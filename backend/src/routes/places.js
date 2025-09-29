import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import auth from '../middleware/auth.js';
import db from '../models/database.js';

const router = express.Router();

// Get all places for a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const places = await db.all(
      'SELECT * FROM places WHERE user_id = ? ORDER BY importance DESC, name ASC',
      [req.params.userId]
    );

    // Get details for each place
    for (const place of places) {
      const details = await db.all(
        'SELECT * FROM place_details WHERE place_id = ?',
        [place.id]
      );
      place.details = details;
    }

    res.json(places);
  } catch (error) {
    console.error('Error getting places:', error);
    res.status(500).json({ error: 'Failed to get places' });
  }
});

// Create a new place
router.post('/', auth, async (req, res) => {
  try {
    const {
      userId,
      name,
      description,
      image,
      address,
      importance,
      lastVisited,
      details
    } = req.body;

    const id = uuidv4();
    await db.run(
      `INSERT INTO places (
        id, user_id, name, description, image,
        address, importance, last_visited
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        name,
        description,
        image,
        address,
        importance,
        lastVisited
      ]
    );

    if (details && details.length > 0) {
      for (const detail of details) {
        await db.run(
          'INSERT INTO place_details (place_id, detail) VALUES (?, ?)',
          [id, detail]
        );
      }
    }

    const newPlace = await db.get('SELECT * FROM places WHERE id = ?', [id]);
    newPlace.details = details ? details.map(detail => ({ detail })) : [];

    res.status(201).json(newPlace);
  } catch (error) {
    console.error('Error creating place:', error);
    res.status(500).json({ error: 'Failed to create place' });
  }
});

// Update a place
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      address,
      importance,
      lastVisited,
      details
    } = req.body;

    await db.run(
      `UPDATE places SET
        name = ?, description = ?, image = ?,
        address = ?, importance = ?, last_visited = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name,
        description,
        image,
        address,
        importance,
        lastVisited,
        req.params.id
      ]
    );

    if (details) {
      // Delete existing details
      await db.run('DELETE FROM place_details WHERE place_id = ?', [req.params.id]);
      
      // Insert new details
      for (const detail of details) {
        await db.run(
          'INSERT INTO place_details (place_id, detail) VALUES (?, ?)',
          [req.params.id, detail]
        );
      }
    }

    const updatedPlace = await db.get('SELECT * FROM places WHERE id = ?', [req.params.id]);
    updatedPlace.details = details ? details.map(detail => ({ detail })) : [];

    res.json(updatedPlace);
  } catch (error) {
    console.error('Error updating place:', error);
    res.status(500).json({ error: 'Failed to update place' });
  }
});

// Delete a place
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.run('DELETE FROM place_details WHERE place_id = ?', [req.params.id]);
    await db.run('DELETE FROM places WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting place:', error);
    res.status(500).json({ error: 'Failed to delete place' });
  }
});

export default router;