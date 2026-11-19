/* الصفحة الرئيسية: أحدث العطور + العطور المميزة */
(function () {
  var I = window.ATHAR_I18N, D = window.ATHAR_DATA, U = window.ATHAR_UI, t = I.t, esc = U.esc;
  var BASE = window.ATHAR_BASE || "";

  function featuredCard(p) {
    var name = I.pick(p, "name"), desc = I.pick(p, "description"), url = D.productUrl(p);
    var tl = U.typeLabel(p);
    return '<article class="fcard">' +
      '<a class="fcard__media" href="' + url + '" tabindex="-1" aria-hidden="true"><img src="' + esc(D.img(p.images[0])) + '" alt="' + esc(name + " — " + p.brand) + '" width="600" height="750" loading="lazy" decoding="async">' +
      (p.isDemo ? '<span class="pcard__demo">' + esc(t("demo.tag")) + "</span>" : "") + "</a>" +
      '<div class="fcard__body">' +
      '<p class="fcard__brand">' + esc(p.brand) + (tl ? " · " + esc(tl) : "") + "</p>" +
      '<h3 class="fcard__name"><a href="' + url + '">' + esc(name) + "</a></h3>" +
      '<p class="fcard__desc">' + esc(desc) + "</p>" +
      '<p class="fcard__meta"><span>' + p.sizeMl + " " + esc(t("ml")) + "</span><i>•</i><span>" + esc(p.concentration || "") + "</span><i>•</i><span class=\"stock stock--" + esc(p.stock) + '">' + esc(t("stock." + p.stock)) + "</span></p>" +
      '<div class="fcard__foot"><strong>' + esc(I.fmtPrice(p.price)) + "</strong>" +
      '<a class="btn btn--gold" href="' + url + '">' + esc(t("card.details")) + U.ICON.arrow + "</a></div>" +
      "</div></article>";
  }

  function render(d) {
    var all = d.products;
    var latest = all.slice().sort(function (a, b) { return a.addedAt < b.addedAt ? 1 : -1; }).slice(0, 8);
    var grid = document.getElementById("latest-grid");
    grid.innerHTML = latest.map(function (p, i) { return U.card(p, i < 4); }).join("");

    var lux = all.filter(function (p) { return D.inCategory(p, "luxury"); })
      .sort(function (a, b) { return b.price - a.price; }).slice(0, 3);
    // «الأكثر طلباً» و«العروض»: لا تظهر إلا مع بيانات حقيقية (ليست تجريبية)
    var real = all.filter(function (p) { return !p.isDemo && !d.isDemoData; });
    var best = real.filter(function (p) { return D.isBest(p) || (p.popularity || 0) > 0; })
      .sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); }).slice(0, 4);
    var offers = real.filter(D.isOffer).slice(0, 4);
    document.getElementById("best").hidden = !best.length;
    document.getElementById("best-grid").innerHTML = best.map(function (p) { return U.card(p); }).join("");
    document.getElementById("offers").hidden = !offers.length;
    document.getElementById("offers-grid").innerHTML = offers.map(function (p) { return U.card(p); }).join("");

    var fs = document.getElementById("featured");
    fs.hidden = !lux.length;
    document.getElementById("featured-grid").innerHTML = lux.map(featuredCard).join("");
  }

  function boot() {
    D.load().then(render).catch(function () {
      var g = document.getElementById("latest-grid");
      g.innerHTML = '<p class="state state--err" role="alert">' + esc(t("res.error")) + "</p>";
    });
  }

  U.init("home");
  boot();
  document.addEventListener("langchange", boot);
})();
