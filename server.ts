import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("wonderbuild.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    age_band TEXT,
    interests TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER,
    type TEXT,
    title TEXT,
    status TEXT DEFAULT 'active',
    brief TEXT,
    outputs TEXT,
    current_step INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(profile_id) REFERENCES profiles(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/profile", (req, res) => {
    const profile = db.prepare("SELECT * FROM profiles ORDER BY id DESC LIMIT 1").get();
    res.json(profile || null);
  });

  app.post("/api/profile", (req, res) => {
    const { name, age_band, interests } = req.body;
    const info = db.prepare("INSERT INTO profiles (name, age_band, interests) VALUES (?, ?, ?)").run(name, age_band, JSON.stringify(interests));
    res.json({ id: info.lastInsertRowid });
  });

  app.get("/api/projects", (req, res) => {
    const projects = db.prepare("SELECT * FROM projects ORDER BY updated_at DESC").all();
    res.json(projects.map(p => ({ ...p, brief: JSON.parse(p.brief || '{}'), outputs: JSON.parse(p.outputs || '{}') })));
  });

  app.get("/api/projects/:id", (req, res) => {
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
    if (project) {
      project.brief = JSON.parse(project.brief || '{}');
      project.outputs = JSON.parse(project.outputs || '{}');
    }
    res.json(project);
  });

  app.post("/api/projects", (req, res) => {
    const { profile_id, type, title, brief } = req.body;
    const info = db.prepare("INSERT INTO projects (profile_id, type, title, brief) VALUES (?, ?, ?, ?)").run(profile_id, type, title, JSON.stringify(brief || {}));
    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/projects/:id", (req, res) => {
    const { title, brief, outputs, current_step, status } = req.body;
    const existing = db.prepare("SELECT * FROM projects WHERE id = ?").get(req.params.id);
    if (!existing) return res.status(404).json({ error: "Project not found" });

    const updatedBrief = brief ? JSON.stringify(brief) : existing.brief;
    const updatedOutputs = outputs ? JSON.stringify(outputs) : existing.outputs;
    const updatedTitle = title || existing.title;
    const updatedStep = current_step !== undefined ? current_step : existing.current_step;
    const updatedStatus = status || existing.status;

    db.prepare(`
      UPDATE projects 
      SET title = ?, brief = ?, outputs = ?, current_step = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(updatedTitle, updatedBrief, updatedOutputs, updatedStep, updatedStatus, req.params.id);
    
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
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
