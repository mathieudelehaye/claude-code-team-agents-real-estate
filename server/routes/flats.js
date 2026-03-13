const express = require('express');
const router = express.Router();

function createRouter(db) {
  // GET /api/flats - return all flats with base64 images
  router.get('/', (req, res) => {
    try {
      const rows = db.prepare('SELECT id, title, price, location, image FROM flats').all();
      const flats = rows.map(row => ({
        id: row.id,
        title: row.title,
        price: row.price,
        location: row.location,
        image: `data:image/png;base64,${Buffer.from(row.image).toString('base64')}`
      }));
      res.json(flats);
    } catch (err) {
      console.error('Error fetching flats:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/flats/:id - return single flat by ID
  router.get('/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(404).json({ error: 'Flat not found' });
      }
      const row = db.prepare('SELECT id, title, price, location, image FROM flats WHERE id = ?').get(id);
      if (!row) {
        return res.status(404).json({ error: 'Flat not found' });
      }
      res.json({
        id: row.id,
        title: row.title,
        price: row.price,
        location: row.location,
        image: `data:image/png;base64,${Buffer.from(row.image).toString('base64')}`
      });
    } catch (err) {
      console.error('Error fetching flat:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}

module.exports = createRouter;
