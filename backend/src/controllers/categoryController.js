const pool = require('../config/database');

async function getCategories(req, res) {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getBooksByCategory(req, res) {
  const { id } = req.params;
  const { brand, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  try {
    let query = 'SELECT * FROM books WHERE category_id = $1';
    const params = [id];
    if (brand) { query += ` AND author ILIKE $2`; params.push(`%${brand}%`); }
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    const result = await pool.query(query, params);
    const count = await pool.query('SELECT COUNT(*) FROM books WHERE category_id = $1', [id]);
    res.json({ total: parseInt(count.rows[0].count), page: parseInt(page), books: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getCategories, getBooksByCategory };
