/* صفحة تفاصيل العطر */
(function () {
  var I = window.ATHAR_I18N, D = window.ATHAR_DATA, U = window.ATHAR_UI, C = window.ATHAR_CART, LB = window.ATHAR_LB, cfg = window.ATHAR_CONFIG, t = I.t, esc = U.esc;
  var BASE = window.ATHAR_BASE || "";
  var root = document.getElementById("product-root");
  var current = null, data = null, imgIdx = 0;

  function slug() {
    if (window.ATHAR_SLUG) return window.ATHAR_SLUG;
    var q = new URLSearchParams(location.search).get("slug");
    if (q) return q;
    var m = location.pathname.match(/\/parfum\/([^\/]+)\/?$/);
    return m ? decodeURIComponent(m[1]) : "";
  }

  function setMeta(sel, attr, val) {
    var el = document.querySelector(sel); if (el) el.setAttribute(attr, val);
  }

  function updateHead(p) {
    var name = I.pick(p, "name"), desc = I.pick(p, "description");
    document.title = name + " — " + p.brand + " | " + cfg.brand.nameLatin;
    setMeta('meta[name="description"]', "content", (desc || "").slice(0, 160));
    setMeta('meta[property="og:title"]', "content", document.title);
    setMeta('meta[property="og:description"]', "content", (desc || "").slice(0, 160));
    var robots = document.querySelector('meta[name="robots"]');
    if (robots && window.ATHAR_SLUG && !p.isDemo && !data.isDemoData) robots.setAttribute("content", "index,follow");
  }

  function noteList(arr) {
    if (!arr || !arr.length) return "";
    return arr.map(function (n) { return "<li>" + esc(I.lang === "fr" ? (n.fr || n.ar) : (n.ar || n.fr)) + "</li>"; }).join("");
  }

  function spec(label, val, ltr) {
    if (val == null || val === "") return "";
    return "<div><dt>" + esc(label) + "</dt><dd" + (ltr ? ' dir="ltr"' : "") + ">" + val + "</dd></div>";
  }

  var qty = 1;

  function buybox(p) {
    var max = C.maxQty(p), inCart = C.qtyOf(p.id);
    if (max < 1) return '<div class="buy"><button class="btn btn--block" type="button" disabled>' + esc(t("add.outBtn")) + "</button></div>";
    return '<div class="buy"><label class="buy__lbl" for="buy-qty">' + esc(t("p.qty")) + '</label>' +
      '<div class="qty" role="group" aria-label="' + esc(t("p.qty")) + '">' +
      '<button type="button" class="qty__btn" id="buy-dec" aria-label="' + esc(t("cart.dec")) + '">−</button>' +
      '<input id="buy-qty" class="qty__input" type="number" inputmode="numeric" min="1" max="' + max + '" value="' + qty + '">' +
      '<button type="button" class="qty__btn" id="buy-inc" aria-label="' + esc(t("cart.inc")) + '">+</button></div>' +
      '<button class="btn btn--gold buy__add" type="button" id="buy-add">' + U.ICON.plus + "<span>" + esc(t("add.btn")) + "</span></button>" +
      '<button class="btn btn--outline buy__now" type="button" id="buy-now">' + esc(t("buy.now")) + "</button></div>" +
      '<p class="buy__info" id="buy-info" aria-live="polite">' + (inCart ? esc(t("add.inCart", { n: inCart })) + ' · <a href="' + BASE + 'panier.html">' + esc(t("add.viewCart")) + "</a>" : "") + "</p>";
  }

  function bindBuybox(p) {
    var inp = document.getElementById("buy-qty"); if (!inp) return;
    var max = C.maxQty(p);
    function clamp() { var v = Math.floor(Number(inp.value)); if (!isFinite(v) || v < 1) v = 1; if (v > max) v = max; inp.value = v; qty = v; }
    document.getElementById("buy-dec").addEventListener("click", function () { inp.value = Number(inp.value) - 1; clamp(); });
    document.getElementById("buy-inc").addEventListener("click", function () { inp.value = Number(inp.value) + 1; clamp(); });
    inp.addEventListener("change", clamp);
    // «اطلب الآن»: ينتقل مباشرة إلى إتمام الطلب بهذا العطر وهذه الكمية، دون إضافة إلى السلة ودون تغييرها
    document.getElementById("buy-now").addEventListener("click", function () {
      clamp(); window.location.href = U.orderNowUrl(p, qty);
    });
    document.getElementById("buy-add").addEventListener("click", function () {
      clamp(); U.addToCart(p, qty);
      var n = C.qtyOf(p.id), info = document.getElementById("buy-info");
      if (info) info.innerHTML = n ? esc(t("add.inCart", { n: n })) + ' · <a href="' + BASE + 'panier.html">' + esc(t("add.viewCart")) + "</a>" : "";
    });
  }

  function render() {
    if (!current) return;
    var p = current, name = I.pick(p, "name"), desc = I.pick(p, "description");
    var imgs = p.images.length ? p.images : [""];
    var tl = U.typeLabel(p);
    var notes = p.notes || {};
    var hasNotes = (notes.top && notes.top.length) || (notes.heart && notes.heart.length) || (notes.base && notes.base.length);
    var save = D.isOffer(p) ? p.compareAtPrice - p.price : 0;
    var authNote = p.authenticity.type === "inspired" ? t("p.inspiredNote") : (p.authenticity.verified ? "" : t("p.originalUnverified"));
    var typeVal = p.authenticity.type === "inspired" ? t("card.inspired") : (p.authenticity.verified ? t("card.originalVerified") : t("card.original"));
    var country = p.originCountry ? t("country." + p.originCountry) : "";
    if (country === "country." + p.originCountry) country = p.originCountry;

    root.innerHTML =
      '<nav class="crumbs" aria-label="breadcrumb"><a href="' + BASE + 'index.html">' + esc(t("nav.home")) + '</a><i aria-hidden="true">/</i><a href="' + BASE + 'catalogue.html">' + esc(t("p.back")) + '</a><i aria-hidden="true">/</i><span aria-current="page">' + esc(name) + "</span></nav>" +
      '<div class="pd">' +
      '<div class="pd__gallery" aria-label="' + esc(t("p.gallery")) + '">' +
      '<div class="pd__main"><button type="button" class="pd__zoom" id="pd-zoom" aria-label="' + esc(t("lb.open")) + '"><img id="pd-main" src="' + esc(D.img(imgs[0])) + '" alt="' + esc(name + " — " + p.brand) + '" width="600" height="750" fetchpriority="high"><span class="pd__zoomicon" aria-hidden="true">' + U.ICON.zoom + '</span></button>' +
      '<div class="pcard__badges">' + U.badgesFor(p) + "</div>" + (p.isDemo ? '<span class="pcard__demo">' + esc(t("demo.tag")) + "</span>" : "") + "</div>" +
      (imgs.length > 1 ? '<div class="pd__thumbs">' + imgs.map(function (src, i) {
        return '<button type="button" class="pd__thumb' + (i === 0 ? " is-on" : "") + '" data-i="' + i + '" aria-label="' + esc(t("p.zoom", { n: i + 1 })) + '"><img src="' + esc(D.img(src)) + '" alt="" width="90" height="112" loading="lazy"></button>';
      }).join("") + "</div>" : "") + "</div>" +
      '<div class="pd__info">' +
      '<p class="pd__brand">' + esc(p.brand) + (tl ? ' <span class="pd__type">' + esc(tl) + "</span>" : "") + "</p>" +
      '<h1 class="pd__name">' + esc(name) + "</h1>" +
      '<div class="pd__price"><strong>' + esc(I.fmtPrice(p.price)) + "</strong>" + (save ? "<s>" + esc(I.fmtPrice(p.compareAtPrice)) + '</s><span class="badge badge--offer">' + esc(t("p.save", { n: I.fmtPrice(save) })) + "</span>" : "") + "</div>" +
      '<p class="pd__stock"><span class="stock stock--' + esc(p.stock) + '">' + esc(t("stock." + p.stock)) + "</span></p>" +
      (desc ? '<h2 class="pd__h">' + esc(t("p.description")) + '</h2><p class="pd__desc">' + esc(desc) + "</p>" : "") +
      '<dl class="specs">' +
      spec(t("p.brand"), esc(p.brand)) +
      spec(t("p.size"), p.sizeMl ? p.sizeMl + " " + esc(t("ml")) : "") +
      spec(t("p.concentration"), p.concentration ? esc(p.concentration) + (t("conc." + p.concentration) !== "conc." + p.concentration && t("conc." + p.concentration) !== p.concentration ? " — " + esc(t("conc." + p.concentration)) : "") : "") +
      spec(t("p.target"), esc(t("gender." + p.gender))) +
      spec(t("p.origin"), esc(country)) +
      spec(t("p.family"), p.family ? esc(t("fam." + p.family)) : "") +
      spec(t("p.type"), esc(typeVal)) +
      spec(t("p.availability"), esc(t("stock." + p.stock))) +
      (typeof p.stockQty === "number" && !p.isDemo && !data.isDemoData ? spec(t("p.qtyAvail"), String(p.stockQty)) : "") +
      spec(t("p.id"), esc(p.id), true) +
      "</dl>" +
      (authNote ? '<p class="pd__note">' + esc(authNote) + "</p>" : "") +
      (p.isDemo ? '<p class="pd__note pd__note--demo">' + esc(t("p.demoNote")) + "</p>" : "") +
      buybox(p) +
      "</div></div>" +
      (hasNotes ? '<section class="pyr" aria-labelledby="pyr-h"><h2 class="sec__h sec__h--sm" id="pyr-h">' + esc(t("p.notes")) + '</h2><div class="pyr__grid">' +
        ["top", "heart", "base"].map(function (k) {
          return notes[k] && notes[k].length ? '<div class="pyr__col"><h3>' + esc(t("p." + k)) + "</h3><ul>" + noteList(notes[k]) + "</ul></div>" : "";
        }).join("") + "</div></section>" : "") +
      '<section class="sim" id="sim" hidden aria-labelledby="sim-h"><h2 class="sec__h sec__h--sm" id="sim-h">' + esc(t("p.similar")) + '</h2><div class="grid" id="sim-grid"></div></section>';

    root.querySelectorAll(".pd__thumb").forEach(function (b) {
      b.addEventListener("click", function () {
        imgIdx = Number(b.getAttribute("data-i"));
        document.getElementById("pd-main").src = D.img(imgs[imgIdx]);
        root.querySelectorAll(".pd__thumb").forEach(function (x) { x.classList.toggle("is-on", x === b); });
      });
    });

    var zoomBtn = document.getElementById("pd-zoom");
    if (zoomBtn) zoomBtn.addEventListener("click", function () {
      LB.open(imgs.map(function (x) { return D.img(x); }), imgIdx, name + " — " + p.brand, zoomBtn);
    });
    bindBuybox(p);

    var sim = D.similar(p, data.products, 4);
    if (sim.length) {
      document.getElementById("sim").hidden = false;
      document.getElementById("sim-grid").innerHTML = sim.map(function (x) { return U.card(x); }).join("");
    }
    updateHead(p);
    jsonLd(p);
  }

  // بيانات منظمة: لا تُنشأ أبداً للمنتجات التجريبية (لا أسعار أو بيانات وهمية داخل البيانات المنظمة)
  function jsonLd(p) {
    var old = document.getElementById("ld-product"); if (old) old.remove();
    if (p.isDemo || data.isDemoData) return;
    var s = document.createElement("script"); s.type = "application/ld+json"; s.id = "ld-product";
    var url = cfg.siteUrl.replace(/\/$/, "") + "/parfum/" + p.slug + "/";
    s.textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "Product", name: I.pick(p, "name"), description: I.pick(p, "description"),
      sku: p.id, brand: { "@type": "Brand", name: p.brand },
      image: p.images.map(function (i) { return cfg.siteUrl.replace(/\/$/, "") + "/" + i; }),
      offers: { "@type": "Offer", url: url, priceCurrency: "DZD", price: p.price,
        availability: p.stock === "out_of_stock" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock" }
    });
    document.head.appendChild(s);
  }

  function notFound() {
    root.innerHTML = '<div class="state"><h1 class="pd__name">' + esc(t("p.notFound")) + '</h1><a class="btn btn--gold" href="' + BASE + 'catalogue.html">' + esc(t("p.back")) + "</a></div>";
    var robots = document.querySelector('meta[name="robots"]'); if (robots) robots.setAttribute("content", "noindex");
    document.title = t("p.notFound") + " | " + cfg.brand.nameLatin;
  }

  U.init("product");
  D.load().then(function (d) {
    data = d;
    var s = slug();
    current = d.products.filter(function (p) { return p.slug === s; })[0] || null;
    if (!current) return notFound();
    render();
  }).catch(function () {
    root.innerHTML = '<p class="state state--err" role="alert">' + esc(t("res.error")) + "</p>";
  });

  document.addEventListener("langchange", function () { if (current) render(); else if (data) notFound(); });
})();
