# BookWorm — E-Bookstore Platform

> **Use Case:** An E-Commerce platform to view, browse and purchase books.
> **Built with:** IBM BOB (Agentic IDE) | Node.js + Express | PostgreSQL | Vanilla HTML/CSS/JS

---

## 📁 Project Structure

```
bookworm/
├── backend/
│   ├── app.js                    ← Express server entry point
│   ├── swagger.yaml              ← OpenAPI 3.0 specification
│   ├── package.json
│   ├── .env                      ← DB & JWT config
│   └── src/
│       ├── config/
│       │   ├── database.js       ← PostgreSQL connection pool
│       │   └── db.sql            ← Schema + seed data
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── bookController.js
│       │   ├── categoryController.js
│       │   ├── cartController.js
│       │   ├── orderController.js
│       │   ├── checkoutController.js
│       │   └── userController.js
│       └── middleware/
│           └── auth.js           ← JWT authentication
│
└── frontend/
    ├── index.html                ← Login / Register page
    ├── home.html                 ← E-store Home (Landing page)
    ├── catalog.html              ← Browse & Catalogue page
    ├── product.html              ← Product Detail page
    ├── checkout.html             ← Shopping Cart + Address
    ├── payment.html              ← Payment Screen
    ├── confirmation.html         ← Purchase Confirmation
    ├── orders.html               ← My Orders + Buy Again
    └── src/
        ├── pages/
        │   └── api.js            ← API client + mock data
        └── styles/
            └── global.css        ← All styles
```

---

## 🚀 Quick Start

### Step 1 — Setup PostgreSQL

Install PostgreSQL from https://www.postgresql.org/download/

```bash
# Initialize the database
psql -U postgres -f backend/src/config/db.sql
```

### Step 2 — Configure Environment

Edit `backend/.env` if needed:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookworm
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=bookworm_secret_key_change_in_production
PORT=3001
```

### Step 3 — Start the Backend API

```bash
cd backend
npm install
npm start
# API running at http://localhost:3001
# Swagger docs at http://localhost:3001/api-docs
```

### Step 4 — Open the Frontend

Option A — Direct (works in demo mode without API):
```
Double-click: frontend/index.html
```

Option B — With live server:
```bash
cd frontend
npx serve . -p 3000
# Open: http://localhost:3000
```

---

## 🎮 Customer Journey (12 Steps from slides)

| # | Step | Page |
|---|------|------|
| 1 | Login Page + User Authentication | `index.html` |
| 2 | Order History with Buy Again + Recommendations | `catalog.html` |
| 3 | Access Product Catalogue for each category | `catalog.html` |
| 4 | — *(Slide 4 architecture)* | — |
| 5 | Select the Category of products | `home.html` sidebar |
| 6 | Browse the brands | `catalog.html` filter |
| 7 | Select product + Related products appear | `product.html` |
| 8 | Add product(s) to basket | `product.html` → `checkout.html` |
| 9 | Select address for delivery | `checkout.html` |
| 10 | Initiate payment + Redeem gift points | `checkout.html` |
| 11 | Payment Confirmation (Credit/Debit/UPI/Wallet) | `payment.html` |
| 12 | Purchase confirmation + Cancel within 48h | `confirmation.html` + API |

---

## 🔌 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/categories` | List all categories |
| GET | `/api/books` | Search/filter books |
| GET | `/api/books/recommended` | Recommended books |
| GET | `/api/books/bestsellers` | Bestsellers |
| GET | `/api/books/new-launches` | New launches |
| GET | `/api/books/:id` | Book detail |
| GET | `/api/books/:id/related` | Related books |
| POST | `/api/books/:id/reviews` | Add review |
| GET | `/api/cart` | Get cart |
| POST | `/api/cart` | Add to cart |
| PUT | `/api/cart/:itemId` | Update cart item |
| DELETE | `/api/cart/:itemId` | Remove from cart |
| GET | `/api/orders` | Order history |
| DELETE | `/api/orders/:id` | Cancel order (48h) |
| POST | `/api/checkout` | Create order |
| POST | `/api/checkout/payment` | Process payment |
| POST | `/api/checkout/apply-coupon` | Apply coupon |

Full spec available at: `http://localhost:3001/api-docs`

---

## 🗃️ Data Model

```
users          → id, name, email, password, role, gift_points
categories     → id, name, slug
books          → id, title, author, price, format, category_id, rating, sells, ...
addresses      → id, user_id, first_name, last_name, address_line, city, pin, ...
carts          → id, user_id
cart_items     → id, cart_id, book_id, quantity
orders         → id, user_id, status, total_price, tax, discount, payment_method, ...
order_items    → id, order_id, book_id, quantity, price
reviews        → id, book_id, user_id, rating, comment
coupons        → id, code, discount, is_percent, valid_until
wishlists      → id, user_id, book_id
```

---

## 🧪 Demo Mode

The frontend works **without the backend running** using built-in mock data. Just open `frontend/index.html` in a browser. All pages are navigable and the full purchase flow is simulated using `localStorage`.

**Demo coupon codes:**
- `SAVE100` → ₹100 discount
- `WELCOME10` → 10% discount

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js 18+, Express 4 |
| Database | PostgreSQL 15+ |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| API Spec | OpenAPI 3.0 (swagger.yaml) |
| IDE | IBM BOB (Agentic IDE) |

---

## 📌 Git Workflow

```bash
# Initialize
git init
git checkout -b feature/bookworm-ecommerce

# Stage and commit
git add .
git commit -m "feat: BookWorm e-bookstore platform — full-stack implementation"

# Push to GitHub
git remote add origin https://github.com/<your-username>/bookworm
git push origin feature/bookworm-ecommerce

# Create Pull Request on GitHub with API documentation link
```

---

*Built with IBM BOB Agentic IDE | Educational & Demo Project*
