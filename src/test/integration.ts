import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const base = process.env.BACKEND_URL || 'http://localhost:4000';

async function run() {
  console.log('Running integration test against', base);

  const email = `test+${Date.now()}@example.com`;
  const password = 'Test1234!';

  // Signup
  let resp = await fetch(`${base}/auth/signup`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password, fullName: 'Test User' }),
  });
  const signup = await resp.json();
  console.log('signup:', signup && signup.user ? 'ok' : 'failed', signup.error || '');

  // Login
  resp = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const login = await resp.json();
  console.log('login:', login && login.token ? 'ok' : 'failed', login.error || '');

  const token = login.token;
  if (!token) process.exit(2);

  // Presign
  resp = await fetch(`${base}/s3/presign?key=test/${Date.now()}.bin`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const presign = await resp.json();
  console.log('presign:', presign && presign.url ? 'ok' : 'failed', presign.error || '');

  if (!presign.url) process.exit(3);

  console.log('Integration test completed successfully');
}

run().catch(err => {
  console.error('integration test failed', err);
  process.exit(1);
});
