import express from 'express';
import database from '../models/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await database.get('SELECT * FROM users WHERE id = ?', [req.user.userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
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
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, condition, cycleLength, isTimerActive, autoStart } = req.body;

    const updates = {};
    const params = [];

    if (name !== undefined) {
      updates.name = '?';
      params.push(name);
    }
    if (condition !== undefined) {
      updates.condition = '?';
      params.push(condition);
    }
    if (cycleLength !== undefined) {
      updates.cycle_length = '?';
      params.push(cycleLength);
    }
    if (isTimerActive !== undefined) {
      updates.is_timer_active = '?';
      params.push(isTimerActive ? 1 : 0);
    }
    if (autoStart !== undefined) {
      updates.auto_start = '?';
      params.push(autoStart ? 1 : 0);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.updated_at = 'CURRENT_TIMESTAMP';
    params.push(req.user.userId);

    const setClause = Object.entries(updates)
      .map(([key, value]) => `${key} = ${value}`)
      .join(', ');

    await database.run(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      params
    );

    // Get updated user
    const updatedUser = await database.get('SELECT * FROM users WHERE id = ?', [req.user.userId]);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        condition: updatedUser.condition,
        trustCode: updatedUser.trust_code,
        cycleLength: updatedUser.cycle_length,
        currentCycle: updatedUser.current_cycle,
        lastResetTime: updatedUser.last_reset_time,
        isTimerActive: Boolean(updatedUser.is_timer_active),
        autoStart: Boolean(updatedUser.auto_start)
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update cycle information (for memory resets)
router.post('/cycle/reset', authenticateToken, async (req, res) => {
  try {
    const currentCycle = await database.get(
      'SELECT current_cycle FROM users WHERE id = ?',
      [req.user.userId]
    );

    const newCycleNumber = (currentCycle?.current_cycle || 0) + 1;
    const resetTime = Date.now();

    // Update user's cycle information
    await database.run(`
      UPDATE users
      SET current_cycle = ?, last_reset_time = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [newCycleNumber, resetTime, req.user.userId]);

    // Record the cycle in memory_cycles table
    await database.run(`
      INSERT INTO memory_cycles (user_id, cycle_number, start_time)
      VALUES (?, ?, ?)
    `, [req.user.userId, newCycleNumber, resetTime]);

    // End the previous cycle if it exists
    if (currentCycle?.current_cycle) {
      await database.run(`
        UPDATE memory_cycles
        SET end_time = ?
        WHERE user_id = ? AND cycle_number = ? AND end_time IS NULL
      `, [resetTime, req.user.userId, currentCycle.current_cycle]);
    }

    res.json({
      message: 'Memory cycle reset successfully',
      cycleNumber: newCycleNumber,
      resetTime: resetTime
    });
  } catch (error) {
    console.error('Cycle reset error:', error);
    res.status(500).json({ error: 'Failed to reset memory cycle' });
  }
});

// Get current cycle info
router.get('/cycle/current', authenticateToken, async (req, res) => {
  try {
    const user = await database.get(
      'SELECT current_cycle, last_reset_time, cycle_length FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentTime = Date.now();
    const timeSinceReset = currentTime - (user.last_reset_time || currentTime);
    const timeRemaining = Math.max(0, (user.cycle_length * 1000) - timeSinceReset);

    res.json({
      currentCycle: user.current_cycle,
      lastResetTime: user.last_reset_time,
      timeSinceReset: timeSinceReset,
      timeRemaining: Math.floor(timeRemaining / 1000), // Convert to seconds
      cycleLength: user.cycle_length
    });
  } catch (error) {
    console.error('Get cycle info error:', error);
    res.status(500).json({ error: 'Failed to get cycle information' });
  }
});

export default router;