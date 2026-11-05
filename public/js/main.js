// Site-wide behaviour: mobile menu, dropdown, live tool filter.
(function () {
  // Every query word must start a word in the tool's name or category,
  // so "age" finds Age Calculator but not Percentage or Mortgage.
  function cardMatches(card, q) {
    var words = (card.dataset.name + ' ' + card.dataset.category).split(/\s+/);
    return q.split(/\s+/).every(function (part) {
      return words.some(function (word) { return word.indexOf(part) === 0; });
    });
  }

  // Mobile menu
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Dropdown on small screens (tap to open)
  document.querySelectorAll('.has-dropdown > a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (window.innerWidth <= 900) {
        e.preventDefault();
        a.parentElement.classList.toggle('is-open');
      }
    });
  });

  // Search page: show the tool cards matching ?q=...
  var searchGrid = document.getElementById('searchGrid');
  if (searchGrid) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var needle = query.toLowerCase();
    var summary = document.getElementById('searchSummary');
    var searchEmpty = document.getElementById('searchEmpty');
    var found = 0;

    searchGrid.querySelectorAll('.tool-card').forEach(function (card) {
      var match = needle !== '' && cardMatches(card, needle);
      card.classList.toggle('is-hidden', !match);
      if (match) found++;
    });

    // Fill the header search box with the current query
    document.querySelectorAll('.header-search input[name="q"]').forEach(function (i) { i.value = query; });

    if (summary && query) {
      summary.textContent = 'Showing results for “' + query + '” (' + found + ' found)';
    }
    if (searchEmpty) searchEmpty.hidden = !(query && found === 0);
  }

  // Live filter for the popular tools grid
  var input = document.getElementById('toolSearch');
  var grid = document.getElementById('toolGrid');
  var empty = document.getElementById('noResults');
  if (input && grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.tool-card'));
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var match = !q || cardMatches(card, q);
        card.classList.toggle('is-hidden', !match);
        if (match) visible++;
      });
      if (empty) empty.hidden = visible !== 0;
    });
  }
})();
