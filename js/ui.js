/* مكوّنات الواجهة المشتركة: الشريط العلوي، قائمة الهاتف، البحث، التذييل، البطاقات */
(function () {
  var I = window.ATHAR_I18N, D = window.ATHAR_DATA, C = window.ATHAR_CART, F = window.ATHAR_FILTERS, cfg = window.ATHAR_CONFIG;
  var BASE = window.ATHAR_BASE || "";
  var t = I.t;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function safeUrl(u) { return /^(https?:\/\/|mailto:|tel:)/i.test(u) ? u : ""; }

  var ICON = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 016 0v2"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z"/><path d="M9 8V6a3 3 0 016 0v2"/><path d="M12 11.5v5M9.5 14h5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true" class="i-arrow"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    zoom: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6M11 8v6M8 11h6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true" class="i-line"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>'
  };

  // أيقونات المنصات الرسمية (Simple Icons، ترخيص CC0) — تُلوَّن بلون النص الحالي
  var BRAND_PATHS = {
    facebook: "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a9 9 0 0 1 1.141.195v3.325a9 9 0 0 0-.653-.036 27 27 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.7 1.7 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647",
    instagram: "M7.03.084c-1.277.06-2.149.264-2.91.563a5.9 5.9 0 0 0-2.124 1.388 5.9 5.9 0 0 0-1.38 2.127C.321 4.926.12 5.8.064 7.076s-.069 1.688-.063 4.947.021 3.667.083 4.947c.061 1.277.264 2.149.563 2.911.308.789.72 1.457 1.388 2.123a5.9 5.9 0 0 0 2.129 1.38c.763.295 1.636.496 2.913.552 1.278.056 1.689.069 4.947.063s3.668-.021 4.947-.082c1.28-.06 2.147-.265 2.91-.563a5.9 5.9 0 0 0 2.123-1.388 5.9 5.9 0 0 0 1.38-2.129c.295-.763.496-1.636.551-2.912.056-1.28.07-1.69.063-4.948-.006-3.258-.02-3.667-.081-4.947-.06-1.28-.264-2.148-.564-2.911a5.9 5.9 0 0 0-1.387-2.123 5.86 5.86 0 0 0-2.128-1.38C19.074.322 18.202.12 16.924.066 15.647.009 15.236-.006 11.977 0S8.31.021 7.03.084m.14 21.693c-1.17-.05-1.805-.245-2.228-.408a3.7 3.7 0 0 1-1.382-.895 3.7 3.7 0 0 1-.9-1.378c-.165-.423-.363-1.058-.417-2.228-.06-1.264-.072-1.644-.08-4.848-.006-3.204.006-3.583.061-4.848.05-1.169.246-1.805.408-2.228.216-.561.477-.96.895-1.382a3.7 3.7 0 0 1 1.379-.9c.423-.165 1.057-.361 2.227-.417 1.265-.06 1.644-.072 4.848-.08 3.203-.006 3.583.006 4.85.062 1.168.05 1.804.244 2.227.408.56.216.96.475 1.382.895s.681.817.9 1.378c.165.422.362 1.056.417 2.227.06 1.265.074 1.645.08 4.848.005 3.203-.006 3.583-.061 4.848-.051 1.17-.245 1.805-.408 2.23-.216.56-.477.96-.896 1.38a3.7 3.7 0 0 1-1.378.9c-.422.165-1.058.362-2.226.418-1.266.06-1.645.072-4.85.079s-3.582-.006-4.848-.06m9.783-16.192a1.44 1.44 0 1 0 1.437-1.442 1.44 1.44 0 0 0-1.437 1.442M5.839 12.012a6.161 6.161 0 1 0 12.323-.024 6.162 6.162 0 0 0-12.323.024M8 12.008A4 4 0 1 1 12.008 16 4 4 0 0 1 8 12.008",
    tiktok: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07",
    whatsapp: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52s.198-.298.298-.497c.099-.198.05-.371-.025-.52s-.669-1.612-.916-2.207c-.242-.579-.487-.5-.669-.51a13 13 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074s2.096 3.2 5.077 4.487c.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413s.248-1.289.173-1.413c-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.82 11.82 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.9 11.9 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413",
    youtube: "M23.498 6.186a3.02 3.02 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.02 3.02 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.02 3.02 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.02 3.02 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814M9.545 15.568V8.432L15.818 12z"
  };
  function brandIcon(k) {
    return BRAND_PATHS[k] ? '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="i-brand"><path fill="currentColor" d="' + BRAND_PATHS[k] + '"/></svg>' : "";
  }

  /* ───── وسائل التواصل: مصدرها الوحيد js/config.js ───── */
  function socialKeys() {
    var s = cfg.social || {};
    return Object.keys(s).filter(function (k) { return /^https:\/\//i.test(s[k] || ""); });
  }
  function socialIcons(cls) {
    var s = cfg.social || {};
    return socialKeys().map(function (k) {
      var name = t("soc." + k), icon = brandIcon(k);
      return '<li><a class="soc soc--' + k + (cls ? " " + cls : "") + '" href="' + esc(s[k]) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(name + " — " + t("ext.new")) + '" title="' + esc(name) + '">' +
        (icon || esc(name)) + "</a></li>";
    }).join("");
  }
  function waUrl() { var u = (cfg.social || {}).whatsapp || ""; return /^https:\/\//i.test(u) ? u : ""; }
  function phoneInfo() {
    var ph = (cfg.contact || {}).phone || "";
    return ph ? { text: ph, tel: "tel:" + ph.replace(/[^\d+]/g, "") } : null;
  }

  // صندوق «تحتاج مساعدة؟» في صفحة إتمام الطلب
  function contactBox() {
    var wa = waUrl(), ph = phoneInfo(), soc = socialIcons("");
    if (!wa && !ph && !soc) return "";
    return '<aside class="chelp" aria-labelledby="chelp-h"><h2 class="chelp__h" id="chelp-h">' + esc(t("contact.help")) + "</h2>" +
      '<p class="chelp__t">' + esc(t("contact.helpText")) + "</p>" +
      '<div class="chelp__act">' +
      (wa ? '<a class="btn btn--wa" href="' + esc(wa) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(t("contact.whatsappCta") + " — " + t("ext.new")) + '">' + brandIcon("whatsapp") + "<span>" + esc(t("contact.whatsappCta")) + "</span></a>" : "") +
      (ph ? '<a class="btn btn--outline" href="' + esc(ph.tel) + '">' + ICON.phone + '<span dir="ltr">' + esc(ph.text) + "</span></a>" : "") + "</div>" +
      (soc ? '<ul class="socrow" aria-label="' + esc(t("contact.social")) + '">' + soc + "</ul>" : "") + "</aside>";
  }

  // زر واتساب العائم: يفتح محادثة مباشرة مع الرقم المضبوط في الإعدادات؛ لا يظهر إن لم يُضبط
  function renderFloat() {
    var old = document.getElementById("wa-float"); if (old) old.remove();
    var wa = waUrl(); if (!wa) return;
    var a = document.createElement("a");
    a.id = "wa-float"; a.className = "wa-float"; a.href = wa; a.target = "_blank"; a.rel = "noopener noreferrer";
    a.setAttribute("aria-label", t("wa.float") + " — " + t("ext.new"));
    a.innerHTML = brandIcon("whatsapp") + '<span class="wa-float__t">' + esc(t("wa.floatShort")) + "</span>";
    document.body.appendChild(a);
  }

  var NAV = [
    { k: "home", href: "index.html", key: "nav.home" },
    { k: "all", href: "catalogue.html", key: "nav.all" },
    { k: "men", href: "catalogue.html?cat=men", key: "nav.men" },
    { k: "women", href: "catalogue.html?cat=women", key: "nav.women" },
    { k: "unisex", href: "catalogue.html?cat=unisex", key: "nav.unisex" },
    { k: "oriental", href: "catalogue.html?cat=oriental", key: "nav.oriental" },
    { k: "luxury", href: "catalogue.html?cat=luxury", key: "nav.luxury" },
    { k: "offers", href: "catalogue.html?cat=offers", key: "nav.offers" }
  ];

  function activeKey(page) {
    if (page === "home") return "home";
    if (page === "catalog") {
      var sp = new URLSearchParams(location.search), c = sp.get("cat") || sp.get("gender");
      return c && NAV.some(function (n) { return n.k === c; }) ? c : "all";
    }
    return page === "product" ? "all" : "";
  }

  function navHtml(page, cls) {
    var act = activeKey(page);
    return NAV.map(function (n) {
      return '<a class="' + cls + (n.k === act ? " is-active" : "") + '" href="' + BASE + n.href + '"' +
        (n.k === act ? ' aria-current="page"' : "") + ' data-i18n="' + n.key + '">' + esc(t(n.key)) + "</a>";
    }).join("");
  }

  function renderHeader(page) {
    var host = document.getElementById("site-header");
    if (!host) return;
    host.innerHTML =
      '<a class="skip-link" href="#main" data-i18n="nav.skip">' + esc(t("nav.skip")) + "</a>" +
      '<div class="demo-bar" id="demo-bar" hidden><span data-i18n="demo.notice">' + esc(t("demo.notice")) + "</span></div>" +
      '<header class="hdr"><div class="container hdr__in">' +
      '<button class="icon-btn hdr__burger" id="burger" type="button" aria-expanded="false" aria-controls="drawer" data-i18n-attr="aria-label:nav.menu">' + ICON.menu + "</button>" +
      '<a class="hdr__logo" href="' + BASE + 'index.html" data-i18n-attr="aria-label:nav.home"><img src="' + BASE + 'assets/img/logo-circle-128.png" srcset="' + BASE + 'assets/img/logo-circle-128.png 1x, ' + BASE + 'assets/img/logo-circle-256.png 2x" width="56" height="56" alt="' + esc(t("logo.alt")) + '" data-i18n-attr="alt:logo.alt"></a>' +
      '<nav class="hdr__nav" aria-label="Main">' + navHtml(page, "hdr__link") + "</nav>" +
      '<div class="hdr__tools">' +
      '<button class="icon-btn" id="btn-search" type="button" data-i18n-attr="aria-label:ui.search">' + ICON.search + "</button>" +
      '<button class="lang-btn" id="btn-lang" type="button" data-i18n-attr="title:ui.langTitle">' + ICON.globe + '<span data-i18n="ui.lang">' + esc(t("ui.lang")) + "</span></button>" +
      '<a class="icon-btn cart-btn" id="btn-cart" href="' + BASE + 'panier.html" aria-label="' + esc(t("cart.aria", { n: C.count() })) + '">' + ICON.bag + '<span class="cart-count" id="cart-count" aria-hidden="true">' + C.count() + "</span></a>" +
      "</div></div></header>" +
      // قائمة الهاتف
      '<div class="drawer" id="drawer" hidden><div class="drawer__bg" data-close></div>' +
      '<aside class="drawer__panel" role="dialog" aria-modal="true" data-i18n-attr="aria-label:nav.menu">' +
      '<div class="drawer__top"><img src="' + BASE + 'assets/img/logo-circle-128.png" width="64" height="64" alt="" aria-hidden="true">' +
      '<button class="icon-btn" type="button" data-close data-i18n-attr="aria-label:nav.close">' + ICON.close + "</button></div>" +
      '<nav class="drawer__nav">' + navHtml(page, "drawer__link") + "</nav></aside></div>" +
      // نافذة البحث
      '<div class="sbox" id="sbox" hidden><div class="sbox__bg" data-close></div>' +
      '<div class="sbox__panel" role="dialog" aria-modal="true" data-i18n-attr="aria-label:ui.search">' +
      '<form id="sform" class="sbox__form" role="search" action="' + BASE + 'catalogue.html" method="get">' +
      '<input id="sinput" name="q" type="search" autocomplete="off" data-i18n-attr="placeholder:ui.searchPlaceholder;aria-label:ui.search" placeholder="' + esc(t("ui.searchPlaceholder")) + '">' +
      '<button class="btn btn--gold" type="submit" data-i18n="ui.searchGo">' + esc(t("ui.searchGo")) + "</button>" +
      '<button class="icon-btn" type="button" data-close data-i18n-attr="aria-label:nav.close">' + ICON.close + "</button></form>" +
      '<div id="sres" class="sbox__res" aria-live="polite"></div></div></div>' +
      '<div class="toast" id="toast" role="status" aria-live="polite" hidden></div>';

    bindHeader();
    var skip = host.querySelector(".skip-link");
    if (skip) skip.addEventListener("click", function (e) {
      e.preventDefault(); var m = document.getElementById("main");
      if (m) { m.setAttribute("tabindex", "-1"); m.focus(); }
    });
  }

  var lastFocus = null;
  function openLayer(el, focusEl) {
    lastFocus = document.activeElement;
    el.hidden = false; document.body.classList.add("no-scroll");
    if (focusEl) setTimeout(function () { focusEl.focus(); }, 30);
  }
  function closeLayer(el) {
    el.hidden = true;
    if (document.getElementById("drawer").hidden && document.getElementById("sbox").hidden) document.body.classList.remove("no-scroll");
    document.getElementById("burger").setAttribute("aria-expanded", "false");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  var toastTimer;
  function toast(msg, link) { // link: {href, label} اختياري
    var el = document.getElementById("toast"); if (!el) return;
    el.textContent = msg;
    if (link) { var a = document.createElement("a"); a.href = link.href; a.textContent = link.label; el.appendChild(document.createTextNode(" ")); el.appendChild(a); }
    el.hidden = false; el.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-on"); el.hidden = true; }, link ? 4200 : 2600);
  }

  function updateCartBadge() {
    var n = C.count(), b = document.getElementById("cart-count"), a = document.getElementById("btn-cart");
    if (b) { b.textContent = n > 99 ? "99+" : n; b.classList.toggle("is-empty", n === 0); }
    if (a) a.setAttribute("aria-label", t("cart.aria", { n: n }));
  }

  // يضيف عطراً إلى السلة ويعرض النتيجة في تنبيه صغير. يُستعمل من البطاقات وصفحة التفاصيل.
  function addToCart(p, qty) {
    var r = C.add(p, qty), name = I.pick(p, "name");
    var link = { href: BASE + "panier.html", label: t("add.viewCart") };
    if (!r.ok) toast(r.reason === "out_of_stock" ? t("add.out") : t("add.max", { n: r.max }));
    else if (r.clamped) toast(t("add.partial", { n: r.max }), link);
    else toast(t("add.added", { name: name }), link);
    return r;
  }

  function bindHeader() {
    var drawer = document.getElementById("drawer"), sbox = document.getElementById("sbox");
    var burger = document.getElementById("burger");
    burger.addEventListener("click", function () { burger.setAttribute("aria-expanded", "true"); openLayer(drawer, drawer.querySelector(".drawer__link")); });
    document.getElementById("btn-search").addEventListener("click", function () { openLayer(sbox, document.getElementById("sinput")); });
    [drawer, sbox].forEach(function (L) {
      L.addEventListener("click", function (e) { if (e.target.closest("[data-close]")) closeLayer(L); });
      if (L === drawer) L.addEventListener("click", function (e) { if (e.target.closest("a")) { L.hidden = true; document.body.classList.remove("no-scroll"); } });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { if (!drawer.hidden) closeLayer(drawer); if (!sbox.hidden) closeLayer(sbox); }
    });
    document.getElementById("btn-lang").addEventListener("click", function () { I.toggle(); });

    var inp = document.getElementById("sinput"), res = document.getElementById("sres");
    inp.addEventListener("input", function () {
      var q = inp.value.trim().toLowerCase();
      if (q.length < 2) { res.innerHTML = ""; return; }
      D.load().then(function (d) {
        var hits = d.products.filter(function (p) { return searchText(p).indexOf(q) > -1; }).slice(0, 5);
        res.innerHTML = hits.length ? hits.map(function (p) {
          return '<a class="sres__item" href="' + D.productUrl(p) + '"><img src="' + esc(D.img(p.images[0] || "")) + '" alt="" width="48" height="60" loading="lazy"><span><strong>' +
            esc(I.pick(p, "name")) + "</strong><small>" + esc(p.brand) + " · " + esc(I.fmtPrice(p.price)) + "</small></span></a>";
        }).join("") : '<p class="sres__none">' + esc(t("ui.noResultsShort")) + "</p>";
      }).catch(function () { res.innerHTML = ""; });
    });
  }

  function searchText(p) { return F.searchText(p); }

  function renderFooter() {
    var host = document.getElementById("site-footer"); if (!host) return;
    var c = cfg.contact, s = cfg.social;
    var contactRows = [];
    if (c.phone) contactRows.push(["contact.phone", '<a href="tel:' + esc(c.phone.replace(/[^\d+]/g, "")) + '" dir="ltr">' + esc(c.phone) + "</a>"]);
    if (c.email) contactRows.push(["contact.email", '<a href="mailto:' + esc(c.email) + '" dir="ltr">' + esc(c.email) + "</a>"]);
    if (c.address) contactRows.push(["contact.address", "<span>" + esc(c.address) + "</span>"]);
    if (c.workingHours) contactRows.push(["contact.hours", "<span>" + esc(c.workingHours) + "</span>"]);
    var social = socialIcons("");

    host.innerHTML =
      '<footer class="ftr"><div class="container">' +
      '<div class="ftr__grid">' +
      '<div class="ftr__brand"><img src="' + BASE + 'assets/img/logo-circle-256.png" width="132" height="132" loading="lazy" alt="' + esc(t("logo.alt")) + '" data-i18n-attr="alt:logo.alt"></div>' +
      '<div><h2 class="ftr__h" data-i18n="foot.shop">' + esc(t("foot.shop")) + '</h2><ul class="ftr__list">' +
      NAV.filter(function (n) { return n.k !== "home" && n.k !== "offers"; }).concat([{ href: "catalogue.html?cat=economy", key: "cat.economy" }, { href: "catalogue.html?cat=new", key: "cat.new" }, { href: "catalogue.html?cat=bestsellers", key: "cat.bestsellers" }, { href: "catalogue.html?cat=offers", key: "nav.offers" }])
        .map(function (n) { return '<li><a href="' + BASE + n.href + '" data-i18n="' + n.key + '">' + esc(t(n.key)) + "</a></li>"; }).join("") + "</ul></div>" +
      '<div><h2 class="ftr__h" data-i18n="foot.contact">' + esc(t("foot.contact")) + "</h2>" +
      (contactRows.length ? '<ul class="ftr__list ftr__contact">' + contactRows.map(function (r) { return '<li><b data-i18n="' + r[0] + '">' + esc(t(r[0])) + "</b>" + r[1] + "</li>"; }).join("") + "</ul>"
        : '<p class="ftr__muted" data-i18n="foot.contactSoon">' + esc(t("foot.contactSoon")) + "</p>") +
      (social ? '<h2 class="ftr__h ftr__h--sub" data-i18n="foot.follow">' + esc(t("foot.follow")) + '</h2><ul class="ftr__social">' + social + "</ul>" : "") + "</div>" +
      '<div><h2 class="ftr__h" data-i18n="foot.legal">' + esc(t("foot.legal")) + '</h2><ul class="ftr__list">' +
      '<li><a href="' + BASE + 'privacy.html" data-i18n="foot.privacy">' + esc(t("foot.privacy")) + "</a></li>" +
      '<li><a href="' + BASE + 'terms.html" data-i18n="foot.terms">' + esc(t("foot.terms")) + "</a></li></ul></div>" +
      "</div>" +
      '<div class="ftr__bar"><p>© <span id="yr">' + new Date().getFullYear() + '</span> <span dir="auto">' + esc(cfg.brand.nameAr) + " | " + esc(cfg.brand.nameLatin) + '</span> — <span data-i18n="foot.rights">' + esc(t("foot.rights")) + "</span></p></div>" +
      "</div></footer>";
  }

  function badgesFor(p) {
    var b = [];
    if (D.isNew(p)) b.push('<span class="badge badge--new">' + esc(t("card.new")) + "</span>");
    if (D.isBest(p)) b.push('<span class="badge badge--best">' + esc(t("card.best")) + "</span>");
    if (D.isOffer(p)) b.push('<span class="badge badge--offer">' + esc(t("card.offer")) + "</span>");
    return b.join("");
  }

  function typeLabel(p) {
    var a = p.authenticity;
    if (a.type === "inspired") return t("card.inspired");
    return a.verified ? t("card.originalVerified") : "";
  }

  // «اطلب الآن»: طلب مباشر لعطر واحد دون المرور بالسلة ودون تعديلها. المنتج والكمية يُمرَّران في الرابط.
  function orderNowUrl(p, qty) {
    return BASE + "commande.html?now=" + encodeURIComponent(p.id) + "&qty=" + Math.max(1, Math.floor(Number(qty) || 1));
  }
  function orderNowBtn(p, name) {
    if (C.maxQty(p) < 1) return '<button class="btn btn--block pcard__now" type="button" disabled>' + esc(t("add.outBtn")) + "</button>";
    return '<a class="btn btn--gold btn--block pcard__now" href="' + esc(orderNowUrl(p, 1)) + '" aria-label="' + esc(t("buy.nowAria", { name: name })) + '">' + esc(t("buy.nowShort")) + "</a>";
  }

  function card(p, eager) {
    var name = I.pick(p, "name"), url = D.productUrl(p);
    var tl = typeLabel(p);
    var meta = [];
    if (p.sizeMl) meta.push('<span>' + p.sizeMl + " " + esc(t("ml")) + "</span>");
    if (p.concentration) meta.push("<span>" + esc(p.concentration) + "</span>");
    meta.push("<span>" + esc(t("gender." + p.gender)) + "</span>");
    var img = p.images[0] ? D.img(p.images[0]) : "", avail = C.maxQty(p) >= 1;
    return '<article class="pcard' + (p.stock === "out_of_stock" ? " is-out" : "") + '">' +
      '<a class="pcard__media" href="' + url + '" tabindex="-1" aria-hidden="true">' +
      '<img src="' + esc(img) + '" alt="' + esc(name + " — " + p.brand) + '" width="600" height="750" ' + (eager ? "" : 'loading="lazy" ') + 'decoding="async">' +
      '<div class="pcard__badges">' + badgesFor(p) + "</div>" +
      (p.isDemo ? '<span class="pcard__demo">' + esc(t("demo.tag")) + "</span>" : "") + "</a>" +
      '<div class="pcard__body">' +
      '<p class="pcard__brand">' + esc(p.brand) + "</p>" +
      '<h3 class="pcard__name"><a href="' + url + '">' + esc(name) + "</a></h3>" +
      '<p class="pcard__meta">' + meta.join('<i aria-hidden="true">•</i>') + "</p>" +
      '<div class="pcard__row"><span class="stock stock--' + esc(p.stock) + '">' + esc(t("stock." + p.stock)) + "</span>" +
      (tl ? '<span class="pcard__type">' + esc(tl) + "</span>" : "") + "</div>" +
      '<div class="pcard__price"><strong>' + esc(I.fmtPrice(p.price)) + "</strong>" +
      (D.isOffer(p) ? "<s>" + esc(I.fmtPrice(p.compareAtPrice)) + "</s>" : "") +
      (avail ? '<button class="pcard__add" type="button" data-add="' + esc(p.id) + '" aria-label="' + esc(t("add.quick") + " — " + name) + '" title="' + esc(t("add.quick")) + '">' + ICON.plus + "</button>" : "") + "</div>" +
      '<a class="btn btn--outline btn--block" href="' + url + '">' + esc(t("card.details")) + ICON.arrow + "</a>" +
      orderNowBtn(p, name) +
      "</div></article>";
  }

  function init(page) {
    renderHeader(page);
    updateCartBadge();
    renderFooter();
    renderFloat();
    I.apply();
    D.load().then(function (d) {
      var bar = document.getElementById("demo-bar");
      if (bar && d.isDemoData) bar.hidden = false;
    }).catch(function () {});
    document.addEventListener("athar:cart", updateCartBadge);
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-add]"); if (!b) return;
      e.preventDefault();
      D.getById(b.getAttribute("data-add")).then(function (p) { if (p) addToCart(p, 1); });
    });
    document.addEventListener("langchange", function () {
      renderHeader(page); renderFooter(); renderFloat(); I.apply(); updateCartBadge();
      D.load().then(function (d) { var bar = document.getElementById("demo-bar"); if (bar && d.isDemoData) bar.hidden = false; });
    });
  }

  window.ATHAR_UI = { init: init, card: card, esc: esc, toast: toast, addToCart: addToCart, orderNowUrl: orderNowUrl, contactBox: contactBox, ICON: ICON, searchText: searchText, typeLabel: typeLabel, badgesFor: badgesFor };
})();
