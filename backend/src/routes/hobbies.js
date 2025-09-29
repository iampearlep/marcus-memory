import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import auth from '../middleware/auth.js';
import db from '../models/database.js';

const router = express.Router();

// Get all hobbies for a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const hobbies = await db.all(
      'SELECT * FROM hobbies WHERE user_id = ? ORDER BY importance DESC, name ASC',
      [req.params.userId]
    );

    // Get details for each hobby
    for (const hobby of hobbies) {
      const details = await db.all(
        'SELECT * FROM hobby_details WHERE hobby_id = ?',
        [hobby.id]
      );
      hobby.details = details;
    }

    res.json(hobbies);
  } catch (error) {
    console.error('Error getting hobbies:', error);
    res.status(500).json({ error: 'Failed to get hobbies' });
  }
});

// Create a new hobby
router.post('/', auth, async (req, res) => {
  try {
    const {
      userId,
      name,
      description,
      image,
      importance,
      lastEngaged,
      details
    } = req.body;

    const id = uuidv4();
    await db.run(
      `INSERT INTO hobbies (
        id, user_id, name, description, image,
        importance, last_engaged
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        name,
        description,
        image,
        importance,
        lastEngaged
      ]
    );

    if (details && details.length > 0) {
      for (const detail of details) {
        await db.run(
          'INSERT INTO hobby_details (hobby_id, detail) VALUES (?, ?)',
          [id, detail]
        );
      }
    }

    const newHobby = await db.get('SELECT * FROM hobbies WHERE id = ?', [id]);
    newHobby.details = details ? details.map(detail => ({ detail })) : [];

    res.status(201).json(newHobby);
  } catch (error) {
    console.error('Error creating hobby:', error);
    res.status(500).json({ error: 'Failed to create hobby' });
  }
});

// Update a hobby
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      importance,
      lastEngaged,
      details
    } = req.body;

    await db.run(
      `UPDATE hobbies SET
        name = ?, description = ?, image = ?,
        importance = ?, last_engaged = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name,
        description,
        image,
        importance,
        lastEngaged,
        req.params.id
      ]
    );

    if (details) {
      // Delete existing details
      await db.run('DELETE FROM hobby_details WHERE hobby_id = ?', [req.params.id]);
      
      // Insert new details
      for (const detail of details) {
        await db.run(
          'INSERT INTO hobby_details (hobby_id, detail) VALUES (?, ?)',
          [req.params.id, detail]
        );
      }
    }

    const updatedHobby = await db.get('SELECT * FROM hobbies WHERE id = ?', [req.params.id]);
    updatedHobby.details = details ? details.map(detail => ({ detail })) : [];

    res.json(updatedHobby);
  } catch (error) {
    console.error('Error updating hobby:', error);
    res.status(500).json({ error: 'Failed to update hobby' });
  }
});

// Delete a hobby
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.run('DELETE FROM hobby_details WHERE hobby_id = ?', [req.params.id]);
    await db.run('DELETE FROM hobbies WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting hobby:', error);
    res.status(500).json({ error: 'Failed to delete hobby' });
  }
});

export default router;