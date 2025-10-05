const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  console.log('🔍 Health check requested');
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    database: 'connected',
    environment: 'development'
  });
});

// Auth endpoints (mock)
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Mock successful login
  const mockUser = {
    id: '123',
    email: email,
    fullName: 'Test User',
    role: email.includes('hr') ? 'hr_admin' : 'applicant'
  };

  const mockToken = 'mock-jwt-token';
  
  res.json({
    user: mockUser,
    token: mockToken,
    refreshToken: 'mock-refresh-token'
  });
});

app.post('/auth/signup', (req, res) => {
  const { email, password, fullName } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Mock successful signup
  const mockUser = {
    id: '124',
    email: email,
    fullName: fullName || 'New User',
    role: 'applicant'
  };

  const mockToken = 'mock-jwt-token';
  
  res.json({
    user: mockUser,
    token: mockToken,
    refreshToken: 'mock-refresh-token'
  });
});

// Jobs endpoints (mock)
app.get('/api/jobs', (req, res) => {
  const mockJobs = [
    {
      id: '1',
      title: 'Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'full-time',
      description: 'We are looking for a skilled Frontend Developer...',
      requirements: ['React', 'TypeScript', 'CSS'],
      salary: '$80,000 - $120,000',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: '2', 
      title: 'Product Manager',
      department: 'Product',
      location: 'San Francisco, CA',
      type: 'full-time',
      description: 'Join our product team to help shape the future...',
      requirements: ['Product Management', 'Analytics', 'Leadership'],
      salary: '$120,000 - $160,000',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ];
  
  res.json({ jobs: mockJobs });
});

// Applications endpoints (mock)
app.post('/api/applications', (req, res) => {
  const application = req.body;
  
  // Mock successful application submission
  res.json({
    id: 'app-' + Date.now(),
    ...application,
    status: 'submitted',
    submittedAt: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const port = 4002;
app.listen(port, () => {
  console.log(`🚀 Quick Care HR backend running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🔐 Auth: http://localhost:${port}/auth/*`);
  console.log(`💼 Jobs: http://localhost:${port}/api/jobs`);
});