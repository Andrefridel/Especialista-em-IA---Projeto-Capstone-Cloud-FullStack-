const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const authController = require('./src/controllers/authController');
const bookController = require('./src/controllers/bookController');
const categoryController = require('./src/controllers/categoryController');
const cartController = require('./src/controllers/cartController');
const orderController = require('./src/controllers/orderController');
const checkoutController = require('./src/controllers/checkoutController');
const userController = require('./src/controllers/userController');
const authMiddleware = require('./src/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Swagger UI ────────────────────────────────────────────────────────
const swaggerDoc = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// ── Routes ────────────────────────────────────────────────────────────

// Auth
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.post('/api/auth/logout', authMiddleware, authController.logout);

// Categories
app.get('/api/categories', categoryController.getCategories);
app.get('/api/categories/:id/books', categoryController.getBooksByCategory);

// Books
app.get('/api/books', bookController.getBooks);
app.get('/api/books/recommended', authMiddleware, bookController.getRecommended);
app.get('/api/books/bestsellers', bookController.getBestsellers);
app.get('/api/books/new-launches', bookController.getNewLaunches);
app.get('/api/books/:id', bookController.getBookById);
app.get('/api/books/:id/related', bookController.getRelated);
app.get('/api/books/:id/reviews', bookController.getReviews);
app.post('/api/books/:id/reviews', authMiddleware, bookController.addReview);

// Cart
app.get('/api/cart', authMiddleware, cartController.getCart);
app.post('/api/cart', authMiddleware, cartController.addToCart);
app.put('/api/cart/:itemId', authMiddleware, cartController.updateCartItem);
app.delete('/api/cart/:itemId', authMiddleware, cartController.removeCartItem);

// Orders
app.get('/api/orders', authMiddleware, orderController.getOrders);
app.get('/api/orders/:id', authMiddleware, orderController.getOrderById);
app.delete('/api/orders/:id', authMiddleware, orderController.cancelOrder);

// Checkout
app.post('/api/checkout', authMiddleware, checkoutController.checkout);
app.post('/api/checkout/payment', authMiddleware, checkoutController.processPayment);
app.post('/api/checkout/apply-coupon', authMiddleware, checkoutController.applyCoupon);

// Users
app.get('/api/users/profile', authMiddleware, userController.getProfile);
app.get('/api/users/addresses', authMiddleware, userController.getAddresses);
app.post('/api/users/addresses', authMiddleware, userController.addAddress);
app.get('/api/users/gift-points', authMiddleware, userController.getGiftPoints);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'BookWorm API' }));

// ── Start ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`BookWorm API running at http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
});

module.exports = app;
