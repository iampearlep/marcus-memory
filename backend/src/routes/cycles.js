import express from 'express';
import auth from '../middleware/auth.js';
import db from '../models/database.js';

const router = express.Router();

// Get current cycle for a user
router.get('/current/:userId', auth, async (req, res) => {
  try {
    const cycle = await db.get(
      'SELECT * FROM memory_cycles WHERE user_id = ? ORDER BY cycle_number DESC LIMIT 1',
      [req.params.userId]
    );
    res.json(cycle || { phase: 'awareness' });
  } catch (error) {
    console.error('Error getting current cycle:', error);
    res.status(500).json({ error: 'Failed to get current cycle' });
  }
});

// Start a new cycle
router.post('/start', auth, async (req, res) => {
  try {
    const { userId } = req.body;

    // Get the latest cycle number
    const lastCycle = await db.get(
      'SELECT cycle_number FROM memory_cycles WHERE user_id = ? ORDER BY cycle_number DESC LIMIT 1',
      [userId]
    );
    const cycleNumber = lastCycle ? lastCycle.cycle_number + 1 : 1;

    // End previous cycle if exists
    if (lastCycle) {
      await db.run(
        'UPDATE memory_cycles SET end_time = ? WHERE user_id = ? AND cycle_number = ?',
        [Date.now(), userId, lastCycle.cycle_number]
      );
    }

    // Create new cycle
    const result = await db.run(
      'INSERT INTO memory_cycles (user_id, cycle_number, start_time, phase) VALUES (?, ?, ?, ?)',
      [userId, cycleNumber, Date.now(), 'awareness']
    );

    const newCycle = await db.get('SELECT * FROM memory_cycles WHERE id = ?', [result.id]);
    res.status(201).json(newCycle);
  } catch (error) {
    console.error('Error starting new cycle:', error);
    res.status(500).json({ error: 'Failed to start new cycle' });
  }
});

// Update cycle phase
router.put('/:id', auth, async (req, res) => {
  try {
    const { phase } = req.body;

    await db.run(
      'UPDATE memory_cycles SET phase = ? WHERE id = ?',
      [phase, req.params.id]
    );

    const updatedCycle = await db.get('SELECT * FROM memory_cycles WHERE id = ?', [req.params.id]);
    res.json(updatedCycle);
  } catch (error) {
    console.error('Error updating cycle:', error);
    res.status(500).json({ error: 'Failed to update cycle' });
  }
});

export default router;