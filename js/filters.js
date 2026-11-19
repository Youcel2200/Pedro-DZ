/* منطق البحث والتصفية والترتيب — دوال نقية بلا DOM، قابلة للاختبار وإعادة الاستعمال. */
(function () {
  var D = window.ATHAR_DATA, cfg = window.ATHAR_CONFIG;
  var GENDERS = ["men", "women", "unisex"];

  function defaultState() {
    return { q: "", cat: "", gender: "", min: "", max: "", sizes: [], concs: [], type: "", stock: false, sort: "newest" };
  }

  // تطبيع للبحث: أحرف صغيرة + إزالة التشكيل والحركات + توحيد الألف والياء والتاء المربوطة
  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[ً-ٰٟ̀-ͯ]/g, "")
      .replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه");
  }
  function searchText(p) { return [p.nameAr, p.nameFr, p.brand, p.id].join(" ").toLowerCase(); }

  function fromParams(params) {
    var p = params instanceof URLSearchParams ? params : new URLSearchParams(params), s = defaultState();
    s.q = p.get("q") || ""; s.cat = p.get("cat") || ""; s.gender = p.get("gender") || "";
    if (GENDERS.indexOf(s.cat) > -1) { s.gender = s.cat; s.cat = ""; } // توافق مع الروابط القديمة ?cat=men
    s.min = p.get("min") || ""; s.max = p.get("max") || "";
    s.sizes = p.get("size") ? p.get("size").split(",") : [];
    s.concs = p.get("conc") ? p.get("conc").split(",") : [];
    s.type = p.get("type") || ""; s.stock = p.get("stock") === "1";
    s.sort = p.get("sort") || "newest";
    return s;
  }

  function toParams(s) {
    var p = new URLSearchParams();
    if (s.q) p.set("q", s.q);
    if (s.cat) p.set("cat", s.cat);
    if (s.gender) p.set("gender", s.gender);
    if (s.min) p.set("min", s.min);
    if (s.max) p.set("max", s.max);
    if (s.sizes.length) p.set("size", s.sizes.join(","));
    if (s.concs.length) p.set("conc", s.concs.join(","));
    if (s.type) p.set("type", s.type);
    if (s.stock) p.set("stock", "1");
    if (s.sort !== "newest") p.set("sort", s.sort);
    return p;
  }

  function activeCount(s) {
    return (s.q ? 1 : 0) + (s.cat ? 1 : 0) + (s.gender ? 1 : 0) + (s.min || s.max ? 1 : 0) + (s.sizes.length ? 1 : 0) +
      (s.concs.length ? 1 : 0) + (s.type ? 1 : 0) + (s.stock ? 1 : 0);
  }

  function apply(products, s) {
    var q = norm(s.q).trim();
    var min = s.min !== "" ? Number(s.min) : null, max = s.max !== "" ? Number(s.max) : null;
    var list = products.filter(function (p) {
      if (q && norm(searchText(p)).indexOf(q) === -1) return false;
      if (s.cat && !D.inCategory(p, s.cat)) return false;
      if (s.gender && p.gender !== s.gender) return false;
      if (min != null && p.price < min) return false;
      if (max != null && p.price > max) return false;
      if (s.sizes.length && s.sizes.indexOf(String(p.sizeMl)) === -1) return false;
      if (s.concs.length && s.concs.indexOf(p.concentration) === -1) return false;
      if (s.type && p.authenticity.type !== s.type) return false;
      if (s.stock && p.stock === "out_of_stock") return false;
      return true;
    });
    list.sort(function (a, b) {
      switch (s.sort) {
        case "priceAsc": return a.price - b.price;
        case "priceDesc": return b.price - a.price;
        case "popular": return (b.popularity || 0) - (a.popularity || 0);
        default: return a.addedAt < b.addedAt ? 1 : -1;
      }
    });
    return list;
  }

  function hasPopularity(products) {
    return cfg.features.popularitySort && products.some(function (p) { return p.popularity != null; });
  }

  window.ATHAR_FILTERS = { defaultState: defaultState, fromParams: fromParams, toParams: toParams, apply: apply, activeCount: activeCount, norm: norm, searchText: searchText, hasPopularity: hasPopularity, GENDERS: GENDERS };
})();
