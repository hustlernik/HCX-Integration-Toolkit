import process from 'process';
import { ObjectId, InsertManyResult } from 'mongodb';
import { connectToDatabase, getDb, closeConnection } from '../configs/db-connection';
import { seedData, type Patient, type InsurancePlan, type PatientCoverage } from './seed-data';

interface ExtendedPatientCoverage extends Omit<PatientCoverage, 'planId'> {
  patientId: ObjectId;
  planId: ObjectId;
  patientAbhaNumber: string;
  originalPlanId: string;
}

async function seedDatabase(): Promise<void> {
  try {
    await connectToDatabase();
    console.log('Connected to MongoDB for seeding...');

    const db = getDb();

    await db.collection('patients').deleteMany({});
    await db.collection('insurance_companies').deleteMany({});
    await db.collection('insurance_plans').deleteMany({});
    await db.collection('patient_coverage').deleteMany({});
    console.log('Cleared existing collections...');

    await db.collection('insurance_companies').insertOne(seedData.insuranceCompany);
    console.log(`Inserted insurance company: ${seedData.insuranceCompany.name}`);

    const patientResult: InsertManyResult<Patient> = await db
      .collection('patients')
      .insertMany(seedData.patients);
    console.log(`Inserted ${seedData.patients.length} patients`);

    const planResult: InsertManyResult<InsurancePlan> = await db
      .collection('insurance_plans')
      .insertMany(seedData.insurancePlans);
    console.log(`Inserted ${seedData.insurancePlans.length} insurance plans`);

    const coverageData: ExtendedPatientCoverage[] = seedData.patientCoverage.map((coverage) => {
      const patientIndex: number = seedData.patients.findIndex(
        (p) => p.abhaNumber === coverage.patientAbhaNumber,
      );
      const patientObjectId: ObjectId = patientResult.insertedIds[patientIndex];

      const planIndex: number = seedData.insurancePlans.findIndex(
        (p) => p.planId === coverage.planId,
      );
      const planObjectId: ObjectId = planResult.insertedIds[planIndex];

      return {
        ...coverage,
        patientId: patientObjectId,
        planId: planObjectId,
        patientAbhaNumber: coverage.patientAbhaNumber,
        originalPlanId: coverage.planId,
      };
    });

    await db.collection('patient_coverage').insertMany(coverageData);
    console.log(`Inserted ${coverageData.length} coverage records`);

    await db.collection('patients').createIndex({ abhaNumber: 1 }, { unique: true });
    await db.collection('insurance_plans').createIndex({ planId: 1 }, { unique: true });
    await db.collection('patient_coverage').createIndex({ patientId: 1 });
    await db.collection('patient_coverage').createIndex({ planId: 1 });
    await db.collection('patient_coverage').createIndex({ patientAbhaNumber: 1 });

    console.log('\nDatabase seeded successfully!');
  } catch (error: unknown) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await closeConnection();
  }
}

seedDatabase().catch((error: unknown) => {
  console.error('Failed to seed database:', error);
  process.exit(1);
});
