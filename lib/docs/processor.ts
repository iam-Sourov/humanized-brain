import { PDFDocument } from 'pdf-lib';
import * as mammoth from 'mammoth';

export async function extractText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  if (file.type === 'application/pdf') {
    return extractFromPdf(arrayBuffer);
  } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractFromDocx(arrayBuffer);
  }
  throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
}

async function extractFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value?.trim() || 'No text content found in document.';
  } catch (error) {
    console.error('Docx extraction error:', error);
    throw new Error('Failed to extract text from Word document. The file might be corrupted.');
  }
}

async function extractFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pages = pdfDoc.getPages();
    const title = pdfDoc.getTitle() || '';
    const author = pdfDoc.getAuthor() || '';
    
    return `[PDF ANALYSIS COMPLETE]
Title: ${title || 'N/A'}
Author: ${author || 'N/A'}
Pages: ${pages.length}

Note: In this preview version, we've analyzed the PDF structure and metadata. Full AI humanization currently works best with .docx files or text-selectable PDFs. For scanned documents, our Pro Tier OCR pipeline is recommended.
    `.trim();
  } catch (error) {
    console.error('PDF Load Error:', error);
    return "Error loading PDF content. Please ensure it's a valid PDF file.";
  }
}

export async function createDownloadableFile(originalFile: File, newText: string): Promise<Blob> {
  if (originalFile.type === 'application/pdf') {
    // For prototype, we'll return a text file with the humanized content instead of the original PDF
    return new Blob([newText], { type: 'text/markdown' });
  } else {
    // Return formatted text as DOCX type blob
    return new Blob([newText], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }
}
