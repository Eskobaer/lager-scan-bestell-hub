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

      // Try to load existing Lagerbestand.db from localStorage
      const data = localStorage.getItem('lagerbestand-db');
      if (data) {
        console.log('Lade bestehende Lagerbestand.db Datenbank...');
        const uint8Array = new Uint8Array(JSON.parse(data));
        this.db = new this.SQL.Database(uint8Array);
      } else {
        console.log('Erstelle neue Lagerbestand.db Datenbank...');
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
      localStorage.setItem('lagerbestand-db', JSON.stringify(Array.from(data)));
      console.log('Lagerbestand.db gespeichert - Datenbankgröße:', data.length, 'Bytes');
    }
  }

  // Funktion zum Exportieren der Datenbank als herunterladbare Datei
  exportDatabase(): Blob {
    const data = this.db.export();
    return new Blob([data], { type: 'application/x-sqlite3' });
  }

  // Funktion zum Importieren einer Datenbankdatei
  async importDatabase(file: File): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    this.db = new this.SQL.Database(uint8Array);
    this.saveToLocalStorage();
  }

  private initTables() {
    // Users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        email TEXT,
        firstName TEXT,
        lastName TEXT,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT NOT NULL,
        lastLogin TEXT
      )
    `);

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
    // Check and insert initial superadmin user
    const userStmt = this.db.prepare('SELECT COUNT(*) as count FROM users');
    userStmt.step();
    const userResult = userStmt.getAsObject();
    const userCount = userResult.count;
    
    if (userCount === 0) {
      // Create initial superadmin user
      this.db.run(`
        INSERT INTO users (id, username, password, role, email, firstName, lastName, isActive, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        '1',
        'admin',
        'admin', // In production this should be hashed
        'superadmin',
        'admin@example.com',
        'Super',
        'Admin',
        1,
        new Date().toISOString()
      ]);
    }
    
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM articles');
    stmt.step();
    const result = stmt.getAsObject();
    const count = result.count;
    
    if (count === 0) {
      // Artikel-Stammdaten initialisieren
      const testArticles: Article[] = [
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
        },
        {
          id: '4',
          articleNumber: 'MUT-M8-STD',
          name: 'Muttern M8',
          description: 'Sechskantmuttern M8, verzinkt',
          manufacturer: 'Würth',
          currentStock: 320,
          minimumStock: 100,
          location: 'Regal A-13',
          lastUpdated: '2025-01-21',
          qrCode: 'QR_MUT-M8-STD'
        },
        {
          id: '5',
          articleNumber: 'LED-12V-5M',
          name: 'LED-Strip 12V',
          description: 'LED-Streifen 5m, warmweiß, IP65',
          manufacturer: 'Philips',
          currentStock: 45,
          minimumStock: 20,
          location: 'Regal D-02',
          lastUpdated: '2025-01-21',
          qrCode: 'QR_LED-12V-5M'
        },
        {
          id: '6',
          articleNumber: 'BOH-10MM-HSS',
          name: 'Bohrer 10mm HSS',
          description: 'Spiralbohrer HSS, geschliffen',
          manufacturer: 'Bosch',
          currentStock: 12,
          minimumStock: 25,
          location: 'Regal E-15',
          lastUpdated: '2025-01-21',
          qrCode: 'QR_BOH-10MM-HSS'
        },
        {
          id: '7',
          articleNumber: 'KLE-EPOXY-2K',
          name: 'Epoxidkleber 2K',
          description: '2-Komponenten Epoxidharz, 500ml',
          manufacturer: 'Henkel',
          currentStock: 8,
          minimumStock: 15,
          location: 'Regal F-03',
          lastUpdated: '2025-01-21',
          qrCode: 'QR_KLE-EPOXY-2K'
        },
        {
          id: '8',
          articleNumber: 'ROR-PVC-32',
          name: 'PVC-Rohr 32mm',
          description: 'PVC-Rohr 32mm, 2m Länge',
          manufacturer: 'Geberit',
          currentStock: 78,
          minimumStock: 30,
          location: 'Lager Außen',
          lastUpdated: '2025-01-21',
          qrCode: 'QR_ROR-PVC-32'
        },
        {
          id: '9',
          articleNumber: 'ISO-BAND-20',
          name: 'Isolierband 20m',
          description: 'Elektriker-Isolierband, schwarz',
          manufacturer: '3M',
          currentStock: 156,
          minimumStock: 50,
          location: 'Regal D-07',
          lastUpdated: '2025-01-21',
          qrCode: 'QR_ISO-BAND-20'
        },
        {
          id: '10',
          articleNumber: 'FIL-M5-20',
          name: 'Gewindestange M5',
          description: 'Gewindestange M5x1000mm, verzinkt',
          manufacturer: 'Fischer',
          currentStock: 24,
          minimumStock: 40,
          location: 'Regal A-20',
          lastUpdated: '2025-01-21',
          qrCode: 'QR_FIL-M5-20'
        }
      ];

      testArticles.forEach(article => {
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
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
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
    stmt.bind([articleNumber]);
    if (stmt.step()) {
      const result = stmt.getAsObject();
      stmt.free();
      return result as Article;
    }
    stmt.free();
    return null;
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

    this.logActivity('create', article.articleNumber, article.name, undefined, undefined, 'System');
    this.saveToLocalStorage();

    return { ...article, id, lastUpdated, qrCode };
  }

  updateArticle(id: string, article: Omit<Article, 'id' | 'lastUpdated' | 'qrCode'>): Article {
    const lastUpdated = new Date().toISOString().split('T')[0];
    
    const existingStmt = this.db.prepare('SELECT * FROM articles WHERE id = ?');
    existingStmt.bind([id]);
    existingStmt.step();
    const existing = existingStmt.getAsObject() as Article;
    existingStmt.free();

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

    this.logActivity('update', article.articleNumber, article.name, undefined, undefined, 'System', {
      oldData: existing,
      newData: article
    });
    this.saveToLocalStorage();

    return { ...article, id, lastUpdated, qrCode: existing.qrCode };
  }

  deleteArticle(id: string): void {
    const stmt = this.db.prepare('SELECT * FROM articles WHERE id = ?');
    stmt.bind([id]);
    stmt.step();
    const article = stmt.getAsObject() as Article;
    stmt.free();
    
    this.db.run('DELETE FROM articles WHERE id = ?', [id]);
    
    this.logActivity('delete', article.articleNumber, article.name, undefined, undefined, 'System');
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
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
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
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
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

  // User management operations
  authenticateUser(username: string, password: string): User | null {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ? AND password = ? AND isActive = 1');
    stmt.bind([username, password]);
    if (stmt.step()) {
      const result = stmt.getAsObject();
      
      // Update last login
      this.db.run('UPDATE users SET lastLogin = ? WHERE id = ?', [
        new Date().toISOString(),
        result.id
      ]);
      this.saveToLocalStorage();
      
      stmt.free();
      return result as User;
    }
    stmt.free();
    return null;
  }

  getAllUsers(): User[] {
    const stmt = this.db.prepare('SELECT * FROM users ORDER BY username');
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results.map((row: any) => ({
      id: row.id,
      username: row.username,
      password: row.password,
      role: row.role,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      isActive: row.isActive === 1,
      createdAt: row.createdAt,
      lastLogin: row.lastLogin
    }));
  }

  createUser(user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): User {
    const id = Date.now().toString();
    const createdAt = new Date().toISOString();

    this.db.run(`
      INSERT INTO users (id, username, password, role, email, firstName, lastName, isActive, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      user.username,
      user.password,
      user.role,
      user.email,
      user.firstName,
      user.lastName,
      user.isActive ? 1 : 0,
      createdAt
    ]);

    this.saveToLocalStorage();
    return { ...user, id, createdAt, lastLogin: null };
  }

  updateUser(id: string, user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): User {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    stmt.bind([id]);
    stmt.step();
    const existing = stmt.getAsObject() as User;
    stmt.free();

    this.db.run(`
      UPDATE users 
      SET username = ?, password = ?, role = ?, email = ?, firstName = ?, lastName = ?, isActive = ?
      WHERE id = ?
    `, [
      user.username,
      user.password,
      user.role,
      user.email,
      user.firstName,
      user.lastName,
      user.isActive ? 1 : 0,
      id
    ]);

    this.saveToLocalStorage();
    return { ...user, id, createdAt: existing.createdAt, lastLogin: existing.lastLogin };
  }

  deleteUser(id: string): void {
    this.db.run('DELETE FROM users WHERE id = ?', [id]);
    this.saveToLocalStorage();
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Singleton instance
let dbInstance: InventoryDatabase | null = null;
let initPromise: Promise<InventoryDatabase> | null = null;

export const getDatabase = (): Promise<InventoryDatabase> => {
  if (initPromise) {
    return initPromise;
  }
  
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  initPromise = (async () => {
    try {
      dbInstance = new InventoryDatabase();
      await dbInstance.init();
      return dbInstance;
    } catch (error) {
      initPromise = null; // Reset on error to allow retry
      throw error;
    }
  })();

  return initPromise;
};

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'user' | 'admin' | 'superadmin';
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string | null;
}

export const database = new InventoryDatabase();

export type { Article, StockBooking, ActivityEntry };