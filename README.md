# Care HR Backend (minimal scaffold)

This is a tiny starter backend to support the Flutter frontend during local development.
It exposes simple REST endpoints and an Apollo GraphQL endpoint. It's intentionally
minimal and intended as a local dev stub.

Required env variables (.env):

- DATABASE_URL=postgres://user:pass@localhost:5432/carehr
- PORT=4000
- AWS_ACCESS_KEY_ID=...
- AWS_SECRET_ACCESS_KEY=...
- S3_BUCKET_NAME=your-bucket

Start locally (recommended):

1. cd backend
2. npm install
3. docker-compose up -d   # starts a local Postgres on 5432
4. npm run start

Run integration test:

1. Ensure backend is running at http://localhost:4000
2. npm run test:integration

Environment variables expected by the server (can be placed in a .env file):

- PG_HOST, PG_PORT, PG_USER, PG_PASSWORD, PG_DATABASE
- JWT_SECRET (optional - defaults to dev-secret)
- S3_BUCKET, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY (for presign)

This scaffold provides a working flow: /auth/signup, /auth/login, and /s3/presign.
It's suitable for local dev and testing, but not production-ready.
