const pool = require('../config/database');

async function getProfile(req, res) {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, gift_points FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAddresses(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addAddress(req, res) {
  const { firstName, lastName, addressLine, city, pin, state, country, phone, email } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO addresses (user_id, first_name, last_name, address_line, city, pin, state, country, phone, email)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [req.user.id, firstName, lastName, addressLine, city, pin, state, country || 'India', phone, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getGiftPoints(req, res) {
  try {
    const result = await pool.query('SELECT gift_points FROM users WHERE id = $1', [req.user.id]);
    res.json({ giftPoints: result.rows[0]?.gift_points || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getProfile, getAddresses, addAddress, getGiftPoints };
