import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { AppDataSource } from './data-source';
import authRoutes from './routes/auth';
import s3Routes from './routes/s3';
import jobRoutes from './routes/jobs';
import applicationRoutes from './routes/applications';

const app = express();
app.use(cors());
app.use(json());

// Add error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  try {
    console.log('🔄 Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✅ Postgres datasource initialized successfully');
  } catch (err) {
    console.warn('⚠️  Failed to initialize Postgres datasource, continuing without DB:', (err as Error)?.message);
  }

  // API Routes
  app.use('/auth', authRoutes);
  app.use('/s3', s3Routes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/applications', applicationRoutes);

  // Health check endpoint
  app.get('/health', (req, res) => {
    console.log('🔍 Health check requested');
    res.json({ 
      ok: true, 
      timestamp: new Date().toISOString(),
      database: AppDataSource.isInitialized ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Keep existing lightweight endpoints for convenience
  app.get('/documents', (req, res) => res.json({ ok: true, documents: [] }));
  app.get('/jobs', (req, res) => res.json({ ok: true, jobs: [] }));

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  const port = process.env.PORT || 4000;
  
  return new Promise<void>((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`🚀 Care HR backend running on http://localhost:${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`🔗 API endpoints: http://localhost:${port}/api/`);
      resolve();
    });

    server.on('error', (err) => {
      console.error('❌ Server error:', err);
      reject(err);
    });

    // Keep server alive
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, shutting down gracefully');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

start().catch(err => {
  console.error('💥 Failed to start server:', err);
  process.exit(1);
});
