/**
 * FHIR Utilities Service
 * Main entry point for the FHIR utilities microservice
 */

import app from './src/app.js';

const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
});