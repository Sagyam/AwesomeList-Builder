/**
 * Book Resource Schema
 *
 * User provides ONLY: type, id, isbn
 * Everything else is auto-fetched from Google Books API & Open Library API
 */

export interface BookAuthor {
  name: string;
  url?: string; // Open Library author page
}

export interface BookIdentifiers {
  isbn_10?: string;
  isbn_13?: string;
  issn?: string;
  lccn?: string;
  oclc?: string;
  goodreads?: string;
  google_books_id?: string; // Google Books volume ID
  openlibrary_id?: string; // Open Library edition ID
}

export interface BookImages {
  // Google Books images
  thumbnail?: string;
  smallThumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  extraLarge?: string;

  // Open Library covers (fallback if Google doesn't have images)
  openLibrarySmall?: string;
  openLibraryMedium?: string;
  openLibraryLarge?: string;
}

export interface BookLink {
  url: string;
  title: string;
  source?: "google" | "openlibrary" | "other";
}

export interface BookSubject {
  name: string;
  url?: string; // Open Library subject page
  source: "google" | "openlibrary";
}

export interface BookRating {
  average?: number; // Google Books average rating (1-5)
  count?: number; // Number of ratings
  source: "google" | "goodreads" | "other";
}

/**
 * Comprehensive book metadata auto-extracted from multiple APIs
 * Combines data from Google Books (primary) and Open Library (secondary)
 */
export interface BookMetadata {
  // Core bibliographic data
  title: string;
  subtitle?: string;
  authors: BookAuthor[];

  // Publishing information
  publisher?: string;
  publishedDate?: string; // YYYY-MM-DD format from Google Books
  publishPlaces?: string[]; // From Open Library

  // Content & format
  description?: string; // Google Books has better descriptions
  pageCount?: number;
  printType?: string; // "BOOK" or "MAGAZINE"
  language?: string; // ISO 639-1 code (e.g., "en")

  // Classification & discovery
  categories?: string[]; // Google Books categories
  subjects?: BookSubject[]; // Combined from both APIs
  mainCategory?: string; // Primary category

  // Identifiers
  identifiers: BookIdentifiers;

  // Visual & links
  images: BookImages;
  links: BookLink[];

  // Ratings & engagement
  rating?: BookRating;

  // Physical characteristics (from Open Library)
  dimensions?: {
    height?: string;
    width?: string;
    thickness?: string;
  };
  weight?: string;

  // Metadata about the metadata
  fetchedAt: string; // ISO timestamp
  sources: {
    googleBooks: boolean;
    openLibrary: boolean;
  };
}

/**
 * Book Resource
 * User provides ONLY: type, id, isbn
 * All other fields are auto-generated
 */
export interface Book {
  type: "book";
  id: string;
  isbn: string; // ISBN-10 or ISBN-13 (user provided)

  // Everything else is auto-fetched
  metadata: BookMetadata;
}
