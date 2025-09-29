import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const dbPath = join(__dirname, '../../data/marcus_memory.db');
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.initializeTables().then(resolve).catch(reject);
        }
      });
    });
  }

  initializeTables() {
    return new Promise((resolve, reject) => {
      const createTables = `
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          password_hash TEXT,
          condition TEXT NOT NULL,
          cycle_length INTEGER DEFAULT 180,
          current_cycle INTEGER DEFAULT 1,
          last_reset_time INTEGER,
          trust_code TEXT,
          is_timer_active BOOLEAN DEFAULT 1,
          auto_start BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Memory logs table
        CREATE TABLE IF NOT EXISTS logs (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          content TEXT NOT NULL,
          priority TEXT CHECK(priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')) DEFAULT 'MEDIUM',
          category TEXT CHECK(category IN ('relationships', 'work', 'medical', 'personal', 'emergency', 'hobbies', 'places')) DEFAULT 'personal',
          timestamp INTEGER NOT NULL,
          cycle_number INTEGER NOT NULL,
          is_emergency BOOLEAN DEFAULT 0,
          is_persistent BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );

        -- Relationships table
        CREATE TABLE IF NOT EXISTS relationships (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          relation TEXT NOT NULL,
          photo TEXT,
          contact_info TEXT,
          birthday TEXT,
          relationship_type TEXT CHECK(relationship_type IN ('family', 'friend', 'medical', 'work', 'other')) DEFAULT 'other',
          importance TEXT CHECK(importance IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')) DEFAULT 'MEDIUM',
          last_interaction TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );

        -- Relationship key facts table
        CREATE TABLE IF NOT EXISTS relationship_facts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          relationship_id TEXT NOT NULL,
          fact TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (relationship_id) REFERENCES relationships (id) ON DELETE CASCADE
        );

        -- Hobbies table
        CREATE TABLE IF NOT EXISTS hobbies (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          image TEXT,
          importance TEXT CHECK(importance IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')) DEFAULT 'MEDIUM',
          last_engaged TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );

        -- Hobby details table
        CREATE TABLE IF NOT EXISTS hobby_details (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          hobby_id TEXT NOT NULL,
          detail TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (hobby_id) REFERENCES hobbies (id) ON DELETE CASCADE
        );

        -- Places table
        CREATE TABLE IF NOT EXISTS places (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          image TEXT,
          address TEXT,
          importance TEXT CHECK(importance IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')) DEFAULT 'MEDIUM',
          last_visited TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );

        -- Place details table
        CREATE TABLE IF NOT EXISTS place_details (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          place_id TEXT NOT NULL,
          detail TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (place_id) REFERENCES places (id) ON DELETE CASCADE
        );

        -- Memory cycles table (for tracking resets)
        CREATE TABLE IF NOT EXISTS memory_cycles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          cycle_number INTEGER NOT NULL,
          start_time INTEGER NOT NULL,
          end_time INTEGER,
          phase TEXT DEFAULT 'awareness',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_logs_cycle ON logs(cycle_number);
        CREATE INDEX IF NOT EXISTS idx_logs_priority ON logs(priority);
        CREATE INDEX IF NOT EXISTS idx_relationships_user_id ON relationships(user_id);
        CREATE INDEX IF NOT EXISTS idx_hobbies_user_id ON hobbies(user_id);
        CREATE INDEX IF NOT EXISTS idx_places_user_id ON places(user_id);
        CREATE INDEX IF NOT EXISTS idx_cycles_user_id ON memory_cycles(user_id);
      `;

      this.db.exec(createTables, (err) => {
        if (err) {
          console.error('Error creating tables:', err);
          reject(err);
        } else {
          console.log('Database tables initialized');
          resolve();
        }
      });
    });
  }

  close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing database:', err);
          } else {
            console.log('Database connection closed');
          }
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  // Helper methods for database operations
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

const db = new Database();
export default db;