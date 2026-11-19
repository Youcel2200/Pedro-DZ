/* منطق تجهيز الطلب: التحقق من الحقول، المجاميع، ورسالة واتساب.
   لا يسجّل الطلب في أي قاعدة بيانات. قنوات الإرسال في ATHAR_ORDER.channels؛
   عند بناء قاعدة البيانات لاحقاً تُضاف قناة "database" هنا دون مس صفحة الطلب (انظر docs/INTEGRATION.md). */
(function () {
  var cfg = window.ATHAR_CONFIG;

  function squash(s) { return String(s == null ? "" : s).replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim(); }
  function toLatinDigits(s) {
    return String(s).replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 0x660; })
      .replace(/[۰-۹]/g, function (d) { return d.charCodeAt(0) - 0x6F0; });
  }

  // رقم جزائري محمول: 05/06/07 + 8 أرقام. يقبل +213 و00213 وفواصل ومسافات والأرقام العربية.
  function normalizePhone(raw) {
    var s = toLatinDigits(String(raw || "")).replace(/[\s.\-()]/g, "");
    if (/^\+213/.test(s)) s = "0" + s.slice(4);
    else if (/^00213/.test(s)) s = "0" + s.slice(5);
    else if (/^213\d{9}$/.test(s)) s = "0" + s.slice(3);
    return s;
  }
  function isValidPhone(raw) { return /^0[567]\d{8}$/.test(normalizePhone(raw)); }

  function wilayaByCode(code) {
    return (window.ATHAR_WILAYAS || []).filter(function (w) { return w.code === code; })[0] || null;
  }

  // ولاية تبسة (12): دائرة ثم بلدية من قوائم ثابتة (ATHAR_TEBESSA). المفاتيح لا تتأثر بلغة الواجهة.
  function tebessaDaira(key) {
    return (window.ATHAR_TEBESSA || []).filter(function (d) { return d.id === key; })[0] || null;
  }
  function tebessaCommune(daira, key) {
    return daira.communes.filter(function (c) { return c.id === key; })[0] || null;
  }

  // يعيد { ok, errors:{field:code}, values } — رموز الأخطاء تُترجم في الواجهة
  function validate(input) {
    var v = {
      fullName: squash(input.fullName), phone: squash(input.phone), wilaya: squash(input.wilaya),
      daira: squash(input.daira), commune: squash(input.commune), address: squash(input.address), notes: squash(input.notes).slice(0, 500)
    }, e = {};
    var words = v.fullName.split(" ").filter(function (w) { return w.replace(/[^\p{L}]/gu, "").length >= 2; });
    if (!v.fullName) e.fullName = "required"; else if (words.length < 2) e.fullName = "fullname";
    if (!v.phone) e.phone = "required"; else if (!isValidPhone(v.phone)) e.phone = "phone";
    if (!v.wilaya) e.wilaya = "required"; else if (!wilayaByCode(v.wilaya)) e.wilaya = "wilaya";
    if (v.wilaya === window.ATHAR_TEBESSA_CODE) {
      var dz = tebessaDaira(v.daira), cm = dz ? tebessaCommune(dz, v.commune) : null;
      if (!v.daira) e.daira = "required"; else if (!dz) e.daira = "daira";
      if (!v.commune) e.commune = "required"; else if (dz && !cm) e.commune = "commune";
      if (dz && cm) { v.dairaKey = v.daira; v.communeKey = v.commune; v.daira = dz.ar; v.commune = cm.ar; }
    } else {
      v.daira = "";
      if (!v.commune) e.commune = "required"; else if (v.commune.length < 2) e.commune = "short";
    }
    if (!v.address) e.address = "required"; else if (v.address.length < 8) e.address = "address";
    v.phone = normalizePhone(v.phone);
    return { ok: Object.keys(e).length === 0, errors: e, values: v };
  }

  function deliveryFee(wilayaCode) {
    var d = cfg.delivery || {}, by = d.byWilaya || {};
    var f = wilayaCode && by[wilayaCode] != null ? by[wilayaCode] : d.defaultFee;
    return typeof f === "number" && f >= 0 ? f : null;
  }

  function totals(subtotal, wilayaCode) {
    var fee = deliveryFee(wilayaCode);
    return { subtotal: subtotal, fee: fee, total: subtotal + (fee || 0), feePending: fee === null };
  }

  function reference(now) {
    now = now || new Date();
    var d = String(now.getFullYear()).slice(2) + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0");
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", r = "";
    var buf = (window.crypto && crypto.getRandomValues) ? crypto.getRandomValues(new Uint8Array(4)) : [1, 2, 3, 4].map(function () { return Math.floor(Math.random() * 256); });
    for (var i = 0; i < 4; i++) r += chars[buf[i] % chars.length];
    return "ATH-" + d + "-" + r;
  }

  function money(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " " + cfg.currency.ar; }

  // رسالة الطلب تُكتب دائماً بالعربية (لغة صاحب المتجر) مع الاسم اللاتيني للعطر
  function buildMessage(o) {
    var w = wilayaByCode(o.values.wilaya), L = [];
    L.push("طلب جديد — " + cfg.brand.nameAr + " | " + cfg.brand.nameLatin);
    L.push("المرجع: " + o.reference);
    if (o.demo) L.push("⚠ طلب تجريبي — بيانات اختبار، لا يُنفَّذ");
    L.push("");
    L.push("الاسم: " + o.values.fullName);
    L.push("الهاتف: " + o.values.phone);
    L.push("الولاية: " + (w ? w.code + " - " + w.ar : o.values.wilaya));
    if (o.values.daira) L.push("الدائرة: " + o.values.daira);
    L.push("البلدية: " + o.values.commune);
    L.push("العنوان: " + o.values.address);
    if (o.values.notes) L.push("ملاحظات: " + o.values.notes);
    L.push("");
    L.push("المنتجات:");
    o.lines.forEach(function (l, i) {
      var p = l.product, meta = [p.sizeMl ? p.sizeMl + " مل" : "", p.concentration || ""].filter(Boolean).join(" ");
      L.push((i + 1) + ") " + p.nameAr + (p.nameFr ? " (" + p.nameFr + ")" : "") + " — " + p.brand + (meta ? " — " + meta : "") +
        " × " + l.qty + " = " + money(l.total) + "  [" + p.id + "]");
    });
    L.push("");
    L.push("مجموع المنتجات: " + money(o.totals.subtotal));
    L.push("التوصيل: " + (o.totals.feePending ? "يُحدَّد لاحقاً" : money(o.totals.fee)));
    L.push(o.totals.feePending ? "الإجمالي (دون التوصيل): " + money(o.totals.total) : "الإجمالي: " + money(o.totals.total));
    return L.join("\n");
  }

  // رقم المتجر بصيغة أرقام دولية فقط، أو "" إن لم يُضبط/كان غير صالح (لا نخترع رقماً)
  function storeWhatsapp() {
    var n = toLatinDigits(String((cfg.order && cfg.order.whatsappNumber) || "")).replace(/[\s.\-()+]/g, "");
    if (/^00/.test(n)) n = n.slice(2);
    if (/^0[567]\d{8}$/.test(n)) n = "213" + n.slice(1);
    return /^\d{11,15}$/.test(n) ? n : "";
  }
  function whatsappUrl(message) {
    var n = storeWhatsapp(); if (!n) return "";
    return "https://wa.me/" + n + "?text=" + encodeURIComponent(message);
  }

  var channels = {
    whatsapp: { available: function () { return !!storeWhatsapp(); }, url: whatsappUrl }
    // database: { ... }   ← تُضاف في مرحلة قاعدة البيانات (غير موجودة الآن)
  };

  window.ATHAR_ORDER = {
    validate: validate, normalizePhone: normalizePhone, isValidPhone: isValidPhone, totals: totals, deliveryFee: deliveryFee,
    reference: reference, buildMessage: buildMessage, storeWhatsapp: storeWhatsapp, whatsappUrl: whatsappUrl, wilayaByCode: wilayaByCode, channels: channels
  };
})();
