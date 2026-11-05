// Time, temperature, length and weight converters: updates as you type.
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; // for Node tests
  else root.UnitConverter = api;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { api.mount(document); });
  }
})(typeof self !== 'undefined' ? self : this, function () {
  var YEAR_SECONDS = 365.2425 * 86400; // calendar average

  // A value in a base unit is: value x factor + offset. Only temperature uses an offset.
  // Each unit is [name, symbol, factor, offset].
  var KINDS = {
    time: { // base: second
      from: 'min', to: 'h',
      note: 'Months and years use calendar averages: 1 year = 365.2425 days, 1 month = 1/12 of a year.',
      units: {
        ms: ['Milliseconds', 'ms', 0.001],
        s: ['Seconds', 's', 1],
        min: ['Minutes', 'min', 60],
        h: ['Hours', 'h', 3600],
        d: ['Days', 'd', 86400],
        w: ['Weeks', 'wk', 604800],
        mo: ['Months', 'mo', YEAR_SECONDS / 12],
        y: ['Years', 'yr', YEAR_SECONDS],
      },
    },
    temperature: { // base: kelvin
      from: 'c', to: 'f',
      minBase: 0,
      minMessage: 'That is below absolute zero, the lowest possible temperature.',
      units: {
        c: ['Celsius', '°C', 1, 273.15],
        f: ['Fahrenheit', '°F', 5 / 9, (459.67 * 5) / 9],
        k: ['Kelvin', 'K', 1, 0],
      },
    },
    length: { // base: metre
      from: 'km', to: 'mi',
      units: {
        mm: ['Millimeters', 'mm', 0.001],
        cm: ['Centimeters', 'cm', 0.01],
        m: ['Meters', 'm', 1],
        km: ['Kilometers', 'km', 1000],
        in: ['Inches', 'in', 0.0254],
        ft: ['Feet', 'ft', 0.3048],
        yd: ['Yards', 'yd', 0.9144],
        mi: ['Miles', 'mi', 1609.344],
        nmi: ['Nautical miles', 'nmi', 1852],
      },
    },
    weight: { // base: kilogram
      from: 'kg', to: 'lb',
      note: 'Ton uses 2,000 pounds (US) and tonne uses 1,000 kilograms (metric).',
      units: {
        mg: ['Milligrams', 'mg', 0.000001],
        g: ['Grams', 'g', 0.001],
        kg: ['Kilograms', 'kg', 1],
        t: ['Tonnes', 't', 1000],
        oz: ['Ounces', 'oz', 0.45359237 / 16],
        lb: ['Pounds', 'lb', 0.45359237],
        st: ['Stone', 'st', 0.45359237 * 14],
        ton: ['Tons (US)', 'ton', 0.45359237 * 2000],
      },
    },
  };

  function toBase(unit, value) { return value * unit[2] + (unit[3] || 0); }

  // Rounded to 12 significant digits to hide floating-point noise
  function convert(kind, value, from, to) {
    var units = KINDS[kind].units;
    var out = (toBase(units[from], value) - (units[to][3] || 0)) / units[to][2];
    return parseFloat(out.toPrecision(12));
  }

  // The tolerance stops rounding from rejecting exactly -273.15 C or -459.67 F
  function isTooLow(kind, value, from) {
    var k = KINDS[kind];
    return k.minBase !== undefined && toBase(k.units[from], value) < k.minBase - 1e-9;
  }

  function show(n, digits) {
    if (!isFinite(n)) return 'Too large';
    return n.toLocaleString('en-US', { maximumSignificantDigits: digits || 12 });
  }

  function fillSelect(doc, select, kind, chosen) {
    Object.keys(kind.units).forEach(function (key) {
      var u = kind.units[key];
      var option = doc.createElement('option');
      option.value = key;
      option.textContent = u[0] + ' (' + u[1] + ')';
      option.defaultSelected = key === chosen; // so the Clear button goes back to it
      select.appendChild(option);
    });
    select.value = chosen;
  }

  function mount(doc) {
    var form = doc.getElementById('unitConverter');
    if (!form) return;

    var kindName = form.dataset.kind;
    var kind = KINDS[kindName];
    var el = form.elements;
    var labelEl = doc.getElementById('converterLabel');
    var resultEl = doc.getElementById('converterResult');
    var stats = doc.getElementById('converterStats');
    var noteEl = doc.getElementById('converterNote');

    fillSelect(doc, el.from, kind, kind.from);
    fillSelect(doc, el.to, kind, kind.to);

    if (kind.note) {
      noteEl.textContent = kind.note;
      noteEl.hidden = false;
    }

    // One box per unit
    Object.keys(kind.units).forEach(function (key) {
      var box = doc.createElement('div');
      box.className = 'stat';
      var dt = doc.createElement('dt');
      dt.textContent = kind.units[key][0];
      var dd = doc.createElement('dd');
      dd.dataset.unit = key;
      box.appendChild(dt);
      box.appendChild(dd);
      stats.appendChild(box);
    });

    function symbol(key) { return kind.units[key][1]; }

    function withSymbol(text, key) {
      // No space before a degree sign: 32°F
      return text + (symbol(key).charAt(0) === '°' ? '' : ' ') + symbol(key);
    }

    function update() {
      var raw = el.value.value;
      stats.hidden = true;

      if (raw === '') {
        labelEl.textContent = '';
        resultEl.textContent = '0';
        return;
      }

      var value = Number(raw);
      if (isTooLow(kindName, value, el.from.value)) {
        labelEl.textContent = kind.minMessage;
        resultEl.textContent = 'Error';
        return;
      }

      labelEl.textContent = withSymbol(show(value), el.from.value) + ' =';
      resultEl.textContent = withSymbol(show(convert(kindName, value, el.from.value, el.to.value)), el.to.value);
      stats.querySelectorAll('[data-unit]').forEach(function (dd) {
        var shown = show(convert(kindName, value, el.from.value, dd.dataset.unit), 8); // shorter, to fit the boxes
        dd.textContent = withSymbol(shown, dd.dataset.unit);
      });
      stats.hidden = false;
    }

    form.addEventListener('input', update);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    // The reset event fires before the inputs are cleared
    form.addEventListener('reset', function () { setTimeout(update); });
  }

  return { convert: convert, isTooLow: isTooLow, mount: mount };
});
