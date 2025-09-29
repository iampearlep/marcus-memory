import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import database from '../models/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get all logs for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { priority, category, limit = 50, offset = 0 } = req.query;

    let sql = 'SELECT * FROM logs WHERE user_id = ?';
    const params = [req.user.userId];

    if (priority) {
      sql += ' AND priority = ?';
      params.push(priority);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const logs = await database.all(sql, params);

    res.json({
      logs: logs.map(log => ({
        id: log.id,
        content: log.content,
        priority: log.priority,
        category: log.category,
        timestamp: log.timestamp,
        cycleNumber: log.cycle_number,
        isEmergency: Boolean(log.is_emergency),
        isPersistent: Boolean(log.is_persistent)
      })),
      total: logs.length
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

// Get logs for current cycle
router.get('/current-cycle', authenticateToken, async (req, res) => {
  try {
    const user = await database.get('SELECT current_cycle FROM users WHERE id = ?', [req.user.userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const logs = await database.all(`
      SELECT * FROM logs
      WHERE user_id = ? AND (cycle_number = ? OR is_persistent = 1)
      ORDER BY timestamp DESC
    `, [req.user.userId, user.current_cycle]);

    res.json({
      logs: logs.map(log => ({
        id: log.id,
        content: log.content,
        priority: log.priority,
        category: log.category,
        timestamp: log.timestamp,
        cycleNumber: log.cycle_number,
        isEmergency: Boolean(log.is_emergency),
        isPersistent: Boolean(log.is_persistent)
      }))
    });
  } catch (error) {
    console.error('Get current cycle logs error:', error);
    res.status(500).json({ error: 'Failed to get current cycle logs' });
  }
});

// Get critical logs (for emergency display)
router.get('/critical', authenticateToken, async (req, res) => {
  try {
    const logs = await database.all(`
      SELECT * FROM logs
      WHERE user_id = ? AND (priority = 'CRITICAL' OR is_persistent = 1)
      ORDER BY timestamp DESC
      LIMIT 10
    `, [req.user.userId]);

    res.json({
      logs: logs.map(log => ({
        id: log.id,
        content: log.content,
        priority: log.priority,
        category: log.category,
        timestamp: log.timestamp,
        cycleNumber: log.cycle_number,
        isEmergency: Boolean(log.is_emergency),
        isPersistent: Boolean(log.is_persistent)
      }))
    });
  } catch (error) {
    console.error('Get critical logs error:', error);
    res.status(500).json({ error: 'Failed to get critical logs' });
  }
});

// Create new log
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      content,
      priority = 'MEDIUM',
      category = 'personal',
      isEmergency = false,
      isPersistent = false
    } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Get current cycle
    const user = await database.get('SELECT current_cycle FROM users WHERE id = ?', [req.user.userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const logId = uuidv4();
    const timestamp = Date.now();

    await database.run(`
      INSERT INTO logs (id, user_id, content, priority, category, timestamp, cycle_number, is_emergency, is_persistent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      logId,
      req.user.userId,
      content.trim(),
      priority,
      category,
      timestamp,
      user.current_cycle,
      isEmergency ? 1 : 0,
      isPersistent ? 1 : 0
    ]);

    res.status(201).json({
      message: 'Log created successfully',
      log: {
        id: logId,
        content: content.trim(),
        priority,
        category,
        timestamp,
        cycleNumber: user.current_cycle,
        isEmergency,
        isPersistent
      }
    });
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ error: 'Failed to create log' });
  }
});

// Update log
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, priority, category, isPersistent } = req.body;

    // Check if log exists and belongs to user
    const existingLog = await database.get('SELECT * FROM logs WHERE id = ? AND user_id = ?', [id, req.user.userId]);
    if (!existingLog) {
      return res.status(404).json({ error: 'Log not found' });
    }

    const updates = {};
    const params = [];

    if (content !== undefined) {
      updates.content = '?';
      params.push(content.trim());
    }
    if (priority !== undefined) {
      updates.priority = '?';
      params.push(priority);
    }
    if (category !== undefined) {
      updates.category = '?';
      params.push(category);
    }
    if (isPersistent !== undefined) {
      updates.is_persistent = '?';
      params.push(isPersistent ? 1 : 0);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    params.push(id, req.user.userId);

    const setClause = Object.entries(updates)
      .map(([key, value]) => `${key} = ${value}`)
      .join(', ');

    await database.run(`UPDATE logs SET ${setClause} WHERE id = ? AND user_id = ?`, params);

    // Get updated log
    const updatedLog = await database.get('SELECT * FROM logs WHERE id = ? AND user_id = ?', [id, req.user.userId]);

    res.json({
      message: 'Log updated successfully',
      log: {
        id: updatedLog.id,
        content: updatedLog.content,
        priority: updatedLog.priority,
        category: updatedLog.category,
        timestamp: updatedLog.timestamp,
        cycleNumber: updatedLog.cycle_number,
        isEmergency: Boolean(updatedLog.is_emergency),
        isPersistent: Boolean(updatedLog.is_persistent)
      }
    });
  } catch (error) {
    console.error('Update log error:', error);
    res.status(500).json({ error: 'Failed to update log' });
  }
});

// Delete log
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await database.run('DELETE FROM logs WHERE id = ? AND user_id = ?', [id, req.user.userId]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Log not found' });
    }

    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Delete log error:', error);
    res.status(500).json({ error: 'Failed to delete log' });
  }
});

export default router;