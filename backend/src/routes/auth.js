import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import database from '../models/database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'marcus-memory-secret-key-change-in-production';

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, condition = '48-hour episodic memory reset' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await database.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate user ID and trust code
    const userId = uuidv4();
    const trustCode = `${name.split(' ')[0].toUpperCase()}${new Date().getFullYear()}`;

    // Create user
    await database.run(`
      INSERT INTO users (id, name, email, password_hash, condition, trust_code, last_reset_time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [userId, name, email, passwordHash, condition, trustCode, Date.now()]);

    // Generate JWT token
    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userId,
        name,
        email,
        condition,
        trustCode
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await database.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        condition: user.condition,
        trustCode: user.trust_code,
        cycleLength: user.cycle_length,
        currentCycle: user.current_cycle,
        lastResetTime: user.last_reset_time,
        isTimerActive: Boolean(user.is_timer_active),
        autoStart: Boolean(user.auto_start)
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Verify token and get user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await database.get('SELECT * FROM users WHERE id = ?', [req.user.userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        condition: user.condition,
        trustCode: user.trust_code,
        cycleLength: user.cycle_length,
        currentCycle: user.current_cycle,
        lastResetTime: user.last_reset_time,
        isTimerActive: Boolean(user.is_timer_active),
        autoStart: Boolean(user.auto_start)
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Export the middleware for use in other routes
export { authenticateToken };

export default router;