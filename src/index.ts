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

async function start() {
  try {
    logger.info('🔄 Initializing database connection...');
    await AppDataSource.initialize();
    logger.info('✅ Postgres datasource initialized successfully');
  } catch (err) {
    logger.warn('⚠️  Failed to initialize Postgres datasource, continuing without DB:', (err as Error)?.message);
  }

  // Add request logging middleware
  app.use((req, res, next) => {
    logger.info(`📝 ${req.method} ${req.url} from ${req.ip}`);
    next();
  });

  // API Routes
  app.use('/auth', authRoutes);
  app.use('/s3', s3Routes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/applications', applicationRoutes);

  // Add missing API endpoints that the Flutter app expects
  app.get('/api/documents/my-documents', (req, res) => {
    // Flutter app expects a direct list of documents
    res.json([
      {
        id: '1',
        name: 'Resume.pdf',
        type: 'application/pdf',
        size: 245760,
        status: 'pending',
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Cover Letter.pdf',
        type: 'application/pdf',
        size: 125430,
        status: 'approved',
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }
    ]);
  });

  app.get('/api/documents/all', (req, res) => {
    // HR admin view - all documents
    res.json([
      {
        id: '1',
        name: 'Resume.pdf',
        type: 'application/pdf',
        size: 245760,
        status: 'pending',
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        uploadedBy: 'John Doe'
      },
      {
        id: '2',
        name: 'Cover Letter.pdf',
        type: 'application/pdf',
        size: 125430,
        status: 'approved',
        uploadedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        uploadedBy: 'Jane Smith'
      }
    ]);
  });

  app.get('/api/notifications', (req, res) => {
    // Flutter app expects the structure with pagination
    res.json({
      notifications: [
        {
          id: '1',
          title: 'Welcome to CareHR',
          message: 'Your account has been successfully created',
          type: 'info',
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Document Approved',
          message: 'Your resume has been approved by HR',
          type: 'success',
          read: false,
          createdAt: new Date().toISOString()
        }
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 2
      }
    });
  });

  // Override the jobs endpoint to provide mock data when database is empty
  app.get('/api/jobs', async (req, res) => {
    try {
      // For now, always return mock data to test frontend
      // TODO: Use JobService when database is properly populated
      res.json([
        {
          id: '1',
          title: 'Senior Flutter Developer',
          department: 'Engineering',
          location: 'Remote',
          type: 'full-time',
          description: 'We are seeking a skilled Flutter developer to join our growing team.',
          requirements: 'Flutter, Dart, REST APIs, State Management',
          salaryRange: '$90,000 - $130,000',
          status: 'published',
          experienceLevel: 'senior',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Product Manager',
          department: 'Product',
          location: 'San Francisco, CA',
          type: 'full-time',
          description: 'Join our product team to help shape the future of our HR platform.',
          requirements: 'Product Management, Analytics, Leadership, Agile',
          salaryRange: '$120,000 - $160,000',
          status: 'published',
          experienceLevel: 'mid',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          title: 'HR Specialist',
          department: 'Human Resources',
          location: 'New York, NY',
          type: 'full-time',
          description: 'Help manage our growing team and improve HR processes.',
          requirements: 'HR Experience, Communication, HRIS Systems, Compliance',
          salaryRange: '$65,000 - $85,000',
          status: 'published',
          experienceLevel: 'mid',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    } catch (error) {
      logger.error('Error fetching jobs:', error);
      // Fallback to mock data on error
      res.json([
        {
          id: '1',
          title: 'Senior Flutter Developer',
          department: 'Engineering',
          location: 'Remote',
          type: 'full-time',
          description: 'We are seeking a skilled Flutter developer to join our growing team.',
          requirements: 'Flutter, Dart, REST APIs, State Management',
          salaryRange: '$90,000 - $130,000',
          status: 'published',
          experienceLevel: 'senior',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    }
  });

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

  // Add error handling middleware AFTER all routes
  app.use((err: any, req: any, res: any, next: any) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

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
