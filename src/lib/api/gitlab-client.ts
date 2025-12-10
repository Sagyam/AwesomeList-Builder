/**
 * GitLab API Client for fetching repository metadata
 */

import {BaseApiClient} from "./base-client.ts";

export interface GitLabProject {
  id: number;
  name: string;
  path: string;
  path_with_namespace: string;
  description: string;
  default_branch: string;
  web_url: string;
  avatar_url: string;
  star_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  last_activity_at: string;
  archived: boolean;
  visibility: string;
  owner: {
    id: number;
    username: string;
    name: string;
    web_url: string;
  };
  namespace: {
    id: number;
    name: string;
    path: string;
    kind: string;
    full_path: string;
    web_url: string;
  };
  topics: string[];
  readme_url?: string;
  http_url_to_repo: string;
  ssh_url_to_repo: string;
}

export interface GitLabLanguages {
  [language: string]: number;
}

export interface GitLabMergeRequestStats {
  opened: number;
}

export interface GitLabRelease {
  tag_name: string;
  name: string;
  released_at: string;
}

export interface GitLabRepositoryMetadata {
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
  topics: string[];
  visibility: string;
  hasWiki: boolean;
  hasDiscussions: boolean;
  image?: string; // Project avatar URL
}

export class GitLabClient extends BaseApiClient {
  constructor(token?: string) {
    super({
      baseUrl: "https://gitlab.com/api/v4",
      headers: {
        ...(token ? { "PRIVATE-TOKEN": token } : {}),
      },
      rateLimit: {
        requestsPerMinute: token ? 100 : 10,
        requestsPerHour: token ? 5000 : 300,
      },
      cache: {
        ttl: 3600000, // 1 hour
        enabled: true,
      },
    });
  }

  /**
   * Fetch repository metadata from GitLab
   */
  async fetchRepositoryMetadata(repoUrl: string): Promise<GitLabRepositoryMetadata | null> {
    const projectPath = this.parseGitLabUrl(repoUrl);
    if (!projectPath) {
      console.warn(`Invalid GitLab URL: ${repoUrl}`);
      return null;
    }

    try {
      // Fetch project data
      const project = await this.retryWithBackoff(() =>
        this.request<GitLabProject>(`/projects/${encodeURIComponent(projectPath)}`)
      );

      // Fetch languages
      let languages: string[] = [];
      try {
        const languagesData = await this.retryWithBackoff(() =>
          this.request<GitLabLanguages>(`/projects/${encodeURIComponent(projectPath)}/languages`)
        );
        languages = Object.keys(languagesData).sort((a, b) => languagesData[b] - languagesData[a]);
      } catch (error) {
        console.warn(`Failed to fetch languages for GitLab project ${projectPath}:`, error);
      }

      // Fetch open merge requests count
      let openPullRequests = 0;
      try {
        const mrStats = await this.retryWithBackoff(() =>
          this.request<GitLabMergeRequestStats>(
            `/projects/${encodeURIComponent(projectPath)}/merge_requests?state=opened&per_page=1`
          )
        );
        // GitLab API returns array, we need to use headers for total count
        // For simplicity, we'll make another call to get the count
        const mrs = await this.retryWithBackoff(() =>
          this.request<unknown[]>(
            `/projects/${encodeURIComponent(projectPath)}/merge_requests?state=opened&per_page=100`
          )
        );
        openPullRequests = mrs.length;
      } catch (error) {
        console.warn(`Failed to fetch MR count for GitLab project ${projectPath}:`, error);
      }

      // Fetch latest release
      let lastReleaseVersion: string | undefined;
      let lastReleaseDate: string | undefined;
      try {
        const releases = await this.retryWithBackoff(() =>
          this.request<GitLabRelease[]>(
            `/projects/${encodeURIComponent(projectPath)}/releases?per_page=1`
          )
        );
        if (releases.length > 0) {
          lastReleaseVersion = releases[0].tag_name;
          lastReleaseDate = releases[0].released_at;
        }
      } catch (error) {
        console.warn(`Failed to fetch releases for GitLab project ${projectPath}:`, error);
      }

      const metadata: GitLabRepositoryMetadata = {
        name: project.name,
        owner: project.namespace.name,
        ownerUrl: project.namespace.web_url,
        repositoryUrl: project.web_url,
        description: project.description || "",
        stars: project.star_count,
        forks: project.forks_count,
        watchers: project.star_count, // GitLab doesn't have separate watchers
        openIssues: project.open_issues_count,
        openPullRequests,
        lastCommit: project.last_activity_at,
        lastReleaseVersion,
        lastReleaseDate,
        created: project.created_at,
        primaryLanguage: languages[0],
        languages,
        archived: project.archived,
        topics: project.topics || [],
        visibility: project.visibility,
        hasWiki: false, // GitLab project interface doesn't show this in the provided code
        hasDiscussions: false,
        image: project.avatar_url, // Project avatar
      };

      return metadata;
    } catch (error) {
      console.error(`Failed to fetch GitLab metadata for ${projectPath}:`, error);
      return null;
    }
  }

  /**
   * Batch fetch multiple repositories
   */
  async fetchMultipleRepositories(
    repoUrls: string[]
  ): Promise<Map<string, GitLabRepositoryMetadata>> {
    const results = new Map<string, GitLabRepositoryMetadata>();

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

    // Consider unhealthy if no activity in the last 2 years
    const lastActivity = new Date(metadata.lastActivity);
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    return lastActivity > twoYearsAgo;
  }

  /**
   * Parse GitLab URL to get project path
   */
  private parseGitLabUrl(url: string): string | null {
    try {
      const match = url.match(/gitlab\.com\/(.+?)(?:\.git)?$/i);
      if (!match) return null;

      return match[1];
    } catch {
      return null;
    }
  }
}

// Export a singleton instance
// You can set GITLAB_TOKEN environment variable for higher rate limits
export const gitlabClient = new GitLabClient(process.env.GITLAB_TOKEN);
