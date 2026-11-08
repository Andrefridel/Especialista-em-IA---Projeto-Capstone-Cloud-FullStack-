const pool = require('../config/database');

async function ensureCart(userId) {
  const existing = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
  if (existing.rows.length > 0) return existing.rows[0].id;
  const result = await pool.query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId]);
  return result.rows[0].id;
}

async function getCart(req, res) {
  const userId = req.user.id;
  try {
    const cartId = await ensureCart(userId);
    const items = await pool.query(
      `SELECT ci.id, ci.quantity, b.id as book_id, b.title, b.author, b.price, b.format, b.cover_color, b.delivery_date
       FROM cart_items ci JOIN books b ON ci.book_id = b.id WHERE ci.cart_id = $1`,
      [cartId]
    );
    const total = items.rows.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.json({ cartId, items: items.rows, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function addToCart(req, res) {
  const { bookId, quantity = 1 } = req.body;
  if (!bookId) return res.status(400).json({ error: 'bookId is required' });
  try {
    const cartId = await ensureCart(req.user.id);
    await pool.query(
      `INSERT INTO cart_items (cart_id, book_id, quantity)
       VALUES ($1,$2,$3)
       ON CONFLICT (cart_id, book_id) DO UPDATE SET quantity = cart_items.quantity + $3`,
      [cartId, bookId, quantity]
    );
    res.json({ message: 'Item added to cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateCartItem(req, res) {
  const { quantity } = req.body;
  const { itemId } = req.params;
  if (!quantity || quantity < 1) return res.status(400).json({ error: 'quantity must be >= 1' });
  try {
    await pool.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [quantity, itemId]);
    res.json({ message: 'Cart updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function removeCartItem(req, res) {
  const { itemId } = req.params;
  try {
    await pool.query('DELETE FROM cart_items WHERE id = $1', [itemId]);
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
