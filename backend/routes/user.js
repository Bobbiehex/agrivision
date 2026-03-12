import express from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Update User Profile (Name & Avatar)
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, avatar } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        // Only update avatar if provided in the request
        ...(avatar !== undefined && { avatar })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile Update Error:', error);
    res.status(500).json({ error: 'Failed to update profile. Please try again.' });
  }
});

export default router;
