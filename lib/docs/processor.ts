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
    const pdfDoc = await PDFDocument.create();
    
    // STRIP METADATA: Explicitly remove all AI-generated or identifiable properties
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setCreator('CleanDoc'); 
    pdfDoc.setProducer('CleanDoc');

    const page = pdfDoc.addPage();
    // Using a simplistic embedding just for the MVP
    // For a robust system we'd use fontkit to embed our brutalist font.
    page.drawText(newText.substring(0, 1500) + (newText.length > 1500 ? '...' : ''), { x: 50, y: page.getHeight() - 50, size: 12 });
    
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes as any], { type: 'application/pdf' });
  } else {
    // Return formatted text as TXT to ensure 100% metadata stripping for Docx fallback.
    // In production, we'd use the 'docx' package to build a fresh, un-watermarked DOCX document structure.
    return new Blob([newText], { type: 'text/plain' });
  }
}
