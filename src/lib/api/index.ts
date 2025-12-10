/**
 * API Clients for external data fetching
 */

export type { ApiClientConfig, CacheConfig, RateLimitConfig } from "./base-client.ts";
export { ApiError, BaseApiClient, RateLimitError } from "./base-client.ts";
export type { CacheEntry } from "./cache-manager.ts";
export { CacheManager, cacheManager } from "./cache-manager.ts";
export type { CargoPackageMetadata } from "./cargo-client.ts";
export { CargoClient, cargoClient } from "./cargo-client.ts";
export type { GitHubRepository, RepositoryMetadata } from "./github-client.ts";
export { GitHubClient, githubClient } from "./github-client.ts";
export type { GitLabProject, GitLabRepositoryMetadata } from "./gitlab-client.ts";
export { GitLabClient, gitlabClient } from "./gitlab-client.ts";
export type { GoPackageMetadata } from "./go-client.ts";
export { GoClient, goClient } from "./go-client.ts";
export type { MavenArtifactMetadata } from "./maven-client.ts";
export { MavenClient, mavenClient } from "./maven-client.ts";
export type { PackageMetadata as NpmPackageMetadata } from "./npm-client.ts";
export { NpmClient, npmClient } from "./npm-client.ts";
export type { PackagistPackageMetadata } from "./packagist-client.ts";
export { PackagistClient, packagistClient } from "./packagist-client.ts";
export type { PyPIPackageMetadata } from "./pypi-client.ts";
export { PyPIClient, pypiClient } from "./pypi-client.ts";
export type { RubyGemsPackageMetadata } from "./rubygems-client.ts";
export { RubyGemsClient, rubygemsClient } from "./rubygems-client.ts";
