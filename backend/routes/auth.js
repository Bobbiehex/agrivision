import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'agrivision-super-secret-key-2026';

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const userRole = role || 'FARMER'; // default role

    // Role-based Email Authorization
    if (userRole === 'SUPER_ADMIN') {
      if (email !== 'anthonyayomide2003@gmail.com') {
        return res.status(403).json({ error: 'Not authorized for SUPER_ADMIN role' });
      }
    }

    if (userRole === 'ADMIN') {
      if (email !== 'info.cleofly@gmx.de' && email !== 'anthonyayomide2003@gmail.com') {
        return res.status(403).json({ error: 'Not authorized for ADMIN role' });
      }
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
      },
    });

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, avatar: newUser.avatar }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check existing user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Role-based Email Authorization (for login protection)
    if (user.role === 'SUPER_ADMIN') {
      if (email !== 'anthonyayomide2003@gmail.com') {
        return res.status(403).json({ error: 'Not authorized for SUPER_ADMIN role' });
      }
    }

    if (user.role === 'ADMIN') {
      if (email !== 'info.cleofly@gmx.de' && email !== 'anthonyayomide2003@gmail.com') {
        return res.status(403).json({ error: 'Not authorized for ADMIN role' });
      }
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Verify Token (Used by frontend on load)
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    
    if (!user) {
      return res.status(401).json({ error: 'User not found', valid: false });
    }

    res.json({ 
      valid: true, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } 
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token', valid: false });
  }
});

export default router;
