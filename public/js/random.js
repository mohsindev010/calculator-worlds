// Random number generator. Uses the browser's secure random source, without modulo bias.
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; // for Node tests
  else root.RandomTool = api;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { api.mount(document); });
  }
})(typeof self !== 'undefined' ? self : this, function () {
  var MAX_COUNT = 1000;
  var TWO_32 = 4294967296;
  var TWO_53 = 9007199254740992;

  function random32() {
    return crypto.getRandomValues(new Uint32Array(1))[0];
  }

  function random53() {
    return (random32() & 0x1fffff) * TWO_32 + random32();
  }

  // A whole number from 0 to n-1. Draws beyond the last full multiple of n are thrown away,
  // otherwise low numbers would come up slightly more often.
  function randomBelow(n) {
    var draw = n <= TWO_32 ? random32 : random53;
    var space = n <= TWO_32 ? TWO_32 : TWO_53;
    var limit = Math.floor(space / n) * n;
    var value;
    do { value = draw(); } while (value >= limit);
    return value % n;
  }

  // Returns { numbers } or { error }
  function generate(min, max, count, unique) {
    if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) {
      return { error: 'Enter whole numbers for the minimum and maximum.' };
    }
    if (min > max) return { error: 'The minimum can’t be more than the maximum.' };
    if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) {
      return { error: 'Choose how many numbers, from 1 to ' + MAX_COUNT.toLocaleString('en-US') + '.' };
    }

    var range = max - min + 1;
    if (!Number.isSafeInteger(range)) return { error: 'That range is too large.' };
    if (unique && count > range) {
      return { error: 'There are only ' + range.toLocaleString('en-US') + ' different numbers in that range.' };
    }

    if (!unique) {
      var numbers = [];
      for (var i = 0; i < count; i++) numbers.push(min + randomBelow(range));
      return { numbers: numbers };
    }

    var seen = new Set();
    while (seen.size < count) seen.add(min + randomBelow(range));
    return { numbers: Array.from(seen) };
  }

  function mount(doc) {
    var form = doc.getElementById('randomTool');
    if (!form) return;

    var get = function (id) { return doc.getElementById(id); };
    var el = form.elements;
    var labelEl = get('randomLabel');
    var resultEl = get('randomResult');
    var list = get('randomList');
    var copy = get('randomCopy');
    var current = '';

    // Blank must count as invalid, not as 0
    function read(input) { return input.value === '' ? NaN : Number(input.value); }

    function clearResult() {
      current = '';
      list.hidden = true;
      list.textContent = '';
      copy.disabled = true;
      labelEl.textContent = '';
      resultEl.textContent = '0';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var out = generate(read(el.min), read(el.max), read(el.count), el.unique.checked);
      clearResult();

      if (out.error) {
        labelEl.textContent = out.error;
        resultEl.textContent = 'Error';
        return;
      }

      current = out.numbers.join(', ');
      copy.disabled = false;
      if (out.numbers.length === 1) {
        labelEl.textContent = 'Random number';
        resultEl.textContent = String(out.numbers[0]);
      } else {
        labelEl.textContent = 'Random numbers';
        resultEl.textContent = out.numbers.length.toLocaleString('en-US') + ' numbers';
        list.textContent = current;
        list.hidden = false;
      }
    });

    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(current).then(
        function () { labelEl.textContent = 'Copied'; },
        function () { labelEl.textContent = 'Couldn’t copy. Please select the numbers and copy them yourself.'; }
      );
    });

    // The reset event fires before the inputs are cleared
    form.addEventListener('reset', clearResult);
  }

  return { generate: generate, mount: mount };
});
