const xlsx = require('xlsx');

/**
 * Parse Excel buffer into a simple JSON structure.
 * Returns an array of row objects from the first sheet by default,
 * with sheet name metadata.
 *
 * @param {Buffer} buffer
 * @returns {{sheetName: string, rows: object[]}[]}
 */
function parseExcelBuffer(buffer) {
  const wb = xlsx.read(buffer, { type: 'buffer' });
  const result = [];
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(ws, { defval: null });
    result.push({ sheetName, rows });
  }
  return result;
}

export default { parseExcelBuffer };
