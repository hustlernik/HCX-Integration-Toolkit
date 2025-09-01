import { resolve } from 'path';
require('dotenv').config({ path: resolve(__dirname, '../.env') });
import express, { json } from 'express';
import cors from 'cors';
import multer, { memoryStorage } from 'multer';

import { validateFhirResource } from './common/fhirValidator.js';
import { extractTextFromPdf } from './utils/pdfParser.js';
import { parseExcelBuffer } from './utils/excelToJson.js';
import { buildInsurancePlanPrompt } from './prompt/InsurancePlan.js';
import { generateJson } from './utils/vertexClient.js';

const app = express();
app.use(cors());
app.use(json());
const port = process.env.PORT || 5001;

const storage = memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.send('FHIR InsurancePlan Converter Backend');
});

function toBundle(resources) {
  return {
    resourceType: 'Bundle',
    type: 'collection',
    entry: resources.map((r) => ({ resource: r })),
  };
}

app.post('/api/insuranceplan/convert', upload.single('inputFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  try {
    const originalFileName = req.file.originalname || 'uploaded';
    const lower = originalFileName.toLowerCase();
    const isPdf = lower.endsWith('.pdf') || (req.file.mimetype || '').includes('pdf');
    const isExcel =
      lower.endsWith('.xlsx') ||
      lower.endsWith('.xls') ||
      (req.file.mimetype || '').includes('excel');

    let inputKind;
    let inputData;

    if (isPdf) {
      inputKind = 'pdf_text';
      inputData = await extractTextFromPdf(req.file.buffer);
      if (!inputData || !inputData.trim()) {
        return res.status(400).json({ message: 'Failed to extract text from PDF.' });
      }
    } else if (isExcel) {
      inputKind = 'excel_data';
      const sheets = parseExcelBuffer(req.file.buffer);

      const formattedSheets = sheets.map((sheet) => ({
        sheetName: sheet.sheetName,
        headers: sheet.rows.length > 0 ? Object.keys(sheet.rows[0]) : [],
        rowCount: sheet.rows.length,
        firstFewRows: sheet.rows.slice(0, 5),
      }));

      inputData =
        `Excel file with ${sheets.length} sheet(s):\n` +
        formattedSheets
          .map(
            (sheet) =>
              `Sheet: "${sheet.sheetName}" (${sheet.rowCount} rows)\n` +
              `Headers: ${sheet.headers.join(', ')}\n` +
              'Sample data:\n' +
              sheet.firstFewRows
                .map(
                  (row, i) =>
                    `Row ${i + 1}: ` +
                    JSON.stringify(row, (key, value) => (value === null ? undefined : value)),
                )
                .join('\n'),
          )
          .join('\n\n');
    } else {
      return res
        .status(400)
        .json({ message: 'Unsupported file type. Use PDF or Excel (.xlsx/.xls).' });
    }

    const profileUrl = process.env.INSURANCEPLAN_PROFILE_URL || '';
    const prompt = buildInsurancePlanPrompt({ inputKind, inputData, profileUrl });

    console.log('---- PROMPT SENT TO AI ----\n', prompt, '\n---------------------------------');

    const raw = await generateJson(prompt);
    console.log('---- RAW RESPONSE FROM AI ----\n', raw, '\n---------------------------------');

    let aiJson;
    try {
      let cleaned = raw
        .replace(/<[^>]*>/g, '')
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
        .trim();
      const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        aiJson = JSON.parse(jsonMatch[1].trim());
      } else {
        const jsonStart = cleaned.indexOf('{');
        const jsonEnd = cleaned.lastIndexOf('}');

        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const jsonStr = cleaned.substring(jsonStart, jsonEnd + 1);
          aiJson = JSON.parse(jsonStr);
        } else {
          aiJson = JSON.parse(cleaned);
        }
      }
    } catch (e) {
      console.error('Failed to parse JSON response:', e);
      throw new Error(`Failed to parse JSON response: ${e.message}`);
    }

    if (aiJson && aiJson.error) {
      return res.status(400).json({ message: 'LLM reported error', ...aiJson });
    }

    let bundle;
    if (aiJson.resourceType === 'Bundle') {
      bundle = aiJson;
    } else if (aiJson.resourceType === 'InsurancePlan') {
      bundle = toBundle([aiJson]);
    } else if (Array.isArray(aiJson)) {
      const errorsInArray = aiJson.filter((x) => x && x.error);
      if (errorsInArray.length && errorsInArray.length === aiJson.length) {
        return res.status(400).json({ message: 'LLM reported errors', errors: errorsInArray });
      }
      bundle = toBundle(aiJson.filter((x) => x && !x.error));
    } else if (aiJson.insurancePlans && Array.isArray(aiJson.insurancePlans)) {
      bundle = toBundle(aiJson.insurancePlans);
    } else {
      return res
        .status(400)
        .json({ message: 'Unexpected AI output. Expected InsurancePlan or Bundle.' });
    }

    const errors = [];
    const warnings = [];
    for (const e of bundle.entry || []) {
      if (!e.resource || e.resource.resourceType !== 'InsurancePlan') {
        errors.push('Non-InsurancePlan resource in bundle entry');
        continue;
      }
      const v = validateFhirResource(e.resource);
      if (!v.isValid) errors.push(...(v.errors || []));
      if (v.warnings && v.warnings.length) warnings.push(...v.warnings);

      if (profileUrl) {
        e.resource.meta = e.resource.meta || {};
        const profiles = new Set([...(e.resource.meta.profile || [])]);
        profiles.add(profileUrl);
        e.resource.meta.profile = Array.from(profiles);
      }
    }

    if (errors.length) {
      return res.status(400).json({ message: 'Validation failed.', errors, bundle: bundle });
    }

    return res.status(200).json({
      message: 'Conversion successful',
      bundle: bundle,
      warnings,
    });
  } catch (err) {
    console.error('/api/insuranceplan/convert error', err);
    return res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

app.post('/api/test-json', async (req, res) => {
  try {
    console.log('Received request on /api/test-json');
    const simplePrompt =
      "Is the sky blue? Respond with JSON containing one key 'answer' which is 'yes' or 'no'.";

    const raw = await generateJson(simplePrompt);

    let aiJson;
    try {
      aiJson = JSON.parse(raw);
    } catch (e) {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) {
        aiJson = JSON.parse(m[0]);
      } else {
        throw new Error('LLM did not return valid JSON');
      }
    }

    res.status(200).json({ message: 'JSON test successful', response: aiJson });
  } catch (err) {
    console.error('/api/test-json error', err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
