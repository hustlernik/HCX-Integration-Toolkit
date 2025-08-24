import express, { Application } from 'express';
import insurancePlanRouter from './routes/insurancePlan.routes';
import beneficiaryRouter from './routes/beneficiary.routes';
import policyRouter from './routes/policy.routes';
import nhcxRouter from './routes/nhcx.routes';
import coverageEligibilityRouter from './routes/coverageEligibility.routes';
import sessionRouter from './routes/session.routes';
import { errorHandler } from './middlewares/errorHandler';
import morgan from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';

const app: Application = express();

const mongoUrl = process.env.MONGO_URL_DEV || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_DB_NAME || 'hcx-toolkit';

mongoose
  .connect(`${mongoUrl}/${dbName}`)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', insurancePlanRouter);
app.use('/api/beneficiaries', beneficiaryRouter);
app.use('/api/policies', policyRouter);
app.use('/coverage-eligibility', coverageEligibilityRouter);
app.use('/', nhcxRouter);
app.use('/', sessionRouter);
app.use(errorHandler);

export default app;
