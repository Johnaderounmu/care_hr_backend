import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { AppDataSource } from './data-source';
import authRoutes from './routes/auth';
import s3Routes from './routes/s3';
import jobRoutes from './routes/jobs';
import applicationRoutes from './routes/applications';
import logger from './utils/logger';

const app = express();
app.use(cors());
app.use(json());

// Add error handling middleware
app.use((err: any, _req: any, res: any) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  try {
    logger.info('🔄 Initializing database connection...');
    await AppDataSource.initialize();
    logger.info('✅ Postgres datasource initialized successfully');
  } catch (err) {
    logger.warn('⚠️  Failed to initialize Postgres datasource, continuing without DB:', (err as Error)?.message);
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
      logger.info(`🚀 Care HR backend running on http://localhost:${port}`);
      logger.info(`📊 Health check: http://localhost:${port}/health`);
      logger.info(`🔗 API endpoints: http://localhost:${port}/api/`);
      resolve();
    });

    server.on('error', (err) => {
      logger.error('❌ Server error:', err);
      reject(err);
    });

    // Keep server alive
    process.on('SIGTERM', () => {
      logger.info('🛑 SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('🛑 SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('✅ Server closed');
        process.exit(0);
      });
    });
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

start().catch(err => {
  logger.error('💥 Failed to start server:', err);
  process.exit(1);
});
