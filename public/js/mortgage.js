// Mortgage calculator: fixed rate, monthly payments.
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; // for Node tests
  else root.MortgageTool = api;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { api.mount(document); });
  }
})(typeof self !== 'undefined' ? self : this, function () {
  // Optional costs (tax, insurance, hoa) may be 0. Returns the amounts or { error }.
  function compute(o) {
    if (!(o.price > 0)) return { error: 'Enter a home price above 0.' };
    if (!(o.downPct >= 0 && o.downPct < 100)) return { error: 'Enter a down payment from 0% up to, but not including, 100%.' };
    if (!(o.years > 0)) return { error: 'Enter a loan term above 0.' };
    if (!(o.rate >= 0)) return { error: 'Enter an interest rate of 0 or more.' };

    var count = Math.round(o.years * 12);
    if (count < 1) return { error: 'The loan term must be at least one month.' };

    var down = (o.price * o.downPct) / 100;
    var loan = o.price - down;
    var monthlyRate = o.rate / 100 / 12;
    var principalAndInterest = monthlyRate === 0
      ? loan / count
      : (loan * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -count));
    var extras = (o.tax + o.insurance) / 12 + o.hoa;
    var total = principalAndInterest * count;

    if (!isFinite(total + extras)) return { error: 'Those values are too large to calculate.' };

    return {
      down: down, loan: loan, count: count,
      principalAndInterest: principalAndInterest, extras: extras,
      monthly: principalAndInterest + extras,
      total: total, interest: total - loan,
    };
  }

  function money(n) {
    return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }

  function mount(doc) {
    var form = doc.getElementById('mortgageTool');
    if (!form) return;

    var get = function (id) { return doc.getElementById(id); };
    var num = function (name) { return Number(form.elements[name].value); }; // blank becomes 0

    function show(label, main, withStats) {
      get('mortgageLabel').textContent = label;
      get('mortgageResult').textContent = main;
      get('mortgageStats').hidden = !withStats;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var r = compute({
        price: num('price'),
        downPct: num('down'),
        years: num('years'),
        rate: form.elements.rate.value === '' ? NaN : num('rate'),
        tax: num('tax'),
        insurance: num('insurance'),
        hoa: num('hoa'),
      });
      if (r.error) return show(r.error, 'Error', false);

      get('mortgagePi').textContent = money(r.principalAndInterest);
      get('mortgageExtras').textContent = money(r.extras);
      get('mortgageDown').textContent = money(r.down);
      get('mortgageLoan').textContent = money(r.loan);
      get('mortgageTotalLabel').textContent = 'Total of ' + r.count.toLocaleString('en-US') + ' loan payment' + (r.count === 1 ? '' : 's');
      get('mortgageTotal').textContent = money(r.total);
      get('mortgageInterest').textContent = money(r.interest);
      show('Monthly payment', money(r.monthly), true);
    });

    form.addEventListener('reset', function () { show('', '$0.00', false); });
  }

  return { compute: compute, mount: mount };
});
