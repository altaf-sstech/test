const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// Configuration
const PORT = process.env.PORT || 3001;
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
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Auth database table initialized successfully.");
  } catch (err) {
    console.error("Database initialization failed:", err.message);
  }
};
initDb();

// Endpoints
app.get('/auth/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'auth-service' });
});

app.post('/auth/register', async (req, res) => {
  const { username, email } = req.body;
  
  if (!username || !email) {
    return res.status(400).json({ error: 'Username and email are required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id, username, email, created_at',
      [username, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // PostgreSQL Unique Violation Error Code
      return res.status(409).json({ error: 'Username or email already exists.' });
    }
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Get all users
app.get('/auth/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, created_at FROM users ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Delete a user by id
app.delete('/auth/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: 'User deleted', id: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

app.listen(PORT, () => console.log(`Auth microservice processing on port ${PORT}`));
