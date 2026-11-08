const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function checkout(req, res) {
  const userId = req.user.id;
  const { address, useSavedAddress, couponCode, redeemGiftPoints } = req.body;

  try {
    // Get cart
    const cartResult = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (cartResult.rows.length === 0) return res.status(400).json({ error: 'Cart is empty' });
    const cartId = cartResult.rows[0].id;

    const items = await pool.query(
      `SELECT ci.quantity, b.id as book_id, b.price, b.title, b.author, b.cover_color, b.format, b.delivery_date
       FROM cart_items ci JOIN books b ON ci.book_id = b.id WHERE ci.cart_id = $1`,
      [cartId]
    );
    if (items.rows.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    let subtotal = items.rows.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = parseFloat((subtotal * 0.12).toFixed(2));
    let discount = 0;

    // Apply coupon
    if (couponCode) {
      const coupon = await pool.query(
        'SELECT * FROM coupons WHERE code = $1 AND valid_until >= NOW()',
        [couponCode]
      );
      if (coupon.rows.length > 0) {
        const c = coupon.rows[0];
        discount = c.is_percent ? parseFloat((subtotal * c.discount / 100).toFixed(2)) : c.discount;
      }
    }

    // Resolve address
    let savedAddressId = null;
    if (useSavedAddress) {
      const saved = await pool.query('SELECT id FROM addresses WHERE user_id = $1 AND is_default = TRUE LIMIT 1', [userId]);
      if (saved.rows.length > 0) savedAddressId = saved.rows[0].id;
    }
    if (!savedAddressId && address) {
      const addrResult = await pool.query(
        `INSERT INTO addresses (user_id, first_name, last_name, address_line, city, pin, state, country, phone, email)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
        [userId, address.firstName, address.lastName, address.addressLine,
         address.city, address.pin, address.state, address.country || 'India',
         address.phone, address.email]
      );
      savedAddressId = addrResult.rows[0].id;
    }

    const totalAmount = parseFloat((subtotal + tax - discount).toFixed(2));

    // Create order (pending)
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, status, total_price, tax, discount, coupon_code, address_id)
       VALUES ($1,'pending',$2,$3,$4,$5,$6) RETURNING id`,
      [userId, totalAmount, tax, discount, couponCode || null, savedAddressId]
    );
    const orderId = orderResult.rows[0].id;

    // Insert order items
    for (const item of items.rows) {
      await pool.query(
        'INSERT INTO order_items (order_id, book_id, quantity, price) VALUES ($1,$2,$3,$4)',
        [orderId, item.book_id, item.quantity, item.price]
      );
    }

    res.status(201).json({
      orderId,
      payableAmount: totalAmount,
      subtotal,
      tax,
      discount,
      items: items.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function processPayment(req, res) {
  const { orderId, method } = req.body;
  const userId = req.user.id;

  if (!orderId || !method) return res.status(400).json({ error: 'orderId and method are required' });

  try {
    const order = await pool.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [orderId, userId]);
    if (order.rows.length === 0) return res.status(404).json({ error: 'Order not found' });

    const transactionId = uuidv4();

    // Simulate payment processing
    await pool.query(
      `UPDATE orders SET status = 'paid', payment_method = $1, transaction_id = $2 WHERE id = $3`,
      [method, transactionId, orderId]
    );

    // Clear cart
    const cart = await pool.query('SELECT id FROM carts WHERE user_id = $1', [userId]);
    if (cart.rows.length > 0) {
      await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.rows[0].id]);
    }

    // Award gift points (1 point per ₹10 spent)
    const points = Math.floor(order.rows[0].total_price / 10);
    await pool.query('UPDATE users SET gift_points = gift_points + $1 WHERE id = $2', [points, userId]);

    // Return purchased items
    const items = await pool.query(
      `SELECT oi.*, b.title, b.author, b.cover_color, b.format, b.price as book_price, b.delivery_date
       FROM order_items oi JOIN books b ON oi.book_id = b.id WHERE oi.order_id = $1`,
      [orderId]
    );

    res.json({
      success: true,
      orderId,
      transactionId,
      pointsEarned: points,
      items: items.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function applyCoupon(req, res) {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'code is required' });
  try {
    const result = await pool.query(
      'SELECT * FROM coupons WHERE code = $1 AND valid_until >= NOW()',
      [code]
    );
    if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid or expired coupon' });
    const c = result.rows[0];
    res.json({ code: c.code, discount: c.discount, isPercent: c.is_percent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { checkout, processPayment, applyCoupon };
