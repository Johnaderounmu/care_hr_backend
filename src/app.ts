import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import authRoutes from './routes/auth';
import s3Routes from './routes/s3';
import { startGraphQL } from './graphql';

const app = express();
app.use(cors());
app.use(json());

app.use('/auth', authRoutes);
app.use('/s3', s3Routes);

// Lightweight endpoints for convenience
app.get('/documents', (req, res) => res.json({ ok: true, documents: [] }));
app.get('/jobs', (req, res) => res.json({ ok: true, jobs: [] }));

// Export the app and a helper to attach GraphQL when desired
export async function configureApp() {
  await startGraphQL(app);
  return app;
}

export default app;
