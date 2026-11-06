// Loads blog pages live from the database. Used by server.js locally and api/blog.js on Vercel.
const { notFoundPage } = require('./site');
const { renderBlocks } = require('./blocks');
const { markdownToBlocks } = require('./markdown');
const { SLUG_PATTERN, listPublished, findPublished } = require('./posts');

// Asks Cloudinary for a resized, compressed version of an uploaded image.
const resized = (url, transform) => url.replace('/image/upload/', `/image/upload/${transform}/`);

function toPost(row) {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    date: new Date(row.published_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
    }),
    image: row.image_url ? {
      url: resized(row.image_url, 'c_limit,w_1200,f_auto,q_auto'),
      cardUrl: resized(row.image_url, 'c_fill,w_500,h_333,f_auto,q_auto'),
      alt: row.image_alt,
      width: row.image_width,
      height: row.image_height,
    } : null,
    content: markdownToBlocks(row.content),
  };
}

// Returns what to render for /blogs/ (no slug) or /blogs/<slug>/.
async function getBlogPage(slug) {
  try {
    if (!slug) {
      return {
        status: 200,
        url: '/blogs/',
        view: 'blog',
        locals: { title: 'Blogs | Calculator Worlds', posts: (await listPublished()).map(toPost) },
      };
    }
    const row = SLUG_PATTERN.test(slug) ? await findPublished(slug) : null;
    if (row) {
      const post = toPost(row);
      return {
        status: 200,
        url: `/blogs/${post.slug}/`,
        view: 'post',
        locals: { title: `${post.title} | Calculator Worlds`, description: post.description, post, renderBlocks },
      };
    }
    return { status: 404, url: `/blogs/${slug}/`, view: notFoundPage.view, locals: notFoundPage.locals };
  } catch (err) {
    console.error(`Could not load blog: ${err.message}`);
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
