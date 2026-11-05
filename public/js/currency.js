// Currency converter. Rates are fetched in the browser, because the site is static and has no server.
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; // for Node tests
  else root.CurrencyTool = api;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { api.mount(document); });
  }
})(typeof self !== 'undefined' ? self : this, function () {
  var RATES_URL = 'https://open.er-api.com/v6/latest/USD';
  var TIMEOUT_MS = 10000;
  var DEFAULT_FROM = 'USD';
  var DEFAULT_TO = 'EUR';

  // Throws if the response isn't usable, so a bad response shows the error state rather than wrong numbers
  function parseRates(json) {
    var r = json && json.rates;
    var valid = json && json.result === 'success' && r && r[DEFAULT_FROM] > 0 && r[DEFAULT_TO] > 0;
    if (!valid) throw new Error('Unexpected exchange rate response');
    return { rates: r, updated: new Date(json.time_last_update_utc) };
  }

  // Both rates are relative to the same base, so any pair can be worked out
  function convert(amount, rates, from, to) {
    return (amount * rates[to]) / rates[from];
  }

  function showMoney(n) {
    if (!isFinite(n)) return 'Too large';
    // Keep small amounts meaningful: 0.00001 shouldn't show as 0.00
    return Math.abs(n) > 0 && Math.abs(n) < 1
      ? n.toLocaleString('en-US', { maximumSignificantDigits: 4 })
      : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function showRate(n) {
    return n.toLocaleString('en-US', { maximumSignificantDigits: 6 });
  }

  function currencyName(code) {
    try {
      var name = new Intl.DisplayNames(['en'], { type: 'currency' }).of(code);
      return name && name !== code ? code + ' – ' + name : code;
    } catch (e) {
      return code;
    }
  }

  function mount(doc) {
    var form = doc.getElementById('currencyTool');
    if (!form) return;

    var get = function (id) { return doc.getElementById(id); };
    var el = form.elements;
    var labelEl = get('currencyLabel');
    var resultEl = get('currencyResult');
    var stats = get('currencyStats');
    var retry = get('currencyRetry');
    var rates = null;

    function fillSelect(select, codes, chosen) {
      select.textContent = '';
      codes.forEach(function (code) {
        var option = doc.createElement('option');
        option.value = code;
        option.textContent = currencyName(code);
        option.defaultSelected = code === chosen; // so the Clear button goes back to it
        select.appendChild(option);
      });
      select.value = chosen;
      select.disabled = false;
    }

    function update() {
      stats.hidden = true;
      if (!rates) return; // the loading or error message stays on the display

      var raw = el.amount.value;
      if (raw === '') {
        labelEl.textContent = '';
        resultEl.textContent = '0';
        return;
      }

      var amount = Number(raw);
      if (amount < 0) {
        labelEl.textContent = 'Enter an amount of 0 or more.';
        resultEl.textContent = 'Error';
        return;
      }

      var from = el.from.value;
      var to = el.to.value;
      labelEl.textContent = showMoney(amount) + ' ' + from + ' =';
      resultEl.textContent = showMoney(convert(amount, rates, from, to)) + ' ' + to;
      get('currencyRateLabel').textContent = '1 ' + from;
      get('currencyRate').textContent = showRate(convert(1, rates, from, to)) + ' ' + to;
      get('currencyInverseLabel').textContent = '1 ' + to;
      get('currencyInverse').textContent = showRate(convert(1, rates, to, from)) + ' ' + from;
      stats.hidden = false;
    }

    function load() {
      retry.hidden = true;
      labelEl.textContent = 'Loading exchange rates…';
      resultEl.textContent = '…';

      // Abort a stalled request so the page can't stay on "Loading" forever
      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, TIMEOUT_MS);

      fetch(RATES_URL, { signal: controller.signal })
        .then(function (res) {
          if (!res.ok) throw new Error('Status ' + res.status);
          return res.json();
        })
        .then(function (json) {
          var data = parseRates(json);
          rates = data.rates;
          var codes = Object.keys(rates).sort();
          fillSelect(el.from, codes, DEFAULT_FROM);
          fillSelect(el.to, codes, DEFAULT_TO);
          if (!isNaN(data.updated)) {
            get('currencyUpdated').textContent = 'Rates updated ' + data.updated.toLocaleDateString('en-GB', {
              timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric',
            }) + '.';
          }
          update();
        })
        .catch(function () {
          labelEl.textContent = 'Couldn’t load exchange rates. Check your connection and try again.';
          resultEl.textContent = 'Error';
          retry.hidden = false;
        })
        .then(function () { clearTimeout(timer); });
    }

    form.addEventListener('input', update);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    // The reset event fires before the inputs are cleared
    form.addEventListener('reset', function () { setTimeout(update); });
    retry.addEventListener('click', load);

    load();
  }

  return { parseRates: parseRates, convert: convert, mount: mount };
});
