import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.route';
import { errorHandler } from './middleware/error.middleware';
import companyRouter from './routes/company.route';
import tenderRouter from './routes/tender.route';
import applicationRouter from './routes/application.route';
import searchRouter from './routes/search.route';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRouter);
app.use('/api/companies', companyRouter);
app.use('/api/tenders', tenderRouter);
app.use('/api/search', searchRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'Kibou B2B Tender Management API' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
