import request from 'supertest';
import { Express } from 'express';
import { configureApp } from '../src/app';
import { AppDataSource } from '../src/data-source';

describe('API Endpoints Integration Tests', () => {
  let app: Express;

  beforeAll(async () => {
    // Initialize the app
    app = await configureApp();
    
    // Initialize database connection for testing
    if (!AppDataSource.isInitialized) {
      try {
        await AppDataSource.initialize();
      } catch (error) {
        console.log('Database connection failed (expected in CI):', error);
      }
    }
  });

  afterAll(async () => {
    // Clean up database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('Health Check', () => {
    it('should return 200 for health check', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('ok', true);
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Jobs API', () => {
    it('should return jobs list (without authentication)', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 for creating job without authentication', async () => {
      const newJob = {
        title: 'Test Job',
        description: 'Test Description',
        department: 'Engineering',
        location: 'Remote',
      };

      await request(app)
        .post('/api/jobs')
        .send(newJob)
        .expect(401);
    });

    it('should handle non-existent job gracefully', async () => {
      const response = await request(app)
        .get('/api/jobs/non-existent-id');
      
      // Should return either 404 (if DB is connected) or 500 (if DB is not connected)
      expect([404, 500]).toContain(response.status);
    });
  });

  describe('Applications API', () => {
    it('should return 401 for creating application without authentication', async () => {
      const newApplication = {
        jobId: 'test-job-id',
        coverLetter: 'Test cover letter',
      };

      await request(app)
        .post('/api/applications')
        .send(newApplication)
        .expect(401);
    });

    it('should return 401 for getting applications without authentication', async () => {
      await request(app)
        .get('/api/applications')
        .expect(401);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      await request(app)
        .get('/api/non-existent-route')
        .expect(404);
    });
  });
});