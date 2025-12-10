/**
 * arXiv API Client for fetching paper metadata and generating cover images
 */

import {createCanvas} from "@napi-rs/canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import {BaseApiClient} from "./base-client.ts";

export interface ArxivEntry {
  id: string;
  title: string;
  summary: string;
  authors: Array<{ name: string }>;
  published: string;
  updated: string;
  doi?: string;
  journal_ref?: string;
  primary_category: string;
  categories: string[];
  links: Array<{ href: string; rel: string; type?: string }>;
}

export interface PaperMetadata {
  title: string;
  authors: string[];
  abstract: string;
  published: string;
  updated: string;
  doi?: string;
  venue?: string;
  pdfUrl: string;
  arxivUrl: string;
  field: string;
  categories: string[];
  coverImagePath?: string;
}

export class ArxivClient extends BaseApiClient {
  private imageDir: string;

  constructor(imageDir = "public/images/papers") {
    super({
      baseUrl: "https://export.arxiv.org",
      headers: {
        "User-Agent": "AwesomeList-Builder/1.0",
      },
      rateLimit: {
        requestsPerMinute: 10, // arXiv recommends max 1 request per 3 seconds
        requestsPerHour: 600,
      },
      cache: {
        ttl: 86400000, // 24 hours - papers rarely change
        enabled: true,
      },
    });
    this.imageDir = imageDir;
  }

  /**
   * Fetch paper metadata from arXiv using arxivId
   */
  async fetchPaperMetadata(arxivId: string): Promise<PaperMetadata | null> {
    // Clean arxivId (remove version suffix if present)
    const cleanId = arxivId.replace(/v\d+$/, "");

    try {
      // Fetch from arXiv API
      const response = await this.retryWithBackoff(() =>
        this.requestXml(`/api/query?id_list=${cleanId}&max_results=1`)
      );

      // Parse XML response
      const entry = this.parseArxivXml(response);
      if (!entry) {
        console.warn(`No paper found for arxivId: ${arxivId}`);
        return null;
      }

      // Extract PDF URL
      const pdfLink = entry.links.find((link) => link.type === "application/pdf");
      const pdfUrl = pdfLink?.href || `https://arxiv.org/pdf/${cleanId}.pdf`;

      // Generate cover image from PDF
      let coverImagePath: string | undefined;
      try {
        coverImagePath = await this.generateCoverImage(cleanId, pdfUrl);
      } catch (error) {
        console.warn(`Failed to generate cover image for ${cleanId}:`, error);
      }

      // Map category to field
      const field = this.getCategoryField(entry.primary_category);

      const metadata: PaperMetadata = {
        title: entry.title.trim().replace(/\s+/g, " "),
        authors: entry.authors.map((a) => a.name),
        abstract: entry.summary.trim().replace(/\s+/g, " "),
        published: entry.published,
        updated: entry.updated,
        doi: entry.doi,
        venue: entry.journal_ref,
        pdfUrl,
        arxivUrl: `https://arxiv.org/abs/${cleanId}`,
        field,
        categories: entry.categories,
        coverImagePath,
      };

      return metadata;
    } catch (error) {
      console.error(`Failed to fetch arXiv metadata for ${arxivId}:`, error);
      return null;
    }
  }

  /**
   * Batch fetch multiple papers
   */
  async fetchMultiplePapers(arxivIds: string[]): Promise<Map<string, PaperMetadata>> {
    const results = new Map<string, PaperMetadata>();

    // Process one at a time to respect arXiv rate limits (3 seconds between requests)
    for (const arxivId of arxivIds) {
      const metadata = await this.fetchPaperMetadata(arxivId);
      if (metadata) {
        results.set(arxivId, metadata);
      }

      // Wait 3 seconds between requests as recommended by arXiv
      if (arxivIds.indexOf(arxivId) < arxivIds.length - 1) {
        await this.sleep(3000);
      }
    }

    return results;
  }

  /**
   * Parse arxivId from URL
   */
  parseArxivUrl(url: string): string | null {
    try {
      const match = url.match(/arxiv\.org\/(?:abs|pdf)\/(\d{4}\.\d{4,5}(?:v\d+)?)/i);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Fetch XML response from arXiv API
   */
  private async requestXml(endpoint: string): Promise<string> {
    await this.checkRateLimit();

    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        headers: {
          ...this.config.headers,
          Accept: "application/atom+xml",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Generate cover image from PDF first page using PDF.js and Canvas
   */
  private async generateCoverImage(arxivId: string, pdfUrl: string): Promise<string | undefined> {
    const tempDir = `${process.cwd()}/temp`;
    const tempPdfPath = `${tempDir}/${arxivId}.pdf`;

    try {
      // Ensure directories exist using Bun.write
      await Bun.write(`${tempDir}/.keep`, "");
      await Bun.write(`${this.imageDir}/.keep`, "");

      // Download PDF
      console.log(`Downloading PDF for ${arxivId}...`);
      const pdfResponse = await fetch(pdfUrl);
      if (!pdfResponse.ok) {
        throw new Error(`Failed to download PDF: ${pdfResponse.statusText}`);
      }

      const pdfBuffer = await pdfResponse.arrayBuffer();
      await Bun.write(tempPdfPath, pdfBuffer);

      // Load PDF with pdfjs-dist
      console.log(`Generating cover image for ${arxivId}...`);
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      });

      const pdfDocument = await loadingTask.promise;
      const page = await pdfDocument.getPage(1);

      // Get viewport for the page
      const viewport = page.getViewport({ scale: 2.0 });

      // Create canvas and context
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext("2d");

      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      // Crop to show only top portion (title, authors, abstract)
      const cropHeight = Math.min(viewport.height, viewport.height * 0.4); // Top 40% of page
      const croppedCanvas = createCanvas(viewport.width, cropHeight);
      const croppedContext = croppedCanvas.getContext("2d");

      croppedContext.drawImage(
        canvas,
        0,
        0,
        viewport.width,
        cropHeight, // Source rectangle
        0,
        0,
        viewport.width,
        cropHeight // Destination rectangle
      );

      // Save image
      const imageName = `${arxivId}-cover.png`;
      const imagePath = `${this.imageDir}/${imageName}`;

      const imageBuffer = croppedCanvas.toBuffer("image/png");
      await Bun.write(imagePath, imageBuffer);

      console.log(`Cover image generated: ${imagePath}`);

      // Delete temporary PDF
      const tempFile = Bun.file(tempPdfPath);
      if (await tempFile.exists()) {
        await Bun.$`rm ${tempPdfPath}`.quiet();
      }

      // Return relative path for use in YAML
      return `/images/papers/${imageName}`;
    } catch (error) {
      console.error(`Error generating cover image for ${arxivId}:`, error);
      // Clean up temp file if it exists
      const tempFile = Bun.file(tempPdfPath);
      if (await tempFile.exists()) {
        await Bun.$`rm ${tempPdfPath}`.quiet();
      }
      return undefined;
    }
  }

  /**
   * Parse arXiv XML response
   */
  private parseArxivXml(xmlString: string): ArxivEntry | null {
    // Simple XML parsing (for production, consider using a proper XML parser)
    const entryMatch = xmlString.match(/<entry>([\s\S]*?)<\/entry>/);
    if (!entryMatch) return null;

    const entryXml = entryMatch[1];

    const id = this.extractXmlTag(entryXml, "id") || "";
    const title = this.extractXmlTag(entryXml, "title") || "";
    const summary = this.extractXmlTag(entryXml, "summary") || "";
    const published = this.extractXmlTag(entryXml, "published") || "";
    const updated = this.extractXmlTag(entryXml, "updated") || "";
    const doi = this.extractXmlTag(entryXml, "arxiv:doi");
    const journal_ref = this.extractXmlTag(entryXml, "arxiv:journal_ref");

    // Extract authors
    const authorMatches = entryXml.matchAll(
      /<author>[\s\S]*?<name>(.*?)<\/name>[\s\S]*?<\/author>/g
    );
    const authors = Array.from(authorMatches).map((match) => ({ name: match[1] }));

    // Extract categories
    const categoryMatches = entryXml.matchAll(/<category\s+term="([^"]+)"/g);
    const categories = Array.from(categoryMatches).map((match) => match[1]);
    const primary_category = categories[0] || "";

    // Extract links
    const linkMatches = entryXml.matchAll(
      /<link\s+href="([^"]+)"\s+rel="([^"]+)"(?:\s+type="([^"]+)")?/g
    );
    const links = Array.from(linkMatches).map((match) => ({
      href: match[1],
      rel: match[2],
      type: match[3],
    }));

    return {
      id,
      title,
      summary,
      authors,
      published,
      updated,
      doi,
      journal_ref,
      primary_category,
      categories,
      links,
    };
  }

  /**
   * Extract text content from XML tag
   */
  private extractXmlTag(xml: string, tagName: string): string | undefined {
    const match = xml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`));
    return match ? match[1].trim() : undefined;
  }

  /**
   * Map arXiv category to field name
   */
  private getCategoryField(category: string): string {
    const categoryMap: Record<string, string> = {
      "cs.AI": "Artificial Intelligence",
      "cs.CL": "Natural Language Processing",
      "cs.CV": "Computer Vision",
      "cs.LG": "Machine Learning",
      "cs.NE": "Neural Networks",
      "cs.RO": "Robotics",
      "stat.ML": "Machine Learning",
      "math.OC": "Optimization",
      "cs.CR": "Cryptography",
      "cs.DC": "Distributed Computing",
      "cs.DS": "Data Structures",
      "cs.IT": "Information Theory",
      "cs.SE": "Software Engineering",
      "cs.PL": "Programming Languages",
      "cs.DB": "Databases",
      "cs.HC": "Human-Computer Interaction",
      "cs.IR": "Information Retrieval",
      "cs.MA": "Multiagent Systems",
      "cs.NI": "Networks",
      "cs.SY": "Systems and Control",
    };

    return categoryMap[category] || "Computer Science";
  }
}

// Export a singleton instance
export const arxivClient = new ArxivClient();
