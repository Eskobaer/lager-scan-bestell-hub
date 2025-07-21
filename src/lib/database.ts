import initSqlJs from 'sql.js';
import { Article } from '@/components/ArticleForm';

interface StockBooking {
  id: string;
  type: 'in' | 'out';
  articleNumber: string;
  articleName: string;
  quantity: number;
  reason: string;
  user: string;
  timestamp: string;
  oldStock: number;
  newStock: number;
}

interface ActivityEntry {
  id: string;
  type: 'in' | 'out' | 'create' | 'update' | 'delete';
  articleNumber: string;
  articleName: string;
  quantity?: number;
  reason?: string;
  user: string;
  timestamp: string;
  newStock?: number;
  oldStock?: number;
  details?: string; // JSON string
}

class InventoryDatabase {
  private db: any = null;
  private SQL: any = null;
  private isInitialized = false;

  async init() {
    if (this.isInitialized) return;

    try {
      // Initialize sql.js
      this.SQL = await initSqlJs({
        locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/${file}`
      });

      // Try to load existing database from localStorage
      const data = localStorage.getItem('inventory-db');
      if (data) {
        const uint8Array = new Uint8Array(JSON.parse(data));
        this.db = new this.SQL.Database(uint8Array);
      } else {
        this.db = new this.SQL.Database();
      }

      this.initTables();
      this.insertMockData();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private saveToLocalStorage() {
    if (this.db) {
      const data = this.db.export();
      localStorage.setItem('inventory-db', JSON.stringify(Array.from(data)));
    }
  }

  private initTables() {
    // Articles table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS articles (
        id TEXT PRIMARY KEY,
        articleNumber TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        manufacturer TEXT,
        currentStock INTEGER NOT NULL DEFAULT 0,
        minimumStock INTEGER NOT NULL DEFAULT 0,
        location TEXT,
        lastUpdated TEXT NOT NULL,
        qrCode TEXT
      )
    `);

    // Stock bookings table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS stock_bookings (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('in', 'out')),
        articleNumber TEXT NOT NULL,
        articleName TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        reason TEXT,
        user TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        oldStock INTEGER NOT NULL,
        newStock INTEGER NOT NULL
      )
    `);

    // Activity log table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('in', 'out', 'create', 'update', 'delete')),
        articleNumber TEXT NOT NULL,
        articleName TEXT NOT NULL,
        quantity INTEGER,
        reason TEXT,
        user TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        newStock INTEGER,
        oldStock INTEGER,
        details TEXT
      )
    `);
  }

  private insertMockData() {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM articles');
    const result = stmt.get();
    const count = result[0];
    
    if (count === 0) {
      const mockArticles: Article[] = [
        {
          id: '1',
          articleNumber: 'SCR-M8-20',
          name: 'Schrauben M8x20',
          description: 'Edelstahl Innensechskant Schrauben',
          manufacturer: 'Würth',
          currentStock: 150,
          minimumStock: 50,
          location: 'Regal A-12',
          lastUpdated: '2025-01-21',
          qrCode: 'QR_SCR-M8-20'
        },
        {
          id: '2',
          articleNumber: 'DIC-STD-01',
          name: 'Dichtungsringe',
          description: 'Standard O-Ring Set',
          manufacturer: 'Fischer',
          currentStock: 25,
          minimumStock: 100,
          location: 'Regal B-05',
          lastUpdated: '2025-01-21',
          qrCode: 'QR_DIC-STD-01'
        },
        {
          id: '3',
          articleNumber: 'KAB-200-SW',
          name: 'Kabelbinder 200mm',
          description: 'Schwarz, UV-beständig',
          manufacturer: 'Hellermann Tyton',
          currentStock: 200,
          minimumStock: 200,
          location: 'Regal C-08',
          lastUpdated: '2025-01-21',
          qrCode: 'QR_KAB-200-SW'
        }
      ];

      mockArticles.forEach(article => {
        this.db.run(`
          INSERT INTO articles (id, articleNumber, name, description, manufacturer, currentStock, minimumStock, location, lastUpdated, qrCode)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          article.id,
          article.articleNumber,
          article.name,
          article.description,
          article.manufacturer,
          article.currentStock,
          article.minimumStock,
          article.location,
          article.lastUpdated,
          article.qrCode
        ]);

        this.logActivity('create', article.articleNumber, article.name, undefined, undefined, 'System', {
          initialData: true
        });
      });

      this.saveToLocalStorage();
    }
  }

  // Article CRUD operations
  getAllArticles(): Article[] {
    const stmt = this.db.prepare('SELECT * FROM articles ORDER BY name');
    const results = stmt.getAsObject();
    return results.map((row: any) => ({
      id: row.id,
      articleNumber: row.articleNumber,
      name: row.name,
      description: row.description,
      manufacturer: row.manufacturer,
      currentStock: row.currentStock,
      minimumStock: row.minimumStock,
      location: row.location,
      lastUpdated: row.lastUpdated,
      qrCode: row.qrCode
    }));
  }

  getArticleByNumber(articleNumber: string): Article | null {
    const stmt = this.db.prepare('SELECT * FROM articles WHERE articleNumber = ?');
    const results = stmt.getAsObject([articleNumber]);
    return results.length > 0 ? results[0] as Article : null;
  }

  createArticle(article: Omit<Article, 'id' | 'lastUpdated' | 'qrCode'>): Article {
    const id = Date.now().toString();
    const lastUpdated = new Date().toISOString().split('T')[0];
    const qrCode = `QR_${article.articleNumber}`;

    this.db.run(`
      INSERT INTO articles (id, articleNumber, name, description, manufacturer, currentStock, minimumStock, location, lastUpdated, qrCode)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      article.articleNumber,
      article.name,
      article.description,
      article.manufacturer,
      article.currentStock,
      article.minimumStock,
      article.location,
      lastUpdated,
      qrCode
    ]);

    this.logActivity('create', article.articleNumber, article.name, undefined, undefined, 'Demo User');
    this.saveToLocalStorage();

    return { ...article, id, lastUpdated, qrCode };
  }

  updateArticle(id: string, article: Omit<Article, 'id' | 'lastUpdated' | 'qrCode'>): Article {
    const lastUpdated = new Date().toISOString().split('T')[0];
    
    const existingStmt = this.db.prepare('SELECT * FROM articles WHERE id = ?');
    const existingResults = existingStmt.getAsObject([id]);
    const existing = existingResults[0] as Article;

    this.db.run(`
      UPDATE articles 
      SET articleNumber = ?, name = ?, description = ?, manufacturer = ?, 
          currentStock = ?, minimumStock = ?, location = ?, lastUpdated = ?
      WHERE id = ?
    `, [
      article.articleNumber,
      article.name,
      article.description,
      article.manufacturer,
      article.currentStock,
      article.minimumStock,
      article.location,
      lastUpdated,
      id
    ]);

    this.logActivity('update', article.articleNumber, article.name, undefined, undefined, 'Demo User', {
      oldData: existing,
      newData: article
    });
    this.saveToLocalStorage();

    return { ...article, id, lastUpdated, qrCode: existing.qrCode };
  }

  deleteArticle(id: string): void {
    const stmt = this.db.prepare('SELECT * FROM articles WHERE id = ?');
    const results = stmt.getAsObject([id]);
    const article = results[0] as Article;
    
    this.db.run('DELETE FROM articles WHERE id = ?', [id]);
    
    this.logActivity('delete', article.articleNumber, article.name, undefined, undefined, 'Demo User');
    this.saveToLocalStorage();
  }

  // Stock booking operations
  createStockBooking(booking: Omit<StockBooking, 'id' | 'articleName' | 'timestamp' | 'oldStock' | 'newStock'>): StockBooking {
    const article = this.getArticleByNumber(booking.articleNumber);
    if (!article) {
      throw new Error('Article not found');
    }

    const oldStock = article.currentStock;
    const newStock = booking.type === 'in' 
      ? oldStock + booking.quantity 
      : Math.max(0, oldStock - booking.quantity);

    if (booking.type === 'out' && booking.quantity > oldStock) {
      throw new Error('Insufficient stock');
    }

    const id = Date.now().toString();
    const timestamp = new Date().toLocaleString('de-DE');

    // Update article stock
    this.db.run('UPDATE articles SET currentStock = ?, lastUpdated = ? WHERE articleNumber = ?', [
      newStock, 
      new Date().toISOString().split('T')[0], 
      booking.articleNumber
    ]);

    // Insert booking
    this.db.run(`
      INSERT INTO stock_bookings (id, type, articleNumber, articleName, quantity, reason, user, timestamp, oldStock, newStock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      booking.type,
      booking.articleNumber,
      article.name,
      booking.quantity,
      booking.reason,
      booking.user,
      timestamp,
      oldStock,
      newStock
    ]);

    this.logActivity(
      booking.type,
      booking.articleNumber,
      article.name,
      booking.quantity,
      booking.reason,
      booking.user,
      { oldStock, newStock }
    );
    this.saveToLocalStorage();

    return { ...booking, id, articleName: article.name, timestamp, oldStock, newStock };
  }

  getAllStockBookings(): StockBooking[] {
    const stmt = this.db.prepare('SELECT * FROM stock_bookings ORDER BY timestamp DESC');
    const results = stmt.getAsObject();
    return results.map((row: any) => ({
      id: row.id,
      type: row.type,
      articleNumber: row.articleNumber,
      articleName: row.articleName,
      quantity: row.quantity,
      reason: row.reason,
      user: row.user,
      timestamp: row.timestamp,
      oldStock: row.oldStock,
      newStock: row.newStock
    }));
  }

  // Activity log operations
  private logActivity(
    type: ActivityEntry['type'],
    articleNumber: string,
    articleName: string,
    quantity?: number,
    reason?: string,
    user: string = 'System',
    details?: any
  ): void {
    this.db.run(`
      INSERT INTO activity_log (id, type, articleNumber, articleName, quantity, reason, user, timestamp, newStock, oldStock, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      articleNumber,
      articleName,
      quantity || null,
      reason || null,
      user,
      new Date().toLocaleString('de-DE'),
      details?.newStock || null,
      details?.oldStock || null,
      details ? JSON.stringify(details) : null
    ]);
  }

  getAllActivities(): ActivityEntry[] {
    const stmt = this.db.prepare('SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 200');
    const results = stmt.getAsObject();
    return results.map((row: any) => ({
      id: row.id,
      type: row.type,
      articleNumber: row.articleNumber,
      articleName: row.articleName,
      quantity: row.quantity,
      reason: row.reason,
      user: row.user,
      timestamp: row.timestamp,
      newStock: row.newStock,
      oldStock: row.oldStock,
      details: row.details
    }));
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Singleton instance
let dbInstance: InventoryDatabase | null = null;

export const getDatabase = async (): Promise<InventoryDatabase> => {
  if (!dbInstance) {
    dbInstance = new InventoryDatabase();
    await dbInstance.init();
  }
  return dbInstance;
};

export type { Article, StockBooking, ActivityEntry };