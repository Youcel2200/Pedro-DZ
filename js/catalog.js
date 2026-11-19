/* صفحة الكتالوج (واجهة فقط): تقرأ الحالة وتعرض النتائج. منطق التصفية كله في filters.js */
(function () {
  var I = window.ATHAR_I18N, D = window.ATHAR_DATA, F = window.ATHAR_FILTERS, U = window.ATHAR_UI, t = I.t, esc = U.esc;
  var all = [], state = F.defaultState();
  var $ = function (id) { return document.getElementById(id); };

  function writeUrl() {
    var qs = F.toParams(state).toString();
    try { history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "")); } catch (e) {}
  }

  function uniq(arr) { return arr.filter(function (v, i) { return v != null && v !== "" && arr.indexOf(v) === i; }); }

  function buildControls() {
    var cats = ["oriental", "luxury", "economy", "new", "bestsellers", "offers"];
    $("f-cat").innerHTML = '<option value="">' + esc(t("cat.all")) + "</option>" +
      cats.map(function (c) { return '<option value="' + c + '">' + esc(t("cat." + c)) + "</option>"; }).join("");
    $("f-gender").innerHTML = '<option value="">' + esc(t("f.genderAll")) + "</option>" +
      F.GENDERS.map(function (g) { return '<option value="' + g + '">' + esc(t("gender." + g)) + "</option>"; }).join("");
    var sorts = [["newest", "f.sortNewest"], ["priceAsc", "f.sortPriceAsc"], ["priceDesc", "f.sortPriceDesc"]];
    if (F.hasPopularity(all)) sorts.push(["popular", "f.sortPopular"]);
    $("f-sort").innerHTML = sorts.map(function (s) { return '<option value="' + s[0] + '">' + esc(t(s[1])) + "</option>"; }).join("");
    $("f-type").innerHTML = '<option value="">' + esc(t("f.typeAll")) + '</option><option value="original">' + esc(t("f.typeOriginal")) +
      '</option><option value="inspired">' + esc(t("f.typeInspired")) + "</option>";
    var sizes = uniq(all.map(function (p) { return p.sizeMl; })).sort(function (a, b) { return a - b; });
    $("f-sizes").innerHTML = sizes.map(function (s) {
      return '<label class="chk"><input type="checkbox" name="size" value="' + s + '"><span>' + s + " " + esc(t("ml")) + "</span></label>";
    }).join("");
    var concs = uniq(all.map(function (p) { return p.concentration; }));
    $("f-concs").innerHTML = concs.map(function (c) {
      return '<label class="chk"><input type="checkbox" name="conc" value="' + esc(c) + '"><span>' + esc(c) + "</span></label>";
    }).join("");
  }

  function syncControls() {
    $("f-q").value = state.q; $("f-cat").value = state.cat; $("f-gender").value = state.gender;
    $("f-min").value = state.min; $("f-max").value = state.max;
    $("f-type").value = state.type; $("f-stock").checked = state.stock;
    var sortOk = Array.prototype.some.call($("f-sort").options, function (o) { return o.value === state.sort; });
    if (!sortOk) state.sort = "newest";
    $("f-sort").value = state.sort;
    document.querySelectorAll('input[name="size"]').forEach(function (c) { c.checked = state.sizes.indexOf(c.value) > -1; });
    document.querySelectorAll('input[name="conc"]').forEach(function (c) { c.checked = state.concs.indexOf(c.value) > -1; });
  }

  function titleFor() {
    if (state.cat) return t("cat." + state.cat);
    if (state.gender) return t("cat." + state.gender);
    return t("cat.h1");
  }

  function render() {
    var list = F.apply(all, state);
    $("cat-h1").textContent = titleFor();
    $("res-count").textContent = t("res.count", { n: list.length });
    var grid = $("grid");
    if (!list.length) {
      grid.innerHTML = '<div class="state"><p><strong>' + esc(t("res.none")) + "</strong></p><p>" + esc(t("res.noneHint")) +
        '</p><button class="btn btn--outline" type="button" id="reset2">' + esc(t("f.reset")) + "</button></div>";
      $("reset2").addEventListener("click", reset);
    } else {
      grid.innerHTML = list.map(function (p, i) { return U.card(p, i < 4); }).join("");
    }
    var n = F.activeCount(state);
    $("filters-n").textContent = n ? "(" + n + ")" : "";
    $("f-reset").disabled = n === 0 && state.sort === "newest";
    writeUrl();
  }

  function group(name, key) {
    document.querySelectorAll('input[name="' + name + '"]').forEach(function (c) {
      c.addEventListener("change", function () {
        state[key] = Array.prototype.filter.call(document.querySelectorAll('input[name="' + name + '"]'), function (x) { return x.checked; }).map(function (x) { return x.value; });
        render();
      });
    });
  }

  function reset() { state = F.defaultState(); syncControls(); render(); }

  function bind() {
    var deb;
    $("f-q").addEventListener("input", function (e) { state.q = e.target.value; clearTimeout(deb); deb = setTimeout(render, 120); });
    [["f-cat", "cat"], ["f-gender", "gender"], ["f-sort", "sort"], ["f-type", "type"]].forEach(function (x) {
      $(x[0]).addEventListener("change", function (e) { state[x[1]] = e.target.value; render(); });
    });
    $("f-stock").addEventListener("change", function (e) { state.stock = e.target.checked; render(); });
    ["f-min", "f-max"].forEach(function (id) {
      $(id).addEventListener("input", function (e) { state[id === "f-min" ? "min" : "max"] = e.target.value; clearTimeout(deb); deb = setTimeout(render, 200); });
    });
    group("size", "sizes"); group("conc", "concs");
    $("f-reset").addEventListener("click", reset);
    $("filters-toggle").addEventListener("click", function () {
      var open = $("filters").classList.toggle("is-open");
      $("filters-toggle").setAttribute("aria-expanded", String(open));
    });
    $("filters-apply").addEventListener("click", function () {
      $("filters").classList.remove("is-open"); $("filters-toggle").setAttribute("aria-expanded", "false");
      window.scrollTo({ top: $("grid").getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" });
    });
    $("f-form").addEventListener("submit", function (e) { e.preventDefault(); });
  }

  function start(d) {
    all = d.products;
    buildControls(); bind();
    state = F.fromParams(location.search); syncControls(); render();
  }

  U.init("catalog");
  D.load().then(start).catch(function () {
    $("grid").innerHTML = '<p class="state state--err" role="alert">' + esc(t("res.error")) + "</p>";
  });

  document.addEventListener("langchange", function () {
    if (!all.length) return;
    var keep = state; buildControls(); state = keep; syncControls(); group("size", "sizes"); group("conc", "concs"); render();
  });
})();
