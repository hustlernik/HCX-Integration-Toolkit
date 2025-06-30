import process from 'process';
import { connectToDatabase, getDb, closeConnection } from '../configs/db-connection';
import { seedData } from './seed-data';

async function seedDatabase() {
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

    const patientResult = await db.collection('patients').insertMany(seedData.patients);
    console.log(`Inserted ${seedData.patients.length} patients`);

    const planResult = await db.collection('insurance_plans').insertMany(seedData.insurancePlans);
    console.log(`Inserted ${seedData.insurancePlans.length} insurance plans`);

    const coverageData = seedData.patientCoverage.map((coverage) => {
      const patientIndex = seedData.patients.findIndex(
        (p) => p.abhaNumber === coverage.patientAbhaNumber,
      );
      const patientObjectId = patientResult.insertedIds[patientIndex];

      const planIndex = seedData.insurancePlans.findIndex((p) => p.planId === coverage.planId);
      const planObjectId = planResult.insertedIds[planIndex];

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
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await closeConnection();
  }
}

seedDatabase().catch((error) => {
  console.error('Failed to seed database:', error);
  process.exit(1);
});
