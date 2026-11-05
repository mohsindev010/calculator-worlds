// Percentage calculator. Each form works out its answer when "Calculate" is clicked.
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; // for Node tests
  else root.PercentTool = api;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { api.mount(document); });
  }
})(typeof self !== 'undefined' ? self : this, function () {
  var TOO_LARGE = 'That result is too large to show.';

  // Round to 12 significant digits, matching the main calculator: 0.07 x 100 -> 7
  function tidy(n) { return parseFloat(n.toPrecision(12)); }

  // ------------------------------------------------------------
  // Two inputs, one answer: return { text } or { error }
  // ------------------------------------------------------------
  var calcs = {
    percentOf: function (p, base) {
      var v = (p * base) / 100;
      if (!isFinite(v)) return { error: TOO_LARGE };
      return { text: p + '% of ' + base + ' = ' + tidy(v) };
    },
    whatPercent: function (a, whole) {
      if (whole === 0) return { error: 'The second value can’t be 0.' };
      var v = (a / whole) * 100;
      if (!isFinite(v)) return { error: TOO_LARGE };
      return { text: a + ' is ' + tidy(v) + '% of ' + whole };
    },
    percentOfWhat: function (a, p) {
      if (p === 0) return { error: 'The percentage can’t be 0.' };
      var v = (a * 100) / p;
      if (!isFinite(v)) return { error: TOO_LARGE };
      return { text: a + ' is ' + p + '% of ' + tidy(v) };
    },
    // Difference relative to the average of the two values, so swapping them changes nothing
    difference: function (a, b) {
      var mean = (Math.abs(a) + Math.abs(b)) / 2;
      var v = mean === 0 ? 0 : (Math.abs(a - b) / mean) * 100;
      if (!isFinite(v)) return { error: TOO_LARGE };
      return { text: 'The difference between ' + a + ' and ' + b + ' is ' + tidy(v) + '%' };
    },
  };

  // ------------------------------------------------------------
  // Three boxes, any two given. Missing values are null.
  // Returns { field, value, text } (plus dir if the direction changed) or { error }
  // ------------------------------------------------------------
  function missingField(vals) {
    var missing = ['p', 'base', 'result'].filter(function (name) { return vals[name] === null; });
    if (missing.length === 0) return { error: 'Leave one box empty to calculate it.' };
    if (missing.length > 1) return { error: 'Enter any two values.' };
    return { field: missing[0] };
  }

  function answer(field, value, describe) {
    if (!isFinite(value)) return { error: TOO_LARGE };
    var tidied = tidy(value);
    return { field: field, value: tidied, text: describe(tidied) };
  }

  var solvers = {
    // p% of base = result
    of: function (vals) {
      var m = missingField(vals);
      if (m.error) return m;
      var p = vals.p, base = vals.base, result = vals.result;

      if (m.field === 'result') {
        return answer('result', (p * base) / 100, function (v) { return p + '% of ' + base + ' = ' + v; });
      }
      if (m.field === 'base') {
        if (p === 0) return { error: 'The percentage can’t be 0.' };
        return answer('base', (result * 100) / p, function (v) { return p + '% of ' + v + ' = ' + result; });
      }
      if (base === 0) return { error: 'The value can’t be 0.' };
      return answer('p', (result / base) * 100, function (v) { return v + '% of ' + base + ' = ' + result; });
    },

    // base increased or decreased by p% = result
    change: function (vals) {
      var m = missingField(vals);
      if (m.error) return m;
      var base = vals.base, p = vals.p, result = vals.result, dir = vals.dir;
      var factor = dir === 'decrease' ? 1 - p / 100 : 1 + p / 100;
      var say = function (b, d, pct, r) { return b + ' ' + d + 'd by ' + pct + '% = ' + r; };

      if (m.field === 'result') {
        return answer('result', base * factor, function (v) { return say(base, dir, p, v); });
      }
      if (m.field === 'base') {
        if (factor === 0) return { error: 'A starting value can’t be worked out from a 100% decrease.' };
        return answer('base', result / factor, function (v) { return say(v, dir, p, result); });
      }

      // The percentage is shown as positive, so the direction follows from the two values
      if (base === 0) return { error: 'The starting value can’t be 0.' };
      var ratio = result / base;
      var found = ratio < 1 ? 'decrease' : 'increase';
      var out = answer('p', Math.abs(ratio - 1) * 100, function (v) { return say(base, found, v, result); });
      if (!out.error) out.dir = found;
      return out;
    },
  };

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  function read(form, name) {
    var v = form.elements[name].value;
    return v === '' ? null : Number(v);
  }

  function show(form, out) {
    var el = form.querySelector('.pct-result');
    el.hidden = !out;
    if (!out) return;
    el.textContent = out.error || out.text;
    el.classList.toggle('is-error', !!out.error);
  }

  function mountCalc(form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var a = read(form, 'a');
      var b = read(form, 'b');
      show(form, a === null || b === null ? { error: 'Enter both values.' } : calcs[form.dataset.pctCalc](a, b));
    });
    form.addEventListener('reset', function () { show(form, null); });
  }

  function mountSolver(form) {
    // The box we filled in last time. It is worked out again on the next Calculate,
    // so people can change an input without having to empty that box first.
    var computed = null;

    form.addEventListener('input', function (e) {
      if (e.target.name === computed) computed = null;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var vals = { p: read(form, 'p'), base: read(form, 'base'), result: read(form, 'result') };
      if (form.elements.dir) vals.dir = form.elements.dir.value;
      if (computed) vals[computed] = null;

      var out = solvers[form.dataset.pctSolve](vals);
      show(form, out);
      if (out.error) return;

      form.elements[out.field].value = out.value;
      if (out.dir) form.elements.dir.value = out.dir;
      computed = out.field;
    });

    form.addEventListener('reset', function () {
      computed = null;
      show(form, null);
    });
  }

  function mount(doc) {
    doc.querySelectorAll('[data-pct-calc]').forEach(mountCalc);
    doc.querySelectorAll('[data-pct-solve]').forEach(mountSolver);
  }

  return { calcs: calcs, solvers: solvers, mount: mount };
});
