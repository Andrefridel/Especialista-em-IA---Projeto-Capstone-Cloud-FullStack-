const pool = require('../config/database');

async function getOrders(req, res) {
  const userId = req.user.id;
  try {
    const orders = await pool.query(
      `SELECT o.*, 
        NOW() - o.created_at < INTERVAL '48 hours' as can_cancel
       FROM orders o WHERE o.user_id = $1 ORDER BY o.created_at DESC`,
      [userId]
    );
    for (const order of orders.rows) {
      const items = await pool.query(
        `SELECT oi.*, b.title, b.author, b.cover_color, b.format FROM order_items oi JOIN books b ON oi.book_id = b.id WHERE oi.order_id = $1`,
        [order.id]
      );
      order.items = items.rows;
    }
    res.json(orders.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getOrderById(req, res) {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT o.*, NOW() - o.created_at < INTERVAL '48 hours' as can_cancel
       FROM orders o WHERE o.id = $1 AND o.user_id = $2`,
      [req.params.id, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = result.rows[0];
    const items = await pool.query(
      `SELECT oi.*, b.title, b.author, b.cover_color, b.format FROM order_items oi JOIN books b ON oi.book_id = b.id WHERE oi.order_id = $1`,
      [order.id]
    );
    order.items = items.rows;
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function cancelOrder(req, res) {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT id, status, created_at FROM orders WHERE id = $1 AND user_id = $2`,
      [req.params.id, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    const order = result.rows[0];
    const diff = (Date.now() - new Date(order.created_at)) / 1000 / 3600;
    if (diff > 48) return res.status(400).json({ error: 'Cannot cancel order after 48 hours' });
    if (order.status === 'cancelled') return res.status(400).json({ error: 'Order already cancelled' });
    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['cancelled', order.id]);
    res.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getOrders, getOrderById, cancelOrder };
