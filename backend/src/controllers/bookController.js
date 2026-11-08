const pool = require('../config/database');

async function getBooks(req, res) {
  const { q, category, format, language, minPrice, maxPrice, sortBy } = req.query;
  let query = `SELECT b.*, c.name as category_name FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE 1=1`;
  const params = [];
  let i = 1;

  if (q) { query += ` AND (b.title ILIKE $${i} OR b.author ILIKE $${i})`; params.push(`%${q}%`); i++; }
  if (category) { query += ` AND c.slug = $${i}`; params.push(category); i++; }
  if (format) { query += ` AND b.format = $${i}`; params.push(format); i++; }
  if (language) { query += ` AND b.language = $${i}`; params.push(language); i++; }
  if (minPrice) { query += ` AND b.price >= $${i}`; params.push(minPrice); i++; }
  if (maxPrice) { query += ` AND b.price <= $${i}`; params.push(maxPrice); i++; }

  const orderMap = { price_asc: 'b.price ASC', price_desc: 'b.price DESC', newest: 'b.created_at DESC' };
  query += ` ORDER BY ${orderMap[sortBy] || 'b.title ASC'}`;

  try {
    const result = await pool.query(query, params);
    res.json({ total: result.rowCount, books: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getRecommended(req, res) {
  try {
    const userId = req.user?.id;
    let books;
    if (userId) {
      // recommend based on categories the user bought before
      const result = await pool.query(`
        SELECT DISTINCT b.* FROM books b
        JOIN categories c ON b.category_id = c.id
        WHERE b.category_id IN (
          SELECT DISTINCT bk.category_id FROM order_items oi
          JOIN orders o ON oi.order_id = o.id
          JOIN books bk ON oi.book_id = bk.id
          WHERE o.user_id = $1
        )
        AND b.id NOT IN (
          SELECT oi2.book_id FROM order_items oi2 JOIN orders o2 ON oi2.order_id = o2.id WHERE o2.user_id = $1
        )
        LIMIT 6
      `, [userId]);
      books = result.rows;
    }
    // fallback: top rated books
    if (!books || books.length === 0) {
      const result = await pool.query('SELECT * FROM books ORDER BY rating DESC LIMIT 6');
      books = result.rows;
    }
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getBestsellers(req, res) {
  try {
    const result = await pool.query('SELECT * FROM books WHERE is_bestseller = TRUE ORDER BY sells DESC LIMIT 6');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getNewLaunches(req, res) {
  try {
    const result = await pool.query('SELECT * FROM books WHERE is_new_launch = TRUE ORDER BY created_at DESC LIMIT 6');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getBookById(req, res) {
  try {
    const result = await pool.query(
      `SELECT b.*, c.name as category_name FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE b.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getRelated(req, res) {
  try {
    const book = await pool.query('SELECT category_id FROM books WHERE id = $1', [req.params.id]);
    if (book.rows.length === 0) return res.status(404).json({ error: 'Book not found' });
    const result = await pool.query(
      'SELECT * FROM books WHERE category_id = $1 AND id != $2 LIMIT 4',
      [book.rows[0].category_id, req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getReviews(req, res) {
  try {
    const result = await pool.query(
      `SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.book_id = $1 ORDER BY r.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addReview(req, res) {
  const { rating, comment } = req.body;
  const bookId = req.params.id;
  const userId = req.user.id;
  if (!rating || !comment) return res.status(400).json({ error: 'rating and comment required' });
  try {
    await pool.query(
      'INSERT INTO reviews (book_id, user_id, rating, comment) VALUES ($1,$2,$3,$4)',
      [bookId, userId, rating, comment]
    );
    // update avg rating
    await pool.query(
      'UPDATE books SET rating = (SELECT AVG(rating) FROM reviews WHERE book_id = $1) WHERE id = $1',
      [bookId]
    );
    res.status(201).json({ message: 'Review submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getBooks, getRecommended, getBestsellers, getNewLaunches, getBookById, getRelated, getReviews, addReview };
