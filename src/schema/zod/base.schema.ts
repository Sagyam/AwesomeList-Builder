import {z} from "zod";

// Reusable enum schemas with helpful error messages
export const TypesSchema = z.enum(
  [
    "library",
    "article",
    "video",
    "book",
    "course",
    "tool",
    "paper",
    "podcast",
    "documentation",
    "repository",
    "community",
    "newsletter",
    "cheatsheet",
    "conference",
    "certification",
  ],
  {
    message:
      "Invalid resource type. Must be one of: library, article, video, book, course, tool, paper, podcast, documentation, repository, community, newsletter, cheatsheet, conference, or certification.",
  }
);

export const DifficultySchema = z.enum(["beginner", "intermediate", "advanced", "expert"], {
  message: "Difficulty must be one of: beginner, intermediate, advanced, or expert.",
});

export const AccessLevelSchema = z.enum(["free", "freemium", "paid", "enterprise"], {
  message: "Access level must be one of: free, freemium, paid, or enterprise.",
});

export const ResourceStatusSchema = z.enum(["active", "maintenance", "deprecated", "archived"], {
  message: "Resource status must be one of: active, maintenance, deprecated, or archived.",
});

export const MaturitySchema = z.enum(["experimental", "beta", "stable", "mature"], {
  message: "Maturity level must be one of: experimental, beta, stable, or mature.",
});

export const RegistrySchema = z.enum(
  ["npm", "pypi", "cargo", "rubygems", "maven", "nuget", "go", "packagist"],
  {
    message: "Registry must be one of: npm, pypi, cargo, rubygems, maven, nuget, go, or packagist.",
  }
);

// Base resource schema without refinements (for extending)
export const BaseResourceSchemaObject = z.object({
  // Required fields
  type: TypesSchema,
  id: z.string().min(1, "ID is required and cannot be empty"),
  title: z.string().optional(),
  name: z.string().optional(),
  url: z.url("URL must be a valid URL (e.g., https://example.com)"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  category: z.string().min(1, "Category is required and cannot be empty"),

  // Mandatory arrays
  tags: z.array(z.string().min(1)).min(1, "At least one tag is required"),
  topics: z.array(z.string().min(1)).min(1, "At least one topic is required"),
  language: z.string().min(2, "Language must be at least 2 characters (e.g., 'en', 'es')"),

  // ISO 8601 dates with validation
  dateAdded: z.iso.datetime({ message: "dateAdded must be a valid ISO 8601 datetime string" }),
  lastVerified: z.iso.datetime({
    message: "lastVerified must be a valid ISO 8601 datetime string",
  }),

  // Optional fields
  featured: z.boolean().optional(),
  trending: z.boolean().optional(),
  archived: z.boolean().optional(),
  deprecated: z.boolean().optional(),
  replacedBy: z.string().optional(),
  relatedResources: z.array(z.string()).optional(),
  difficulty: DifficultySchema.optional(),
  isFree: z.boolean().optional(),
  isPaid: z.boolean().optional(),
  requiresSignup: z.boolean().optional(),
  accessLevel: AccessLevelSchema.optional(),

  // Visual fields
  image: z.string().url("Image must be a valid URL").optional().or(z.string().min(1).optional()),
  imageAlt: z.string().optional(),
});

// Base resource schema with refinements
export const BaseResourceSchema = BaseResourceSchemaObject.refine(
  (data) => data.title || data.name,
  {
    message: "Either 'title' or 'name' must be provided",
    path: ["title"],
  }
);

export type BaseResourceInput = z.infer<typeof BaseResourceSchema>;
