const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bookworm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: false
});

async function initDB() {
  try {
    // Check if tables already exist
    const check = await pool.query(
      "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='books'"
    );
    if (parseInt(check.rows[0].count) > 0) {
      console.log('Database already initialized');
      return;
    }

    console.log('Initializing database...');
    const sql = fs.readFileSync(path.join(__dirname, 'db.sql'), 'utf8');

    // Remove CREATE DATABASE and \c commands (not needed in Railway)
    const cleanSql = sql
      .replace(/CREATE DATABASE.*?;/gi, '')
      .replace(/\\c\s+\w+/gi, '')
      .trim();

    await pool.query(cleanSql);
    console.log('Database initialized successfully!');
  } catch (err) {
    console.error('DB init error:', err.message);
  }
}

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err.message);
});

module.exports = { pool, initDB };
