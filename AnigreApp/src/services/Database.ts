import * as SQLite from 'expo-sqlite';
import { ScanResult } from '../constants/types';

export type Post = {
  id: string;
  userId: string;
  authorName: string;
  imageUri?: string;
  videoUri?: string;
  caption: string;
  likes: number;
  timestamp: string;
  isLikedByMe?: boolean;
};

export type Comment = {
  id: string;
  postId: string;
  userId: string;
  authorName: string;
  text: string;
  timestamp: string;
};

const dbName = 'anigre.db';
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const getDB = (): Promise<SQLite.SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(dbName);
  }
  return dbPromise;
};

export const initDB = async () => {
  try {
    const db = await getDB();
    
    // Check if we are upgrading schema
    const checkUsers = await db.getFirstAsync<{ count: number }>("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='users'");
    
    if (checkUsers && checkUsers.count === 0) {
      await db.execAsync(`
        DROP TABLE IF EXISTS scans;
        DROP TABLE IF EXISTS crops;
      `);
    }

    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS scans (
        id TEXT PRIMARY KEY NOT NULL,
        userId TEXT NOT NULL,
        imageUri TEXT NOT NULL,
        diseaseName TEXT NOT NULL,
        confidence REAL NOT NULL,
        severity TEXT NOT NULL,
        date TEXT NOT NULL,
        treatments TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS crops (
        id TEXT PRIMARY KEY NOT NULL,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        plantedDate TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY NOT NULL,
        userId TEXT NOT NULL,
        imageUri TEXT,
        videoUri TEXT,
        caption TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY NOT NULL,
        postId TEXT NOT NULL,
        userId TEXT NOT NULL,
        text TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (postId) REFERENCES posts (id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS post_likes (
        postId TEXT NOT NULL,
        userId TEXT NOT NULL,
        PRIMARY KEY (postId, userId),
        FOREIGN KEY (postId) REFERENCES posts (id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      );
    `);

    // Seed Community Posts if empty
    const checkPosts = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM posts');
    if (checkPosts && checkPosts.count === 0) {
      // Create some mock users first
      await db.runAsync('INSERT OR IGNORE INTO users (id, name, email, password) VALUES (?, ?, ?, ?)', ['mock-user-1', 'Rahul Sharma', 'rahul@example.com', '123']);
      await db.runAsync('INSERT OR IGNORE INTO users (id, name, email, password) VALUES (?, ?, ?, ?)', ['mock-user-2', 'Aisha Patel', 'aisha@example.com', '123']);
      
      const seedPosts = [
        { id: 'post-1', userId: 'mock-user-1', caption: 'My tomato plants are finally bearing fruit! 🍅 #FarmingLife', likes: 12, ts: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), imageUri: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?q=80&w=600' },
        { id: 'post-2', userId: 'mock-user-2', caption: 'Anyone know how to deal with early signs of rust on corn leaves? Found some weird spots today.', likes: 5, ts: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), imageUri: 'https://images.unsplash.com/photo-1621360046522-6e5ce3a16533?q=80&w=600' },
      ];

      for (const p of seedPosts) {
        await db.runAsync(
          'INSERT INTO posts (id, userId, imageUri, caption, likes, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
          [p.id, p.userId, p.imageUri, p.caption, p.likes, p.ts]
        );
      }
    }
  } catch (err) {
    console.error('Database Init Error:', err);
  }
};

export const insertScan = async (userId: string, scan: ScanResult) => {
  try {
    const db = await getDB();
    const treatmentsJson = JSON.stringify(scan.treatments);
    
    await db.runAsync(
      'INSERT INTO scans (id, userId, imageUri, diseaseName, confidence, severity, date, treatments) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [scan.id, userId, scan.imageUri, scan.diseaseName, scan.confidence, scan.severity, scan.date, treatmentsJson]
    );
  } catch (err) {
    console.error('Insert Scan Error:', err);
  }
};

export const getRecentScans = async (userId: string): Promise<ScanResult[]> => {
  try {
    const db = await getDB();
    const allRows = await db.getAllAsync('SELECT * FROM scans WHERE userId = ? ORDER BY date DESC', [userId]);
    
    return allRows.map((row: any) => ({
      ...row,
      treatments: JSON.parse(row.treatments)
    }));
  } catch (err) {
    console.error('Fetch Scans Error:', err);
    return [];
  }
};

export const getMyCrops = async (userId: string): Promise<any[]> => {
  try {
    const db = await getDB();
    return await db.getAllAsync('SELECT * FROM crops WHERE userId = ? ORDER BY plantedDate DESC', [userId]);
  } catch (err) {
    console.error('Fetch Crops Error:', err);
    return [];
  }
};

export const insertCrop = async (userId: string, id: string, name: string, status: string, plantedDate: string) => {
  try {
    const db = await getDB();
    await db.runAsync(
      'INSERT INTO crops (id, userId, name, status, plantedDate) VALUES (?, ?, ?, ?, ?)',
      [id, userId, name, status, plantedDate]
    );
  } catch (err) {
    console.error('Insert Crop Error:', err);
  }
};

export const registerUser = async (name: string, email: string, password: string): Promise<any> => {
  try {
    const db = await getDB();
    const existingUser = await db.getFirstAsync('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const id = `user-${Date.now()}`;
    await db.runAsync(
      'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
      [id, name, email.toLowerCase(), password]
    );

    return { id, name, email };
  } catch (err: any) {
    console.error('Register User Error:', err);
    throw err;
  }
};

export const loginUser = async (email: string, password: string): Promise<any> => {
  try {
    const db = await getDB();
    const user = await db.getFirstAsync<any>('SELECT id, name, email FROM users WHERE email = ? AND password = ?', [email.toLowerCase(), password]);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    return user;
  } catch (err: any) {
    console.error('Login User Error:', err);
    throw err;
  }
};

// ==========================================
// AGRIGRAM FEED & COMMUNITY
// ==========================================

export const getAllPosts = async (currentUserId: string): Promise<Post[]> => {
  try {
    const db = await getDB();
    const query = `
      SELECT 
        p.*, 
        u.name as authorName,
        (SELECT count(*) FROM post_likes WHERE postId = p.id AND userId = ?) as isLiked
      FROM posts p
      JOIN users u ON p.userId = u.id
      ORDER BY p.timestamp DESC
    `;
    const rows = await db.getAllAsync<any>(query, [currentUserId]);
    
    return rows.map(row => ({
      ...row,
      isLikedByMe: row.isLiked > 0
    }));
  } catch (err) {
    console.error('Fetch Posts Error:', err);
    return [];
  }
};

export const createPost = async (userId: string, caption: string, imageUri?: string, videoUri?: string) => {
  try {
    const db = await getDB();
    const id = `post-${Date.now()}`;
    await db.runAsync(
      'INSERT INTO posts (id, userId, imageUri, videoUri, caption, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [id, userId, imageUri || null, videoUri || null, caption, new Date().toISOString()]
    );
  } catch (err) {
    console.error('Create Post Error:', err);
    throw err;
  }
};

export const toggleLikePost = async (postId: string, userId: string, isCurrentlyLiked: boolean) => {
  try {
    const db = await getDB();
    if (isCurrentlyLiked) {
      await db.runAsync('DELETE FROM post_likes WHERE postId = ? AND userId = ?', [postId, userId]);
      await db.runAsync('UPDATE posts SET likes = likes - 1 WHERE id = ?', [postId]);
    } else {
      await db.runAsync('INSERT INTO post_likes (postId, userId) VALUES (?, ?)', [postId, userId]);
      await db.runAsync('UPDATE posts SET likes = likes + 1 WHERE id = ?', [postId]);
    }
  } catch (err) {
    console.error('Like Post Error:', err);
    throw err;
  }
};

export const getComments = async (postId: string): Promise<Comment[]> => {
  try {
    const db = await getDB();
    return await db.getAllAsync<any>(
      `SELECT c.*, u.name as authorName FROM comments c JOIN users u ON c.userId = u.id WHERE c.postId = ? ORDER BY c.timestamp ASC`,
      [postId]
    );
  } catch (err) {
    console.error('Fetch Comments Error:', err);
    return [];
  }
};

export const addComment = async (postId: string, userId: string, text: string) => {
  try {
    const db = await getDB();
    const id = `comment-${Date.now()}`;
    await db.runAsync(
      'INSERT INTO comments (id, postId, userId, text, timestamp) VALUES (?, ?, ?, ?, ?)',
      [id, postId, userId, text, new Date().toISOString()]
    );
  } catch (err) {
    console.error('Add Comment Error:', err);
    throw err;
  }
};
