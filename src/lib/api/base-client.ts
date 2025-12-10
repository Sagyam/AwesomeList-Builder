/**
 * Base API Client with rate limiting and error handling
 */

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour?: number;
}

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  enabled: boolean;
}

export interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  rateLimit?: RateLimitConfig;
  cache?: CacheConfig;
  timeout?: number;
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter?: number
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class BaseApiClient {
  protected config: ApiClientConfig;
  private requestTimes: number[] = [];
  private hourlyRequestTimes: number[] = [];

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 10000,
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerHour: 5000,
      },
      cache: {
        ttl: 3600000, // 1 hour default
        enabled: true,
      },
      ...config,
    };
  }

  /**
   * Check if we're within rate limits
   */
  protected async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;

    // Clean up old request times
    this.requestTimes = this.requestTimes.filter((time) => time > oneMinuteAgo);
    this.hourlyRequestTimes = this.hourlyRequestTimes.filter((time) => time > oneHourAgo);

    // Check per-minute limit
    if (
      this.config.rateLimit &&
      this.requestTimes.length >= this.config.rateLimit.requestsPerMinute
    ) {
      const oldestRequest = this.requestTimes[0];
      const waitTime = 60000 - (now - oldestRequest);
      throw new RateLimitError(
        `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
        waitTime
      );
    }

    // Check per-hour limit
    if (
      this.config.rateLimit?.requestsPerHour &&
      this.hourlyRequestTimes.length >= this.config.rateLimit.requestsPerHour
    ) {
      const oldestRequest = this.hourlyRequestTimes[0];
      const waitTime = 3600000 - (now - oldestRequest);
      throw new RateLimitError(
        `Hourly rate limit exceeded. Please wait ${Math.ceil(waitTime / 60000)} minutes.`,
        waitTime
      );
    }

    // Record this request
    this.requestTimes.push(now);
    this.hourlyRequestTimes.push(now);
  }

  /**
   * Make an HTTP request with rate limiting and error handling
   */
  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    await this.checkRateLimit();

    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.config.headers,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle rate limiting from the API
        if (response.status === 429) {
          const retryAfter = Number.parseInt(response.headers.get("Retry-After") || "60") * 1000;
          throw new RateLimitError("API rate limit exceeded", retryAfter);
        }

        const errorBody = await response.text();
        throw new ApiError(
          `API request failed: ${response.statusText}`,
          response.status,
          errorBody
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof RateLimitError || error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError(`Request timeout after ${this.config.timeout}ms`, 408);
      }

      throw new ApiError(
        `Request failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Exponential backoff retry logic
   */
  protected async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (error instanceof RateLimitError) {
          // Wait for the retry-after period
          const waitTime = error.retryAfter || baseDelay * 2 ** attempt;
          console.warn(
            `Rate limited, waiting ${waitTime}ms before retry ${attempt + 1}/${maxRetries}`
          );
          await this.sleep(waitTime);
          continue;
        }

        if (error instanceof ApiError && error.statusCode) {
          // Don't retry client errors (4xx) except rate limits
          if (error.statusCode >= 400 && error.statusCode < 500) {
            throw error;
          }
        }

        if (attempt < maxRetries) {
          const delay = baseDelay * 2 ** attempt;
          console.warn(`Request failed, retrying in ${delay}ms (${attempt + 1}/${maxRetries})`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Sleep for specified milliseconds
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
