/* منطق السلة — لا يعرف شيئاً عن الواجهة. يخزّن (المعرّف + الكمية) فقط في localStorage؛
   الأسعار والتوفر تُقرأ دائماً من بيانات المنتجات الحالية عند العرض، فلا يعلق سعر قديم في المتصفح. */
(function () {
  var cfg = window.ATHAR_CONFIG, KEY = "athar_cart_v1", mem = [];

  function maxPerItem() { return Math.max(1, Number(cfg.order && cfg.order.maxQtyPerItem) || 10); }

  function clean(arr) {
    var seen = {};
    return (Array.isArray(arr) ? arr : []).filter(function (x) {
      if (!x || typeof x.id !== "string" || !x.id || seen[x.id]) return false;
      if (!(Number.isInteger(x.qty) && x.qty > 0 && x.qty <= 99)) return false;
      seen[x.id] = 1; return true;
    }).map(function (x) { return { id: x.id, qty: x.qty }; });
  }

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? clean(JSON.parse(raw)) : mem.slice();
    } catch (e) { return mem.slice(); }
  }
  function write(items) {
    items = clean(items); mem = items.slice();
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* التخزين محجوب: تبقى السلة في الذاكرة طوال الجلسة */ }
    notify();
  }
  function notify() { document.dispatchEvent(new CustomEvent("athar:cart")); }

  function items() { return read(); }
  function count() { return read().reduce(function (a, x) { return a + x.qty; }, 0); }
  function qtyOf(id) { var f = read().filter(function (x) { return x.id === id; })[0]; return f ? f.qty : 0; }

  // الحد الأقصى المسموح لهذا المنتج: صفر إن لم يكن متوفراً، ولا يتجاوز المخزون المعروف (stockQty) ولا حد الطلب.
  function maxQty(p) {
    if (!p || p.stock === "out_of_stock") return 0;
    var cap = maxPerItem();
    if (typeof p.stockQty === "number") cap = Math.min(cap, Math.max(0, Math.floor(p.stockQty)));
    return cap;
  }

  // يعيد { ok, added, qty, reason } — reason: out_of_stock | max_reached | invalid
  function add(p, qty) {
    qty = Math.floor(Number(qty) || 1);
    if (!p || qty < 1) return { ok: false, added: 0, qty: 0, reason: "invalid" };
    var max = maxQty(p);
    if (max < 1) return { ok: false, added: 0, qty: qtyOf(p.id), reason: "out_of_stock" };
    var list = read(), cur = qtyOf(p.id), room = max - cur;
    if (room < 1) return { ok: false, added: 0, qty: cur, reason: "max_reached", max: max };
    var take = Math.min(qty, room), next = cur + take;
    var found = false;
    list = list.map(function (x) { if (x.id === p.id) { found = true; return { id: x.id, qty: next }; } return x; });
    if (!found) list.push({ id: p.id, qty: next });
    write(list);
    return { ok: true, added: take, qty: next, clamped: take < qty, reason: take < qty ? "max_reached" : "", max: max };
  }

  function setQty(p, qty) {
    qty = Math.floor(Number(qty));
    if (!p || !isFinite(qty)) return null;
    if (qty < 1) { remove(p.id); return 0; }
    var max = maxQty(p); if (max < 1) return qtyOf(p.id);
    qty = Math.min(qty, max);
    var found = false;
    var list = read().map(function (x) { if (x.id === p.id) { found = true; return { id: x.id, qty: qty }; } return x; });
    if (!found) list.push({ id: p.id, qty: qty });
    write(list); return qty;
  }

  function remove(id) { write(read().filter(function (x) { return x.id !== id; })); }
  function clear() { write([]); }

  // يربط محتوى السلة ببيانات المنتجات الحالية.
  // lines: كل سطر {product, qty, available, max, unit, total, adjusted}
  // missing: معرّفات لم تعد موجودة في الكتالوج (تُحذف من السلة تلقائياً عند prune=true)
  function resolve(products, prune) {
    var byId = {}; products.forEach(function (p) { byId[p.id] = p; });
    var lines = [], missing = [], fix = [], changed = false;
    read().forEach(function (it) {
      var p = byId[it.id];
      if (!p) { missing.push(it.id); changed = true; return; }
      var max = maxQty(p), available = max > 0, qty = it.qty, adjusted = false;
      if (available && qty > max) { qty = max; adjusted = true; changed = true; }
      lines.push({ product: p, qty: qty, available: available, max: max, unit: p.price, total: available ? p.price * qty : 0, adjusted: adjusted });
      fix.push({ id: it.id, qty: qty });
    });
    if (prune && changed) write(fix);
    var okLines = lines.filter(function (l) { return l.available; });
    return {
      lines: lines, missing: missing,
      subtotal: okLines.reduce(function (a, l) { return a + l.total; }, 0),
      count: okLines.reduce(function (a, l) { return a + l.qty; }, 0),
      unavailable: lines.length - okLines.length
    };
  }

  window.addEventListener("storage", function (e) { if (e.key === KEY) notify(); }); // مزامنة بين التبويبات

  window.ATHAR_CART = { items: items, count: count, qtyOf: qtyOf, maxQty: maxQty, add: add, setQty: setQty, remove: remove, clear: clear, resolve: resolve, KEY: KEY };
})();
