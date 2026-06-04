const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Configuration
const PORT = process.env.PORT || 3003;
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("FATAL ERROR: DATABASE_URL environment variable is missing.");
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection Pool
const pool = new Pool({
  connectionString: DATABASE_URL,
});

// Database Initialization Table Query
const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS laptops (
        id SERIAL PRIMARY KEY,
        brand VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        specs TEXT,
        price NUMERIC,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Laptop database table initialized successfully.");
  } catch (err) {
    console.error("Database initialization failed:", err.message);
  }
};
initDb();

// Endpoints
app.get('/laptop/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'laptop-service' });
});

app.get('/laptop/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM laptops ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

app.post('/laptop/items', async (req, res) => {
  const { brand, model, specs, price } = req.body;

  if (!brand || !model) {
    return res.status(400).json({ error: 'Brand and model are required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO laptops (brand, model, specs, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [brand, model, specs || null, price || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

app.delete('/laptop/items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM laptops WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Laptop not found' });
    res.status(200).json({ message: 'Laptop deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

app.listen(PORT, () => console.log(`Laptop microservice processing on port ${PORT}`));
