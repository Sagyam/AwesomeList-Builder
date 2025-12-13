/**
 * PDF Cover Generator - Extracts first page of PDF as image
 * Used for PDFs that cannot be screenshotted with Playwright
 */

import {existsSync} from "node:fs";
import {mkdir} from "node:fs/promises";
import {join} from "node:path";
import {createCanvas} from "@napi-rs/canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export interface PdfCoverOptions {
  /** Output directory for cover images (relative to project root) */
  outputDir?: string;
  /** Scale factor for rendering (higher = better quality, larger file) */
  scale?: number;
  /** Crop to top portion (0-1, where 1 = full page, 0.4 = top 40%) */
  cropRatio?: number;
  /** Image format */
  format?: "png" | "jpeg";
  /** JPEG quality (1-100) */
  quality?: number;
}

export interface PdfCoverResult {
  /** Local file path to saved cover image */
  localPath: string;
  /** Public URL path for the cover image */
  publicPath: string;
  /** Whether cover generation was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

const DEFAULT_OPTIONS: Required<PdfCoverOptions> = {
  outputDir: "public/images/screenshots",
  scale: 2.0,
  cropRatio: 0.4,
  format: "png",
  quality: 85,
};

/**
 * Generate filename from URL
 */
function generateFilename(url: string, format: string): string {
  let urlObj: URL;
  try {
    urlObj = new URL(url);
  } catch {
    return `pdf-cover-${Date.now()}.${format}`;
  }

  const domain = urlObj.hostname.replace(/^www\./, "").replace(/\./g, "-");
  const path = urlObj.pathname
    .replace(/^\//g, "")
    .replace(/\/$/g, "")
    .replace(/\.pdf$/i, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .substring(0, 50);

  const timestamp = Date.now();
  const basename = path ? `${domain}-${path}` : domain;

  return `${basename}-${timestamp}.${format}`;
}

/**
 * Generate cover image from PDF first page with timeout
 */
export async function generatePdfCover(
  pdfUrl: string,
  options: PdfCoverOptions = {}
): Promise<PdfCoverResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Wrap in timeout (20 seconds)
  const timeoutPromise = new Promise<PdfCoverResult>((_, reject) => {
    setTimeout(() => reject(new Error("PDF cover generation timed out after 20 seconds")), 20000);
  });

  const generatePromise = async (): Promise<PdfCoverResult> => {
    const tempDir = `${process.cwd()}/temp`;
    const filename = generateFilename(pdfUrl, opts.format);
    const tempPdfPath = `${tempDir}/${filename}.pdf`;

    try {
      // Ensure directories exist
      const outputPath = join(process.cwd(), opts.outputDir);
      if (!existsSync(outputPath)) {
        await mkdir(outputPath, { recursive: true });
      }
      if (!existsSync(tempDir)) {
        await mkdir(tempDir, { recursive: true });
      }

      // Download PDF
      console.log(`⟳ Downloading PDF: ${pdfUrl}`);
      const pdfResponse = await fetch(pdfUrl, {
        signal: AbortSignal.timeout(15000), // 15 second download timeout
      });

      if (!pdfResponse.ok) {
        throw new Error(`Failed to download PDF: ${pdfResponse.status} ${pdfResponse.statusText}`);
      }

      const pdfBuffer = await pdfResponse.arrayBuffer();
      await Bun.write(tempPdfPath, pdfBuffer);

      // Load PDF with pdfjs-dist
      console.log(`⟳ Rendering PDF first page...`);
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      });

      const pdfDocument = await loadingTask.promise;
      const page = await pdfDocument.getPage(1);

      // Get viewport for the page
      const viewport = page.getViewport({ scale: opts.scale });

      // Create canvas and context
      const canvas = createCanvas(viewport.width, viewport.height);
      const context = canvas.getContext("2d");

      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      // Crop to top portion if cropRatio < 1
      let finalCanvas = canvas;
      if (opts.cropRatio < 1) {
        const cropHeight = Math.floor(viewport.height * opts.cropRatio);
        const croppedCanvas = createCanvas(viewport.width, cropHeight);
        const croppedContext = croppedCanvas.getContext("2d");

        croppedContext.drawImage(
          canvas,
          0,
          0,
          viewport.width,
          cropHeight,
          0,
          0,
          viewport.width,
          cropHeight
        );

        finalCanvas = croppedCanvas;
      }

      // Save image
      const localPath = join(outputPath, filename);
      const publicPath = `/images/screenshots/${filename}`;

      const imageBuffer =
        opts.format === "png"
          ? finalCanvas.toBuffer("image/png")
          : finalCanvas.toBuffer("image/jpeg", { quality: opts.quality });

      await Bun.write(localPath, imageBuffer);

      // Clean up temp PDF
      const tempFile = Bun.file(tempPdfPath);
      if (await tempFile.exists()) {
        await Bun.$`rm ${tempPdfPath}`.quiet();
      }

      console.log(`✓ PDF cover generated: ${publicPath}`);

      return {
        localPath,
        publicPath,
        success: true,
      };
    } catch (error) {
      // Clean up temp file
      const tempFile = Bun.file(tempPdfPath);
      if (await tempFile.exists()) {
        await Bun.$`rm ${tempPdfPath}`.quiet();
      }

      throw error;
    }
  };

  // Race between generation and timeout
  try {
    return await Promise.race([generatePromise(), timeoutPromise]);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`✗ Failed to generate PDF cover for ${pdfUrl}:`, errorMessage);

    return {
      localPath: "",
      publicPath: "",
      success: false,
      error: errorMessage,
    };
  }
}
