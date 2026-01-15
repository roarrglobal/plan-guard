import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker - use CDN for the worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text content from a PDF file
 * @param file - The PDF file to extract text from
 * @returns Promise<string> - The extracted text content
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const textParts: string[] = [];
    
    // Extract text from each page (limit to first 50 pages for performance)
    const maxPages = Math.min(pdf.numPages, 50);
    
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items into a single string for this page
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      if (pageText.trim()) {
        textParts.push(`--- Page ${pageNum} ---\n${pageText}`);
      }
    }
    
    if (pdf.numPages > 50) {
      textParts.push(`\n[Note: Document has ${pdf.numPages} pages. Only first 50 pages were extracted.]`);
    }
    
    const fullText = textParts.join('\n\n');
    
    if (!fullText.trim()) {
      throw new Error('No text could be extracted from this PDF. It may be a scanned document or contain only images.');
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF extraction error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('No text could be extracted')) {
        throw error;
      }
      if (error.message.includes('Invalid PDF')) {
        throw new Error('This file appears to be corrupted or is not a valid PDF.');
      }
    }
    
    throw new Error('Failed to extract text from PDF. Please try uploading a different document.');
  }
}

/**
 * Check if a file is a PDF
 */
export function isPDF(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}
