# Calculator Worlds

Free online calculators, converters and generators. Express + EJS for local development, built to plain static files for hosting. The live site is on Vercel: https://calculator-worlds.vercel.app

## Run locally

```bash
npm install
npm start          # http://localhost:3000
```

## Build the static site

```bash
npm run build                      # output in ./dist
BASE_PATH=/my-folder npm run build # only if it will be served from a sub-folder
```

## Deploy

Vercel is connected to this repository. Pushing to `main` updates the live site.

## Project layout

- `data/tools.js` - tools, categories and nav links (edit this to add tools)
- `data/legal.js` - text of the Terms and Privacy pages (update it if the site starts using ads, analytics, cookies or another outside service)
- `lib/site.js` - list of pages (shared by the dev server and the build)
- `views/` - EJS templates and partials
- `public/` - CSS, JS (the calculator and each tool) and images; `public/js/vendor/` holds third-party code
- `server.js` - local dev server
- `build.js` - static site generator
