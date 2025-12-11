import {z} from "zod";

/**
 * Book Schema - Minimal user input (type, id, isbn only)
 * All other data is auto-fetched from Google Books and Open Library APIs
 */

export const BookAuthorSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
});

export const BookIdentifiersSchema = z.object({
  isbn_10: z.string().optional(),
  isbn_13: z.string().optional(),
  issn: z.string().optional(),
  lccn: z.string().optional(),
  oclc: z.string().optional(),
  goodreads: z.string().optional(),
  google_books_id: z.string().optional(),
  openlibrary_id: z.string().optional(),
});

export const BookImagesSchema = z.object({
  // Google Books images
  thumbnail: z.string().url().optional(),
  smallThumbnail: z.string().url().optional(),
  small: z.string().url().optional(),
  medium: z.string().url().optional(),
  large: z.string().url().optional(),
  extraLarge: z.string().url().optional(),

  // Open Library covers
  openLibrarySmall: z.string().url().optional(),
  openLibraryMedium: z.string().url().optional(),
  openLibraryLarge: z.string().url().optional(),
});

export const BookLinkSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  source: z.enum(["google", "openlibrary", "other"]).optional(),
});

export const BookSubjectSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
  source: z.enum(["google", "openlibrary"]),
});

export const BookRatingSchema = z.object({
  average: z.number().min(0).max(5).optional(),
  count: z.number().int().nonnegative().optional(),
  source: z.enum(["google", "goodreads", "other"]),
});

export const BookMetadataSchema = z.object({
  // Core bibliographic data
  title: z.string().min(1, "Book title is required"),
  subtitle: z.string().optional(),
  authors: z.array(BookAuthorSchema),

  // Publishing information
  publisher: z.string().optional(),
  publishedDate: z.string().optional(),
  publishPlaces: z.array(z.string()).optional(),

  // Content & format
  description: z.string().optional(),
  pageCount: z.number().int().positive().optional(),
  printType: z.string().optional(),
  language: z.string().optional(),

  // Classification & discovery
  categories: z.array(z.string()).optional(),
  subjects: z.array(BookSubjectSchema).optional(),
  mainCategory: z.string().optional(),

  // Identifiers
  identifiers: BookIdentifiersSchema,

  // Visual & links
  images: BookImagesSchema,
  links: z.array(BookLinkSchema),

  // Ratings & engagement
  rating: BookRatingSchema.optional(),

  // Physical characteristics
  dimensions: z
      .object({
        height: z.string().optional(),
        width: z.string().optional(),
        thickness: z.string().optional(),
      })
      .optional(),
  weight: z.string().optional(),

  // Metadata about the metadata
  fetchedAt: z.string(),
  sources: z.object({
    googleBooks: z.boolean(),
    openLibrary: z.boolean(),
  }),
});

/**
 * Book Schema - User provides ONLY type, id, and isbn
 */
export const BookSchema = z.object({
  type: z.literal("book"),
  id: z.string().min(1, "Book ID is required"),
  isbn: z
    .string()
      .refine(
          (val) => {
            const cleaned = val.replace(/[-\s]/g, "");
            return (
                /^(?:\d{9}[\dX]|\d{10})$/.test(cleaned) || /^(?:978|979)\d{10}$/.test(cleaned)
            );
          },
          "ISBN must be a valid 10-digit or 13-digit ISBN"
      ),
  metadata: BookMetadataSchema,
});

export type BookInput = z.infer<typeof BookSchema>;
