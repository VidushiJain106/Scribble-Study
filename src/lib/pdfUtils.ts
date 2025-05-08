import * as pdfjsLib from 'pdfjs-dist';

// Configure the PDF.js worker
// This only needs to be done once in the application
const configurePdfWorker = () => {
  // We need to point to the worker file location
  // Since we're using a CDN, we can use the CDN URL
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
};

// Initialize when the file is imported
configurePdfWorker();

/**
 * Extract text from a PDF file
 * @param pdfUrl The URL or data URL of the PDF file
 * @returns A promise that resolves to the extracted text
 */
export const extractTextFromPdf = async (pdfUrl: string): Promise<string> => {
  try {
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    
    const numPages = pdf.numPages;
    let extractedText = '';
    
    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Concatenate the text items
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      extractedText += pageText + '\n\n';
    }
    
    return extractedText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}; 