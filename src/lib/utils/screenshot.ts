/**
 * Screenshot Utility - Captures page screenshots using Playwright
 * Used as fallback when og:image is not available or broken
 */

import {type Browser, chromium, type Page} from "playwright";
import {mkdir} from "node:fs/promises";
import {existsSync} from "node:fs";
import {join} from "node:path";

export interface ScreenshotOptions {
    /** Output directory for screenshots (relative to project root) */
    outputDir?: string;
    /** Screenshot width in pixels */
    width?: number;
    /** Screenshot height in pixels */
    height?: number;
    /** Wait time in milliseconds before taking screenshot */
    waitTime?: number;
    /** Full page screenshot (default: false, captures viewport only) */
    fullPage?: boolean;
    /** Screenshot quality for JPEG (1-100) */
    quality?: number;
    /** Image format */
    type?: "png" | "jpeg";
}

export interface ScreenshotResult {
    /** Local file path to saved screenshot */
    localPath: string;
    /** Public URL path for the screenshot */
    publicPath: string;
    /** Whether screenshot was successful */
    success: boolean;
    /** Error message if failed */
    error?: string;
}

const DEFAULT_OPTIONS: Required<ScreenshotOptions> = {
    outputDir: "public/images/screenshots",
    width: 1200,
    height: 630, // Open Graph standard size
    waitTime: 2000,
    fullPage: false,
    quality: 85,
    type: "jpeg",
};

let browserInstance: Browser | null = null;

/**
 * Get or create browser instance
 */
async function getBrowser(): Promise<Browser> {
    if (!browserInstance) {
        try {
            browserInstance = await chromium.launch({
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-accelerated-2d-canvas",
                    "--disable-gpu",
                ],
            });
        } catch (error) {
            console.error(
                "\n⚠️  Screenshot feature requires Playwright browser binaries."
            );
            console.error("   Run: bunx playwright install chromium\n");
            throw error;
        }
    }
    return browserInstance;
}

/**
 * Close browser instance
 */
export async function closeBrowser(): Promise<void> {
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
    }
}

/**
 * Generate filename from URL
 */
function generateFilename(url: string, format: string): string {
    // Extract domain and path
    let urlObj: URL;
    try {
        urlObj = new URL(url);
    } catch {
        // If invalid URL, create a safe filename from the string
        return `screenshot-${Date.now()}.${format}`;
    }

    const domain = urlObj.hostname.replace(/^www\./, "").replace(/\./g, "-");
    const path = urlObj.pathname
        .replace(/^\//, "")
        .replace(/\/$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .substring(0, 50); // Limit length

    const timestamp = Date.now();
    const basename = path ? `${domain}-${path}` : domain;

    return `${basename}-${timestamp}.${format}`;
}

/**
 * Capture screenshot of a webpage
 */
export async function captureScreenshot(
    url: string,
    options: ScreenshotOptions = {}
): Promise<ScreenshotResult> {
    const opts = {...DEFAULT_OPTIONS, ...options};
    let page: Page | null = null;

    try {
        // Ensure output directory exists
        const outputPath = join(process.cwd(), opts.outputDir);
        if (!existsSync(outputPath)) {
            await mkdir(outputPath, {recursive: true});
        }

        // Get browser and create page
        const browser = await getBrowser();
        page = await browser.newPage({
            viewport: {
                width: opts.width,
                height: opts.height,
            },
            userAgent:
                "Mozilla/5.0 (compatible; AwesomeList-Builder-Screenshot/1.0; +https://github.com/yourrepo)",
        });

        // Navigate to URL with timeout
        await page.goto(url, {
            waitUntil: "networkidle",
            timeout: 30000,
        });

        // Wait for content to load
        await page.waitForTimeout(opts.waitTime);

        // Remove cookie banners, popups, and overlays if present
        await page.evaluate(() => {
            // Common cookie banner selectors
            const selectors = [
                '[class*="cookie"]',
                '[class*="gdpr"]',
                '[class*="consent"]',
                '[id*="cookie"]',
                '[id*="gdpr"]',
                '[id*="consent"]',
                '[class*="banner"]',
                '[class*="popup"]',
                '[class*="modal"][style*="fixed"]',
                '[class*="overlay"]',
            ];

            selectors.forEach((selector) => {
                const elements = document.querySelectorAll(selector);
                elements.forEach((el) => {
                    const htmlEl = el as HTMLElement;
                    const computedStyle = window.getComputedStyle(htmlEl);
                    if (
                        computedStyle.position === "fixed" ||
                        computedStyle.position === "absolute"
                    ) {
                        htmlEl.style.display = "none";
                    }
                });
            });
        });

        // Generate filename and paths
        const filename = generateFilename(url, opts.type);
        const localPath = join(outputPath, filename);
        const publicPath = `/images/screenshots/${filename}`;

        // Capture screenshot
        await page.screenshot({
            path: localPath,
            type: opts.type,
            quality: opts.type === "jpeg" ? opts.quality : undefined,
            fullPage: opts.fullPage,
        });

        // Close page
        await page.close();

        console.log(`✓ Screenshot saved: ${publicPath}`);

        return {
            localPath,
            publicPath,
            success: true,
        };
    } catch (error) {
        // Close page if open
        if (page) {
            await page.close().catch(() => {
            });
        }

        const errorMessage =
            error instanceof Error ? error.message : String(error);
        console.error(`✗ Failed to capture screenshot for ${url}:`, errorMessage);

        return {
            localPath: "",
            publicPath: "",
            success: false,
            error: errorMessage,
        };
    }
}

/**
 * Batch capture screenshots for multiple URLs
 */
export async function captureScreenshots(
    urls: string[],
    options: ScreenshotOptions = {}
): Promise<Map<string, ScreenshotResult>> {
    const results = new Map<string, ScreenshotResult>();

    console.log(`\nCapturing screenshots for ${urls.length} URLs...`);

    for (const url of urls) {
        const result = await captureScreenshot(url, options);
        results.set(url, result);
    }

    await closeBrowser();

    const successCount = Array.from(results.values()).filter((r) => r.success)
        .length;
    console.log(
        `\nCompleted: ${successCount}/${urls.length} screenshots captured successfully\n`
    );

    return results;
}

/**
 * Validate if an image URL is accessible
 */
export async function validateImageUrl(url: string): Promise<boolean> {
    try {
        const response = await fetch(url, {method: "HEAD", signal: AbortSignal.timeout(5000)});
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Get screenshot or validate og:image, with fallback
 */
export async function getOrCaptureImage(
    pageUrl: string,
    ogImageUrl?: string,
    options: ScreenshotOptions = {}
): Promise<string | undefined> {
    // Check if screenshots are enabled
    const screenshotsEnabled =
        process.env.ENABLE_SCREENSHOTS !== "false" &&
        process.env.ENABLE_SCREENSHOTS !== "0";

    // If og:image exists, validate it
    if (ogImageUrl) {
        const isValid = await validateImageUrl(ogImageUrl);
        if (isValid) {
            console.log(`✓ Using og:image: ${ogImageUrl}`);
            return ogImageUrl;
        }
        console.log(`✗ og:image invalid or inaccessible: ${ogImageUrl}`);
    }

    // Fallback to screenshot if enabled (with graceful error handling)
    if (screenshotsEnabled) {
        try {
            console.log(`⟳ Capturing screenshot for: ${pageUrl}`);
            const result = await captureScreenshot(pageUrl, options);

            if (result.success) {
                return result.publicPath;
            }
        } catch (error) {
            // If screenshot fails (e.g., missing dependencies), continue without image
            console.warn(
                `⚠️  Screenshot capture failed for ${pageUrl}, continuing without image`
            );
        }
    } else {
        console.log(
            `ℹ️  Screenshot capture disabled (ENABLE_SCREENSHOTS=${process.env.ENABLE_SCREENSHOTS})`
        );
    }

    return undefined;
}
