# Care HR Backend

[![CI/CD Pipeline](https://github.com/Johnaderounmu/care_hr_backend/actions/workflows/ci.yml/badge.svg)](https://github.com/Johnaderounmu/care_hr_backend/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/Johnaderounmu/care_hr_backend/branch/master/graph/badge.svg)](https://codecov.io/gh/Johnaderounmu/care_hr_backend)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

> 🚀 **Care HR Backend** - A robust Node.js, TypeScript, GraphQL, and PostgreSQL powered HR management system backend

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Environment Configuration](#-environment-configuration)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication system
- Role-based access control (HR Admin, Applicant)
- Secure password hashing with bcrypt
- Session management and token refresh

### 📊 GraphQL API
- Type-safe GraphQL schema
- Apollo Server integration
- Real-time subscriptions support
- Efficient query optimization

### 🗄️ Database Management
- PostgreSQL with TypeORM
- Database migrations and seeding
- Connection pooling and optimization
- ACID compliance

### 📎 File Management
- AWS S3 integration for document storage
- Presigned URL generation
- File upload validation
- Document categorization

### 🔒 Security Features
- Input validation and sanitization
- CORS configuration
- Rate limiting
- SQL injection prevention
- XSS protection

## 🏗️ Architecture

```
src/
├── entities/          # TypeORM database entities
├── routes/           # Express route handlers
│   ├── auth.ts      # Authentication endpoints
│   └── s3.ts        # File upload endpoints
├── test/            # Integration tests
├── types/           # TypeScript type definitions
├── app.ts          # Express application setup
├── data-source.ts  # Database configuration
├── graphql.ts      # GraphQL schema and resolvers
└── index.ts        # Application entry point
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 12
- **npm** or **yarn**
- **Docker** (optional, for containerized development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Johnaderounmu/care_hr_backend.git
   cd care_hr_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start PostgreSQL** (using Docker)
   ```bash
   docker-compose up -d postgres
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start at `http://localhost:4000`

## 📚 API Documentation

### REST Endpoints

#### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User authentication
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout

#### File Management
- `POST /s3/presign` - Generate presigned upload URL
- `GET /s3/download/:key` - Download file

### GraphQL Endpoint

Access the GraphQL playground at `http://localhost:4000/graphql`

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgres://user:password@localhost:5432/carehr
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=carehr

# Authentication
JWT_SECRET=your-super-secure-secret-key
JWT_EXPIRES_IN=24h

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=care-hr-documents
S3_REGION=us-east-1
```

## 👨‍💻 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:integration  # Run integration tests

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Test Coverage
```bash
npm run test:coverage
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Docker Deployment

```bash
# Build image
docker build -t care-hr-backend .

# Run container
docker run -p 4000:4000 --env-file .env care-hr-backend
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass: `npm test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 **Email**: support@careconnecthr.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/Johnaderounmu/care_hr_backend/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Johnaderounmu/care_hr_backend/discussions)

---

**Made with ❤️ by the Care HR Team**
