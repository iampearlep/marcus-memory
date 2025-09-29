import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import auth from '../middleware/auth.js';
import db from '../models/database.js';

const router = express.Router();

// Get all relationships for a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const relationships = await db.all(
      'SELECT * FROM relationships WHERE user_id = ? ORDER BY importance DESC, name ASC',
      [req.params.userId]
    );

    // Get facts for each relationship
    for (const relationship of relationships) {
      const facts = await db.all(
        'SELECT * FROM relationship_facts WHERE relationship_id = ?',
        [relationship.id]
      );
      relationship.facts = facts;
    }

    res.json(relationships);
  } catch (error) {
    console.error('Error getting relationships:', error);
    res.status(500).json({ error: 'Failed to get relationships' });
  }
});

// Create a new relationship
router.post('/', auth, async (req, res) => {
  try {
    const {
      userId,
      name,
      relation,
      photo,
      contactInfo,
      birthday,
      relationshipType,
      importance,
      lastInteraction,
      facts
    } = req.body;

    const id = uuidv4();
    await db.run(
      `INSERT INTO relationships (
        id, user_id, name, relation, photo, contact_info, birthday,
        relationship_type, importance, last_interaction
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        name,
        relation,
        photo,
        contactInfo,
        birthday,
        relationshipType,
        importance,
        lastInteraction
      ]
    );

    if (facts && facts.length > 0) {
      for (const fact of facts) {
        await db.run(
          'INSERT INTO relationship_facts (relationship_id, fact) VALUES (?, ?)',
          [id, fact]
        );
      }
    }

    const newRelationship = await db.get('SELECT * FROM relationships WHERE id = ?', [id]);
    newRelationship.facts = facts ? facts.map(fact => ({ fact })) : [];

    res.status(201).json(newRelationship);
  } catch (error) {
    console.error('Error creating relationship:', error);
    res.status(500).json({ error: 'Failed to create relationship' });
  }
});

// Update a relationship
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      name,
      relation,
      photo,
      contactInfo,
      birthday,
      relationshipType,
      importance,
      lastInteraction,
      facts
    } = req.body;

    await db.run(
      `UPDATE relationships SET
        name = ?, relation = ?, photo = ?, contact_info = ?, birthday = ?,
        relationship_type = ?, importance = ?, last_interaction = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        name,
        relation,
        photo,
        contactInfo,
        birthday,
        relationshipType,
        importance,
        lastInteraction,
        req.params.id
      ]
    );

    if (facts) {
      // Delete existing facts
      await db.run('DELETE FROM relationship_facts WHERE relationship_id = ?', [req.params.id]);
      
      // Insert new facts
      for (const fact of facts) {
        await db.run(
          'INSERT INTO relationship_facts (relationship_id, fact) VALUES (?, ?)',
          [req.params.id, fact]
        );
      }
    }

    const updatedRelationship = await db.get(
      'SELECT * FROM relationships WHERE id = ?',
      [req.params.id]
    );
    updatedRelationship.facts = facts ? facts.map(fact => ({ fact })) : [];

    res.json(updatedRelationship);
  } catch (error) {
    console.error('Error updating relationship:', error);
    res.status(500).json({ error: 'Failed to update relationship' });
  }
});

// Delete a relationship
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.run('DELETE FROM relationship_facts WHERE relationship_id = ?', [req.params.id]);
    await db.run('DELETE FROM relationships WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting relationship:', error);
    res.status(500).json({ error: 'Failed to delete relationship' });
  }
});

export default router;