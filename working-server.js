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
    environment: 'development',
    status: 'healthy'
  });
});

// Auth endpoints (mock)
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log(`🔐 Login attempt: ${email}`);
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Mock successful login for any credentials
  const mockUser = {
    id: 'user-' + Date.now(),
    email: email,
    fullName: email.includes('hr') ? 'HR Administrator' : 'Demo User',
    role: email.includes('hr') ? 'hr_admin' : 'applicant'
  };

  const mockToken = 'mock-jwt-token-' + Date.now();
  
  console.log(`✅ Login successful for ${email}`);
  
  res.json({
    user: mockUser,
    token: mockToken,
    refreshToken: 'mock-refresh-token'
  });
});

app.post('/auth/signup', (req, res) => {
  const { email, password, fullName } = req.body;
  
  console.log(`📝 Signup attempt: ${email}`);
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Mock successful signup
  const mockUser = {
    id: 'user-' + Date.now(),
    email: email,
    fullName: fullName || 'New User',
    role: 'applicant'
  };

  const mockToken = 'mock-jwt-token-' + Date.now();
  
  console.log(`✅ Signup successful for ${email}`);
  
  res.json({
    user: mockUser,
    token: mockToken,
    refreshToken: 'mock-refresh-token'
  });
});

// Jobs endpoints (mock)
app.get('/api/jobs', (req, res) => {
  console.log('💼 Jobs requested');
  
  const mockJobs = [
    {
      id: '1',
      title: 'Senior Flutter Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'full-time',
      description: 'We are seeking a skilled Flutter developer to join our growing team. You will be responsible for developing cross-platform mobile applications and working closely with our design and backend teams.',
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
      description: 'Join our product team to help shape the future of our HR platform. You will work with engineering, design, and stakeholders to define product roadmaps and features.',
      requirements: ['Product Management', 'Analytics', 'Leadership', 'Agile'],
      salary: '$120,000 - $160,000',
      status: 'active',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'New York, NY',
      type: 'full-time',
      description: 'We are looking for a creative UX/UI designer to help us create intuitive and beautiful user experiences for our HR management platform.',
      requirements: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
      salary: '$80,000 - $110,000',
      status: 'active',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      title: 'DevOps Engineer',
      department: 'Engineering', 
      location: 'Austin, TX',
      type: 'full-time',
      description: 'Help us scale our infrastructure and improve our deployment processes. You will work on CI/CD, monitoring, and cloud infrastructure.',
      requirements: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
      salary: '$100,000 - $140,000',
      status: 'active',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  res.json({ jobs: mockJobs });
});

// Applications endpoints (mock)
app.post('/api/applications', (req, res) => {
  const application = req.body;
  
  console.log(`📋 Application submitted for job: ${application.jobId}`);
  
  // Mock successful application submission
  const mockApplication = {
    id: 'app-' + Date.now(),
    ...application,
    status: 'submitted',
    submittedAt: new Date().toISOString()
  };
  
  console.log(`✅ Application processed: ${mockApplication.id}`);
  
  res.json(mockApplication);
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Backend server is working!', 
    timestamp: new Date().toISOString(),
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
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

// Try multiple ports
const ports = [4000, 4001, 4002, 4003, 4004];

function tryPort(index) {
  if (index >= ports.length) {
    console.error('❌ All ports failed');
    process.exit(1);
  }
  
  const port = ports[index];
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Care HR Backend running on http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    console.log(`🔐 Auth endpoints: http://localhost:${port}/auth/*`);
    console.log(`💼 Jobs API: http://localhost:${port}/api/jobs`);
    console.log(`🧪 Test endpoint: http://localhost:${port}/test`);
    console.log('');
    console.log('✅ Backend ready for frontend connections!');
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${port} in use, trying next...`);
      tryPort(index + 1);
    } else {
      console.error(`❌ Server error: ${err.message}`);
      process.exit(1);
    }
  });
}

console.log('🔄 Starting Care HR Backend...');
tryPort(0);