/* طبقة البيانات: تحميل العطور وتطبيعها والتصنيف. تغيير المصدر لاحقاً (Supabase) لا يمس بقية الملفات. */
(function () {
  var cfg = window.ATHAR_CONFIG;
  var cache = null;

  var CATEGORY_KEYS = ["men", "women", "unisex", "oriental", "luxury", "economy", "new", "bestsellers"];

  function normalize(p) {
    var n = Object.assign({}, p);
    n.price = Number(p.price);
    n.compareAtPrice = p.compareAtPrice ? Number(p.compareAtPrice) : null;
    n.sizeMl = p.sizeMl ? Number(p.sizeMl) : null;
    n.categories = Array.isArray(p.categories) ? p.categories : [];
    n.badges = Array.isArray(p.badges) ? p.badges : [];
    n.images = Array.isArray(p.images) && p.images.length ? p.images : [];
    n.stock = p.stock || "in_stock";
    n.authenticity = p.authenticity || { type: "original", verified: false };
    n.notes = p.notes || {};
    n.popularity = typeof p.popularity === "number" ? p.popularity : null;
    n.stockQty = typeof p.stockQty === "number" && p.stockQty >= 0 ? Math.floor(p.stockQty) : null; // null = كمية غير معتمدة
    if (n.stockQty === 0) n.stock = "out_of_stock"; // مخزون صفر معتمد = غير متوفر
    return n;
  }

  function isValid(p) {
    return p && p.id && p.slug && (p.nameAr || p.nameFr) && isFinite(p.price) && p.price > 0;
  }

  function loadLocal() {
    var url = (window.ATHAR_BASE || "") + cfg.dataSource.localUrl;
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).catch(function (e) {
      // احتياط عند الفتح المباشر للملفات (file://): نسخة مدمجة يولّدها scripts/build.py
      if (window.ATHAR_PRODUCTS_DATA) return window.ATHAR_PRODUCTS_DATA;
      throw e;
    });
  }

  // يحوّل صفاً من جدول Supabase (أسماء snake_case) إلى شكل المنتج الموحّد المستخدم في المتجر.
  // هذا هو الموضع الوحيد الذي يعرف أسماء أعمدة قاعدة البيانات (انظر docs/INTEGRATION.md).
  function fromSupabaseRow(r) {
    return {
      id: r.id, slug: r.slug, nameAr: r.name_ar, nameFr: r.name_fr, brand: r.brand,
      descriptionAr: r.description_ar, descriptionFr: r.description_fr,
      price: r.price, compareAtPrice: r.compare_at_price, sizeMl: r.size_ml, concentration: r.concentration,
      categories: r.categories || [], gender: r.gender, originCountry: r.origin_country || "",
      authenticity: { type: r.authenticity_type || "original", verified: !!r.authenticity_verified },
      images: r.images || [], stock: r.stock_status, stockQty: r.stock_qty, published: r.published,
      addedAt: r.added_at ? String(r.added_at).slice(0, 10) : "", badges: r.badges || [],
      notes: r.notes || {}, family: r.family, popularity: r.popularity, isDemo: !!r.is_demo
    };
  }

  // جاهز للربط (لا يعمل إلا إذا mode:"supabase" في config.js — وهو غير مفعّل). يقرأ العرض storefront_products (المنشور فقط، بأسماء الحقول التي يعرفها المُحوِّل).
  // مسارات الصور في القاعدة نسبية داخل الحاوية product-images؛ تُحوَّل هنا إلى روابط عامة كاملة.
  function loadSupabase() {
    var ds = cfg.dataSource;
    if (!ds.supabaseUrl || !ds.supabaseKey) return Promise.reject(new Error("Supabase غير مُعدّ"));
    return fetch(ds.supabaseUrl + "/rest/v1/storefront_products?select=*&order=popularity.desc.nullslast", {
      headers: { apikey: ds.supabaseKey, Authorization: "Bearer " + ds.supabaseKey }
    }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (rows) {
        var pub = ds.supabaseUrl.replace(/\/+$/, "") + "/storage/v1/object/public/product-images/";
        return { isDemoData: false, products: rows.map(function (r) {
          var p = fromSupabaseRow(r);
          p.images = p.images.map(function (x) { return /^https?:\/\//.test(x) ? x : pub + String(x).split("/").map(encodeURIComponent).join("/"); });
          return p;
        }) };
      });
  }

  // رابط الصورة: كاملاً إن كان مصدره Storage، وإلا نسبياً من جذر الموقع (الوضع المحلي).
  function img(path) {
    path = path || "";
    return /^(https?:)?\/\/|^data:/.test(path) ? path : (window.ATHAR_BASE || "") + path;
  }

  // الرجوع التلقائي إلى النظام المحلي عند تعذّر الوصول لـ Supabase فقط (لا عند كون القاعدة فارغة) — يظهر عندها تنبيه البيانات التجريبية.
  function loadSource() {
    var ds = cfg.dataSource;
    if (ds.mode !== "supabase") return loadLocal();
    return loadSupabase().catch(function (e) {
      if (!ds.fallbackToLocal) throw e;
      console.warn("[Athar] تعذّر الوصول إلى Supabase، استُعمل النظام المحلي مؤقتاً:", e && e.message);
      return loadLocal();
    });
  }

  function load() {
    if (cache) return cache;
    cache = loadSource().then(function (raw) {
      var list = (raw.products || []).filter(function (p) { return p.published !== false; }).map(normalize).filter(isValid);
      return { isDemoData: !!raw.isDemoData, products: list };
    }).catch(function (e) {
      cache = null;
      console.error("[Athar] فشل تحميل البيانات:", e);
      throw e;
    });
    return cache;
  }

  // واجهة مستودع المنتجات: بقية الموقع يستعمل هذه الدوال فقط ولا يعرف مصدر البيانات.
  function getBySlug(slug) { return load().then(function (d) { return d.products.filter(function (p) { return p.slug === slug; })[0] || null; }); }
  function getById(id) { return load().then(function (d) { return d.products.filter(function (p) { return p.id === id; })[0] || null; }); }

  function daysSince(dateStr) {
    var d = new Date(dateStr); if (isNaN(d)) return 9999;
    return (Date.now() - d.getTime()) / 86400000;
  }

  function isNew(p) { return p.badges.indexOf("new") > -1; }
  function isBest(p) { return p.badges.indexOf("bestseller") > -1; }
  function isOffer(p) { return p.compareAtPrice && p.compareAtPrice > p.price; }

  function inCategory(p, key) {
    switch (key) {
      case "men": case "women": case "unisex": return p.gender === key;
      case "oriental": case "luxury": case "economy": return p.categories.indexOf(key) > -1;
      case "new": return isNew(p);
      case "bestsellers": return isBest(p);
      case "offers": return !!isOffer(p);
      default: return true;
    }
  }

  function similar(p, all, n) {
    n = n || 4;
    return all.filter(function (x) { return x.id !== p.id; }).map(function (x) {
      var s = 0;
      if (x.family && x.family === p.family) s += 3;
      if (x.gender === p.gender) s += 2;
      x.categories.forEach(function (c) { if (p.categories.indexOf(c) > -1) s += 1; });
      return { x: x, s: s };
    }).sort(function (a, b) { return b.s - a.s || (a.x.addedAt < b.x.addedAt ? 1 : -1); })
      .slice(0, n).map(function (o) { return o.x; });
  }

  function productUrl(p) { return (window.ATHAR_BASE || "") + "parfum.html?slug=" + encodeURIComponent(p.slug); }
  function catalogUrl(params) {
    var q = [];
    for (var k in params) if (params[k] !== "" && params[k] != null) q.push(encodeURIComponent(k) + "=" + encodeURIComponent(params[k]));
    return (window.ATHAR_BASE || "") + "catalogue.html" + (q.length ? "?" + q.join("&") : "");
  }

  window.ATHAR_DATA = {
    load: load, img: img, getBySlug: getBySlug, getById: getById, fromSupabaseRow: fromSupabaseRow, CATEGORY_KEYS: CATEGORY_KEYS, inCategory: inCategory, similar: similar,
    isNew: isNew, isBest: isBest, isOffer: isOffer, productUrl: productUrl, catalogUrl: catalogUrl, daysSince: daysSince
  };
})();
