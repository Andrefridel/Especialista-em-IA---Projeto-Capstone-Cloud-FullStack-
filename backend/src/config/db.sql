-- BookWorm E-Bookstore PostgreSQL Schema
-- Run this script to initialize the database

CREATE DATABASE bookworm;
\c bookworm;

-- ── USERS ─────────────────────────────────────────────────────────────
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  role        VARCHAR(20) DEFAULT 'registered' CHECK (role IN ('guest','registered','admin')),
  gift_points INTEGER DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ── CATEGORIES ────────────────────────────────────────────────────────
CREATE TABLE categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL
);

INSERT INTO categories (name, slug) VALUES
  ('All', 'all'),
  ('Romance', 'romance'),
  ('Mystery', 'mystery'),
  ('Science Fiction', 'science-fiction'),
  ('Fantasy', 'fantasy'),
  ('Historical', 'historical'),
  ('Biography', 'biography'),
  ('Self-help', 'self-help'),
  ('Memoir', 'memoir'),
  ('Travel', 'travel'),
  ('Cooking', 'cooking'),
  ('Children''s', 'childrens'),
  ('Young Adult', 'young-adult'),
  ('Comics & Graphic Novels', 'comics-graphic-novels'),
  ('Poetry', 'poetry'),
  ('Drama', 'drama'),
  ('Science', 'science'),
  ('Philosophy', 'philosophy'),
  ('Religion', 'religion'),
  ('Language Learning', 'language-learning');

-- ── BOOKS ─────────────────────────────────────────────────────────────
CREATE TABLE books (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  author        VARCHAR(150) NOT NULL,
  description   TEXT,
  about_author  TEXT,
  published_by  VARCHAR(150),
  language      VARCHAR(50) DEFAULT 'English',
  format        VARCHAR(30) CHECK (format IN ('Paperback','Hardcover','eBook')),
  price         NUMERIC(10,2) NOT NULL,
  rating        NUMERIC(3,2) DEFAULT 0,
  sells         INTEGER DEFAULT 0,
  cover_color   VARCHAR(20),
  isbn          VARCHAR(20),
  delivery_date DATE,
  category_id   INTEGER REFERENCES categories(id),
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_new_launch BOOLEAN DEFAULT FALSE,
  tags          TEXT[],
  created_at    TIMESTAMP DEFAULT NOW()
);

INSERT INTO books (title, author, description, format, price, rating, sells, cover_color, delivery_date, category_id, is_bestseller, is_new_launch, tags) VALUES
  ('The Art of Focus', 'Arjun Patel', 'Practical guide to mastering focus & boosting productivity every day.', 'Paperback', 399, 4.5, 320, '#e85d04', '2025-07-21', 8, FALSE, FALSE, ARRAY['Non-fiction','Self Help']),
  ('The Art of Learning', 'Raj Patel', 'Master the mindset and methods for effective lifelong learning.', 'Paperback', 259, 4.3, 210, '#c1121f', '2025-07-21', 8, FALSE, FALSE, ARRAY['Non-fiction','Self Help']),
  ('The Path to Success', 'James Wright', 'A practical guide to achieving goals with clarity and confidence.', 'Paperback', 359, 4.1, 180, '#ffd60a', '2025-07-21', 8, FALSE, FALSE, ARRAY['Non-fiction','Self Help']),
  ('The Midnight Hour', 'James Adams', 'Haunting tale of a man''s journey & the shadows of a forgotten past.', 'Paperback', 299, 4.7, 450, '#1a1a2e', '2025-07-21', 3, TRUE, FALSE, ARRAY['Fiction','Thriller','Horror']),
  ('Beneath the Stars', 'Jessica Martin', 'A heartwarming tale, where two souls discover what you need.', 'Hard Cover', 499, 4.8, 390, '#6b2d8b', '2025-07-21', 2, TRUE, FALSE, ARRAY['Fiction','Love','Drama']),
  ('The Final Frontier', 'Laura Mitchell', 'A mission to space secrets to change humanity forever.', 'Paperback', 359, 4.2, 280, '#003566', '2025-07-21', 4, TRUE, FALSE, ARRAY['Fiction','Thriller']),
  ('Joy of Minimalism', 'Daniel Reed', 'Declutter your life to uncover peace, clarity, and joy.', 'Paperback', 149, 4.6, 146, '#f4c20d', '2025-07-21', 8, FALSE, TRUE, ARRAY['Non-fiction','Self Help']),
  ('The Vanishing House', 'Clara Nelson', 'A chilling mystery unfolds within a house that disappears.', 'eBook', 99, 4.0, 170, '#2d6a4f', '2025-07-21', 3, FALSE, TRUE, ARRAY['Fiction','Horror']),
  ('The Lost Kitten', 'Emily Parker', 'A heartwarming tale of courage, friendship, and feline adventure.', 'Hardcover', 339, 4.4, 220, '#ff6b35', '2025-07-21', 12, FALSE, TRUE, ARRAY['Fiction','Children']);

-- ── ADDRESSES ─────────────────────────────────────────────────────────
CREATE TABLE addresses (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  first_name   VARCHAR(100),
  last_name    VARCHAR(100),
  address_line VARCHAR(255),
  city         VARCHAR(100),
  pin          VARCHAR(20),
  state        VARCHAR(100),
  country      VARCHAR(100) DEFAULT 'India',
  phone        VARCHAR(20),
  email        VARCHAR(150),
  is_default   BOOLEAN DEFAULT FALSE
);

-- ── COUPONS ───────────────────────────────────────────────────────────
CREATE TABLE coupons (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(50) UNIQUE NOT NULL,
  discount    NUMERIC(10,2) NOT NULL,
  is_percent  BOOLEAN DEFAULT FALSE,
  valid_until DATE
);

INSERT INTO coupons (code, discount, is_percent, valid_until) VALUES
  ('SAVE100', 100, FALSE, '2025-12-31'),
  ('WELCOME10', 10, TRUE, '2025-12-31');

-- ── CART ──────────────────────────────────────────────────────────────
CREATE TABLE carts (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cart_items (
  id       SERIAL PRIMARY KEY,
  cart_id  INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  book_id  INTEGER REFERENCES books(id),
  quantity INTEGER DEFAULT 1,
  UNIQUE (cart_id, book_id)
);

-- ── ORDERS ────────────────────────────────────────────────────────────
CREATE TABLE orders (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id),
  status          VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  total_price     NUMERIC(10,2),
  tax             NUMERIC(10,2),
  delivery_charge NUMERIC(10,2) DEFAULT 0,
  discount        NUMERIC(10,2) DEFAULT 0,
  coupon_code     VARCHAR(50),
  address_id      INTEGER REFERENCES addresses(id),
  payment_method  VARCHAR(30),
  transaction_id  VARCHAR(100),
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
  id       SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  book_id  INTEGER REFERENCES books(id),
  quantity INTEGER DEFAULT 1,
  price    NUMERIC(10,2)
);

-- ── REVIEWS ───────────────────────────────────────────────────────────
CREATE TABLE reviews (
  id         SERIAL PRIMARY KEY,
  book_id    INTEGER REFERENCES books(id) ON DELETE CASCADE,
  user_id    INTEGER REFERENCES users(id),
  rating     INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment    VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ── WISHLISTS ─────────────────────────────────────────────────────────
CREATE TABLE wishlists (
  id      SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books(id),
  UNIQUE (user_id, book_id)
);
