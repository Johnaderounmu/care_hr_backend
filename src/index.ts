import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { startGraphQL } from './graphql';
import { AppDataSource } from './data-source';
import authRoutes from './routes/auth';
import s3Routes from './routes/s3';

const app = express();
app.use(cors());
app.use(json());

async function start() {
  try {
    await AppDataSource.initialize();
    console.log('Postgres datasource initialized');
  } catch (err) {
    console.warn('Failed to initialize Postgres datasource, continuing in stub mode', err);
  }

  app.use('/auth', authRoutes);
  app.use('/s3', s3Routes);

  // Keep existing lightweight endpoints for convenience
  app.get('/documents', (req, res) => res.json({ ok: true, documents: [] }));
  app.get('/jobs', (req, res) => res.json({ ok: true, jobs: [] }));

  await startGraphQL(app);

  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Care HR backend running on http://localhost:${port}`));
}

start().catch(err => {
  console.error('Failed to start server', err);
  process.exit(1);
});
