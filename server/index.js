const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');
const createFlatsRouter = require('./routes/flats');

const PORT = 3000;
const DB_PATH = path.join(__dirname, 'flats.db');

const app = express();

// CORS - allow all origins
app.use(cors());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Health check - no database access required
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Open database
const db = new Database(DB_PATH, { readonly: true });

// Mount flat routes
app.use('/api/flats', createFlatsRouter(db));

// Start server
const server = app.listen(PORT, () => {
  console.log(`London Rentals API running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  db.close();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  db.close();
  server.close();
  process.exit(0);
});
