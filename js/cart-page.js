/* صفحة السلة (واجهة فقط): المنطق في cart.js */
(function () {
  var I = window.ATHAR_I18N, D = window.ATHAR_DATA, C = window.ATHAR_CART, O = window.ATHAR_ORDER, U = window.ATHAR_UI, t = I.t, esc = U.esc;
  var BASE = window.ATHAR_BASE || "";
  var root = document.getElementById("cart-root"), data = null, notices = { missing: 0, adjusted: [] };

  function summary(r) {
    var tot = O.totals(r.subtotal, null);
    var ok = r.count > 0;
    return '<aside class="sum" aria-label="' + esc(t("co.summary")) + '"><h2 class="sum__h">' + esc(t("co.summary")) + "</h2>" +
      '<dl class="sum__rows"><div><dt>' + esc(t("cart.subtotal")) + " (" + esc(t("cart.items", { n: r.count })) + ")</dt><dd>" + esc(I.fmtPrice(tot.subtotal)) + "</dd></div>" +
      "<div><dt>" + esc(t("cart.delivery")) + "</dt><dd>" + (tot.feePending ? esc(t("cart.deliveryPending")) : esc(I.fmtPrice(tot.fee))) + "</dd></div>" +
      '<div class="sum__total"><dt>' + esc(tot.feePending ? t("cart.totalPartial") : t("cart.total")) + "</dt><dd id=\"cart-total\">" + esc(I.fmtPrice(tot.total)) + "</dd></div></dl>" +
      (ok ? '<a class="btn btn--gold btn--block" id="go-checkout" href="' + BASE + 'commande.html">' + esc(t("cart.checkout")) + U.ICON.arrow + "</a>"
          : '<button class="btn btn--block" type="button" disabled>' + esc(t("cart.checkout")) + "</button>") +
      '<a class="btn btn--outline btn--block" href="' + BASE + 'catalogue.html">' + esc(t("cart.continue")) + "</a></aside>";
  }

  function line(l) {
    var p = l.product, name = I.pick(p, "name"), url = D.productUrl(p);
    var meta = [p.sizeMl ? p.sizeMl + " " + t("ml") : "", p.concentration || ""].filter(Boolean).join(" · ");
    var atMax = l.qty >= l.max;
    return '<li class="cl' + (l.available ? "" : " is-off") + '" data-id="' + esc(p.id) + '">' +
      '<a class="cl__img" href="' + url + '"><img src="' + esc(D.img(p.images[0] || "")) + '" alt="' + esc(name + " — " + p.brand) + '" width="96" height="120" loading="lazy"></a>' +
      '<div class="cl__main"><p class="pcard__brand">' + esc(p.brand) + "</p>" +
      '<h2 class="cl__name"><a href="' + url + '">' + esc(name) + "</a></h2>" +
      '<p class="cl__meta">' + esc(meta) + "</p>" +
      '<p class="cl__unit">' + esc(t("cart.unit")) + ": <strong>" + esc(I.fmtPrice(l.unit)) + "</strong></p>" +
      (l.available ? "" : '<p class="cl__warn" role="status">' + esc(t("cart.unavailable")) + "</p>") + "</div>" +
      '<div class="cl__qty">' + (l.available ?
        '<div class="qty" role="group" aria-label="' + esc(t("cart.qty")) + '">' +
        '<button type="button" class="qty__btn" data-act="dec" ' + (l.qty <= 1 ? "disabled " : "") + 'aria-label="' + esc(t("cart.dec")) + '">−</button>' +
        '<input class="qty__input" data-act="set" type="number" inputmode="numeric" min="1" max="' + l.max + '" value="' + l.qty + '" aria-label="' + esc(t("cart.qty")) + '">' +
        '<button type="button" class="qty__btn" data-act="inc" ' + (atMax ? "disabled " : "") + 'aria-label="' + esc(t("cart.inc")) + '">+</button></div>' +
        (atMax ? '<p class="cl__max">' + esc(t("cart.maxNote", { n: l.max })) + "</p>" : "") : "") + "</div>" +
      '<div class="cl__total">' + (l.available ? "<span>" + esc(t("cart.lineTotal")) + "</span><strong>" + esc(I.fmtPrice(l.total)) + "</strong>" : "") +
      '<button type="button" class="cl__rm" data-act="rm">' + esc(t("cart.remove")) + "</button></div></li>";
  }

  function render() {
    if (!data) return;
    var r = C.resolve(data.products, true);
    if (r.missing.length) notices.missing += r.missing.length;
    r.lines.forEach(function (l) { if (l.adjusted) notices.adjusted.push(I.pick(l.product, "name") + ": " + t("cart.adjusted", { n: l.qty })); });
    var nt = "";
    if (data.isDemoData) nt += '<p class="pd__note pd__note--demo" role="note">' + esc(t("demo.cartNote")) + "</p>";
    if (notices.missing) nt += '<p class="pd__note" role="status">' + esc(t("cart.missing")) + "</p>";
    notices.adjusted.forEach(function (m) { nt += '<p class="pd__note" role="status">' + esc(m) + "</p>"; });
    if (!r.lines.length) {
      root.innerHTML = nt + '<div class="state"><svg class="state__ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg><p><strong>' + esc(t("cart.empty")) +
        "</strong></p><p>" + esc(t("cart.emptyHint")) + '</p><a class="btn btn--gold" href="' + BASE + 'catalogue.html">' + esc(t("cart.continue")) + "</a></div>";
      return;
    }
    root.innerHTML = nt + '<div class="cartp"><div><ul class="cl-list">' + r.lines.map(line).join("") + "</ul>" +
      '<button type="button" class="linkbtn" id="cart-clear">' + esc(t("cart.clear")) + "</button></div>" + summary(r) + "</div>";
  }

  // إعادة الرسم مؤجلة وغير متداخلة (تمنع خطأ innerHTML أثناء blur عند تعديل الكمية)
  var pending = false;
  function schedule() { if (pending) return; pending = true; Promise.resolve().then(function () { pending = false; render(); }); }

  function productOf(id) { return data.products.filter(function (p) { return p.id === id; })[0]; }

  root.addEventListener("click", function (e) {
    var clr = e.target.closest("#cart-clear"); if (clr) { notices = { missing: 0, adjusted: [] }; C.clear(); return; }
    var b = e.target.closest("[data-act]"); if (!b || b.tagName === "INPUT") return;
    var li = b.closest(".cl"), id = li.getAttribute("data-id"), p = productOf(id); if (!p) return;
    notices = { missing: 0, adjusted: [] };
    var cur = C.qtyOf(id), act = b.getAttribute("data-act");
    if (act === "inc") C.setQty(p, cur + 1);
    else if (act === "dec") C.setQty(p, Math.max(1, cur - 1));
    else if (act === "rm") C.remove(id);
  });
  root.addEventListener("change", function (e) {
    var inp = e.target.closest('input[data-act="set"]'); if (!inp) return;
    var id = inp.closest(".cl").getAttribute("data-id"), p = productOf(id); if (!p) return;
    notices = { missing: 0, adjusted: [] };
    var v = Math.floor(Number(inp.value));
    C.setQty(p, isFinite(v) && v >= 1 ? v : 1); schedule();
  });

  U.init("cart");
  document.addEventListener("athar:cart", schedule);
  document.addEventListener("langchange", schedule);
  D.load().then(function (d) { data = d; render(); }).catch(function () {
    root.innerHTML = '<p class="state state--err" role="alert">' + esc(t("cart.loadError")) + "</p>";
  });
})();
