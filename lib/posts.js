// Reading and writing blog posts.
const { query } = require('./db');

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const slugify = (text) => String(text || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const listPublished = async () => (await query(
  "SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC, id DESC",
)).rows;

const findPublished = async (slug) => (await query(
  "SELECT * FROM posts WHERE slug = $1 AND status = 'published'",
  [slug],
)).rows[0];

const listAll = async () => (await query('SELECT * FROM posts ORDER BY updated_at DESC, id DESC')).rows;

const findById = async (id) => (await query('SELECT * FROM posts WHERE id = $1', [id])).rows[0];

const fieldValues = (p) => [
  p.slug, p.title, p.description, p.content,
  p.image_url, p.image_alt, p.image_width, p.image_height, p.status,
];

const createPost = async (p) => (await query(
  `INSERT INTO posts (slug, title, description, content, image_url, image_alt, image_width, image_height, status, published_at)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::text, CASE WHEN $9::text = 'published' THEN NOW() END)
   RETURNING *`,
  fieldValues(p),
)).rows[0];

// A post keeps its original publish date if it is unpublished and published again.
const updatePost = async (id, p) => (await query(
  `UPDATE posts SET
     slug = $1, title = $2, description = $3, content = $4,
     image_url = $5, image_alt = $6, image_width = $7, image_height = $8, status = $9::text,
     published_at = CASE WHEN $9::text = 'published' THEN COALESCE(published_at, NOW()) ELSE published_at END,
     updated_at = NOW()
   WHERE id = $10
   RETURNING *`,
  [...fieldValues(p), id],
)).rows[0];

const deletePost = (id) => query('DELETE FROM posts WHERE id = $1', [id]);

module.exports = {
  SLUG_PATTERN, slugify, listPublished, findPublished, listAll, findById, createPost, updatePost, deletePost,
};
