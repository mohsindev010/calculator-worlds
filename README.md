# Calculator Worlds

Free online calculators, converters and generators. Express + EJS for local development, built to plain static files for GitHub Pages.

## Run locally

```bash
npm install
npm start          # http://localhost:3000
```

## Build the static site

```bash
npm run build                      # output in ./dist
BASE_PATH=/my-repo npm run build   # if it will be served from https://USER.github.io/my-repo/
```

## Deploy to GitHub Pages

1. Create a repository on GitHub and push this project to the `main` branch.
2. In the repository go to **Settings -> Pages** and set **Source** to **GitHub Actions**.
3. Push to `main` (or run the workflow from the **Actions** tab). The site is built by
   `.github/workflows/deploy.yml` and published at `https://USER.github.io/REPO/`.

Note: GitHub Pages sites are public. Private access control for Pages needs GitHub Enterprise Cloud.

## Project layout

- `data/tools.js` - tools, categories and nav links (edit this to add tools)
- `lib/site.js` - list of pages (shared by the dev server and the build)
- `views/` - EJS templates and partials
- `public/` - CSS, JS (including the calculator) and images
- `server.js` - local dev server
- `build.js` - static site generator
