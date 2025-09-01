import { utils, writeFile } from 'xlsx';

const planDetails = [
  { Key: 'Plan Name', Value: 'Active Assure Silver' },
  { Key: 'Plan ID', Value: 'PLAN-123' },
  { Key: 'Status', Value: 'active' },
  { Key: 'Start Date', Value: '2025-01-01' },
  { Key: 'Issuer', Value: 'Acme Insurance Co.' },
  { Key: 'TPA', Value: 'HealthAdmin TPA' },
  { Key: 'Plan Type', Value: 'Medical' },
];

const coverage = [
  { 'Coverage Type': 'In-Patient Hospitalization', Benefit: 'Room Rent' },
  { 'Coverage Type': 'In-Patient Hospitalization', Benefit: 'ICU Charges' },
  { 'Coverage Type': 'Day Care', Benefit: 'Cataract Surgery' },
];

const wb = utils.book_new();

const ws1 = utils.json_to_sheet(planDetails);
const ws2 = utils.json_to_sheet(coverage);

utils.book_append_sheet(wb, ws1, 'Plan Details');
utils.book_append_sheet(wb, ws2, 'Coverage');

writeFile(wb, 'test_plan.xlsx');

console.log('test_plan.xlsx created successfully.');
