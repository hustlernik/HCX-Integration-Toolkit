/**
 * @fileoverview Utility for parsing PDF files to extract text content.
 */

import pdf from 'pdf-parse';

/**
 * Parses a PDF file buffer and extracts its text content.
 *
 * @param {Buffer} pdfBuffer The buffer containing the PDF file data.
 * @returns {Promise<string>} A promise that resolves with the extracted text content.
 * @throws {Error} If parsing fails or the input is not a valid PDF.
 */
async function extractTextFromPdf(pdfBuffer) {
  if (!pdfBuffer || typeof pdfBuffer !== 'object' || !Buffer.isBuffer(pdfBuffer)) {
    throw new Error('Invalid input: pdfBuffer must be a Buffer.');
  }

  try {
    const data = await pdf(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);

    if (error.name === 'InvalidPDFException') {
      throw new Error('Failed to parse PDF: Invalid PDF file format.');
    }
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

export { extractTextFromPdf };
