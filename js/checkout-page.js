/* صفحة إتمام الطلب (واجهة فقط): التحقق وبناء الرسالة في order.js — لا يُسجَّل شيء في أي قاعدة بيانات */
(function () {
  var I = window.ATHAR_I18N, D = window.ATHAR_DATA, C = window.ATHAR_CART, O = window.ATHAR_ORDER, U = window.ATHAR_UI, t = I.t, esc = U.esc;
  var BASE = window.ATHAR_BASE || "";
  var root = document.getElementById("co-root"), data = null, sent = null, vals = {}, rendering = false, placed = null, pendingRef = null;
  /* قناة التسجيل في قاعدة البيانات: مطفأة افتراضياً (config.order.channel = "whatsapp") */
  function isDb() { return ((window.ATHAR_CONFIG || {}).order || {}).channel === "supabase" && !!window.ATHAR_SUPABASE_ORDER; }
  var FIELDS = ["fullName", "phone", "wilaya", "daira", "commune", "address", "notes"];
  var IDS = { fullName: "co-name", phone: "co-phone", wilaya: "co-wilaya", daira: "co-daira", commune: "co-commune", address: "co-address", notes: "co-notes" };

  // ───── الطلب المباشر: commande.html?now=<id>&qty=<n> — لا يقرأ السلة ولا يكتب فيها إطلاقاً ─────
  function directParams() {
    var sp = new URLSearchParams(location.search), id = sp.get("now");
    if (!id) return null;
    var q = Math.floor(Number(sp.get("qty")));
    return { id: id, qty: isFinite(q) && q >= 1 ? q : 1 };
  }
  function resolveDirect(dp) {
    var p = data.products.filter(function (x) { return x.id === dp.id; })[0] || null;
    if (!p) return { missing: true, lines: [], subtotal: 0, count: 0, unavailable: 0 };
    var max = C.maxQty(p);
    if (max < 1) return { product: p, unavailable: 1, lines: [], subtotal: 0, count: 0 };
    var qty = Math.min(dp.qty, max);
    return { product: p, lines: [{ product: p, qty: qty, available: true, max: max, unit: p.price, total: p.price * qty, adjusted: qty < dp.qty }], subtotal: p.price * qty, count: qty, unavailable: 0 };
  }
  // يعيد نتيجة السلة العادية أو نتيجة الطلب المباشر بالشكل نفسه
  function resolved(prune) {
    var dp = directParams();
    return dp ? resolveDirect(dp) : C.resolve(data.products, prune);
  }

  // ───── الولاية/الدائرة/البلدية ─────
  function isTebessa(code) { return code === window.ATHAR_TEBESSA_CODE; }
  function nm(o) { return I.lang === "fr" ? o.fr : o.ar; }
  function geoHtml(wilaya) {
    if (!isTebessa(wilaya)) {
      return field("commune", t("co.commune"), '<input id="co-commune" name="commune" type="text" autocomplete="address-level2" required aria-describedby="e-commune">');
    }
    var T = window.ATHAR_TEBESSA || [], dz = T.filter(function (d) { return d.id === vals.daira; })[0] || null;
    var dOpts = '<option value="">' + esc(t("co.dairaPick")) + "</option>" + T.map(function (d) { return '<option value="' + d.id + '">' + esc(nm(d)) + "</option>"; }).join("");
    var cOpts = '<option value="">' + esc(dz ? t("co.communePick") : t("co.communePickFirst")) + "</option>" +
      (dz ? dz.communes.map(function (c) { return '<option value="' + c.id + '">' + esc(nm(c)) + "</option>"; }).join("") : "");
    return field("daira", t("co.daira"), '<select id="co-daira" name="daira" required aria-describedby="e-daira">' + dOpts + "</select>") +
      field("commune", t("co.commune"), '<select id="co-commune" name="commune" autocomplete="address-level2" required aria-describedby="e-commune"' + (dz ? "" : " disabled") + ">" + cOpts + "</select>");
  }
  function bindGeo() {
    ["daira", "commune"].forEach(function (f) {
      var e = document.getElementById(IDS[f]); if (!e) return;
      if (vals[f] != null) e.value = vals[f];
      e.addEventListener("blur", function () { if (!rendering && e.value) validateOne(f); });
    });
    var d = document.getElementById("co-daira");
    if (d) d.addEventListener("change", function () { vals.daira = d.value; vals.commune = ""; renderGeo(); });
  }
  function renderGeo() {
    var box = document.getElementById("co-geo"); if (!box) return;
    box.innerHTML = geoHtml(vals.wilaya || "");
    bindGeo();
  }

  function capture() {
    FIELDS.forEach(function (f) { var e = document.getElementById(IDS[f]); if (e) vals[f] = e.value; });
  }

  function field(f, label, control, hint) {
    return '<div class="fld" data-f="' + f + '"><label for="' + IDS[f] + '">' + esc(label) + "</label>" + control +
      (hint ? '<p class="fld__hint" id="h-' + f + '">' + esc(hint) + "</p>" : "") + '<p class="fld__err" id="e-' + f + '" role="alert"></p></div>';
  }

  function summaryHtml(r, wilaya) {
    var tot = O.totals(r.subtotal, wilaya);
    return '<aside class="sum" aria-label="' + esc(t("co.summary")) + '"><h2 class="sum__h">' + esc(t("co.summary")) + "</h2>" +
      '<ul class="mini">' + r.lines.filter(function (l) { return l.available; }).map(function (l) {
        return '<li><img src="' + esc(D.img(l.product.images[0] || "")) + '" alt="" width="48" height="60"><span class="mini__t"><strong>' + esc(I.pick(l.product, "name")) +
          "</strong><small>" + esc(l.qty + " × " + I.fmtPrice(l.unit)) + "</small></span><b>" + esc(I.fmtPrice(l.total)) + "</b></li>";
      }).join("") + "</ul>" +
      '<dl class="sum__rows"><div><dt>' + esc(t("cart.subtotal")) + " (" + esc(t("cart.items", { n: r.count })) + ")</dt><dd>" + esc(I.fmtPrice(tot.subtotal)) + "</dd></div>" +
      "<div><dt>" + esc(t("cart.delivery")) + '</dt><dd id="co-fee">' + (tot.feePending ? esc(t("cart.deliveryPending")) : esc(I.fmtPrice(tot.fee))) + "</dd></div>" +
      '<div class="sum__total"><dt id="co-total-l">' + esc(tot.feePending ? t("cart.totalPartial") : t("cart.total")) + '</dt><dd id="co-total">' + esc(I.fmtPrice(tot.total)) + "</dd></div></dl>" +
      (tot.feePending ? '<p class="fld__hint">' + esc(t("co.feeNote")) + "</p>" : "") +
      (r.unavailable ? '<p class="pd__note">' + esc(t("co.unavailableWarn")) + "</p>" : "") + "</aside>";
  }

  function sentHtml() {
    var s = sent;
    return '<section class="sentbox" role="status" aria-live="polite"><h2>' + esc(s.wa ? t("co.sentTitle") : t("co.reviewing")) + "</h2>" +
      (s.wa ? "<p>" + esc(t("co.sentText")) + "</p>" : "") +
      '<p class="sentbox__ref">' + esc(t("co.ref")) + ": <strong dir=\"ltr\">" + esc(s.ref) + "</strong></p>" +
      '<label class="buy__lbl" for="co-text">' + esc(t("co.textBox")) + '</label><textarea id="co-text" class="co-text" rows="12" readonly dir="auto">' + esc(s.message) + "</textarea>" +
      '<div class="sentbox__act">' + (s.url ? '<a class="btn btn--gold" id="co-open-wa" href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(t("co.send")) + "</a>" : "") +
      '<button type="button" class="btn btn--outline" id="co-copy2">' + esc(t("co.copy")) + "</button>" +
      (directParams() ? "" : '<button type="button" class="btn btn--outline" id="co-clear">' + esc(t("cart.clear")) + "</button>") +
      '<a class="btn btn--outline" href="' + BASE + 'catalogue.html">' + esc(t("cart.continue")) + "</a></div></section>";
  }

  function render() {
    if (!data) return;
    if (placed) { root.innerHTML = placedHtml(); return; }
    capture();
    rendering = true; // يمنع معالجات blur من تعديل DOM أثناء الاستبدال
    var dp = directParams(), r = resolved(true), okCount = r.count;
    var nt = data.isDemoData ? '<p class="pd__note pd__note--demo" role="note">' + esc(t("demo.cartNote")) + "</p>" : "";
    if (dp) nt += '<p class="pd__note" id="co-direct" role="note"><strong>' + esc(t("co.directTitle")) + ":</strong> " + esc(t("co.directNote")) + ' <a href="' + BASE + 'panier.html">' + esc(t("co.directCart")) + "</a></p>";
    if (!okCount) {
      var msg = dp ? (r.missing ? t("co.nowMissing") : t("co.nowUnavailable")) : t("co.emptyCart");
      var back = dp && r.product ? '<a class="btn btn--outline" href="' + esc(D.productUrl(r.product)) + '">' + esc(t("co.directBack")) + "</a>" : "";
      root.innerHTML = nt + '<div class="state"><p><strong id="co-empty-msg">' + esc(msg) + "</strong></p>" + back + '<a class="btn btn--gold" href="' + BASE + 'catalogue.html">' + esc(t("cart.continue")) + "</a></div>";
      rendering = false;
      return;
    }
    var wa = O.channels.whatsapp.available();
    var wil = (window.ATHAR_WILAYAS || []).map(function (w) {
      return '<option value="' + w.code + '">' + esc(w.code + " - " + (I.lang === "fr" ? w.fr : w.ar)) + "</option>";
    }).join("");
    root.innerHTML = nt + '<div class="cartp"><form id="co-form" class="coform" novalidate autocomplete="on"><h2 class="sum__h">' + esc(t("co.customer")) + "</h2>" +
      '<p class="form-err" id="form-err" role="alert" hidden>' + esc(t("co.fixErrors")) + "</p>" +
      field("fullName", t("co.fullName"), '<input id="co-name" name="name" type="text" autocomplete="name" required aria-describedby="e-fullName">') +
      field("phone", t("co.phone"), '<input id="co-phone" name="tel" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" placeholder="05 55 12 34 56" required aria-describedby="h-phone e-phone">', t("co.phoneHint")) +
      '<div class="fld__row2">' +
      field("wilaya", t("co.wilaya"), '<select id="co-wilaya" name="wilaya" autocomplete="address-level1" required aria-describedby="e-wilaya"><option value="">' + esc(t("co.wilayaPick")) + "</option>" + wil + "</select>") +
      '<div id="co-geo" class="co-geo">' + geoHtml(vals.wilaya || "") + "</div></div>" +
      field("address", t("co.address"), '<textarea id="co-address" name="address" rows="3" autocomplete="street-address" required aria-describedby="e-address"></textarea>') +
      field("notes", t("co.notes"), '<textarea id="co-notes" name="notes" rows="2" maxlength="500"></textarea>') +
      ((wa || isDb()) ? "" : '<p class="pd__note" id="no-wa" role="note">' + esc(t("co.noWa")) + "</p>") +
      '<p class="fld__hint">' + esc(t(isDb() ? "co.honestDb" : "co.honest")) + "</p>" +
      '<div class="coform__act"><button class="btn btn--gold" type="submit" id="co-submit">' + esc(isDb() ? t("co.submitDb") : (wa ? t("co.send") : t("co.copy"))) + "</button>" +
      '<a class="btn btn--outline" href="' + BASE + 'panier.html">' + esc(t("co.back")) + "</a></div>" +
      '<div id="co-sent" aria-live="polite">' + (sent ? sentHtml() : "") + "</div></form>" +
      '<div class="co-side"><div id="co-sum">' + summaryHtml(r, vals.wilaya || "") + "</div>" + U.contactBox() + "</div></div>";
    FIELDS.forEach(function (f) { var e = document.getElementById(IDS[f]); if (e && vals[f] != null) e.value = vals[f]; });
    var ws = document.getElementById("co-wilaya");
    ws.addEventListener("change", function () {
      var was = vals.wilaya; capture(); // يحفظ ما كُتب في البلدية قبل إعادة رسم الحقول
      if (isTebessa(was) !== isTebessa(ws.value)) { vals.daira = ""; vals.commune = ""; } // نوع الحقل تغيّر: لا نُبقي قيمة لا تناسبه
      renderGeo();
      document.getElementById("co-sum").innerHTML = summaryHtml(resolved(false), ws.value);
    });
    document.getElementById("co-form").addEventListener("submit", onSubmit);
    FIELDS.forEach(function (f) { var e = document.getElementById(IDS[f]); if (e) e.addEventListener("blur", function () { if (!rendering && e.value) validateOne(f); }); });
    bindGeo();
    bindSent();
    rendering = false;
  }

  function showErrors(errors) {
    FIELDS.forEach(function (f) {
      var box = document.getElementById("e-" + f), inp = document.getElementById(IDS[f]);
      if (!box) return;
      box.textContent = errors[f] ? t("err." + errors[f]) : "";
      if (inp) { if (errors[f]) inp.setAttribute("aria-invalid", "true"); else inp.removeAttribute("aria-invalid"); }
      box.parentNode.classList.toggle("has-err", !!errors[f]);
    });
  }
  function currentValues() {
    var o = {}; FIELDS.forEach(function (f) { var e = document.getElementById(IDS[f]); o[f] = e ? e.value : ""; }); return o;
  }
  function validateOne(f) {
    var res = O.validate(currentValues()), box = document.getElementById("e-" + f), inp = document.getElementById(IDS[f]);
    if (!box || !inp) return;
    box.textContent = res.errors[f] ? t("err." + res.errors[f]) : "";
    box.parentNode.classList.toggle("has-err", !!res.errors[f]);
    if (res.errors[f]) inp.setAttribute("aria-invalid", "true"); else inp.removeAttribute("aria-invalid");
  }

  function copy(text, done) {
    function fallback() {
      var ta = document.getElementById("co-text"); if (!ta) return;
      ta.focus(); ta.select(); try { document.execCommand("copy"); done(); } catch (e) {}
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  }

  function bindSent() {
    var c2 = document.getElementById("co-copy2"), clr = document.getElementById("co-clear");
    if (c2) c2.addEventListener("click", function () { copy(sent.message, function () { U.toast(t("co.copied")); }); });
    if (clr) clr.addEventListener("click", function () { sent = null; vals = {}; C.clear(); });
  }

  /* ───── تسجيل الطلب في Supabase عبر الدالة الآمنة — القاعدة تحسب الأسعار والمخزون، والمتصفح لا يرسل سعراً ───── */
  function placedHtml() {
    var p = placed;
    return '<section class="sentbox" role="status" aria-live="polite"><h2>' + esc(t("co.placedTitle")) + "</h2><p>" + esc(t("co.placedText")) + "</p>" +
      '<p class="sentbox__ref">' + esc(t("co.orderNo")) + ': <strong dir="ltr" id="co-placed-no">' + esc(p.number) + "</strong></p>" +
      "<p>" + esc(t("cart.total")) + ": <strong>" + esc(I.fmtPrice(p.total)) + "</strong></p>" + (p.pending ? "<p>" + esc(t("co.placedFee")) + "</p>" : "") +
      '<div class="sentbox__act"><a class="btn btn--gold" href="' + BASE + 'catalogue.html">' + esc(t("cart.continue")) + "</a></div></section>";
  }
  function submitDb(res, lines) {
    var btn = document.getElementById("co-submit"), box = document.getElementById("co-sent"), v = res.values, teb = !!v.communeKey;
    if (btn) { btn.disabled = true; btn.textContent = t("co.sending"); }
    pendingRef = pendingRef || O.reference(); // مرجع ثابت: إعادة المحاولة بعد انقطاع لا تكرّر الطلب
    var customer = { fullName: v.fullName, phone: v.phone, wilayaCode: v.wilaya, communeCode: teb ? v.communeKey : null, communeName: teb ? null : v.commune, address: v.address, notes: v.notes, lang: I.lang };
    window.ATHAR_SUPABASE_ORDER.send(window.ATHAR_CONFIG, customer, lines.map(function (l) { return { slug: l.product.slug, quantity: l.qty }; }), pendingRef).then(function (s) {
      placed = { number: s.order_number, total: s.total, pending: !!s.delivery_fee_pending };
      if (!directParams()) C.clear();
      render();
    }).catch(function (e) {
      var k = e && e.code ? "dberr." + e.code : "dberr.network", msg = I.t(k); if (!msg || msg === k) msg = t(e && e.code ? "dberr.generic" : "dberr.network");
      if (btn) { btn.disabled = false; btn.textContent = t("co.submitDb"); }
      if (box) box.innerHTML = '<p class="state state--err" id="co-db-err" role="alert">' + esc(msg) + "</p>";
    });
  }

  function onSubmit(e) {
    e.preventDefault();
    var r = resolved(true);
    if (!r.count) { render(); return; }
    var res = O.validate(currentValues());
    showErrors(res.errors);
    var fe = document.getElementById("form-err"); fe.hidden = res.ok;
    if (!res.ok) {
      var first = FIELDS.filter(function (f) { return res.errors[f]; })[0];
      var fe2 = document.getElementById(IDS[first]); if (fe2) fe2.focus(); return;
    }
    var lines = r.lines.filter(function (l) { return l.available; });
    if (isDb()) { submitDb(res, lines); return; }
    var ref = O.reference();
    var message = O.buildMessage({ reference: ref, values: res.values, lines: lines, totals: O.totals(r.subtotal, res.values.wilaya), demo: !!data.isDemoData });
    var url = O.channels.whatsapp.available() ? O.whatsappUrl(message) : "";
    sent = { ref: ref, message: message, url: url, wa: !!url };
    document.getElementById("co-sent").innerHTML = sentHtml(); bindSent();
    if (url) window.open(url, "_blank", "noopener");
    else copy(message, function () { U.toast(t("co.copied")); });
    document.getElementById("co-sent").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  U.init("checkout");
  document.addEventListener("athar:cart", render);
  document.addEventListener("langchange", render);
  D.load().then(function (d) { data = d; render(); }).catch(function () {
    root.innerHTML = '<p class="state state--err" role="alert">' + esc(t("cart.loadError")) + "</p>";
  });
})();
