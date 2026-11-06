// One list of pages, shared by the dev server (server.js) and the static build (build.js).
const {
  categoryCards,
  popularTools,
  popularSearches,
  navLinks,
  allTools,
} = require('../data/tools');
const { terms, privacy } = require('../data/legal');

const infoPages = {
  about: { title: 'About', body: 'Calculator Worlds offers free online calculators, converters, and generators to simplify everyday tasks.' },
  contact: { title: 'Contact Us', body: 'Reach us at sales@calculatorworlds.com.' },
  terms,
  privacy,
  faqs: { title: 'FAQs', body: 'Frequently asked questions will appear here.' },
  'how-to-use': { title: 'How to Use Calculators', body: 'Step-by-step guides are coming soon.' },
};

const isCalculator = (t) => t.category !== 'Converter' && t.category !== 'Generator';

const listings = [
  ['/calculators/', 'Calculators', isCalculator],
  ['/calculators/math/', 'Math Calculators', (t) => t.category === 'Math'],
  ['/calculators/financial/', 'Financial Calculators', (t) => t.category === 'Financial'],
  ['/calculators/health/', 'Health Calculators', (t) => t.category === 'Health'],
  ['/generators/', 'Generators', (t) => t.category === 'Generator'],
  ['/converters/', 'Converters', (t) => t.category === 'Converter'],
  ['/tools/', 'All Tools', () => true],
];

// Values every template can use
const commonLocals = {
  navLinks,
  allTools,
  siteName: 'Calculator Worlds',
  title: 'Calculator Worlds - Free Online Calculators',
};

function getPages() {
  const pages = [];

  pages.push({
    url: '/',
    view: 'index',
    locals: { categoryCards, popularTools, popularSearches },
  });

  pages.push({
    url: '/search/',
    view: 'search',
    locals: { title: 'Search | Calculator Worlds' },
  });

  listings.forEach(([url, heading, filterFn]) => {
    pages.push({
      url,
      view: 'listing',
      locals: { title: `${heading} | Calculator Worlds`, heading, tools: allTools.filter(filterFn) },
    });
  });

  allTools.forEach((tool) => {
    pages.push({
      url: `/tool/${tool.slug}/`,
      view: 'tool',
      locals: { title: `${tool.name} | Calculator Worlds`, tool },
    });
  });

  Object.keys(infoPages).forEach((slug) => {
    const page = infoPages[slug];
    pages.push({
      url: `/${slug}/`,
      view: 'page',
      locals: { title: `${page.title} | Calculator Worlds`, page },
    });
  });

  return pages;
}

const notFoundPage = {
  url: '/404.html',
  view: 'page',
  locals: {
    title: 'Page not found | Calculator Worlds',
    page: { title: '404 - Page not found', body: 'The page you are looking for does not exist.' },
  },
};

module.exports = { getPages, notFoundPage, commonLocals };
