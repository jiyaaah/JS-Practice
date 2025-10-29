const exprEl = document.getElementById('expr');
const resultEl = document.getElementById('result');
const keys = document.getElementById('keys');

let expr = '';
let result = '0';

function refreshUI() {
  exprEl.textContent = expr || '\u00A0';
  resultEl.textContent = result;
}

function sanitizeForEval(s) {
  s = s.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-');
  if (!/^[0-9+\-*/().% \t]*$/.test(s)) return null;
  return s;
}

function evaluateExpression(s) {
  const sanitized = sanitizeForEval(s);
  if (sanitized === null) return null;

  try {
    const withPercent = sanitized.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
    const fn = new Function('return ' + withPercent);
    let val = fn();
    if (typeof val === 'number' && !Number.isFinite(val)) return null;
    if (typeof val === 'number') val = Math.round(val * 1e10) / 1e10;
    return String(val);
  } catch (e) {
    return null;
  }
}

function appendToExpr(value) {
  if (/^[+\-*/]$/.test(value)) {
    if (!expr && value !== '-') return;
    if (/[+\-*/]$/.test(expr)) {
      expr = expr.slice(0, -1) + value;
      result = evaluateExpression(expr) || result;
      refreshUI();
      return;
    }
  }
  expr += value;
  const evalRes = evaluateExpression(expr);
  if (evalRes !== null) result = evalRes;
  refreshUI();
}

function doClear() {
  expr = '';
  result = '0';
  refreshUI();
}

function doBack() {
  if (!expr) return;
  expr = expr.slice(0, -1);
  const evalRes = evaluateExpression(expr);
  result = evalRes !== null ? evalRes : (expr ? '' : '0');
  refreshUI();
}

function doPercent() {
  expr += '%';
  const evalRes = evaluateExpression(expr);
  if (evalRes !== null) result = evalRes;
  refreshUI();
}

function doNegate() {
  if (!expr) { expr = '-'; refreshUI(); return; }
  const val = evaluateExpression(expr);
  if (val !== null) {
    expr = '(' + String(-Number(val)) + ')';
    result = String(-Number(val));
    refreshUI();
  }
}

function doEquals() {
  const evalRes = evaluateExpression(expr);
  if (evalRes === null) {
    result = 'Error';
  } else {
    result = evalRes;
    expr = result;
  }
  refreshUI();
}

keys.addEventListener('click', (ev) => {
  const btn = ev.target.closest('button');
  if (!btn) return;
  const action = btn.dataset.action;
  const value = btn.dataset.value;
  if (action === 'clear') return doClear();
  if (action === 'back') return doBack();
  if (action === 'percent') return doPercent();
  if (action === 'negate') return doNegate();
  if (action === 'equals') return doEquals();
  if (value !== undefined) return appendToExpr(value);
});

window.addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter') { ev.preventDefault(); doEquals(); return; }
  if (ev.key === 'Backspace') { ev.preventDefault(); doBack(); return; }
  if (ev.key === 'Escape') { ev.preventDefault(); doClear(); return; }

  const allowed = '0123456789+-*/().%';
  if (allowed.includes(ev.key)) {
    ev.preventDefault();
    appendToExpr(ev.key);
  }
});

refreshUI();
