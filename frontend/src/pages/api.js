// BookWorm API client
const API_BASE = 'http://localhost:3001/api';

function getToken() { return localStorage.getItem('bw_token'); }

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

const API = {
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  register: (name, email, password) => request('POST', '/auth/register', { name, email, password }),
  logout: () => request('POST', '/auth/logout'),

  getCategories: () => request('GET', '/categories'),
  getBooksByCategory: (id, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/categories/${id}/books${q ? '?' + q : ''}`);
  },

  getBooks: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/books${q ? '?' + q : ''}`);
  },
  getRecommended: () => request('GET', '/books/recommended'),
  getBestsellers: () => request('GET', '/books/bestsellers'),
  getNewLaunches: () => request('GET', '/books/new-launches'),
  getBook: (id) => request('GET', `/books/${id}`),
  getRelated: (id) => request('GET', `/books/${id}/related`),
  getReviews: (id) => request('GET', `/books/${id}/reviews`),
  addReview: (id, body) => request('POST', `/books/${id}/reviews`, body),

  getCart: () => request('GET', '/cart'),
  addToCart: (bookId, quantity = 1) => request('POST', '/cart', { bookId, quantity }),
  updateCartItem: (itemId, quantity) => request('PUT', `/cart/${itemId}`, { quantity }),
  removeCartItem: (itemId) => request('DELETE', `/cart/${itemId}`),

  getOrders: () => request('GET', '/orders'),
  getOrder: (id) => request('GET', `/orders/${id}`),
  cancelOrder: (id) => request('DELETE', `/orders/${id}`),

  checkout: (body) => request('POST', '/checkout', body),
  payment: (body) => request('POST', '/checkout/payment', body),
  applyCoupon: (code) => request('POST', '/checkout/apply-coupon', { code }),

  getProfile: () => request('GET', '/users/profile'),
  getAddresses: () => request('GET', '/users/addresses'),
  addAddress: (body) => request('POST', '/users/addresses', body),
  getGiftPoints: () => request('GET', '/users/gift-points'),
};

// Helper: mock data (used when API is not available for demo)
const MOCK_BOOKS = [
  { id: 1, title: 'The Art of Focus', author: 'Arjun Patel', description: 'Practical guide to mastering focus & boosting productivity every day.', format: 'Paperback', price: 399, rating: 4.5, sells: 320, cover_color: '#e85d04', delivery_date: 'Mon, 21 Jul', tags: ['Non-fiction', 'Self Help'] },
  { id: 2, title: 'The Art of Learning', author: 'Raj Patel', description: 'Master the mindset and methods for effective lifelong learning.', format: 'Paperback', price: 259, rating: 4.3, sells: 210, cover_color: '#c1121f', delivery_date: 'Mon, 21 Jul', tags: ['Non-fiction', 'Self Help'] },
  { id: 3, title: 'The Path to Success', author: 'James Wright', description: 'A practical guide to achieving goals with clarity and confidence.', format: 'Paperback', price: 359, rating: 4.1, sells: 180, cover_color: '#ffd60a', delivery_date: 'Mon, 21 Jul', tags: ['Non-fiction', 'Self Help'] },
  { id: 4, title: 'The Midnight Hour', author: 'James Adams', description: 'Haunting tale of a man\'s journey & the shadows of a forgotten past.', format: 'Paperback', price: 299, rating: 4.7, sells: 450, cover_color: '#1a1a2e', delivery_date: 'Mon, 21 Jul', tags: ['Fiction', 'Thriller', 'Horror'] },
  { id: 5, title: 'Beneath the Stars', author: 'Jessica Martin', description: 'A heartwarming tale, where two souls discover what you need.', format: 'Hard Cover', price: 499, rating: 4.8, sells: 390, cover_color: '#6b2d8b', delivery_date: 'Mon, 21 Jul', tags: ['Fiction', 'Love', 'Drama'] },
  { id: 6, title: 'The Final Frontier', author: 'Laura Mitchell', description: 'A mission to space secrets to change humanity forever.', format: 'Paperback', price: 359, rating: 4.2, sells: 280, cover_color: '#003566', delivery_date: 'Mon, 21 Jul', tags: ['Fiction', 'Thriller'] },
  { id: 7, title: 'Joy of Minimalism', author: 'Daniel Reed', description: 'Declutter your life to uncover peace, clarity, and joy.', format: 'Paperback', price: 149, rating: 4.6, sells: 146, cover_color: '#f4c20d', delivery_date: 'Mon, 21 Jul', tags: ['Non-fiction', 'Self Help'] },
  { id: 8, title: 'The Vanishing House', author: 'Clara Nelson', description: 'A chilling mystery unfolds within a house that disappears.', format: 'eBook', price: 99, rating: 4.0, sells: 170, cover_color: '#2d6a4f', delivery_date: 'Mon, 21 Jul', tags: ['Fiction', 'Horror'] },
  { id: 9, title: 'The Lost Kitten', author: 'Emily Parker', description: 'A heartwarming tale of courage, friendship, and feline adventure.', format: 'Hardcover', price: 339, rating: 4.4, sells: 220, cover_color: '#ff6b35', delivery_date: 'Mon, 21 Jul', tags: ['Fiction', 'Children'] },
];

const MOCK_CATEGORIES = [
  { id: 1, name: 'All', slug: 'all' }, { id: 2, name: 'Romance', slug: 'romance' },
  { id: 3, name: 'Mystery', slug: 'mystery' }, { id: 4, name: 'Science Fiction', slug: 'science-fiction' },
  { id: 5, name: 'Fantasy', slug: 'fantasy' }, { id: 6, name: 'Historical', slug: 'historical' },
  { id: 7, name: 'Biography', slug: 'biography' }, { id: 8, name: 'Self-help', slug: 'self-help' },
  { id: 9, name: 'Memoir', slug: 'memoir' }, { id: 10, name: 'Travel', slug: 'travel' },
  { id: 11, name: 'Cooking', slug: 'cooking' }, { id: 12, name: "Children's", slug: 'childrens' },
  { id: 13, name: 'Young Adult', slug: 'young-adult' }, { id: 14, name: 'Comics & Graphic Novels', slug: 'comics-graphic-novels' },
  { id: 15, name: 'Poetry', slug: 'poetry' }, { id: 16, name: 'Drama', slug: 'drama' },
  { id: 17, name: 'Science', slug: 'science' }, { id: 18, name: 'Philosophy', slug: 'philosophy' },
  { id: 19, name: 'Religion', slug: 'religion' }, { id: 20, name: 'Language Learning', slug: 'language-learning' },
];

// Cart state (localStorage fallback for demo)
const Cart = {
  get() { return JSON.parse(localStorage.getItem('bw_cart') || '[]'); },
  save(items) { localStorage.setItem('bw_cart', JSON.stringify(items)); },
  add(book) {
    const items = this.get();
    const existing = items.find(i => i.id === book.id);
    if (existing) existing.qty++;
    else items.push({ ...book, qty: 1 });
    this.save(items);
    this.updateBadge();
  },
  remove(id) {
    const items = this.get().filter(i => i.id !== id);
    this.save(items);
    this.updateBadge();
  },
  updateQty(id, qty) {
    const items = this.get();
    const item = items.find(i => i.id === id);
    if (item) item.qty = qty;
    this.save(items);
    this.updateBadge();
  },
  count() { return this.get().reduce((s, i) => s + i.qty, 0); },
  total() { return this.get().reduce((s, i) => s + i.price * i.qty, 0); },
  updateBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) { const c = this.count(); badge.textContent = c; badge.style.display = c > 0 ? 'flex' : 'none'; }
  }
};

function renderBookCard(book, onclick) {
  const tags = (book.tags || []).map(t => `<span class="book-tag">${t}</span>`).join('');
  return `
    <div class="book-card" onclick="${onclick}">
      <div class="book-cover" style="background:${book.cover_color || '#333'}">${book.title}</div>
      <div class="book-title">${book.title}</div>
      <div class="book-author">by <a href="#" onclick="event.stopPropagation();goBook(${book.id})">${book.author}</a></div>
      <div class="book-desc">${book.description || ''}</div>
      <div class="book-tags">${tags}</div>
      <div class="book-format">${book.format || ''}</div>
      <div class="book-price">₹${book.price}</div>
      <div class="book-delivery">Delivery by ${book.delivery_date || 'Mon, 21 Jul'}</div>
    </div>`;
}

function goBook(id) { window.location.href = `product.html?id=${id}`; }

function renderNavbar(active) {
  const user = JSON.parse(localStorage.getItem('bw_user') || '{}');
  const count = Cart.count();
  return `
    <nav class="navbar">
      <div class="navbar-brand">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
        Book Worm
      </div>
      <div class="navbar-links">
        <a href="orders.html" class="${active === 'orders' ? 'active' : ''}">My Orders</a>
        <a href="#" onclick="alert('Wishlist coming soon')">My Wishlist</a>
        <a href="#" onclick="alert('My Writers coming soon')">My Writers</a>
      </div>
      <div class="navbar-right">
        <button class="cart-btn" onclick="window.location.href='checkout.html'">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
          <span class="cart-badge" id="cartBadge" style="${count > 0 ? '' : 'display:none'}">${count}</span>
        </button>
        <button class="user-btn" onclick="handleUserBtn()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
      </div>
    </nav>`;
}

function handleUserBtn() {
  const token = localStorage.getItem('bw_token');
  if (token) {
    if (confirm('Logout?')) {
      localStorage.removeItem('bw_token');
      localStorage.removeItem('bw_user');
      window.location.href = 'index.html';
    }
  } else {
    window.location.href = 'index.html';
  }
}
