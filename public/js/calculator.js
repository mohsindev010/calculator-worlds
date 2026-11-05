// Scientific calculator. Uses its own parser (no eval) so input is safe.
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; // for Node tests
  else root.CalcEngine = api;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { api.mount(document); });
  }
})(typeof self !== 'undefined' ? self : this, function () {
  // ------------------------------------------------------------
  // Tokenizer + recursive-descent parser
  // ------------------------------------------------------------
  var FUNCS = ['asin', 'acos', 'atan', 'sin', 'cos', 'tan', 'log', 'ln', 'abs', '√', '∛'];

  function tokenize(src) {
    var tokens = [];
    var i = 0;
    while (i < src.length) {
      var ch = src[i];
      if (/\s/.test(ch)) { i++; continue; }

      var num = /^(\d+\.?\d*|\.\d+)(E[+-]?\d+)?/.exec(src.slice(i));
      if (num) { tokens.push({ t: 'num', v: parseFloat(num[0]) }); i += num[0].length; continue; }

      if (src.startsWith('Ans', i)) { tokens.push({ t: 'ans' }); i += 3; continue; }

      var fn = null;
      for (var f = 0; f < FUNCS.length; f++) {
        if (src.startsWith(FUNCS[f], i)) { fn = FUNCS[f]; break; }
      }
      if (fn) { tokens.push({ t: 'fn', v: fn }); i += fn.length; continue; }

      if (ch === 'π') { tokens.push({ t: 'num', v: Math.PI }); i++; continue; }
      if (ch === 'e') { tokens.push({ t: 'num', v: Math.E }); i++; continue; }

      if ('+-−×÷*/^()!%'.indexOf(ch) !== -1) { tokens.push({ t: 'op', v: ch }); i++; continue; }

      throw new Error('Unexpected "' + ch + '"');
    }
    return tokens;
  }

  function factorial(n) {
    if (n < 0 || Math.floor(n) !== n) throw new Error('Invalid factorial');
    if (n > 170) return Infinity;
    var r = 1;
    for (var k = 2; k <= n; k++) r *= k;
    return r;
  }

  function evaluate(src, opts) {
    opts = opts || {};
    var deg = opts.angle !== 'rad';
    var ans = opts.ans || 0;
    var tokens = tokenize(src);
    var pos = 0;

    var toRad = function (x) { return deg ? (x * Math.PI) / 180 : x; };
    var fromRad = function (x) { return deg ? (x * 180) / Math.PI : x; };

    function peek() { return tokens[pos]; }
    function isOp(tok, vals) { return tok && tok.t === 'op' && vals.indexOf(tok.v) !== -1; }

    function parseExpr() {
      var left = parseTerm();
      while (isOp(peek(), ['+', '-', '−'])) {
        var op = tokens[pos++].v;
        var right = parseTerm();
        left = op === '+' ? left + right : left - right;
      }
      return left;
    }

    function startsOperand(tok) {
      return tok && (tok.t === 'num' || tok.t === 'ans' || tok.t === 'fn' || (tok.t === 'op' && tok.v === '('));
    }

    function parseTerm() {
      var left = parseUnary();
      for (;;) {
        var tok = peek();
        if (isOp(tok, ['×', '*', '÷', '/'])) {
          pos++;
          var right = parseUnary();
          left = tok.v === '×' || tok.v === '*' ? left * right : left / right;
        } else if (startsOperand(tok)) {
          left = left * parseUnary(); // implicit multiplication: 2π, 3(4+1)
        } else break;
      }
      return left;
    }

    function parseUnary() {
      var tok = peek();
      if (isOp(tok, ['-', '−'])) { pos++; return -parseUnary(); }
      if (isOp(tok, ['+'])) { pos++; return parseUnary(); }
      return parsePower();
    }

    function parsePower() {
      var base = parsePostfix();
      if (isOp(peek(), ['^'])) { pos++; return Math.pow(base, parseUnary()); }
      return base;
    }

    function parsePostfix() {
      var v = parsePrimary();
      for (;;) {
        var tok = peek();
        if (isOp(tok, ['!'])) { pos++; v = factorial(v); }
        else if (isOp(tok, ['%'])) { pos++; v = v / 100; }
        else break;
      }
      return v;
    }

    function parsePrimary() {
      var tok = tokens[pos++];
      if (!tok) throw new Error('Incomplete expression');
      if (tok.t === 'num') return tok.v;
      if (tok.t === 'ans') return ans;
      if (tok.t === 'op' && tok.v === '(') {
        var inner = parseExpr();
        if (isOp(peek(), [')'])) pos++; // missing ")" at the end is auto-closed
        return inner;
      }
      if (tok.t === 'fn') {
        if (!isOp(peek(), ['('])) throw new Error('Expected "(" after ' + tok.v);
        pos++;
        var arg = parseExpr();
        if (isOp(peek(), [')'])) pos++;
        return applyFn(tok.v, arg);
      }
      throw new Error('Unexpected token');
    }

    function applyFn(name, x) {
      switch (name) {
        case 'sin': return Math.sin(toRad(x));
        case 'cos': return Math.cos(toRad(x));
        case 'tan': return Math.tan(toRad(x));
        case 'asin': return fromRad(Math.asin(x));
        case 'acos': return fromRad(Math.acos(x));
        case 'atan': return fromRad(Math.atan(x));
        case 'ln': return Math.log(x);
        case 'log': return Math.log10(x);
        case 'abs': return Math.abs(x);
        case '√': return Math.sqrt(x);
        case '∛': return Math.cbrt(x);
      }
      throw new Error('Unknown function');
    }

    var result = parseExpr();
    if (pos < tokens.length) throw new Error('Unexpected token');
    return result;
  }

  // Tidy floating-point noise: 0.1+0.2 -> 0.3, sin(180) -> 0
  function clean(n) {
    if (!isFinite(n)) throw new Error('Math error');
    if (Math.abs(n) < 1e-12) return 0;
    return parseFloat(n.toPrecision(12));
  }

  function format(n) {
    if (Math.abs(n) >= 1e15 || (Math.abs(n) < 1e-6 && n !== 0)) {
      return n.toExponential(8).replace(/\.?0+e/, 'e').replace('e+', 'E').replace('e-', 'E-');
    }
    return String(n);
  }

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  function mount(doc) {
    var root = doc.getElementById('calculator');
    if (!root) return;

    var exprEl = doc.getElementById('calcExpr');
    var resEl = doc.getElementById('calcResult');

    var expr = '';
    var ans = 0;
    var memory = 0;
    var justEvaluated = false;
    var errored = false;

    function angleMode() {
      var checked = root.querySelector('input[name="angle"]:checked');
      return checked ? checked.value : 'deg';
    }

    function render() {
      if (errored) return;
      resEl.textContent = expr === '' ? '0' : expr;
    }

    function calc() {
      if (expr === '') return ans;
      return clean(evaluate(expr, { angle: angleMode(), ans: ans }));
    }

    function showError(msg) {
      errored = true;
      exprEl.textContent = expr;
      resEl.textContent = msg || 'Error';
    }

    function startFresh() {
      errored = false;
      exprEl.textContent = '';
    }

    function insert(text) {
      if (errored) { expr = ''; startFresh(); }
      if (justEvaluated) {
        // A new number starts fresh; an operator continues from the result
        var continues = /^[+\-−×÷^%!*/]/.test(text) || text.charAt(0) === '^';
        if (continues) expr = format(ans);
        else expr = '';
        justEvaluated = false;
        exprEl.textContent = '';
      }
      expr += text;
      render();
    }

    function equals() {
      if (expr === '') return;
      try {
        var value = calc();
        exprEl.textContent = expr + ' =';
        ans = value;
        expr = format(value);
        justEvaluated = true;
        errored = false;
        resEl.textContent = expr;
      } catch (e) {
        showError('Error');
        expr = '';
        justEvaluated = false;
      }
    }

    function back() {
      if (errored) { clearAll(); return; }
      if (justEvaluated) { justEvaluated = false; exprEl.textContent = ''; }
      // remove a whole function token like "sin(" in one go
      var m = /(asin\(|acos\(|atan\(|sin\(|cos\(|tan\(|log\(|ln\(|abs\(|√\(|∛\(|Ans)$/.exec(expr);
      expr = m ? expr.slice(0, -m[0].length) : expr.slice(0, -1);
      render();
    }

    function clearAll() {
      expr = '';
      justEvaluated = false;
      startFresh();
      resEl.textContent = '0';
    }

    function negate() {
      if (errored) return;
      var wrapped = /\(-(\d+\.?\d*|\.\d+)\)$/.exec(expr);
      if (wrapped) {
        expr = expr.slice(0, -wrapped[0].length) + wrapped[1];
      } else {
        var trailing = /(\d+\.?\d*|\.\d+)$/.exec(expr);
        if (trailing) expr = expr.slice(0, -trailing[0].length) + '(-' + trailing[0] + ')';
        else expr += '(-';
      }
      justEvaluated = false;
      render();
    }

    function currentValue() {
      try { return calc(); } catch (e) { return null; }
    }

    function memoryAdd(sign) {
      var v = currentValue();
      if (v === null) return;
      memory = clean(memory + sign * v);
      exprEl.textContent = 'M = ' + format(memory);
    }

    var actions = {
      equals: equals,
      back: back,
      clear: clearAll,
      negate: negate,
      random: function () { insert(String(Math.round(Math.random() * 1000) / 1000)); },
      'm-plus': function () { memoryAdd(1); },
      'm-minus': function () { memoryAdd(-1); },
      'm-recall': function () { insert(format(memory)); },
    };

    root.addEventListener('click', function (e) {
      var btn = e.target.closest('button.key');
      if (!btn || !root.contains(btn)) return;
      if (btn.dataset.action) actions[btn.dataset.action]();
      else if (btn.dataset.insert !== undefined) insert(btn.dataset.insert);
    });

    // Recalculate nothing on mode change, but keep the UI consistent
    root.querySelectorAll('input[name="angle"]').forEach(function (r) {
      r.addEventListener('change', function () {
        if (justEvaluated) return;
        render();
      });
    });

    // Keyboard support (only when focus is not in another input)
    doc.addEventListener('keydown', function (e) {
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
      var k = e.key;
      if (/^[0-9.]$/.test(k)) { insert(k); }
      else if (k === '+') insert('+');
      else if (k === '-') insert('−');
      else if (k === '*') insert('×');
      else if (k === '/') { e.preventDefault(); insert('÷'); }
      else if (k === '^') insert('^');
      else if (k === '(' || k === ')') insert(k);
      else if (k === '%') insert('%');
      else if (k === '!') insert('!');
      else if (k === 'Enter' || k === '=') { e.preventDefault(); equals(); }
      else if (k === 'Backspace') back();
      else if (k === 'Escape' || k === 'Delete') clearAll();
      else return;
    });
  }

  return { evaluate: evaluate, clean: clean, format: format, mount: mount };
});
