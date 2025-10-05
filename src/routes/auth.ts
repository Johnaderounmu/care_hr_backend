import express from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || '15m';

function signAccessToken(user: User) {
  const secret: any = jwtSecret as unknown as jwt.Secret;
  return jwt.sign({ sub: user.id, role: user.role } as any, secret, { expiresIn: accessTokenExpiry } as any);
}

router.post('/signup', async (req, res) => {
  const { email, password, fullName, role } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  try {
    // Check if database is connected
    if (!AppDataSource.isInitialized) {
      // Return stub response when database is not available
      const mockUser = {
        id: uuidv4(),
        email,
        fullName: fullName || 'Mock User',
        role: role || 'applicant'
      };
      const token = jwt.sign({ sub: mockUser.id, role: mockUser.role } as any, jwtSecret as any, { expiresIn: accessTokenExpiry } as any);
      return res.json({ 
        user: mockUser, 
        token, 
        refreshToken: uuidv4(),
        message: 'Running in stub mode - user not persisted'
      });
    }

    const repo = AppDataSource.getRepository(User);
    const existing = await repo.findOneBy({ email });
    if (existing) return res.status(409).json({ error: 'user already exists' });

    const hash = await bcrypt.hash(password, 10);
    const user = repo.create({ email, passwordHash: hash, fullName, role });
    user.refreshToken = uuidv4();
    await repo.save(user);

    const token = signAccessToken(user);
    res.json({ user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }, token, refreshToken: user.refreshToken });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  try {
    // Check if database is connected
    if (!AppDataSource.isInitialized) {
      // Return stub response when database is not available
      const mockUser = {
        id: uuidv4(),
        email,
        fullName: 'Mock User',
        role: 'applicant'
      };
      const token = jwt.sign({ sub: mockUser.id, role: mockUser.role } as any, jwtSecret as any, { expiresIn: accessTokenExpiry } as any);
      return res.json({ 
        user: mockUser, 
        token, 
        refreshToken: uuidv4(),
        message: 'Running in stub mode - credentials not verified'
      });
    }

    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOneBy({ email });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    // issue new refresh token and persist
    user.refreshToken = uuidv4();
    await repo.save(user);

    const token = signAccessToken(user);
    res.json({ user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role }, token, refreshToken: user.refreshToken });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Refresh endpoint: exchanges a refresh token for a new access token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });

  try {
    // Check if database is connected
    if (!AppDataSource.isInitialized) {
      // Return stub response when database is not available
      const mockUser = {
        id: uuidv4(),
        email: 'mock@example.com',
        fullName: 'Mock User',
        role: 'applicant'
      };
      const token = jwt.sign({ sub: mockUser.id, role: mockUser.role } as any, jwtSecret as any, { expiresIn: accessTokenExpiry } as any);
      return res.json({ 
        token, 
        refreshToken: uuidv4(),
        message: 'Running in stub mode - refresh token not verified'
      });
    }

    const repo = AppDataSource.getRepository(User);
    const user = await repo.findOneBy({ refreshToken });
    if (!user) return res.status(401).json({ error: 'invalid refresh token' });

    // rotate refresh token
    user.refreshToken = uuidv4();
    await repo.save(user);

    const token = signAccessToken(user);
    res.json({ token, refreshToken: user.refreshToken });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
