// Postgres connection (Neon) and the blog's tables, created on first use.
const { Pool } = require('pg');

let pool;
let ready;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    });
    pool.on('error', (err) => console.error(`Database connection error: ${err.message}`));
  }
  return pool;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS posts (
    id           SERIAL PRIMARY KEY,
    slug         TEXT NOT NULL UNIQUE,
    title        TEXT NOT NULL,
    description  TEXT NOT NULL DEFAULT '',
    content      TEXT NOT NULL DEFAULT '',
    image_url    TEXT,
    image_alt    TEXT NOT NULL DEFAULT '',
    image_width  INTEGER,
    image_height INTEGER,
    status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE TABLE IF NOT EXISTS login_attempts (
    ip              TEXT PRIMARY KEY,
    failures        INTEGER NOT NULL,
    first_failed_at TIMESTAMPTZ NOT NULL
  );
`;

async function query(text, params) {
  if (!ready) {
    ready = getPool().query(SCHEMA).catch((err) => {
      ready = null;
      throw err;
    });
  }
  await ready;
  return getPool().query(text, params);
}

module.exports = { query };
