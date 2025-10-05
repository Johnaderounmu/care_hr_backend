import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { AppDataSource } from './data-source';

const app = express();
app.use(cors());
app.use(json());

async function start() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Postgres datasource initialized successfully');
  } catch (err) {
    console.warn('⚠️  Failed to initialize Postgres datasource, continuing without DB:', (err as Error)?.message || err);
  }

  // Health check endpoint
  app.get('/health', (req, res) => {
    console.log('🔍 Health check requested');
    res.json({ 
      ok: true, 
      timestamp: new Date().toISOString(),
      database: AppDataSource.isInitialized ? 'connected' : 'disconnected'
    });
  });

  // Simple test endpoint
  app.get('/test', (req, res) => {
    console.log('🧪 Test endpoint requested');
    res.json({ message: 'Backend is working!' });
  });

  // Keep existing lightweight endpoints
  app.get('/documents', (req, res) => res.json({ ok: true, documents: [] }));
  app.get('/jobs', (req, res) => res.json({ ok: true, jobs: [] }));

  const port = process.env.PORT || 4000;
  
  const server = app.listen(port, () => {
    console.log(`🚀 Care HR backend running on http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🧪 Test endpoint: http://localhost:${port}/test`);
  });

  // Error handling
  server.on('error', (err) => {
    console.error('❌ Server error:', err);
  });

  process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('✅ Server closed');
      process.exit(0);
    });
  });
}

start().catch(err => {
  console.error('💥 Failed to start server:', err);
  process.exit(1);
});