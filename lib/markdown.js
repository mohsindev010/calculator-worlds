// Turns the editor's Markdown into blocks for lib/blocks.js, which escapes all text.
const INLINE = /\\([\\`*[\]#>!.-])|`([^`]+)`|\*\*(.+?)\*\*(?!\*)|\*(.+?)\*|\[((?:\\.|[^\]\\])+)\]\(([^)\s]+)\)/g;

function parseInline(text, marks = {}) {
  const nodes = [];
  const addText = (value, extra = {}) => {
    if (value) nodes.push({ type: 'text', text: value, ...marks, ...extra });
  };
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    addText(text.slice(last, match.index));
    const [whole, escaped, code, bold, italic, label, url] = match;
    if (escaped !== undefined) addText(escaped);
    else if (code !== undefined) addText(code, { code: true });
    else if (bold !== undefined) nodes.push(...parseInline(bold, { ...marks, bold: true }));
    else if (italic !== undefined) nodes.push(...parseInline(italic, { ...marks, italic: true }));
    else nodes.push({ type: 'link', url, children: parseInline(label, marks) });
    last = match.index + whole.length;
  }
  addText(text.slice(last));
  return nodes;
}

const HEADING = /^(#{1,6})\s+(.+)$/;
const BULLET = /^\s*[-*]\s+(.*)$/;
const NUMBERED = /^\s*\d+\.\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const IMAGE = /^!\[([^\]]*)\]\((https:\/\/[^)\s]+)\)$/;
const FENCE = /^```/;

function markdownToBlocks(markdown) {
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let i = 0;

  // Collects consecutive lines matching a pattern, returning each line's captured text.
  const takeWhile = (pattern) => {
    const taken = [];
    while (i < lines.length && pattern.test(lines[i])) {
      taken.push(lines[i].match(pattern)[1]);
      i += 1;
    }
    return taken;
  };
  const list = (format, items) => blocks.push({
    type: 'list',
    format,
    children: items.map((item) => ({ type: 'list-item', children: parseInline(item) })),
  });

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
    } else if (FENCE.test(line)) {
      i += 1;
      const code = [];
      while (i < lines.length && !FENCE.test(lines[i])) {
        code.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push({ type: 'code', children: [{ type: 'text', text: code.join('\n') }] });
    } else if (HEADING.test(line)) {
      const [, hashes, text] = line.match(HEADING);
      blocks.push({ type: 'heading', level: hashes.length, children: parseInline(text) });
      i += 1;
    } else if (IMAGE.test(line)) {
      const [, alt, url] = line.match(IMAGE);
      blocks.push({ type: 'image', image: { url, alt } });
      i += 1;
    } else if (BULLET.test(line)) {
      list('unordered', takeWhile(BULLET));
    } else if (NUMBERED.test(line)) {
      list('ordered', takeWhile(NUMBERED));
    } else if (QUOTE.test(line)) {
      blocks.push({ type: 'quote', children: parseInline(takeWhile(QUOTE).join(' ')) });
    } else {
      // Every line is its own paragraph, so line breaks are never lost.
      blocks.push({ type: 'paragraph', children: parseInline(line.trim()) });
      i += 1;
    }
  }
  return blocks;
}

module.exports = { markdownToBlocks };
