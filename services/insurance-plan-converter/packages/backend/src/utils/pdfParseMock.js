/**
 * @fileoverview Mock implementation of pdf-parse to prevent test file access during initialization.
 */

export default async function pdfParse(buffer) {
  // This is a mock implementation that will be replaced by the actual pdf-parse
  // after the module is fully loaded
  const actualPdfParse = (await import('pdf-parse')).default;

  // Now that we've imported the actual module, we can use it
  return actualPdfParse(buffer);
}
