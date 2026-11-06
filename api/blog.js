// Vercel function for /blogs/ and /blogs/<slug>/ (see vercel.json). Every other page stays static.
const path = require('path');
const ejs = require('ejs');
const { commonLocals } = require('../lib/site');
const { getBlogPage } = require('../lib/blog');

module.exports = async (req, res) => {
  const page = await getBlogPage(req.query.slug);
  const html = await ejs.renderFile(path.join(__dirname, '..', 'views', `${page.view}.ejs`), {
    ...commonLocals,
    base: '',
    year: new Date().getFullYear(),
    currentPath: page.url,
    ...page.locals,
  });
  // Vercel caches good pages for 60s; older copies cover a Strapi outage for up to a day.
  res.setHeader('Cache-Control', page.status === 200
    ? 'public, s-maxage=60, stale-while-revalidate=86400'
    : 'no-store');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(page.status).send(html);
};
