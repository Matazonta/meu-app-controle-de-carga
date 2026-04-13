import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import cors from "cors";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(process.cwd(), "database.db");
const db = new Database(dbPath);

console.log(`Database initialized at: ${dbPath}`);

// Initialize database tables
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      driverName TEXT,
      productType TEXT,
      quantity INTEGER,
      origin TEXT,
      destination TEXT,
      timestamp TEXT
    );

    CREATE TABLE IF NOT EXISTS drivers (
      name TEXT PRIMARY KEY,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS km_registrations (
      id TEXT PRIMARY KEY,
      date TEXT,
      time TEXT,
      vehicle TEXT,
      driver TEXT,
      start TEXT,
      end TEXT,
      total TEXT
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      message TEXT,
      timestamp TEXT,
      type TEXT
    );
  `);
  console.log("Database tables verified/created successfully");
  
  // Log table structures for debugging
  const tables = ['drivers', 'registrations', 'km_registrations', 'alerts'];
  tables.forEach(table => {
    try {
      const info = db.prepare(`PRAGMA table_info(${table})`).all();
      console.log(`Table ${table} structure:`, info);
    } catch (e) {
      console.error(`Error checking table ${table}:`, e);
    }
  });
} catch (e) {
  console.error("CRITICAL: Failed to initialize database tables:", e);
}

// Seed default drivers if empty
const driverCount = db.prepare("SELECT COUNT(*) as count FROM drivers").get() as { count: number };
if (driverCount.count === 0) {
  const defaultDrivers = ['Robison', 'Wesley', 'Gil', 'Zonta', 'Eduardo', 'Luis', 'Joel'];
  const insert = db.prepare("INSERT INTO drivers (name, password) VALUES (?, ?)");
  defaultDrivers.forEach(name => insert.run(name, null));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Request Logging Middleware
  app.use((req, res, next) => {
    const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
    try {
      fs.appendFileSync('access.log', logEntry);
    } catch (e) {}
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      time: new Date().toISOString(),
      database: !!db 
    });
  });

  app.get("/api/debug/routes", (req, res) => {
    const routes = app._router.stack
      .filter((r: any) => r.route)
      .map((r: any) => ({
        path: r.route.path,
        methods: Object.keys(r.route.methods)
      }));
    res.json(routes);
  });
  
  // Registrations
  app.get("/api/registrations", (req, res) => {
    const rows = db.prepare("SELECT * FROM registrations ORDER BY timestamp DESC").all();
    res.json(rows);
  });

  app.post("/api/registrations", (req, res) => {
    const { id, driverName, productType, quantity, origin, destination, timestamp } = req.body;
    db.prepare("INSERT INTO registrations (id, driverName, productType, quantity, origin, destination, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(id, driverName, productType, quantity, origin, destination, timestamp);
    res.json({ success: true });
  });

  // Drivers
  app.get("/api/drivers", (req, res) => {
    const rows = db.prepare("SELECT * FROM drivers").all();
    console.log(`Fetching drivers: ${rows.length} found`);
    res.json(rows);
  });

  app.post("/api/drivers", (req, res) => {
    console.log("POST /api/drivers request body:", req.body);
    const { name, password } = req.body;
    const trimmedName = name?.trim();
    
    if (!trimmedName) {
      return res.status(400).json({ error: "Nome do motorista é obrigatório" });
    }

    try {
      // Use INSERT OR REPLACE to handle updates/re-adds gracefully
      db.prepare("INSERT OR REPLACE INTO drivers (name, password) VALUES (?, ?)")
        .run(trimmedName, password || "");
      
      console.log(`Driver saved successfully: ${trimmedName}`);
      res.json({ success: true });
    } catch (e) {
      console.error("Error in POST /api/drivers:", e);
      res.status(500).json({ 
        error: "Erro ao salvar no banco de dados", 
        details: e instanceof Error ? e.message : String(e) 
      });
    }
  });

  app.delete("/api/drivers/:name", (req, res) => {
    console.log(`Deleting driver: ${req.params.name}`);
    db.prepare("DELETE FROM drivers WHERE name = ?").run(req.params.name);
    res.json({ success: true });
  });

  // KM Registrations
  app.get("/api/km", (req, res) => {
    const rows = db.prepare("SELECT * FROM km_registrations").all();
    res.json(rows);
  });

  app.post("/api/km", (req, res) => {
    const { id, date, time, vehicle, driver, start, end, total } = req.body;
    db.prepare("INSERT OR REPLACE INTO km_registrations (id, date, time, vehicle, driver, start, end, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(id, date, time, vehicle, driver, start, end, total);
    res.json({ success: true });
  });

  // Alerts
  app.get("/api/alerts", (req, res) => {
    const rows = db.prepare("SELECT * FROM alerts ORDER BY timestamp DESC").all();
    res.json(rows);
  });

  app.post("/api/alerts", (req, res) => {
    const { id, message, timestamp, type } = req.body;
    db.prepare("INSERT INTO alerts (id, message, timestamp, type) VALUES (?, ?, ?, ?)")
      .run(id, message, timestamp, type);
    res.json({ success: true });
  });

  app.delete("/api/alerts", (req, res) => {
    db.prepare("DELETE FROM alerts").run();
    res.json({ success: true });
  });

  // Reset Logic
  app.post("/api/reset-daily", (req, res) => {
    db.prepare("DELETE FROM km_registrations").run();
    db.prepare("DELETE FROM alerts").run();
    res.json({ success: true });
  });

  app.post("/api/hard-reset", (req, res) => {
    db.prepare("DELETE FROM registrations").run();
    db.prepare("DELETE FROM km_registrations").run();
    db.prepare("DELETE FROM alerts").run();
    db.prepare("UPDATE drivers SET password = NULL").run();
    res.json({ success: true });
  });

  app.get("/api/debug/logs", (req, res) => {
    try {
      const logs = fs.readFileSync('access.log', 'utf8');
      res.send(`<pre>${logs}</pre>`);
    } catch (e) {
      res.send("No logs found.");
    }
  });

  // Catch-all for API routes that don't match
  app.all("/api/*", (req, res) => {
    const msg = `[API 404] ${req.method} ${req.url} - Route not found\n`;
    console.warn(msg);
    try {
      fs.appendFileSync('404.log', msg);
    } catch (e) {}
    
    res.status(404).json({ 
      error: "Rota não encontrada no servidor", 
      method: req.method, 
      path: req.url 
    });
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ 
      error: "Erro interno no servidor", 
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
