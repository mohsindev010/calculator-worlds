// Loads blog pages live from Strapi. Used by server.js locally and api/blog.js on Vercel.
const { notFoundPage } = require('./site');
const { renderBlocks } = require('./blocks');

const STRAPI_URL = (process.env.STRAPI_URL || 'http://localhost:1337').replace(/\/+$/, '');
const SAFE_SLUG = /^[a-z0-9][a-z0-9_-]*$/i;
const PAGE_SIZE = 100; // Strapi's maxLimit in config/api.js

async function fetchPosts(filter = '') {
  const posts = [];
  let page = 1;
  let pageCount = 1;
  do {
    const query = `populate=*&sort=publishedAt:desc&pagination[page]=${page}&pagination[pageSize]=${PAGE_SIZE}${filter}`;
    const res = await fetch(`${STRAPI_URL}/api/blogs?${query}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Strapi responded with HTTP ${res.status}`);
    const json = await res.json();
    posts.push(...json.data);
    pageCount = json.meta.pagination.pageCount;
    page += 1;
  } while (page <= pageCount);
  return posts;
}

// Local uploads come back as "/uploads/x.jpg"; cloud storage URLs are already absolute.
const absoluteUrl = (url) => new URL(url, STRAPI_URL).href;

// Picks the largest web-sized version of an image, skipping the full-size original.
function pick(media, ...sizes) {
  for (const size of sizes) {
    if (media.formats && media.formats[size]) return media.formats[size];
  }
  return media;
}

function toImage(media) {
  if (!media) return null;
  const full = pick(media, 'large', 'medium', 'small');
  const card = pick(media, 'small', 'medium', 'large');
  return {
    url: absoluteUrl(full.url),
    cardUrl: absoluteUrl(card.url),
    alt: media.alternativeText || '',
    width: full.width,
    height: full.height,
  };
}

function toBlock(block) {
  if (block.type !== 'image' || !block.image) return block;
  const full = pick(block.image, 'large', 'medium', 'small');
  return {
    type: 'image',
    image: {
      url: absoluteUrl(full.url),
      alt: block.image.alternativeText || '',
      width: full.width,
      height: full.height,
    },
  };
}

function toPost(post) {
  return {
    slug: post.Slug,
    title: post.Title,
    description: post.Description || '',
    date: new Date(post.publishedAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
    }),
    image: toImage(post.Media),
    content: (post.Content || []).map(toBlock),
  };
}

// Returns what to render for /blogs/ (no slug) or /blogs/<slug>/.
async function getBlogPage(slug) {
  try {
    if (!slug) {
      const posts = (await fetchPosts()).filter((p) => p.Slug && SAFE_SLUG.test(p.Slug)).map(toPost);
      return {
        status: 200,
        url: '/blogs/',
        view: 'blog',
        locals: { title: 'Blogs | Calculator Worlds', posts },
      };
    }
    if (SAFE_SLUG.test(slug)) {
      const [found] = await fetchPosts(`&filters[Slug][$eq]=${encodeURIComponent(slug)}`);
      if (found) {
        const post = toPost(found);
        return {
          status: 200,
          url: `/blogs/${post.slug}/`,
          view: 'post',
          locals: { title: `${post.title} | Calculator Worlds`, description: post.description, post, renderBlocks },
        };
      }
    }
    return { status: 404, url: `/blogs/${slug}/`, view: notFoundPage.view, locals: notFoundPage.locals };
  } catch (err) {
    console.error(`Could not load blog from ${STRAPI_URL}: ${err.message}`);
    return {
      status: 503,
      url: slug ? `/blogs/${slug}/` : '/blogs/',
      view: 'page',
      locals: {
        title: 'Blog unavailable | Calculator Worlds',
        page: { title: 'Blog temporarily unavailable', body: 'Please try again in a few minutes.' },
      },
    };
  }
}

module.exports = { getBlogPage };
