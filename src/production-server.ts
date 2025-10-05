import express from 'express';
import cors from 'cors';

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());

// Health check endpoint (required for Render)
app.get('/health', (req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    status: 'healthy'
  });
});

// Mock data for production
const mockJobs = [
  {
    id: '1',
    title: 'Senior Flutter Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'full-time',
    description: 'We are seeking a skilled Flutter developer to join our growing team.',
    requirements: ['Flutter', 'Dart', 'REST APIs', 'State Management'],
    salary: '$90,000 - $130,000',
    status: 'active',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2', 
    title: 'Product Manager',
    department: 'Product',
    location: 'San Francisco, CA',
    type: 'full-time',
    description: 'Join our product team to help shape the future of our HR platform.',
    requirements: ['Product Management', 'Analytics', 'Leadership', 'Agile'],
    salary: '$120,000 - $160,000',
    status: 'active',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Auth endpoints
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const mockUser = {
    id: 'user-' + Date.now(),
    email: email,
    fullName: email.includes('hr') ? 'HR Administrator' : 'Demo User',
    role: email.includes('hr') ? 'hr_admin' : 'applicant'
  };

  const mockToken = 'mock-jwt-token-' + Date.now();
  
  res.json({
    user: mockUser,
    token: mockToken,
    refreshToken: 'mock-refresh-token'
  });
});

app.post('/auth/signup', (req, res) => {
  const { email, password, fullName } = req.body;
  
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password, and full name required' });
  }

  const mockUser = {
    id: 'user-' + Date.now(),
    email: email,
    fullName: fullName,
    role: 'applicant'
  };

  const mockToken = 'mock-jwt-token-' + Date.now();
  
  res.json({
    user: mockUser,
    token: mockToken,
    refreshToken: 'mock-refresh-token'
  });
});

// Jobs API
app.get('/api/jobs', (req, res) => {
  res.json({ jobs: mockJobs });
});

// Applications endpoint
app.post('/api/applications', (req, res) => {
  const application = req.body;
  
  const mockApplication = {
    id: 'app-' + Date.now(),
    ...application,
    status: 'submitted',
    submittedAt: new Date().toISOString()
  };
  
  res.json(mockApplication);
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Care HR Backend is running in production!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    endpoints: [
      'GET /health - Health check',
      'POST /auth/login - User login',
      'POST /auth/signup - User registration', 
      'GET /api/jobs - Get job listings',
      'POST /api/applications - Submit application'
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    availableRoutes: [
      'GET /health',
      'GET /test', 
      'POST /auth/login',
      'POST /auth/signup',
      'GET /api/jobs',
      'POST /api/applications'
    ]
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Care HR Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log('✅ Backend ready for connections!');
});

export default app;