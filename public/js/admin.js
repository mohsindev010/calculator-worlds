// Post editor: URL preview, formatting buttons and direct image uploads to Cloudinary.
(function () {
  const $ = (id) => document.getElementById(id);
  const content = $('postContent');
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
  function replaceSelection(text, selectFrom, selectTo) {
    const start = content.selectionStart;
    content.setRangeText(text, start, content.selectionEnd, 'end');
    if (selectFrom !== undefined) content.setSelectionRange(start + selectFrom, start + selectTo);
    content.focus();
  }

  function wrapSelection(mark, placeholder) {
    const selected = content.value.slice(content.selectionStart, content.selectionEnd) || placeholder;
    replaceSelection(mark + selected + mark, mark.length, mark.length + selected.length);
  }

  function prefixLines(prefix, placeholder) {
    const start = content.selectionStart;
    const selected = content.value.slice(start, content.selectionEnd) || placeholder;
    const atLineStart = start === 0 || content.value[start - 1] === '\n';
    const lead = atLineStart ? '' : '\n';
    const text = selected.split('\n').map((line) => prefix + line).join('\n');
    replaceSelection(lead + text, lead.length + prefix.length, lead.length + text.length);
  }

  $('toolbar').addEventListener('click', (e) => {
    const button = e.target.closest('button[data-wrap], button[data-line]');
    if (!button) return;
    if (button.dataset.wrap) wrapSelection(button.dataset.wrap, button.dataset.placeholder);
    else prefixLines(button.dataset.line, button.dataset.placeholder);
  });

  $('insertLink').addEventListener('click', () => {
    const url = window.prompt('Link address (starting with https://)');
    if (!url) return;
    const selected = content.value.slice(content.selectionStart, content.selectionEnd) || 'link text';
    replaceSelection(`[${selected}](${url.trim()})`, 1, 1 + selected.length);
  });

  // ----- Image uploads -----
  async function uploadImage(file) {
    const signatureRes = await fetch('/admin/upload-signature', { method: 'POST' });
    if (!signatureRes.ok) throw new Error('Could not start the upload.');
    const { url, fields } = await signatureRes.json();
    const form = new FormData();
    Object.keys(fields).forEach((key) => form.append(key, fields[key]));
    form.append('file', file);
    const uploadRes = await fetch(url, { method: 'POST', body: form });
    const result = await uploadRes.json();
    if (!uploadRes.ok) throw new Error(result.error ? result.error.message : 'The upload failed.');
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
      status.textContent = `Upload failed: ${err.message}`;
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
    replaceSelection(`\n\n![](${image.secure_url})\n\n`);
  }));

  // ----- Delete -----
  const deleteForm = $('deleteForm');
  if (deleteForm) {
    deleteForm.addEventListener('submit', (e) => {
      if (!window.confirm('Delete this post permanently? This cannot be undone.')) e.preventDefault();
    });
  }
}());
