// Loan calculator: amortized (fixed repayments) and deferred (lump sum at the end).
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; // for Node tests
  else root.LoanTool = api;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { api.mount(document); });
  }
})(typeof self !== 'undefined' ? self : this, function () {
  var TOO_LARGE = 'Those values are too large to calculate.';
  var PAY_LABELS = {
    365: 'day', 52: 'week', 26: '2 weeks', 24: 'half month', 12: 'month', 4: 'quarter', 2: '6 months', 1: 'year',
  };

  // Shared input check. Rates and terms are per year; compound is times per year.
  function invalid(amount, years, rate) {
    if (!(amount > 0)) return 'Enter a loan amount above 0.';
    if (!(years > 0)) return 'Enter a loan term above 0.';
    if (!(rate >= 0)) return 'Enter an interest rate of 0 or more.';
    return null;
  }

  function split(amount, total) {
    var principalPct = Math.round((amount / total) * 100);
    return { principalPct: principalPct, interestPct: 100 - principalPct };
  }

  function amortized(amount, years, ratePct, compound, payback) {
    var error = invalid(amount, years, ratePct);
    if (error) return { error: error };

    var count = Math.round(years * payback);
    if (count < 1) return { error: 'The term is too short for this payment schedule.' };

    // Convert the yearly rate and its compounding into a rate per payment
    var r = ratePct / 100;
    var perPayment = Math.pow(1 + r / compound, compound / payback) - 1;
    var payment = perPayment === 0
      ? amount / count
      : (amount * perPayment) / (1 - Math.pow(1 + perPayment, -count));
    var total = payment * count;
    if (!isFinite(total)) return { error: TOO_LARGE };

    var parts = split(amount, total);
    return {
      payment: payment, count: count, total: total, interest: total - amount,
      principalPct: parts.principalPct, interestPct: parts.interestPct,
    };
  }

  function deferred(amount, years, ratePct, compound) {
    var error = invalid(amount, years, ratePct);
    if (error) return { error: error };

    var due = amount * Math.pow(1 + ratePct / 100 / compound, compound * years);
    if (!isFinite(due)) return { error: TOO_LARGE };

    var parts = split(amount, due);
    return { due: due, interest: due - amount, principalPct: parts.principalPct, interestPct: parts.interestPct };
  }

  function money(n) {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  function mountForm(form) {
    var out = function (name) { return form.querySelector('[data-out="' + name + '"]'); };
    var num = function (name) { return Number(form.elements[name].value); }; // blank becomes 0

    function showError(message) {
      out('label').textContent = message;
      out('main').textContent = 'Error';
      out('stats').hidden = true;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var years = num('years') + num('months') / 12;
      var rate = form.elements.rate.value === '' ? NaN : num('rate');
      var r;

      if (form.dataset.loan === 'amortized') {
        var payback = num('payback');
        r = amortized(num('amount'), years, rate, num('compound'), payback);
        if (r.error) return showError(r.error);
        out('label').textContent = 'Payment every ' + PAY_LABELS[payback];
        out('main').textContent = money(r.payment);
        out('totalLabel').textContent = 'Total of ' + r.count.toLocaleString('en-US') + ' payment' + (r.count === 1 ? '' : 's');
        out('total').textContent = money(r.total);
      } else {
        r = deferred(num('amount'), years, rate, num('compound'));
        if (r.error) return showError(r.error);
        out('label').textContent = 'Amount due at loan maturity';
        out('main').textContent = money(r.due);
      }

      out('interest').textContent = money(r.interest);
      out('principalPct').textContent = r.principalPct + '%';
      out('interestPct').textContent = r.interestPct + '%';
      out('stats').hidden = false;
    });

    form.addEventListener('reset', function () {
      out('label').textContent = '';
      out('main').textContent = '$0.00';
      out('stats').hidden = true;
    });
  }

  function mount(doc) {
    doc.querySelectorAll('[data-loan]').forEach(mountForm);
  }

  return { amortized: amortized, deferred: deferred, mount: mount };
});
