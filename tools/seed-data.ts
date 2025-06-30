interface Patient {
  abhaNumber: string;
  name: string;
  dob: Date;
  gender: 'Male' | 'Female' | 'Other';
}

interface InsuranceCompany {
  companyId: string;
  name: string;
  code: string;
  phone: string;
  customerServicePhone: string;
  website: string;
}

interface InsurancePlan {
  planId: string;
  companyId: string;
  name: string;
  description: string;
  premium: number;
  deductible: number;
  coveragePercentage: number;
  maxCoverageAmount: number;
}

interface PatientCoverage {
  coverageId: string;
  patientAbhaNumber: string;
  planId: string;
  policyNumber: string;
  subscriberId: string;
  effectiveDate: Date;
  expirationDate: Date;
  isActive: boolean;
  copayAmount: number;
  yearToDateDeductible: number;
}

interface SeedData {
  patients: Patient[];
  insuranceCompany: InsuranceCompany;
  insurancePlans: InsurancePlan[];
  patientCoverage: PatientCoverage[];
}

export const seedData: SeedData = {
  patients: [
    {
      abhaNumber: '12-3456-7890-1234',
      name: 'Rajesh Kumar Sharma',
      dob: new Date('1985-03-15'),
      gender: 'Male',
    },
    {
      abhaNumber: '98-7654-3210-9876',
      name: 'Priya Devi Singh',
      dob: new Date('1992-07-22'),
      gender: 'Female',
    },
    {
      abhaNumber: '11-2233-4455-6677',
      name: 'Amit Patel',
      dob: new Date('1978-11-08'),
      gender: 'Male',
    },
  ],

  insuranceCompany: {
    companyId: 'IC-001',
    name: 'Star Health Insurance',
    code: 'STAR',
    phone: '+91-44-2856-7890',
    customerServicePhone: '+91-44-2856-7891',
    website: 'www.starhealth.in',
  },

  insurancePlans: [
    {
      planId: 'PLAN-BASIC-01',
      companyId: 'IC-001',
      name: 'Basic Health Plan',
      description: 'Entry-level coverage for routine care',
      premium: 2000,
      deductible: 5000,
      coveragePercentage: 70,
      maxCoverageAmount: 200000,
    },
    {
      planId: 'PLAN-STANDARD-02',
      companyId: 'IC-001',
      name: 'Standard Health Plan',
      description: 'Comprehensive coverage with better benefits',
      premium: 4000,
      deductible: 3000,
      coveragePercentage: 80,
      maxCoverageAmount: 500000,
    },
    {
      planId: 'PLAN-PREMIUM-03',
      companyId: 'IC-001',
      name: 'Premium Health Plan',
      description: 'Top-tier coverage with maximum benefits',
      premium: 6000,
      deductible: 1000,
      coveragePercentage: 90,
      maxCoverageAmount: 1000000,
    },
  ],

  patientCoverage: [
    {
      coverageId: 'COV-001',
      patientAbhaNumber: '12-3456-7890-1234',
      planId: 'PLAN-BASIC-01',
      policyNumber: 'POL-2024-001234',
      subscriberId: 'SUB-12345',
      effectiveDate: new Date('2024-01-01'),
      expirationDate: new Date('2024-12-31'),
      isActive: true,
      copayAmount: 1000,
      yearToDateDeductible: 2000,
    },
    {
      coverageId: 'COV-002',
      patientAbhaNumber: '98-7654-3210-9876',
      planId: 'PLAN-STANDARD-02',
      policyNumber: 'POL-2024-002345',
      subscriberId: 'SUB-23456',
      effectiveDate: new Date('2024-01-01'),
      expirationDate: new Date('2024-12-31'),
      isActive: true,
      copayAmount: 750,
      yearToDateDeductible: 1500,
    },
    {
      coverageId: 'COV-003',
      patientAbhaNumber: '11-2233-4455-6677',
      planId: 'PLAN-PREMIUM-03',
      policyNumber: 'POL-2024-003456',
      subscriberId: 'SUB-34567',
      effectiveDate: new Date('2024-01-01'),
      expirationDate: new Date('2024-12-31'),
      isActive: true,
      copayAmount: 500,
      yearToDateDeductible: 800,
    },
  ],
};

export type { Patient, InsuranceCompany, InsurancePlan, PatientCoverage, SeedData };
