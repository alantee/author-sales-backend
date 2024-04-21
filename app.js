const cors = require('cors');
const express = require('express');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();
app.use(cors());
const port = 3000;

const pool = new Pool({
    user: 'davion.myles',
    host: 'localhost',
    database: 'authorsalesdb',
    password: '',
    port: 5432,
});

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

app.get('/top-authors', async (req, res) => {
  const { author_name } = req.query;
  console.log(author_name);

  try {
    const cacheKey = 'top-authors';
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json({data: JSON.parse(cachedData) });
    }

    if (author_name && !/^[\p{L}\s'-]+$/u.test(author_name)) {
      return res.status(400).json({ error: 'Invalid input for author name, please use letters, spaces, apostrophes, or hyphens only.' });
    }

    if (author_name) {
      const authorQuery = await pool.query(
        `SELECT id FROM authors WHERE name = $1`, [author_name]
      );
      if (authorQuery.rows.length === 0) {
        return res.status(404).json({ error: 'Author not found' });
      }
    }

    const topAuthorsQuery = await pool.query(
      `SELECT authors.name, SUM(sale_items.item_price * sale_items.quantity) AS total_sales
      FROM authors
      JOIN books ON authors.id = books.author_id
      JOIN sale_items ON books.id = sale_items.book_id
      GROUP BY authors.id
      ORDER BY total_sales DESC
      LIMIT 10`
    );
  
    if (topAuthorsQuery.rows.length === 0) {
      return res.status(404).json({ error: 'No authors found' });
    }

    await redisClient.set(cacheKey, JSON.stringify(topAuthorsQuery.rows), {
      EX: 10 
    });

    res.json({data: topAuthorsQuery.rows });
  } catch (err) {
      console.error('Failed to retrieve top authors:', err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = app;
