/**
 * GitHub API Client for fetching repository metadata
 */

import {BaseApiClient} from "./base-client.ts";

export interface GitHubRepository {
  name: string;
  owner: {
    login: string;
    html_url: string;
    avatar_url: string;
  };
  html_url: string;
  homepage: string | null;
  description: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  topics: string[];
  license: {
    spdx_id: string;
    name: string;
  } | null;
  archived: boolean;
  disabled: boolean;
  has_wiki: boolean;
  has_discussions: boolean;
}

export interface GitHubLanguages {
  [language: string]: number;
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  draft: boolean;
  prerelease: boolean;
}

export interface GitHubSearchResult {
  total_count: number;
}

export interface RepositoryMetadata {
  name: string;
  owner: string;
  ownerUrl: string;
  repositoryUrl: string;
  homepage?: string;
  description: string;
  license?: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  openPullRequests: number;
  lastCommit: string;
  lastReleaseVersion?: string;
  lastReleaseDate?: string;
  created: string;
  primaryLanguage?: string;
  languages: string[];
  archived: boolean;
  hasWiki: boolean;
  hasDiscussions: boolean;
  topics: string[];
  image?: string; // Owner avatar URL
}

export class GitHubClient extends BaseApiClient {
  constructor(token?: string) {
    super({
      baseUrl: "https://api.github.com",
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      rateLimit: {
        requestsPerMinute: token ? 100 : 10,
        requestsPerHour: token ? 5000 : 60,
      },
      cache: {
        ttl: 3600000, // 1 hour
        enabled: true,
      },
    });
  }

  /**
   * Fetch repository metadata from GitHub
   */
  async fetchRepositoryMetadata(repoUrl: string): Promise<RepositoryMetadata | null> {
    const parsed = this.parseGitHubUrl(repoUrl);
    if (!parsed) {
      console.warn(`Invalid GitHub URL: ${repoUrl}`);
      return null;
    }

    try {
      // Fetch repository data
      const repo = await this.retryWithBackoff(() =>
        this.request<GitHubRepository>(`/repos/${parsed.owner}/${parsed.repo}`)
      );

      // Fetch languages
      let languages: string[] = [];
      try {
        const languagesData = await this.retryWithBackoff(() =>
          this.request<GitHubLanguages>(`/repos/${parsed.owner}/${parsed.repo}/languages`)
        );
        languages = Object.keys(languagesData).sort((a, b) => languagesData[b] - languagesData[a]);
      } catch (error) {
        console.warn(`Failed to fetch languages for ${parsed.owner}/${parsed.repo}:`, error);
      }

      // Fetch open pull requests count
      let openPullRequests = 0;
      try {
        const prSearch = await this.retryWithBackoff(() =>
          this.request<GitHubSearchResult>(
            `/search/issues?q=repo:${parsed.owner}/${parsed.repo}+type:pr+state:open`
          )
        );
        openPullRequests = prSearch.total_count;
      } catch (error) {
        console.warn(`Failed to fetch PR count for ${parsed.owner}/${parsed.repo}:`, error);
      }

      // Fetch latest release
      let lastReleaseVersion: string | undefined;
      let lastReleaseDate: string | undefined;
      try {
        const releases = await this.retryWithBackoff(() =>
          this.request<GitHubRelease[]>(`/repos/${parsed.owner}/${parsed.repo}/releases?per_page=1`)
        );
        if (releases.length > 0 && !releases[0].draft && !releases[0].prerelease) {
          lastReleaseVersion = releases[0].tag_name;
          lastReleaseDate = releases[0].published_at;
        }
      } catch (error) {
        console.warn(`Failed to fetch releases for ${parsed.owner}/${parsed.repo}:`, error);
      }

      const metadata: RepositoryMetadata = {
        name: repo.name,
        owner: repo.owner.login,
        ownerUrl: repo.owner.html_url,
        repositoryUrl: repo.html_url,
        homepage: repo.homepage || undefined,
        description: repo.description,
        license: repo.license?.spdx_id,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        openIssues: repo.open_issues_count,
        openPullRequests,
        lastCommit: repo.pushed_at,
        lastReleaseVersion,
        lastReleaseDate,
        created: repo.created_at,
        primaryLanguage: repo.language || undefined,
        languages,
        archived: repo.archived,
        hasWiki: repo.has_wiki,
        hasDiscussions: repo.has_discussions,
        topics: repo.topics || [],
        image: repo.owner.avatar_url, // Owner's avatar
      };

      return metadata;
    } catch (error) {
      console.error(`Failed to fetch GitHub metadata for ${parsed.owner}/${parsed.repo}:`, error);
      return null;
    }
  }

  /**
   * Batch fetch multiple repositories
   */
  async fetchMultipleRepositories(repoUrls: string[]): Promise<Map<string, RepositoryMetadata>> {
    const results = new Map<string, RepositoryMetadata>();

    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < repoUrls.length; i += batchSize) {
      const batch = repoUrls.slice(i, i + batchSize);

      const promises = batch.map(async (url) => {
        const metadata = await this.fetchRepositoryMetadata(url);
        if (metadata) {
          results.set(url, metadata);
        }
      });

      await Promise.all(promises);

      // Small delay between batches
      if (i + batchSize < repoUrls.length) {
        await this.sleep(1000);
      }
    }

    return results;
  }

  /**
   * Check if a repository is archived or deprecated
   */
  async isRepositoryHealthy(repoUrl: string): Promise<boolean> {
    const metadata = await this.fetchRepositoryMetadata(repoUrl);
    if (!metadata) return false;

    // Consider unhealthy if archived
    if (metadata.archived) return false;

    // Consider unhealthy if no commits in the last 2 years
    const lastCommit = new Date(metadata.lastCommit);
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    return lastCommit > twoYearsAgo;
  }

  /**
   * Parse GitHub URL to get owner and repo
   */
  private parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    try {
      const match = url.match(/github\.com\/([^/]+)\/([^/]+)(?:\/|$)/i);
      if (!match) return null;

      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ""),
      };
    } catch {
      return null;
    }
  }
}

// Export a singleton instance
// You can set GH_API_TOKEN environment variable for higher rate limits
export const githubClient = new GitHubClient(process.env.GH_API_TOKEN || process.env.GITHUB_TOKEN);
