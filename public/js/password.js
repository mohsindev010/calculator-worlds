// Password generator. Uses the browser's secure random source; nothing is sent or stored.
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; // for Node tests
  else root.PasswordTool = api;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { api.mount(document); });
  }
})(typeof self !== 'undefined' ? self : this, function () {
  var MIN_LENGTH = 4;
  var MAX_LENGTH = 128;
  var SETS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    digits: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{};:,.?/',
  };
  var AMBIGUOUS = /[O0Il1|]/g;

  // A whole number from 0 to n-1. Draws beyond the last full multiple of n are thrown away,
  // otherwise some characters would come up slightly more often.
  function randomBelow(n) {
    var limit = Math.floor(4294967296 / n) * n;
    var value;
    do { value = crypto.getRandomValues(new Uint32Array(1))[0]; } while (value >= limit);
    return value % n;
  }

  function pick(chars) { return chars.charAt(randomBelow(chars.length)); }

  // Returns { password, bits } or { error }
  function generate(o) {
    if (!Number.isInteger(o.length) || o.length < MIN_LENGTH || o.length > MAX_LENGTH) {
      return { error: 'Choose a length from ' + MIN_LENGTH + ' to ' + MAX_LENGTH + '.' };
    }

    var chosen = Object.keys(SETS)
      .filter(function (name) { return o[name]; })
      .map(function (name) { return o.noAmbiguous ? SETS[name].replace(AMBIGUOUS, '') : SETS[name]; });
    if (chosen.length === 0) return { error: 'Choose at least one type of character.' };

    var pool = chosen.join('');

    // One from each chosen type, so the password always meets what was asked for
    var chars = chosen.map(pick);
    while (chars.length < o.length) chars.push(pick(pool));

    // Shuffle so those guaranteed characters aren't always at the start
    for (var i = chars.length - 1; i > 0; i--) {
      var j = randomBelow(i + 1);
      var held = chars[i];
      chars[i] = chars[j];
      chars[j] = held;
    }

    return { password: chars.join(''), bits: Math.floor(o.length * Math.log2(pool.length)) };
  }

  function strength(bits) {
    if (bits < 40) return 'Weak';
    if (bits < 60) return 'Fair';
    if (bits < 80) return 'Strong';
    return 'Very strong';
  }

  function mount(doc) {
    var form = doc.getElementById('passwordTool');
    if (!form) return;

    var el = form.elements;
    var labelEl = doc.getElementById('passwordLabel');
    var resultEl = doc.getElementById('passwordResult');
    var copy = doc.getElementById('passwordCopy');
    var current = '';

    function update() {
      var out = generate({
        length: el.chars.value === '' ? NaN : Number(el.chars.value), // an input can't be named "length": form.elements.length is the field count
        upper: el.upper.checked,
        lower: el.lower.checked,
        digits: el.digits.checked,
        symbols: el.symbols.checked,
        noAmbiguous: el.noAmbiguous.checked,
      });

      current = out.password || '';
      copy.disabled = !current;
      labelEl.textContent = out.error || 'Strength: ' + strength(out.bits);
      resultEl.textContent = out.error ? 'Error' : current;
    }

    copy.addEventListener('click', function () {
      navigator.clipboard.writeText(current).then(
        function () { labelEl.textContent = 'Copied'; },
        function () { labelEl.textContent = 'Couldn’t copy. Please select the password and copy it yourself.'; }
      );
    });

    form.addEventListener('input', update);
    form.addEventListener('submit', function (e) { e.preventDefault(); update(); });

    update();
  }

  return { generate: generate, strength: strength, mount: mount };
});
