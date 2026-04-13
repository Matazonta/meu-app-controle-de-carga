import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import cors from "cors";

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

  // API Routes
  
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
