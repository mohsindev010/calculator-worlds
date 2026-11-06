// The blog admin at /admin: one password, a signed session cookie, and post editing.
const crypto = require('crypto');
const express = require('express');
const { query } = require('./db');
const posts = require('./posts');
const { renderBlocks } = require('./blocks');
const { markdownToBlocks } = require('./markdown');

const COOKIE = 'cms_session';
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_FAILURES = 5;
const LOCK_MINUTES = 15;
const MIN_SECRET_LENGTH = 32;
const UPLOAD_FOLDER = 'calculator-worlds/blog';
const UPLOAD_FORMATS = 'jpg,jpeg,png,webp,gif';
const CLOUDINARY_IMAGE = /^https:\/\/res\.cloudinary\.com\/[^\s"'<>]+$/;

const isConfigured = () => Boolean(process.env.ADMIN_PASSWORD)
  && (process.env.SESSION_SECRET || '').length >= MIN_SECRET_LENGTH;

const sha256 = (text) => crypto.createHash('sha256').update(text).digest();

const sameText = (a, b) => crypto.timingSafeEqual(sha256(a), sha256(b));

const sign = (value) => crypto.createHmac('sha256', process.env.SESSION_SECRET).update(value).digest('hex');

function createSession() {
  const expires = String(Date.now() + SESSION_MS);
  return `${expires}.${sign(expires)}`;
}

function hasValidSession(req) {
  if (!isConfigured()) return false;
  const cookie = (req.headers.cookie || '').split(';').map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`));
  if (!cookie) return false;
  const [expires, signature = ''] = cookie.slice(COOKIE.length + 1).split('.');
  return sameText(signature, sign(expires)) && Number(expires) > Date.now();
}

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL),
  path: '/admin',
});

const clientIp = (req) => String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown')
  .split(',')[0].trim();

async function isLockedOut(ip) {
  const { rows } = await query(
    `SELECT 1 FROM login_attempts
     WHERE ip = $1 AND failures >= $2 AND first_failed_at > NOW() - make_interval(mins => $3)`,
    [ip, MAX_FAILURES, LOCK_MINUTES],
  );
  return rows.length > 0;
}

const recordFailure = (ip) => query(
  `INSERT INTO login_attempts (ip, failures, first_failed_at) VALUES ($1, 1, NOW())
   ON CONFLICT (ip) DO UPDATE SET
     failures = CASE WHEN login_attempts.first_failed_at > NOW() - make_interval(mins => $2)
                     THEN login_attempts.failures + 1 ELSE 1 END,
     first_failed_at = CASE WHEN login_attempts.first_failed_at > NOW() - make_interval(mins => $2)
                     THEN login_attempts.first_failed_at ELSE NOW() END`,
  [ip, LOCK_MINUTES],
);

// Rejects form posts sent from other websites.
function sameOriginOnly(req, res, next) {
  if (req.method !== 'POST') return next();
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const origin = req.headers.origin;
  let originHost = null;
  try {
    originHost = origin ? new URL(origin).host : null;
  } catch (err) {
    originHost = null;
  }
  if (originHost !== host) return res.status(403).send('Request blocked.');
  return next();
}

function requireLogin(req, res, next) {
  if (hasValidSession(req)) return next();
  return res.redirect('/admin/login');
}

// Reads the post form, returning the values to save and any problem to show.
function readPostForm(body) {
  const title = (body.title || '').trim();
  const slug = (body.slug || '').trim().toLowerCase() || posts.slugify(title);
  const imageUrl = (body.image_url || '').trim();
  const toSize = (value) => (Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : null);
  const post = {
    title,
    slug,
    description: (body.description || '').trim(),
    content: body.content || '',
    image_url: imageUrl || null,
    image_alt: (body.image_alt || '').trim(),
    image_width: imageUrl ? toSize(body.image_width) : null,
    image_height: imageUrl ? toSize(body.image_height) : null,
    status: body.action === 'publish' ? 'published' : 'draft',
  };
  let error = null;
  if (!title) error = 'Please add a title.';
  else if (!posts.SLUG_PATTERN.test(slug)) error = 'The URL can only use lowercase letters, numbers and single hyphens.';
  else if (imageUrl && !CLOUDINARY_IMAGE.test(imageUrl)) error = 'The cover image must be uploaded with the Upload button.';
  return { post, error };
}

const UNIQUE_VIOLATION = '23505';

function createRouter() {
  const router = express.Router();
  const wrap = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
  const renderEditor = (res, post, error, status = 200) => res.status(status).render('admin/edit', {
    title: `${post.id ? 'Edit' : 'New'} post | Calculator Worlds`,
    post,
    error,
    contentHtml: renderBlocks(markdownToBlocks(post.content)),
  });

  router.use((req, res, next) => {
    res.set({ 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow', 'X-Frame-Options': 'DENY' });
    next();
  });
  router.use(express.urlencoded({ extended: false, limit: '1mb' }));
  router.use(sameOriginOnly);

  const renderLogin = (res, error, status = 200) => res.status(status).render('admin/login', {
    title: 'Admin login | Calculator Worlds',
    error,
  });

  router.get('/login', (req, res) => {
    if (hasValidSession(req)) return res.redirect('/admin');
    return renderLogin(res, isConfigured() ? null : 'Login is turned off until the admin settings are added.');
  });

  router.post('/login', wrap(async (req, res) => {
    if (!isConfigured()) return renderLogin(res, 'Login is turned off until the admin settings are added.', 503);
    const ip = clientIp(req);
    if (await isLockedOut(ip)) {
      return renderLogin(res, `Too many failed attempts. Please try again in ${LOCK_MINUTES} minutes.`, 429);
    }
    if (!sameText(req.body.password || '', process.env.ADMIN_PASSWORD)) {
      await recordFailure(ip);
      return renderLogin(res, 'That password is not correct.', 401);
    }
    await query('DELETE FROM login_attempts WHERE ip = $1', [ip]);
    res.cookie(COOKIE, createSession(), { ...cookieOptions(), maxAge: SESSION_MS });
    return res.redirect('/admin');
  }));

  router.use(requireLogin);

  router.post('/logout', (req, res) => {
    res.clearCookie(COOKIE, cookieOptions());
    res.redirect('/admin/login');
  });

  router.get('/', wrap(async (req, res) => {
    res.render('admin/list', { title: 'Posts | Calculator Worlds', posts: await posts.listAll() });
  }));

  router.get('/new', (req, res) => renderEditor(res, { status: 'draft' }, null));

  router.post('/new', wrap(async (req, res) => {
    const { post, error } = readPostForm(req.body);
    if (error) return renderEditor(res, post, error, 400);
    try {
      const saved = await posts.createPost(post);
      return res.redirect(`/admin/posts/${saved.id}?saved=1`);
    } catch (err) {
      if (err.code !== UNIQUE_VIOLATION) throw err;
      return renderEditor(res, post, 'Another post already uses this URL.', 409);
    }
  }));

  const loadPost = wrap(async (req, res, next) => {
    const id = /^\d{1,9}$/.test(req.params.id) ? Number(req.params.id) : null;
    req.post = id ? await posts.findById(id) : null;
    if (!req.post) return res.redirect('/admin');
    return next();
  });

  router.get('/posts/:id', loadPost, (req, res) => {
    renderEditor(res, req.post, null);
  });

  router.post('/posts/:id', loadPost, wrap(async (req, res) => {
    const { post, error } = readPostForm(req.body);
    const shown = { ...req.post, ...post, status: req.post.status };
    if (error) return renderEditor(res, shown, error, 400);
    try {
      await posts.updatePost(req.post.id, post);
      return res.redirect(`/admin/posts/${req.post.id}?saved=1`);
    } catch (err) {
      if (err.code !== UNIQUE_VIOLATION) throw err;
      return renderEditor(res, shown, 'Another post already uses this URL.', 409);
    }
  }));

  router.post('/posts/:id/delete', loadPost, wrap(async (req, res) => {
    await posts.deletePost(req.post.id);
    res.redirect('/admin');
  }));

  // Lets the browser upload one image straight to Cloudinary without seeing the API secret.
  router.post('/upload-signature', (req, res) => {
    const setting = (name) => (process.env[name] || '').trim();
    const cloudName = setting('CLOUDINARY_CLOUD_NAME');
    const apiKey = setting('CLOUDINARY_API_KEY');
    const secret = setting('CLOUDINARY_API_SECRET');
    const missing = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].filter((name) => !setting(name));
    if (missing.length) {
      return res.status(503).json({ error: `Missing Vercel setting: ${missing.join(', ')}. Add it, then redeploy.` });
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const params = `allowed_formats=${UPLOAD_FORMATS}&folder=${UPLOAD_FOLDER}&timestamp=${timestamp}`;
    return res.json({
      url: `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
      fields: {
        allowed_formats: UPLOAD_FORMATS,
        folder: UPLOAD_FOLDER,
        timestamp,
        api_key: apiKey,
        signature: crypto.createHash('sha1').update(params + secret).digest('hex'),
      },
    });
  });

  // eslint-disable-next-line no-unused-vars
  router.use((err, req, res, next) => {
    console.error(`Admin error: ${err.message}`);
    res.status(503).render('page', {
      title: 'Admin unavailable | Calculator Worlds',
      page: { title: 'Admin temporarily unavailable', body: 'The database could not be reached. Your last change may not have saved, so please check it and try again.' },
    });
  });

  return router;
}

module.exports = { createRouter };
