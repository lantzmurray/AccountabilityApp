import * as SQLite from 'expo-sqlite';
import { format } from 'date-fns';
import { Platform } from 'react-native';

// Web SQLite implementation
let initSqlJs: any = null;
let SQL: any = null;

if (Platform.OS === 'web') {
  try {
    initSqlJs = require('sql.js');
  } catch (e) {
    console.warn('sql.js not available for web');
  }
}

export type Category = { id: number; name: string; weight: number };
export type Log = { id: number; category_id: number; rating: number; note?: string | null; date: string };
export type Journal = { id: number; text: string; date: string; tags?: string | null };
export type Streak = { category_id: number; current: number; best: number };
export type Activity = { id: number; name: string; category_id?: number | null; description?: string | null };
export type TimeEntry = { id: number; activity_id: number; start_time: string; end_time?: string | null; duration_minutes?: number | null; note?: string | null; date: string };
export type Reminder = { id: number; title: string; description?: string | null; due_date: string; due_time?: string | null; completed: boolean; category_id?: number | null; activity_id?: number | null; created_at: string; };

let db: any = null;
let webDb: any = null;

export async function getDb() {
  if (Platform.OS === 'web') {
    if (!webDb && initSqlJs) {
      try {
        SQL = await initSqlJs({
          locateFile: (file: string) => `https://sql.js.org/dist/${file}`
        });
        // Try to load existing data from localStorage
        const savedData = localStorage.getItem('accountability_db');
        if (savedData) {
          const uint8Array = new Uint8Array(JSON.parse(savedData));
          webDb = new SQL.Database(uint8Array);
        } else {
          webDb = new SQL.Database();
        }
      } catch (e) {
        console.error('Failed to initialize web database:', e);
        // Fallback to in-memory storage
        webDb = { exec: () => [], run: () => {}, all: () => [] };
      }
    }
    return webDb;
  } else {
    if (!db) {
      db = await SQLite.openDatabaseAsync('accountability.db');
    }
    return db;
  }
}

// Helper function to save web database
function saveWebDb() {
  if (Platform.OS === 'web' && webDb && webDb.export) {
    try {
      const data = webDb.export();
      localStorage.setItem('accountability_db', JSON.stringify(Array.from(data)));
    } catch (e) {
      console.error('Failed to save web database:', e);
    }
  }
}

// Helper function to execute SQL based on platform
async function execSQL(dbx: any, sql: string) {
  if (Platform.OS === 'web') {
    if (dbx && dbx.exec) {
      dbx.exec(sql);
      saveWebDb();
    }
  } else {
    await dbx.execAsync(sql);
  }
}

export async function initDb() {
  const dbx = await getDb();
  await execSQL(dbx, 'PRAGMA foreign_keys = ON;');
  await execSQL(dbx, `
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      weight REAL DEFAULT 1
    );
  `);
  await execSQL(dbx, `
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      note TEXT,
      date TEXT NOT NULL,
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);
  await execSQL(dbx, `
    CREATE TABLE IF NOT EXISTS journal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      date TEXT NOT NULL,
      tags TEXT
    );
  `);
  await execSQL(dbx, `
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  await execSQL(dbx, `
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER,
      description TEXT,
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
    );
  `);
  await execSQL(dbx, `
    CREATE TABLE IF NOT EXISTS time_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_id INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT,
      duration_minutes INTEGER,
      note TEXT,
      date TEXT NOT NULL,
      FOREIGN KEY(activity_id) REFERENCES activities(id) ON DELETE CASCADE
    );
  `);
  await execSQL(dbx, `
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT NOT NULL,
      due_time TEXT,
      completed INTEGER DEFAULT 0,
      category_id INTEGER,
      activity_id INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL,
      FOREIGN KEY(activity_id) REFERENCES activities(id) ON DELETE SET NULL
    );
  `);
}

// Helper functions for cross-platform database queries
async function runQuery(dbx: any, sql: string, params: any[] = []): Promise<any> {
  if (Platform.OS === 'web') {
    if (dbx && dbx.run) {
      const result = dbx.run(sql, params);
      saveWebDb();
      return result;
    }
    return null;
  } else {
    return await dbx.runAsync(sql, params);
  }
}

async function getAllQuery(dbx: any, sql: string, params: any[] = []): Promise<any[]> {
  if (Platform.OS === 'web') {
    if (dbx && dbx.exec) {
      const results = dbx.exec(sql, params);
      if (results.length > 0 && results[0].values) {
        const columns = results[0].columns;
        return results[0].values.map((row: any[]) => {
          const obj: any = {};
          columns.forEach((col: string, index: number) => {
            obj[col] = row[index];
          });
          return obj;
        });
      }
    }
    return [];
  } else {
    return await dbx.getAllAsync(sql, params);
  }
}

async function getFirstQuery(dbx: any, sql: string, params: any[] = []): Promise<any> {
  if (Platform.OS === 'web') {
    const results = await getAllQuery(dbx, sql, params);
    return results.length > 0 ? results[0] : null;
  } else {
    return await dbx.getFirstAsync(sql, params);
  }
}

export async function seedDefaults() {
  const dbx = await getDb();
  const result = await getFirstQuery(dbx, 'SELECT COUNT(*) as count FROM categories');
  if (!result || result.count === 0) {
    const defaults = ['Follow-through','Consistency','Trust-building','Patience'];
    for (const name of defaults) {
      await runQuery(dbx, 'INSERT INTO categories (name, weight) VALUES (?, ?)', [name, 1]);
    }
  }

  // Seed default activities
  const activityResult = await getFirstQuery(dbx, 'SELECT COUNT(*) as count FROM activities');
  if (!activityResult || activityResult.count === 0) {
    const defaultActivities = [
      'Work - Deep Focus',
      'Work - Meetings',
      'Personal - Exercise',
      'Personal - Reading',
      'Personal - Learning',
      'Household',
      'Family Time',
      'Social'
    ];
    for (const name of defaultActivities) {
      await runQuery(dbx, 'INSERT INTO activities (name) VALUES (?)', [name]);
    }
  }
}

export const categoryRepo = {
  async all(): Promise<Category[]> {
    const dbx = await getDb();
    return getAllQuery(dbx, 'SELECT * FROM categories ORDER BY name');
  },
  async create(name: string, weight = 1): Promise<void> {
    const dbx = await getDb();
    await runQuery(dbx, 'INSERT INTO categories (name, weight) VALUES (?, ?)', [name, weight]);
  },
  async update(id: number, fields: Partial<Omit<Category, 'id'>>): Promise<void> {
    const dbx = await getDb();
    const sets: string[] = [];
    const values: any[] = [];
    if (fields.name !== undefined) { sets.push('name = ?'); values.push(fields.name); }
    if (fields.weight !== undefined) { sets.push('weight = ?'); values.push(fields.weight); }
    if (sets.length === 0) return;
    values.push(id);
    await runQuery(dbx, `UPDATE categories SET ${sets.join(', ')} WHERE id = ?`, values);
  },
  async remove(id: number): Promise<void> {
    const dbx = await getDb();
    await runQuery(dbx, 'DELETE FROM categories WHERE id = ?', [id]);
  }
};

export const logRepo = {
  async add(category_id: number, rating: number, note: string | null, dateISO?: string) {
    const dbx = await getDb();
    const d = dateISO ?? format(new Date(), 'yyyy-MM-dd');
    await runQuery(dbx, 'INSERT INTO logs (category_id, rating, note, date) VALUES (?, ?, ?, ?)', [category_id, rating, note, d]);
  },
  async forRange(startISO: string, endISO: string): Promise<Log[]> {
    const dbx = await getDb();
    return getAllQuery(dbx, 'SELECT * FROM logs WHERE date BETWEEN ? AND ? ORDER BY date DESC', [startISO, endISO]);
  },
  async recent(limit = 50): Promise<Log[]> {
    const dbx = await getDb();
    return getAllQuery(dbx, 'SELECT * FROM logs ORDER BY date DESC, id DESC LIMIT ?', [limit]);
  },
  async byCategorySince(category_id: number, startISO: string): Promise<Log[]> {
    const dbx = await getDb();
    return getAllQuery(dbx, 'SELECT * FROM logs WHERE category_id = ? AND date >= ? ORDER BY date ASC', [category_id, startISO]);
  }
};

export const journalRepo = {
  async add(text: string, tags: string[] = [], dateISO?: string) {
    const dbx = await getDb();
    const d = dateISO ?? format(new Date(), 'yyyy-MM-dd');
    await runQuery(dbx, 'INSERT INTO journal (text, tags, date) VALUES (?, ?, ?)', [text, JSON.stringify(tags), d]);
  },
  async search(query: string): Promise<Journal[]> {
    const dbx = await getDb();
    return getAllQuery(dbx, 'SELECT * FROM journal WHERE text LIKE ? ORDER BY date DESC', [`%${query}%`]);
  },
  async recent(limit = 50): Promise<Journal[]> {
    const dbx = await getDb();
    return getAllQuery(dbx, 'SELECT * FROM journal ORDER BY date DESC, id DESC LIMIT ?', [limit]);
  }
};

export const settingsRepo = {
  async get(key: string): Promise<string | null> {
    const dbx = await getDb();
    const row = await getFirstQuery(dbx, 'SELECT value FROM settings WHERE key = ?', [key]);
    return row?.value ?? null;
  },
  async set(key: string, value: string): Promise<void> {
    const dbx = await getDb();
    await runQuery(dbx, 'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', [key, value]);
  }
};

export const activityRepo = {
  async all(): Promise<Activity[]> {
    const dbx = await getDb();
    return getAllQuery(dbx, 'SELECT * FROM activities ORDER BY name');
  },
  async create(name: string, category_id?: number | null, description?: string | null): Promise<void> {
    const dbx = await getDb();
    await runQuery(dbx, 'INSERT INTO activities (name, category_id, description) VALUES (?, ?, ?)', [name, category_id, description]);
  },
  async update(id: number, fields: Partial<Omit<Activity, 'id'>>): Promise<void> {
    const dbx = await getDb();
    const sets: string[] = [];
    const values: any[] = [];
    if (fields.name !== undefined) { sets.push('name = ?'); values.push(fields.name); }
    if (fields.category_id !== undefined) { sets.push('category_id = ?'); values.push(fields.category_id); }
    if (fields.description !== undefined) { sets.push('description = ?'); values.push(fields.description); }
    if (sets.length === 0) return;
    values.push(id);
    await runQuery(dbx, `UPDATE activities SET ${sets.join(', ')} WHERE id = ?`, values);
  },
  async remove(id: number): Promise<void> {
    const dbx = await getDb();
    await runQuery(dbx, 'DELETE FROM activities WHERE id = ?', [id]);
  }
};

export const timeEntryRepo = {
  async start(activity_id: number, note?: string | null, dateISO?: string): Promise<number> {
    const dbx = await getDb();
    const now = new Date().toISOString();
    const d = dateISO ?? format(new Date(), 'yyyy-MM-dd');
    const result = await runQuery(dbx, 'INSERT INTO time_entries (activity_id, start_time, note, date) VALUES (?, ?, ?, ?)', [activity_id, now, note, d]);
    if (Platform.OS === 'web') {
      // For web, we need to get the last inserted ID differently
      const lastEntry = await getFirstQuery(dbx, 'SELECT id FROM time_entries ORDER BY id DESC LIMIT 1');
      return lastEntry?.id || 0;
    }
    return result.lastInsertRowId!;
  },
  async stop(id: number, note?: string | null): Promise<void> {
    const dbx = await getDb();
    const now = new Date().toISOString();
    const entry = await getFirstQuery(dbx, 'SELECT * FROM time_entries WHERE id = ?', [id]);
    if (!entry) return;
    
    const startTime = new Date(entry.start_time);
    const endTime = new Date(now);
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
    
    await runQuery(dbx, 'UPDATE time_entries SET end_time = ?, duration_minutes = ?, note = ? WHERE id = ?', [now, durationMinutes, note, id]);
  },
  async add(activity_id: number, duration_minutes: number, note?: string | null, dateISO?: string): Promise<void> {
    const dbx = await getDb();
    const now = new Date().toISOString();
    const d = dateISO ?? format(new Date(), 'yyyy-MM-dd');
    const startTime = new Date(Date.now() - duration_minutes * 60000).toISOString();
    await runQuery(dbx, 'INSERT INTO time_entries (activity_id, start_time, end_time, duration_minutes, note, date) VALUES (?, ?, ?, ?, ?, ?)', [activity_id, startTime, now, duration_minutes, note, d]);
  },
  async recent(limit = 50): Promise<TimeEntry[]> {
    const dbx = await getDb();
    return getAllQuery(dbx, 'SELECT * FROM time_entries ORDER BY start_time DESC, id DESC LIMIT ?', [limit]);
  },
  async forRange(startISO: string, endISO: string): Promise<TimeEntry[]> {
    const dbx = await getDb();
    return getAllQuery(dbx, 'SELECT * FROM time_entries WHERE date BETWEEN ? AND ? ORDER BY start_time DESC', [startISO, endISO]);
  },
  async active(): Promise<TimeEntry[]> {
    const dbx = await getDb();
    return getAllQuery(dbx, 'SELECT * FROM time_entries WHERE end_time IS NULL ORDER BY start_time ASC');
  },
  async byActivitySince(activity_id: number, startISO: string): Promise<TimeEntry[]> {
    const dbx = await getDb();
    return getAllQuery(dbx, 'SELECT * FROM time_entries WHERE activity_id = ? AND date >= ? ORDER BY start_time ASC', [activity_id, startISO]);
  }
};

export const reminderRepo = {
  async all(): Promise<Reminder[]> {
    const dbx = await getDb();
    return getAllQuery(dbx, 'SELECT * FROM reminders ORDER BY due_date ASC, due_time ASC, id ASC');
  },
  async create(title: string, description: string | null, due_date: string, due_time: string | null, category_id?: number | null, activity_id?: number | null): Promise<void> {
    const dbx = await getDb();
    const now = new Date().toISOString();
    await runQuery(dbx, 'INSERT INTO reminders (title, description, due_date, due_time, completed, category_id, activity_id, created_at) VALUES (?, ?, ?, ?, 0, ?, ?, ?)', [title, description, due_date, due_time, category_id, activity_id, now]);
  },
  async update(id: number, fields: Partial<Omit<Reminder, 'id' | 'created_at'>>): Promise<void> {
    const dbx = await getDb();
    const updates: string[] = [];
    const values: any[] = [];
    if (fields.title !== undefined) { updates.push('title = ?'); values.push(fields.title); }
    if (fields.description !== undefined) { updates.push('description = ?'); values.push(fields.description); }
    if (fields.due_date !== undefined) { updates.push('due_date = ?'); values.push(fields.due_date); }
    if (fields.due_time !== undefined) { updates.push('due_time = ?'); values.push(fields.due_time); }
    if (fields.completed !== undefined) { updates.push('completed = ?'); values.push(fields.completed ? 1 : 0); }
    if (fields.category_id !== undefined) { updates.push('category_id = ?'); values.push(fields.category_id); }
    if (fields.activity_id !== undefined) { updates.push('activity_id = ?'); values.push(fields.activity_id); }
    if (updates.length > 0) {
      values.push(id);
      await runQuery(dbx, `UPDATE reminders SET ${updates.join(', ')} WHERE id = ?`, values);
    }
  },
  async remove(id: number): Promise<void> {
    const dbx = await getDb();
    await runQuery(dbx, 'DELETE FROM reminders WHERE id = ?', [id]);
  },
  async markCompleted(id: number): Promise<void> {
    const dbx = await getDb();
    await runQuery(dbx, 'UPDATE reminders SET completed = 1 WHERE id = ?', [id]);
  },
  async pending(): Promise<Reminder[]> {
    const dbx = await getDb();
    return getAllQuery(dbx, 'SELECT * FROM reminders WHERE completed = 0 ORDER BY due_date ASC, due_time ASC, id ASC');
  },
  async overdue(): Promise<Reminder[]> {
    const dbx = await getDb();
    const today = format(new Date(), 'yyyy-MM-dd');
    const now = format(new Date(), 'HH:mm');
    return getAllQuery(dbx, 'SELECT * FROM reminders WHERE completed = 0 AND (due_date < ? OR (due_date = ? AND due_time IS NOT NULL AND due_time < ?)) ORDER BY due_date ASC, due_time ASC', [today, today, now]);
  }
};

export async function computeStreaks(): Promise<Streak[]> {
  const dbx = await getDb();
  const cats = await categoryRepo.all();
  const today = format(new Date(), 'yyyy-MM-dd');
  const dayMillis = 24 * 60 * 60 * 1000;
  const result: Streak[] = [];
  for (const c of cats) {
    const logs = await getAllQuery(dbx, 'SELECT * FROM logs WHERE category_id = ? ORDER BY date DESC', [c.id]);
    let current = 0; let best = 0;
    let prev = new Date();
    for (const l of logs) {
      const d = new Date(l.date + 'T00:00:00');
      if (current === 0) {
        const delta = Math.floor((+prev - +d) / dayMillis);
        if (l.date === today || delta <= 1) {
          current = 1;
          prev = d;
        } else {
          break;
        }
      } else {
        const delta = Math.floor((+prev - +d) / dayMillis);
        if (delta === 1) {
          current += 1;
          prev = d;
        } else if (delta === 0) {
          continue;
        } else {
          best = Math.max(best, current);
          break;
        }
      }
    }
    best = Math.max(best, current);
    result.push({ category_id: c.id, current, best });
  }
  return result;
}

export async function exportAll(): Promise<{ categories: Category[]; logs: Log[]; journal: Journal[]; activities: Activity[]; time_entries: TimeEntry[]; reminders: Reminder[]; settings: Record<string, string> }> {
  const dbx = await getDb();
  const categories = await getAllQuery(dbx, 'SELECT * FROM categories');
  const logs = await getAllQuery(dbx, 'SELECT * FROM logs');
  const journal = await getAllQuery(dbx, 'SELECT * FROM journal');
  const activities = await getAllQuery(dbx, 'SELECT * FROM activities');
  const time_entries = await getAllQuery(dbx, 'SELECT * FROM time_entries');
  const reminders = await getAllQuery(dbx, 'SELECT * FROM reminders');
  const settingsRows = await getAllQuery(dbx, 'SELECT key, value FROM settings');
  const settings: Record<string, string> = {};
  for (const s of settingsRows) settings[s.key] = s.value;
  return { categories, logs, journal, activities, time_entries, reminders, settings };
}

export async function importAll(data: { categories: Category[]; logs: Log[]; journal: Journal[]; activities?: Activity[]; time_entries?: TimeEntry[]; reminders?: Reminder[]; settings?: Record<string, string> }) {
  const dbx = await getDb();
  if (Platform.OS === 'web') {
    // Web doesn't support transactions, so we'll just clear and import
    await runQuery(dbx, 'DELETE FROM categories');
    await runQuery(dbx, 'DELETE FROM logs');
    await runQuery(dbx, 'DELETE FROM journal');
    await runQuery(dbx, 'DELETE FROM activities');
    await runQuery(dbx, 'DELETE FROM time_entries');
    await runQuery(dbx, 'DELETE FROM reminders');
  } else {
    await execSQL(dbx, 'BEGIN TRANSACTION');
    try {
      await execSQL(dbx, 'DELETE FROM categories');
      await execSQL(dbx, 'DELETE FROM logs');
      await execSQL(dbx, 'DELETE FROM journal');
      await execSQL(dbx, 'DELETE FROM activities');
      await execSQL(dbx, 'DELETE FROM time_entries');
      await execSQL(dbx, 'DELETE FROM reminders');
    } catch (e) {
      await execSQL(dbx, 'ROLLBACK');
      throw e;
    }
  }
  
  try {
    if (data.categories) {
      for (const c of data.categories) {
        await runQuery(dbx, 'INSERT INTO categories (id, name, weight) VALUES (?, ?, ?)', [c.id, c.name, c.weight]);
      }
    }
    if (data.logs) {
      for (const l of data.logs) {
        await runQuery(dbx, 'INSERT INTO logs (id, category_id, rating, note, date) VALUES (?, ?, ?, ?, ?)', [l.id, l.category_id, l.rating, l.note ?? null, l.date]);
      }
    }
    if (data.journal) {
      for (const j of data.journal) {
        await runQuery(dbx, 'INSERT INTO journal (id, text, date, tags) VALUES (?, ?, ?, ?)', [j.id, j.text, j.date, j.tags ?? null]);
      }
    }
    if (data.activities) {
      for (const a of data.activities) {
        await runQuery(dbx, 'INSERT INTO activities (id, name, category_id, description) VALUES (?, ?, ?, ?)', [a.id, a.name, a.category_id ?? null, a.description ?? null]);
      }
    }
    if (data.time_entries) {
      for (const t of data.time_entries) {
        await runQuery(dbx, 'INSERT INTO time_entries (id, activity_id, start_time, end_time, duration_minutes, note, date) VALUES (?, ?, ?, ?, ?, ?, ?)', [t.id, t.activity_id, t.start_time, t.end_time ?? null, t.duration_minutes ?? null, t.note ?? null, t.date]);
      }
    }
    if (data.reminders) {
      for (const r of data.reminders) {
        await runQuery(dbx, 'INSERT INTO reminders (id, title, description, due_date, due_time, completed, category_id, activity_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [r.id, r.title, r.description ?? null, r.due_date, r.due_time ?? null, r.completed ? 1 : 0, r.category_id ?? null, r.activity_id ?? null, r.created_at]);
      }
    }
    if (data.settings) {
      for (const [k, v] of Object.entries(data.settings)) {
        await runQuery(dbx, 'INSERT INTO settings (key, value) VALUES (?, ?)', [k, v]);
      }
    }
    if (Platform.OS !== 'web') {
      await execSQL(dbx, 'COMMIT');
    }
  } catch (e) {
    if (Platform.OS !== 'web') {
      await execSQL(dbx, 'ROLLBACK');
    }
    throw e;
  }
}