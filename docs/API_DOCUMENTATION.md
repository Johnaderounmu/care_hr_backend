# Care HR Backend API Documentation

## Overview

The Care HR Backend provides a comprehensive REST API for managing HR operations including job postings, applications, document management, and user authentication. The API is built with Express.js, TypeScript, and TypeORM.

## Base URL

- Development: `http://localhost:4000`
- Production: TBD

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Health Check

#### GET /health
Check API health status.

**Response:**
```json
{
  "ok": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Authentication

#### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "refreshToken": "refresh-token-here",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "User Name",
    "role": "APPLICANT"
  }
}
```

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "User Name",
  "role": "APPLICANT"
}
```

#### POST /auth/refresh
Refresh JWT token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token-here"
}
```

### Jobs API

#### GET /api/jobs
Get all jobs with optional filtering.

**Query Parameters:**
- `status`: Filter by job status (DRAFT, PUBLISHED, ACTIVE, CLOSED, ARCHIVED)
- `type`: Filter by job type (FULL_TIME, PART_TIME, CONTRACT, TEMPORARY, INTERNSHIP)
- `department`: Filter by department name
- `location`: Filter by location (partial match)
- `experienceLevel`: Filter by experience level

**Example:**
```
GET /api/jobs?status=PUBLISHED&department=Engineering&type=FULL_TIME
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "Software Engineer",
    "description": "Job description...",
    "department": "Engineering",
    "location": "San Francisco",
    "type": "FULL_TIME",
    "status": "PUBLISHED",
    "salaryMin": 80000,
    "salaryMax": 120000,
    "skills": ["JavaScript", "React", "Node.js"],
    "createdBy": {
      "id": "uuid",
      "fullName": "HR Manager"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "publishedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET /api/jobs/search
Search jobs by keywords.

**Query Parameters:**
- `q`: Search term (required)

**Example:**
```
GET /api/jobs/search?q=engineer
```

#### GET /api/jobs/statistics
Get job statistics (requires authentication).

**Response:**
```json
{
  "total": 100,
  "published": 75,
  "draft": 15,
  "closed": 8,
  "archived": 2
}
```

#### GET /api/jobs/:id
Get a specific job by ID.

**Response:**
```json
{
  "id": "uuid",
  "title": "Software Engineer",
  "description": "Detailed job description...",
  "requirements": "Job requirements...",
  "benefits": "Job benefits...",
  "department": "Engineering",
  "location": "San Francisco",
  "type": "FULL_TIME",
  "experienceLevel": "MID",
  "status": "PUBLISHED",
  "salaryMin": 80000,
  "salaryMax": 120000,
  "skills": ["JavaScript", "React", "Node.js"],
  "createdBy": {
    "id": "uuid",
    "fullName": "HR Manager"
  },
  "applications": [
    {
      "id": "uuid",
      "applicant": {
        "id": "uuid",
        "fullName": "John Doe"
      },
      "status": "SUBMITTED",
      "submittedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### POST /api/jobs
Create a new job (requires authentication).

**Request Body:**
```json
{
  "title": "Software Engineer",
  "description": "Job description...",
  "requirements": "Job requirements...",
  "benefits": "Job benefits...",
  "department": "Engineering",
  "location": "San Francisco",
  "type": "FULL_TIME",
  "experienceLevel": "MID",
  "salaryMin": 80000,
  "salaryMax": 120000,
  "skills": ["JavaScript", "React", "Node.js"],
  "applicationDeadline": "2024-12-31T23:59:59.000Z"
}
```

#### PUT /api/jobs/:id
Update a job (requires authentication).

#### DELETE /api/jobs/:id
Delete a job (requires authentication).

#### POST /api/jobs/:id/publish
Publish a job (requires authentication).

#### POST /api/jobs/:id/close
Close a job (requires authentication).

#### GET /api/jobs/:id/applications
Get applications for a specific job (requires authentication).

**Query Parameters:**
- `status`: Filter by application status
- `limit`: Limit number of results
- `offset`: Offset for pagination

#### GET /api/jobs/:id/applications/statistics
Get application statistics for a specific job (requires authentication).

### Applications API

#### POST /api/applications
Submit a new application (requires authentication).

**Request Body:**
```json
{
  "jobId": "uuid",
  "coverLetter": "I am very interested...",
  "resume": "resume-file-url",
  "additionalDocuments": ["doc1-url", "doc2-url"]
}
```

#### GET /api/applications
Get all applications with filtering (requires authentication).

**Query Parameters:**
- `search`: Search term for applicant name or job title
- `status`: Filter by application status
- `jobId`: Filter by specific job
- `dateFrom`: Filter applications from date
- `dateTo`: Filter applications to date

#### GET /api/applications/my-applications
Get current user's applications (requires authentication).

#### GET /api/applications/statistics
Get application statistics (requires authentication).

**Query Parameters:**
- `jobId`: Get statistics for specific job (optional)

**Response:**
```json
{
  "total": 150,
  "submitted": 75,
  "reviewed": 30,
  "shortlisted": 20,
  "rejected": 15,
  "hired": 5,
  "withdrawn": 5
}
```

#### GET /api/applications/:id
Get a specific application (requires authentication).

#### PATCH /api/applications/:id/status
Update application status (requires authentication).

**Request Body:**
```json
{
  "status": "REVIEWED",
  "notes": "Great candidate, moving to next round"
}
```

#### POST /api/applications/:id/withdraw
Withdraw an application (requires authentication, applicant only).

#### PATCH /api/applications/bulk-update
Bulk update multiple applications (requires authentication).

**Request Body:**
```json
{
  "applicationIds": ["uuid1", "uuid2", "uuid3"],
  "updates": {
    "status": "REJECTED",
    "notes": "Not a fit for this position"
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `204`: No Content (successful deletion)
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

## Data Types

### Job Status
- `DRAFT`: Job is being prepared
- `PUBLISHED`: Job is published and accepting applications
- `ACTIVE`: Job is currently active
- `CLOSED`: Job is closed to new applications
- `ARCHIVED`: Job is archived
- `CANCELLED`: Job is cancelled

### Application Status
- `SUBMITTED`: Application submitted
- `REVIEWED`: Application reviewed
- `UNDER_REVIEW`: Application under review
- `SHORTLISTED`: Candidate shortlisted
- `INTERVIEWING`: In interview process
- `OFFERED`: Job offer extended
- `ACCEPTED`: Offer accepted
- `HIRED`: Candidate hired
- `REJECTED`: Application rejected
- `WITHDRAWN`: Application withdrawn

### Job Types
- `FULL_TIME`: Full-time position
- `PART_TIME`: Part-time position
- `CONTRACT`: Contract position
- `TEMPORARY`: Temporary position
- `INTERNSHIP`: Internship position

### Experience Levels
- `ENTRY`: Entry level
- `JUNIOR`: Junior level
- `MID`: Mid level
- `SENIOR`: Senior level
- `LEAD`: Lead level
- `EXECUTIVE`: Executive level

### User Roles
- `SUPER_ADMIN`: System administrator
- `HR_ADMIN`: HR administrator
- `HR_MANAGER`: HR manager
- `RECRUITER`: Recruiter
- `INTERVIEWER`: Interviewer
- `APPLICANT`: Job applicant

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

## Pagination

For endpoints that return lists, pagination is available:

**Query Parameters:**
- `limit`: Number of items per page (default: 20, max: 100)
- `offset`: Number of items to skip (default: 0)

**Response Format:**
```json
{
  "data": [...],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

## GraphQL

A GraphQL endpoint is also available at `/graphql` for more flexible queries. See the GraphQL schema documentation for available queries and mutations.

## WebSockets

Real-time notifications are available via WebSocket connections for:
- Application status updates
- New job postings
- Interview scheduling
- System notifications

Connect to `/ws` with authentication token for real-time updates.

## Development

### Running the API Locally

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start the development server: `npm run dev`

### Testing

Run the test suite:
```bash
npm test                # Run all tests with coverage
npm run test:watch      # Run tests in watch mode
npm run test:integration # Run integration tests only
```

### Linting and Formatting

```bash
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm run type-check      # Run TypeScript type checking
```