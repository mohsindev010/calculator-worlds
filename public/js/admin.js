// Admin pages: delete confirmations, the visual post editor and image uploads to Cloudinary.
(function () {
  const $ = (id) => document.getElementById(id);

  document.querySelectorAll('form[data-confirm]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      if (!window.confirm(form.dataset.confirm)) e.preventDefault();
    });
  });

  const editor = $('editor');
  if (!editor) return;

  const status = $('uploadStatus');
  if (new URLSearchParams(location.search).has('saved')) $('savedNotice').hidden = false;

  // ----- URL -----
  const slug = $('postSlug');
  const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const showSlug = () => { $('slugPreview').textContent = slug.value || 'your-post'; };
  $('postTitle').addEventListener('input', (e) => {
    if (slug.dataset.locked) return;
    slug.value = slugify(e.target.value);
    showSlug();
  });
  slug.addEventListener('input', () => {
    slug.dataset.locked = '1';
    showSlug();
  });

  // ----- Formatting -----
  document.execCommand('defaultParagraphSeparator', false, 'p');
  let savedRange = null;

  function saveSelection() {
    const selection = window.getSelection();
    if (selection.rangeCount && editor.contains(selection.anchorNode)) {
      savedRange = selection.getRangeAt(0).cloneRange();
    }
  }

  function restoreSelection() {
    editor.focus();
    if (!savedRange) return;
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(savedRange);
  }

  function currentBlock() {
    const selection = window.getSelection();
    let node = selection.rangeCount ? selection.anchorNode : null;
    while (node && node !== editor) {
      if (node.nodeType === 1 && /^(H[1-6]|BLOCKQUOTE)$/.test(node.tagName)) return node.tagName;
      node = node.parentNode;
    }
    return 'P';
  }

  function updateToolbar() {
    saveSelection();
    const block = currentBlock();
    document.querySelectorAll('#toolbar [data-command]').forEach((button) => {
      button.setAttribute('aria-pressed', String(document.queryCommandState(button.dataset.command)));
    });
    document.querySelectorAll('#toolbar [data-block]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.block === block));
    });
  }

  document.addEventListener('selectionchange', () => {
    if (editor.contains(document.activeElement) || document.activeElement === editor) updateToolbar();
  });

  // Keeps the text selected when a toolbar button is clicked.
  $('toolbar').addEventListener('mousedown', (e) => {
    if (e.target.closest('button')) e.preventDefault();
  });

  $('toolbar').addEventListener('click', (e) => {
    const button = e.target.closest('button');
    if (!button) return;
    editor.focus();
    if (button.dataset.command) {
      document.execCommand(button.dataset.command);
    } else if (button.dataset.block) {
      // Clicking the active style again turns it back into normal text.
      const next = currentBlock() === button.dataset.block ? 'P' : button.dataset.block;
      document.execCommand('formatBlock', false, next);
    } else if (button.id === 'insertLink') {
      saveSelection();
      const url = (window.prompt('Link address (starting with https://)') || '').trim();
      if (!url) return;
      restoreSelection();
      if (window.getSelection().isCollapsed) document.execCommand('insertText', false, url);
      if (window.getSelection().isCollapsed) {
        const range = window.getSelection().getRangeAt(0);
        range.setStart(range.startContainer, Math.max(0, range.startOffset - url.length));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
      }
      document.execCommand('createLink', false, url);
      window.getSelection().collapseToEnd();
    }
    updateToolbar();
  });

  // ----- Pasting: keep the structure, drop the source's fonts, colours and sizes -----
  const KEEP = {
    H1: 'h2', H2: 'h2', H3: 'h3', H4: 'h4', H5: 'h4', H6: 'h4', P: 'p', DIV: 'p', UL: 'ul', OL: 'ol', LI: 'li',
    BLOCKQUOTE: 'blockquote', PRE: 'pre', STRONG: 'strong', EM: 'em', I: 'em', CODE: 'code', BR: 'br',
  };

  function cleanNode(node, out) {
    if (node.nodeType === 3) {
      out.appendChild(document.createTextNode(node.nodeValue.replace(/\s*\n\s*/g, ' ')));
      return;
    }
    if (node.nodeType !== 1 || /^(SCRIPT|STYLE|META|LINK|TITLE)$/.test(node.tagName)) return;
    const style = node.getAttribute('style') || '';
    const fontWeight = (style.match(/font-weight:\s*(\w+)/) || [])[1];
    const isBold = fontWeight === 'bold' || Number(fontWeight) >= 600;
    const isItalic = /font-style:\s*italic/.test(style);
    let target = out;
    let tag = KEEP[node.tagName];
    // Google Docs wraps whole documents in <b style="font-weight:normal">.
    if (node.tagName === 'B' && fontWeight !== 'normal' && !(Number(fontWeight) < 600)) tag = 'strong';
    if (node.tagName === 'A') {
      const href = node.getAttribute('href') || '';
      if (/^(https?:|mailto:)/i.test(href)) {
        target = document.createElement('a');
        target.setAttribute('href', href);
        out.appendChild(target);
      }
    } else if (node.tagName === 'IMG') {
      const src = node.getAttribute('src') || '';
      if (/^https:/i.test(src)) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = node.getAttribute('alt') || '';
        out.appendChild(img);
      }
      return;
    } else if (tag) {
      target = document.createElement(tag);
      out.appendChild(target);
    }
    if (!tag || tag === 'p' || tag.startsWith('h')) {
      if (isBold && !tag?.startsWith('h')) target = target.appendChild(document.createElement('strong'));
      if (isItalic) target = target.appendChild(document.createElement('em'));
    }
    node.childNodes.forEach((child) => cleanNode(child, target));
  }

  const escapeHtml = (text) => text.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));

  editor.addEventListener('paste', (e) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    if (html) {
      const out = document.createElement('div');
      new DOMParser().parseFromString(html, 'text/html').body.childNodes.forEach((n) => cleanNode(n, out));
      document.execCommand('insertHTML', false, out.innerHTML);
    } else {
      const lines = e.clipboardData.getData('text/plain').split(/\r?\n/).filter((line) => line.trim());
      document.execCommand('insertHTML', false, lines.map((line) => `<p>${escapeHtml(line)}</p>`).join(''));
    }
  });

  // ----- Saving: the editor's content is stored as Markdown -----
  const escapeMarkdown = (text) => text.replace(/ /g, ' ').replace(/([\\`*[\]])/g, '\\$1');

  // Keeps spaces outside the marks, because "** bold **" would not read as bold.
  function mark(inner, symbol) {
    const parts = inner.match(/^(\s*)([\s\S]*?)(\s*)$/);
    return parts[2] ? parts[1] + symbol + parts[2] + symbol + parts[3] : inner;
  }

  function inlineMarkdown(node) {
    if (node.nodeType === 3) return escapeMarkdown(node.nodeValue.replace(/\s*\n\s*/g, ' '));
    if (node.nodeType !== 1) return '';
    const inner = Array.from(node.childNodes).map(inlineMarkdown).join('');
    const style = node.style || {};
    switch (node.tagName) {
      case 'BR': return '\n';
      case 'STRONG': case 'B': return mark(inner, '**');
      case 'EM': case 'I': return mark(inner, '*');
      case 'CODE': return `\`${node.textContent.replace(/`/g, '')}\``;
      case 'A': {
        const href = (node.getAttribute('href') || '').replace(/\s/g, '%20').replace(/\)/g, '%29');
        return inner.trim() && href ? `[${inner}](${href})` : inner;
      }
      case 'SPAN': case 'FONT':
        if (style.fontWeight === 'bold' || Number(style.fontWeight) >= 600) return mark(inner, '**');
        if (style.fontStyle === 'italic') return mark(inner, '*');
        return inner;
      default: return inner;
    }
  }

  // Protects typed text such as "1. Intro" or "- note" from turning into a list.
  const protectLine = (line) => line
    .replace(/^(\s*\d+)\.(\s)/, '$1\\.$2')
    .replace(/^(\s*)(#{1,6}\s|[-*]\s|>|!\[)/, '$1\\$2');

  const textLines = (nodes) => nodes.map(inlineMarkdown).join('').split('\n').map((l) => l.trim()).filter(Boolean);

  const isBlockElement = (node) => node.nodeType === 1
    && /^(H[1-6]|P|DIV|UL|OL|LI|BLOCKQUOTE|PRE|IMG|SECTION|ARTICLE|TABLE|TBODY|TR|TD|TH)$/.test(node.tagName);

  function imageMarkdown(img) {
    const src = (img.getAttribute('src') || '').replace(/\s/g, '%20').replace(/\)/g, '%29');
    return /^https:/i.test(src) ? `![${(img.getAttribute('alt') || '').replace(/[[\]]/g, '')}](${src})` : '';
  }

  function listMarkdown(list) {
    const ordered = list.tagName === 'OL';
    const lines = [];
    list.querySelectorAll('li').forEach((item) => {
      const own = Array.from(item.childNodes).filter((n) => !(n.nodeType === 1 && /^(UL|OL)$/.test(n.tagName)));
      const text = textLines(own).join(' ');
      if (text) lines.push(`${ordered ? `${lines.length + 1}.` : '-'} ${text}`);
    });
    return lines.join('\n');
  }

  // Splits a container into Markdown blocks, keeping images on their own lines.
  function blocksFrom(container) {
    const blocks = [];
    let run = [];
    const flush = () => {
      textLines(run).forEach((line) => blocks.push(protectLine(line)));
      run = [];
    };
    container.childNodes.forEach((node) => {
      if (!isBlockElement(node)) {
        if (node.nodeType === 1 && node.querySelector('img')) {
          flush();
          blocks.push(...blocksFrom(node));
        } else {
          run.push(node);
        }
        return;
      }
      flush();
      if (/^H[1-6]$/.test(node.tagName)) {
        const text = textLines([node]).join(' ');
        if (text) blocks.push(`${'#'.repeat(Number(node.tagName[1]))} ${text}`);
      } else if (node.tagName === 'UL' || node.tagName === 'OL') {
        const list = listMarkdown(node);
        if (list) blocks.push(list);
      } else if (node.tagName === 'BLOCKQUOTE') {
        textLines([node]).forEach((line) => blocks.push(`> ${line}`));
      } else if (node.tagName === 'PRE') {
        blocks.push(`\`\`\`\n${node.textContent.replace(/```/g, '')}\n\`\`\``);
      } else if (node.tagName === 'IMG') {
        const image = imageMarkdown(node);
        if (image) blocks.push(image);
      } else {
        blocks.push(...blocksFrom(node));
      }
    });
    flush();
    return blocks;
  }

  $('postForm').addEventListener('submit', () => {
    $('postContent').value = blocksFrom(editor).join('\n\n');
  });

  // ----- Image uploads -----
  const MAX_UPLOAD_MB = 10;

  async function uploadImage(file) {
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      throw new Error(`This image is larger than ${MAX_UPLOAD_MB} MB. Please choose a smaller one.`);
    }
    const startRes = await fetch('/admin/upload-settings', { method: 'POST' });
    if (startRes.redirected) throw new Error('You were logged out. Please log in again in a new tab, then retry.');
    const start = await startRes.json().catch(() => ({}));
    if (!startRes.ok) throw new Error(start.error || 'Could not start the upload.');

    const form = new FormData();
    Object.keys(start.fields).forEach((key) => form.append(key, start.fields[key]));
    form.append('file', file);
    const uploadRes = await fetch(start.url, { method: 'POST', body: form });
    const result = await uploadRes.json().catch(() => ({}));
    if (!uploadRes.ok) {
      const message = result.error && result.error.message ? result.error.message : `Error ${uploadRes.status}`;
      const hint = uploadRes.status === 400 || uploadRes.status === 401 || uploadRes.status === 404
        ? ' Please check the upload preset in Cloudinary and the CLOUDINARY settings in Vercel.' : '';
      throw new Error(`Cloudinary said: ${message}.${hint}`);
    }
    return result;
  }

  async function handleUpload(input, onDone) {
    const file = input.files[0];
    if (!file) return;
    status.textContent = `Uploading ${file.name}...`;
    try {
      onDone(await uploadImage(file));
      status.textContent = 'Image uploaded. Remember to save the post.';
    } catch (err) {
      status.textContent = `Upload failed. ${err.message}`;
    }
    input.value = '';
  }

  function setCover(image) {
    $('imageUrl').value = image ? image.secure_url : '';
    $('imageWidth').value = image ? image.width : '';
    $('imageHeight').value = image ? image.height : '';
    $('coverPreview').src = image ? image.secure_url : '';
    $('coverPreview').hidden = !image;
    $('coverRemove').hidden = !image;
  }

  $('coverFile').addEventListener('change', (e) => handleUpload(e.target, setCover));
  $('coverRemove').addEventListener('click', () => setCover(null));
  $('contentFile').addEventListener('change', (e) => handleUpload(e.target, (image) => {
    restoreSelection();
    document.execCommand('insertHTML', false, `<img src="${escapeHtml(image.secure_url)}" alt="" /><p><br></p>`);
  }));
}());
