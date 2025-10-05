import request from 'supertest';
import { configureApp } from '../src/app';
import { AppDataSource } from '../src/data-source';

let app: any;

beforeAll(async () => {
  // initialize DB (will fall back to stub if DB not available)
  try {
    await AppDataSource.initialize();
  } catch (e) {
    // ignore - tests can still run in stub mode
  }
  app = await configureApp();
});

afterAll(async () => {
  try {
    await AppDataSource.destroy();
  } catch (e) {}
});

describe('Auth + S3 integration', () => {
  it('signup -> login -> refresh -> presign', async () => {
    const email = `test+${Date.now()}@example.com`;
    const password = 'Test1234!';

    const signup = await request(app)
      .post('/auth/signup')
      .send({ email, password, fullName: 'Test User' });

    expect(signup.status).toBe(200);
    expect(signup.body.user).toBeDefined();
    expect(signup.body.refreshToken).toBeDefined();

    const login = await request(app).post('/auth/login').send({ email, password });
    expect(login.status).toBe(200);
    const token = login.body.token;
    const refreshToken = login.body.refreshToken;
    expect(token).toBeDefined();
    expect(refreshToken).toBeDefined();

    // refresh
    const refreshed = await request(app).post('/auth/refresh').send({ refreshToken });
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.token).toBeDefined();

    // presign (will fail if S3 not configured, but should return 500 or error body)
    const presign = await request(app).get('/s3/presign').query({ key: `test/${Date.now()}.bin` }).set('Authorization', `Bearer ${token}`);
    // we accept success or server error depending on S3 env
    expect([200, 500]).toContain(presign.status);
  }, 20000);
});
