// Static build for GitHub Pages: `npm run build` -> writes the finished site to ./dist
//
// BASE_PATH is the sub-folder the site is served from.
//   - project site  https://USER.github.io/REPO/   -> BASE_PATH=/REPO
//   - user site     https://USER.github.io/        -> BASE_PATH=
// The GitHub Actions workflow sets this automatically.
const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { getPages, notFoundPage, commonLocals } = require('./lib/site');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const VIEWS = path.join(ROOT, 'views');

let base = (process.env.BASE_PATH || '').trim();
if (base && !base.startsWith('/')) base = '/' + base;
base = base.replace(/\/+$/, '');

function outputFile(url) {
  if (url.endsWith('/')) return path.join(DIST, url, 'index.html');
  return path.join(DIST, url);
}

async function main() {
  fs.rmSync(DIST, { recursive: true, force: true });
  fs.mkdirSync(DIST, { recursive: true });

  // Copy static assets (css, js, images)
  fs.cpSync(path.join(ROOT, 'public'), DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, '.nojekyll'), '');

  const pages = [...getPages(), notFoundPage];
  const year = new Date().getFullYear();

  for (const page of pages) {
    const html = await ejs.renderFile(path.join(VIEWS, page.view + '.ejs'), {
      ...commonLocals,
      base,
      year,
      currentPath: page.url,
      ...page.locals,
    });
    const file = outputFile(page.url);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
  }

  console.log(`Built ${pages.length} pages into dist/ (base path: "${base || '/'}")`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
