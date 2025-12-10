/**
 * API Clients for external data fetching
 */

export type { ApiClientConfig, CacheConfig, RateLimitConfig } from "./base-client.ts";
export { ApiError, BaseApiClient, RateLimitError } from "./base-client.ts";
export { MetadataFetcher } from "./fetch-metadata.ts";
export type { GitHubRepository, RepositoryMetadata } from "./github-client.ts";
export { GitHubClient, githubClient } from "./github-client.ts";
export type { GitLabProject, GitLabRepositoryMetadata } from "./gitlab-client.ts";
export { GitLabClient, gitlabClient } from "./gitlab-client.ts";
