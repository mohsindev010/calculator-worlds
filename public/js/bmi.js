// BMI calculator (metric and US units).
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; // for Node tests
  else root.BmiTool = api;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { api.mount(document); });
  }
})(typeof self !== 'undefined' ? self : this, function () {
  var KG_PER_LB = 0.45359237;
  var M_PER_IN = 0.0254;
  var HEALTHY_MIN = 18.5;
  var HEALTHY_MAX = 25;

  function oneDecimal(n) { return parseFloat(n.toFixed(1)); }

  // Uses the rounded BMI, so a displayed 25 is never labelled Normal
  function category(rounded) {
    if (rounded < HEALTHY_MIN) return 'Underweight';
    if (rounded < HEALTHY_MAX) return 'Normal';
    if (rounded < 30) return 'Overweight';
    return 'Obesity';
  }

  function compute(meters, kg) {
    var squared = meters * meters;
    var bmi = kg / squared;
    var rounded = oneDecimal(bmi);
    return {
      bmi: rounded,
      category: category(rounded),
      minKg: HEALTHY_MIN * squared,
      maxKg: HEALTHY_MAX * squared,
      prime: oneDecimal(bmi / HEALTHY_MAX),
      ponderal: oneDecimal(kg / (squared * meters)),
    };
  }

  function mount(doc) {
    var form = doc.getElementById('bmiTool');
    if (!form) return;

    var get = function (id) { return doc.getElementById(id); };
    var num = function (name) { return Number(form.elements[name].value); }; // blank becomes 0
    var isUs = function () { return form.elements.unit.value === 'us'; };

    function clearResult() {
      get('bmiLabel').textContent = '';
      get('bmiResult').textContent = '0';
      get('bmiStats').hidden = true;
    }

    function syncUnits() {
      get('bmiMetric').hidden = isUs();
      get('bmiUs').hidden = !isUs();
    }

    form.addEventListener('change', function (e) {
      if (e.target.name !== 'unit') return;
      syncUnits();
      clearResult();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var us = isUs();
      var meters = us ? (num('ft') * 12 + num('in')) * M_PER_IN : num('cm') / 100;
      var kg = us ? num('lb') * KG_PER_LB : num('kg');

      if (!(meters > 0) || !(kg > 0)) {
        clearResult();
        get('bmiLabel').textContent = 'Enter a height and weight above 0.';
        get('bmiResult').textContent = 'Error';
        return;
      }

      var r = compute(meters, kg);
      var toUnit = function (value) { return oneDecimal(us ? value / KG_PER_LB : value); };

      get('bmiLabel').textContent = 'Your BMI';
      get('bmiResult').textContent = r.bmi + ' kg/m² (' + r.category + ')';
      get('bmiRange').textContent = HEALTHY_MIN + ' – ' + HEALTHY_MAX + ' kg/m²';
      get('bmiHealthy').textContent = toUnit(r.minKg) + ' – ' + toUnit(r.maxKg) + (us ? ' lb' : ' kg');
      get('bmiPrime').textContent = r.prime;
      get('bmiPonderal').textContent = r.ponderal + ' kg/m³';
      get('bmiStats').hidden = false;
    });

    form.addEventListener('reset', function () {
      // The reset event fires before the inputs are cleared
      setTimeout(function () { syncUnits(); clearResult(); });
    });
  }

  return { compute: compute, mount: mount };
});
