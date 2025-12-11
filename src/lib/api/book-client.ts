/**
 * Book API Client - Fetches from Google Books API (primary) and Open Library API (fallback)
 * Merges data from both sources to create comprehensive book metadata
 */

import type {BookAuthor, BookMetadata, BookSubject} from "@/schema/ts/book.interface.ts";
import {BaseApiClient} from "./base-client.ts";

// ===== Google Books API Types =====
interface GoogleBooksVolumeInfo {
  title?: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  printType?: string;
  categories?: string[];
  mainCategory?: string;
  averageRating?: number;
  ratingsCount?: number;
  language?: string;
  imageLinks?: {
    smallThumbnail?: string;
    thumbnail?: string;
    small?: string;
    medium?: string;
    large?: string;
    extraLarge?: string;
  };
  previewLink?: string;
  infoLink?: string;
  canonicalVolumeLink?: string;
  industryIdentifiers?: Array<{
    type: string; // "ISBN_10", "ISBN_13", "ISSN"
    identifier: string;
  }>;
}

interface GoogleBooksVolume {
  id: string;
  volumeInfo: GoogleBooksVolumeInfo;
}

interface GoogleBooksResponse {
  kind: string;
  totalItems: number;
  items?: GoogleBooksVolume[];
}

// ===== Open Library API Types =====
interface OpenLibraryResponse {
  [key: string]: {
    title?: string;
    subtitle?: string;
    authors?: Array<{ name: string; url?: string }>;
    identifiers?: {
      isbn_10?: string[];
      isbn_13?: string[];
      lccn?: string[];
      oclc?: string[];
      goodreads?: string[];
      openlibrary?: string[];
    };
    publishers?: Array<{ name: string }>;
    publish_date?: string;
    publish_places?: Array<{ name: string }>;
    number_of_pages?: number;
    weight?: string;
    cover?: {
      small?: string;
      medium?: string;
      large?: string;
    };
    subjects?: Array<{ name: string; url?: string }>;
    links?: Array<{ url: string; title: string }>;
    notes?: string;
  };
}

export class BookClient extends BaseApiClient {
  private googleBooksApiKey?: string;

  constructor() {
    super({
      baseUrl: "https://www.googleapis.com/books/v1",
      rateLimit: {
        requestsPerMinute: 100,
        requestsPerHour: 5000,
      },
      cache: {
        ttl: 86400000, // 24 hours (book metadata doesn't change often)
        enabled: true,
      },
    });

    // Google Books API key is optional but recommended for higher quota
    this.googleBooksApiKey = process.env.GOOGLE_BOOKS_API_KEY;
  }

  /**
   * Fetch comprehensive book metadata from both Google Books and Open Library
   * Google Books is primary source, Open Library fills in gaps
   */
  async fetchBookMetadata(isbn: string): Promise<BookMetadata | null> {
    const cleanIsbn = isbn.replace(/[-\s]/g, "");

    // Fetch from both APIs in parallel
    const [googleData, openLibraryData] = await Promise.allSettled([
      this.fetchFromGoogleBooks(cleanIsbn),
      this.fetchFromOpenLibrary(cleanIsbn),
    ]);

    const google = googleData.status === "fulfilled" ? googleData.value : null;
    const openLib = openLibraryData.status === "fulfilled" ? openLibraryData.value : null;

    if (!google && !openLib) {
      console.warn(`No metadata found for ISBN: ${isbn}`);
      return null;
    }

    // Merge data from both sources
    return this.mergeMetadata(google, openLib, cleanIsbn);
  }

  /**
   * Get Open Library cover URL
   */
  getCoverUrl(isbn: string, size: "S" | "M" | "L" = "M"): string {
    const cleanIsbn = isbn.replace(/[-\s]/g, "");
    return `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-${size}.jpg`;
  }

  /**
   * Fetch book data from Google Books API
   */
  private async fetchFromGoogleBooks(isbn: string): Promise<GoogleBooksVolume | null> {
    try {
      const apiKeyParam = this.googleBooksApiKey ? `&key=${this.googleBooksApiKey}` : "";
      const response = await this.request<GoogleBooksResponse>(
        `/volumes?q=isbn:${isbn}${apiKeyParam}`
      );

      if (!response || !response.items || response.items.length === 0) {
        console.log(`Google Books: No data found for ISBN ${isbn}`);
        return null;
      }

      return response.items[0];
    } catch (error) {
      console.error(`Google Books API error for ISBN ${isbn}:`, error);
      return null;
    }
  }

  /**
   * Fetch book data from Open Library API
   */
  private async fetchFromOpenLibrary(isbn: string): Promise<any | null> {
    try {
      const bibkey = `ISBN:${isbn}`;
      const response = await fetch(
        `https://openlibrary.org/api/books?bibkeys=${bibkey}&format=json&jscmd=data`
      );

      if (!response.ok) {
        return null;
      }

      const data: OpenLibraryResponse = await response.json();

      if (!data || !data[bibkey]) {
        console.log(`Open Library: No data found for ISBN ${isbn}`);
        return null;
      }

      return data[bibkey];
    } catch (error) {
      console.error(`Open Library API error for ISBN ${isbn}:`, error);
      return null;
    }
  }

  /**
   * Merge data from Google Books and Open Library into unified metadata
   */
  private mergeMetadata(
    google: GoogleBooksVolume | null,
    openLib: any | null,
    isbn: string
  ): BookMetadata {
    const googleInfo = google?.volumeInfo;

    // Extract identifiers
    const identifiers: BookMetadata["identifiers"] = {
      isbn_10: undefined,
      isbn_13: undefined,
      google_books_id: google?.id,
      openlibrary_id: openLib?.identifiers?.openlibrary?.[0],
    };

    // Parse ISBN type
    if (isbn.length === 10) {
      identifiers.isbn_10 = isbn;
    } else if (isbn.length === 13) {
      identifiers.isbn_13 = isbn;
    }

    // Add identifiers from APIs
    if (googleInfo?.industryIdentifiers) {
      for (const id of googleInfo.industryIdentifiers) {
        if (id.type === "ISBN_10") identifiers.isbn_10 = id.identifier;
        if (id.type === "ISBN_13") identifiers.isbn_13 = id.identifier;
        if (id.type === "ISSN") identifiers.issn = id.identifier;
      }
    }

    if (openLib?.identifiers) {
      identifiers.lccn = openLib.identifiers.lccn?.[0];
      identifiers.oclc = openLib.identifiers.oclc?.[0];
      identifiers.goodreads = openLib.identifiers.goodreads?.[0];
    }

    // Merge authors
    const authors: BookAuthor[] = [];
    if (googleInfo?.authors) {
      authors.push(...googleInfo.authors.map((name) => ({ name })));
    } else if (openLib?.authors) {
      authors.push(...openLib.authors);
    }

    // Merge subjects
    const subjects: BookSubject[] = [];
    if (googleInfo?.categories) {
      subjects.push(...googleInfo.categories.map((name) => ({ name, source: "google" as const })));
    }
    if (openLib?.subjects) {
      subjects.push(
        ...openLib.subjects.map((s: any) => ({
          name: s.name,
          url: s.url,
          source: "openlibrary" as const,
        }))
      );
    }

    // Build images object
    const images: BookMetadata["images"] = {
      ...googleInfo?.imageLinks,
      openLibrarySmall: openLib?.cover?.small,
      openLibraryMedium: openLib?.cover?.medium,
      openLibraryLarge: openLib?.cover?.large,
    };

    // Build links
    const links: BookMetadata["links"] = [];
    if (googleInfo?.previewLink) {
      links.push({ url: googleInfo.previewLink, title: "Google Books Preview", source: "google" });
    }
    if (googleInfo?.infoLink) {
      links.push({ url: googleInfo.infoLink, title: "Google Books Info", source: "google" });
    }
    if (openLib?.links) {
      links.push(...openLib.links.map((l: any) => ({ ...l, source: "openlibrary" as const })));
    }

    return {
      // Prefer Google Books for core data
      title: googleInfo?.title || openLib?.title || "Unknown Title",
      subtitle: googleInfo?.subtitle || openLib?.subtitle,
      authors,

      publisher: googleInfo?.publisher || openLib?.publishers?.[0]?.name,
      publishedDate: googleInfo?.publishedDate || openLib?.publish_date,
      publishPlaces: openLib?.publish_places?.map((p: any) => p.name),

      description: googleInfo?.description || openLib?.notes,
      pageCount: googleInfo?.pageCount || openLib?.number_of_pages,
      printType: googleInfo?.printType,
      language: googleInfo?.language,

      categories: googleInfo?.categories,
      subjects: subjects.length > 0 ? subjects : undefined,
      mainCategory: googleInfo?.mainCategory || googleInfo?.categories?.[0],

      identifiers,
      images,
      links,

      rating: googleInfo?.averageRating
        ? {
            average: googleInfo.averageRating,
            count: googleInfo.ratingsCount,
            source: "google" as const,
          }
        : undefined,

      weight: openLib?.weight,

      fetchedAt: new Date().toISOString(),
      sources: {
        googleBooks: !!google,
        openLibrary: !!openLib,
      },
    };
  }
}

export const bookClient = new BookClient();
