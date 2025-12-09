// Export all Zod schemas

export type { ArticleInput } from "./article.schema";
export { ArticleSchema } from "./article.schema";

// Export Zod input types
export type { BaseResourceInput } from "./base.schema";
export {
  AccessLevelSchema,
  BaseResourceSchema,
  BaseResourceSchemaObject,
  DifficultySchema,
  MaturitySchema,
  RegistrySchema,
  ResourceStatusSchema,
  TypesSchema,
} from "./base.schema";
export type { BookInput } from "./book.schema";
export { BookSchema } from "./book.schema";
export type { CertificationInput } from "./certification.schema";
export { CertificationSchema } from "./certification.schema";
export type { CheatsheetInput } from "./cheatsheet.schema";
export { CheatsheetSchema } from "./cheatsheet.schema";
export type { CommunityInput } from "./community.schema";
export { CommunitySchema } from "./community.schema";
export type { ConferenceInput } from "./conference.schema";
export { ConferenceSchema } from "./conference.schema";
export type { CourseInput } from "./course.schema";
export { CourseSchema } from "./course.schema";
export type { DocumentationInput } from "./documentation.schema.ts";
export { DocumentationSchema } from "./documentation.schema.ts";
export type { LibraryInput } from "./library.schema.ts";
export { LibrarySchema } from "./library.schema.ts";
export type { NewsletterInput } from "./newsletter.schema.ts";
export { NewsletterSchema } from "./newsletter.schema.ts";
export type { PaperInput } from "./paper.schema.ts";
export { PaperSchema } from "./paper.schema.ts";
export type { PodcastInput } from "./podcast.schema.ts";
export { PodcastSchema } from "./podcast.schema.ts";
export type { RepositoryInput } from "./repository.schema.ts";
export { RepositorySchema } from "./repository.schema.ts";
export type { ToolInput } from "./tool.schema.ts";
export { ToolSchema } from "./tool.schema.ts";
export {
  ResourceArraySchema,
  ResourceSchema,
  validateResource,
  validateResourceArray,
  validateResourceArraySafe,
  validateResourceSafe,
} from "./validation";
export type { ResourceArrayInput, ResourceInput } from "./validation.ts";
export type { VideoInput } from "./video.schema.ts";
export { VideoSchema } from "./video.schema.ts";
export type {ProjectInput, ProjectMetadataInput} from "./project.schema.ts";
export {ProjectMetadataSchema, ProjectSchema} from "./project.schema.ts";
