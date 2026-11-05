// Age calculator. Dates are handled in UTC so daylight saving can't shift a day count.
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; // for Node tests
  else root.AgeTool = api;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { api.mount(document); });
  }
})(typeof self !== 'undefined' ? self : this, function () {
  var DAY = 86400000;

  function makeDate(y, m, d) {
    var date = new Date(0);
    date.setUTCFullYear(y, m, d); // Date.UTC would treat years 0-99 as 19xx
    return date;
  }

  // Parses the YYYY-MM-DD value of a date input
  function parseDate(value) {
    var m = /^(\d{4,})-(\d{2})-(\d{2})$/.exec(value);
    return m ? makeDate(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
  }

  // Moves to the last day of the month if needed: Jan 31 + 1 month -> Feb 28, Feb 29 + 1 year -> Feb 28
  function addMonths(date, n) {
    var total = date.getUTCFullYear() * 12 + date.getUTCMonth() + n;
    var y = Math.floor(total / 12);
    var m = total - y * 12;
    var lastDay = makeDate(y, m + 1, 0).getUTCDate();
    return makeDate(y, m, Math.min(date.getUTCDate(), lastDay));
  }

  // Returns null if the birth date is after the target date
  function ageBetween(dob, on) {
    if (dob > on) return null;

    var months = (on.getUTCFullYear() - dob.getUTCFullYear()) * 12 + on.getUTCMonth() - dob.getUTCMonth();
    if (addMonths(dob, months) > on) months--;

    var years = Math.floor(months / 12);
    var totalDays = Math.round((on - dob) / DAY);

    var birthday = addMonths(dob, years * 12);
    var isBirthday = years > 0 && birthday.getTime() === on.getTime();
    var next = isBirthday ? on : addMonths(dob, (years + 1) * 12);

    return {
      years: years,
      months: months % 12,
      days: Math.round((on - addMonths(dob, months)) / DAY),
      totalMonths: months,
      totalWeeks: Math.floor(totalDays / 7),
      totalDays: totalDays,
      daysToBirthday: Math.round((next - on) / DAY),
    };
  }

  function plural(n, word) { return n.toLocaleString('en-US') + ' ' + word + (n === 1 ? '' : 's'); }

  function formatAge(age) {
    return plural(age.years, 'year') + ', ' + plural(age.months, 'month') + ', ' + plural(age.days, 'day');
  }

  function showDate(date) {
    return date.toLocaleDateString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' });
  }

  function todayValue() {
    var now = new Date();
    return [
      String(now.getFullYear()).padStart(4, '0'),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
  }

  function mount(doc) {
    var form = doc.getElementById('ageTool');
    if (!form) return;

    var get = function (id) { return doc.getElementById(id); };
    var dobEl = get('ageDob');
    var onEl = get('ageOn');
    var exprEl = get('ageExpr');
    var resEl = get('ageResult');
    var stats = get('ageStats');

    function update() {
      var dob = parseDate(dobEl.value);
      var on = parseDate(onEl.value);
      stats.hidden = true;

      if (!dob || !on) {
        exprEl.textContent = 'Enter a date of birth';
        resEl.textContent = '0';
        return;
      }

      var age = ageBetween(dob, on);
      if (!age) {
        exprEl.textContent = 'The date of birth is after ' + showDate(on);
        resEl.textContent = 'Invalid date';
        return;
      }

      exprEl.textContent = 'Age on ' + showDate(on);
      resEl.textContent = formatAge(age);
      get('ageMonths').textContent = age.totalMonths.toLocaleString('en-US');
      get('ageWeeks').textContent = age.totalWeeks.toLocaleString('en-US');
      get('ageDays').textContent = age.totalDays.toLocaleString('en-US');
      get('ageNext').textContent = age.daysToBirthday === 0 ? 'Today' : 'In ' + plural(age.daysToBirthday, 'day');
      get('ageWeekday').textContent = dob.toLocaleDateString('en-GB', { timeZone: 'UTC', weekday: 'long' });
      stats.hidden = false;
    }

    form.addEventListener('input', update);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    // The reset event fires before the inputs are cleared
    form.addEventListener('reset', function () {
      setTimeout(function () { onEl.value = todayValue(); update(); });
    });

    // Set in the browser: a date rendered at build time would go stale on the static site
    onEl.value = todayValue();
    update();
  }

  return { parseDate: parseDate, ageBetween: ageBetween, formatAge: formatAge, mount: mount };
});
