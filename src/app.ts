import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import authRoutes from './routes/auth';
import s3Routes from './routes/s3';
import jobRoutes from './routes/jobs';
import applicationRoutes from './routes/applications';
import documentRoutes from './routes/documents';
import reportRoutes from './routes/reports';
import notificationRoutes from './routes/notifications';
import interviewRoutes from './routes/interviews';
import { startGraphQL } from './graphql';

const app = express();
app.use(cors());
app.use(json());

app.use('/auth', authRoutes);
app.use('/s3', s3Routes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/interviews', interviewRoutes);

// Health check endpoint
app.get('/health', (req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

// Export the app and a helper to attach GraphQL when desired
export async function configureApp() {
  await startGraphQL(app);
  return app;
}

export default app;
