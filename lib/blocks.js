// Turns Strapi rich-text blocks into HTML, escaping all text.
const escapeHtml = (value) => String(value == null ? '' : value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const isSafeLink = (url) => /^(https?:|mailto:|\/|#)/i.test(url || '');

function renderText(node) {
  let html = escapeHtml(node.text);
  if (node.code) html = `<code>${html}</code>`;
  if (node.bold) html = `<strong>${html}</strong>`;
  if (node.italic) html = `<em>${html}</em>`;
  if (node.underline) html = `<u>${html}</u>`;
  if (node.strikethrough) html = `<s>${html}</s>`;
  return html;
}

function renderInline(nodes) {
  return (nodes || []).map((node) => {
    if (node.type === 'link') {
      const inner = renderInline(node.children);
      if (!isSafeLink(node.url)) return inner;
      const external = /^https?:/i.test(node.url) ? ' target="_blank" rel="noopener"' : '';
      return `<a href="${escapeHtml(node.url)}"${external}>${inner}</a>`;
    }
    if (node.type === 'list-item') return renderInline(node.children);
    return renderText(node);
  }).join('');
}

function renderList(block) {
  const tag = block.format === 'ordered' ? 'ol' : 'ul';
  const items = (block.children || []).map((child) => (
    child.type === 'list' ? renderList(child) : `<li>${renderInline(child.children)}</li>`
  )).join('');
  return `<${tag}>${items}</${tag}>`;
}

function renderBlock(block, base) {
  const inner = renderInline(block.children);
  switch (block.type) {
    case 'paragraph':
      return inner.trim() ? `<p>${inner}</p>` : '';
    case 'heading': {
      const level = Math.min(Math.max(Number(block.level) || 2, 1), 6);
      return `<h${level}>${inner}</h${level}>`;
    }
    case 'list':
      return renderList(block);
    case 'quote':
      return `<blockquote>${inner}</blockquote>`;
    case 'code':
      return `<pre><code>${inner}</code></pre>`;
    case 'image': {
      const { url, alt, width, height } = block.image;
      return `<img src="${escapeHtml(base + url)}" alt="${escapeHtml(alt)}" width="${escapeHtml(width)}" height="${escapeHtml(height)}" loading="lazy" />`;
    }
    default:
      return '';
  }
}

const renderBlocks = (blocks, base = '') => (blocks || []).map((b) => renderBlock(b, base)).join('\n');

module.exports = { renderBlocks };
