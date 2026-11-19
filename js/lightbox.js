/* معرض الصور المكبّر: تنقل بالأزرار والمفاتيح والسحب باللمس، وتكبير بالنقر. يحترم اتجاه RTL/LTR. */
(function () {
  var I = window.ATHAR_I18N, t = I.t;
  var root, img, counter, thumbs, btnPrev, btnNext, btnClose, btnZoom, state = { list: [], i: 0, alt: "", zoom: false, trigger: null };

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  var SVG = {
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    chev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    zoom: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6M11 8v6M8 11h6"/></svg>'
  };

  function build() {
    if (root) return;
    root = el("div", "lb"); root.hidden = true; root.setAttribute("role", "dialog"); root.setAttribute("aria-modal", "true");
    root.innerHTML = '<div class="lb__bg" data-lb-close></div><div class="lb__box"><div class="lb__top"><span class="lb__count" dir="ltr" aria-live="polite"></span><div class="lb__tools"></div></div>' +
      '<div class="lb__stage"><button type="button" class="lb__nav lb__nav--prev"></button><div class="lb__imgwrap"><img class="lb__img" alt=""></div><button type="button" class="lb__nav lb__nav--next"></button></div><div class="lb__thumbs"></div></div>';
    document.body.appendChild(root);
    img = root.querySelector(".lb__img"); counter = root.querySelector(".lb__count"); thumbs = root.querySelector(".lb__thumbs");
    btnPrev = root.querySelector(".lb__nav--prev"); btnNext = root.querySelector(".lb__nav--next");
    btnZoom = el("button", "lb__btn", SVG.zoom); btnZoom.type = "button";
    btnClose = el("button", "lb__btn", SVG.close); btnClose.type = "button";
    root.querySelector(".lb__tools").appendChild(btnZoom); root.querySelector(".lb__tools").appendChild(btnClose);
    btnPrev.innerHTML = SVG.chev; btnNext.innerHTML = SVG.chev;

    root.addEventListener("click", function (e) {
      // النقر على أي مساحة فارغة (خارج الصورة والأزرار) يغلق المعرض
      if (e.target.closest("[data-lb-close]") || (e.target.matches && e.target.matches(".lb__box, .lb__top, .lb__stage, .lb__imgwrap, .lb__thumbs"))) close();
    });
    btnClose.addEventListener("click", close);
    btnZoom.addEventListener("click", toggleZoom);
    btnPrev.addEventListener("click", function () { step(-1); });
    btnNext.addEventListener("click", function () { step(1); });
    img.addEventListener("click", function (e) { toggleZoom(e); });
    img.addEventListener("mousemove", function (e) {
      if (!state.zoom) return;
      var r = img.getBoundingClientRect();
      img.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + "% " + ((e.clientY - r.top) / r.height * 100) + "%";
    });
    // سحب باللمس
    var sx = null;
    root.querySelector(".lb__stage").addEventListener("touchstart", function (e) { sx = state.zoom ? null : e.touches[0].clientX; }, { passive: true });
    root.querySelector(".lb__stage").addEventListener("touchend", function (e) {
      if (sx == null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) < 45) return;
      var rtl = document.documentElement.dir === "rtl";
      step((dx < 0) === !rtl ? 1 : -1); // في LTR السحب لليسار = التالي، وفي RTL السحب لليمين = التالي
    });
    document.addEventListener("keydown", onKey);
    document.addEventListener("langchange", function () { if (!root.hidden) labels(); });
  }

  function labels() {
    root.setAttribute("aria-label", t("p.gallery"));
    btnClose.setAttribute("aria-label", t("lb.close")); btnZoom.setAttribute("aria-label", t("lb.zoom"));
    btnPrev.setAttribute("aria-label", t("lb.prev")); btnNext.setAttribute("aria-label", t("lb.next"));
    var rtl = document.documentElement.dir === "rtl";
    root.classList.toggle("is-rtl", rtl);
  }

  function show(i) {
    var n = state.list.length; state.i = (i + n) % n;
    img.src = state.list[state.i]; img.alt = state.alt; setZoom(false);
    counter.textContent = t("lb.counter", { i: state.i + 1, n: n });
    btnPrev.hidden = btnNext.hidden = n < 2;
    thumbs.hidden = n < 2;
    thumbs.querySelectorAll("button").forEach(function (b, k) { b.classList.toggle("is-on", k === state.i); });
  }
  function step(d) { if (state.list.length > 1) show(state.i + d); }
  function setZoom(z) { state.zoom = z; img.classList.toggle("is-zoomed", z); if (!z) img.style.transformOrigin = ""; }
  function toggleZoom(e) {
    if (!state.zoom && e && e.clientX != null && img.getBoundingClientRect) {
      var r = img.getBoundingClientRect();
      img.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + "% " + ((e.clientY - r.top) / r.height * 100) + "%";
    }
    setZoom(!state.zoom);
  }

  function onKey(e) {
    if (!root || root.hidden) return;
    var rtl = document.documentElement.dir === "rtl";
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") step(rtl ? -1 : 1);
    else if (e.key === "ArrowLeft") step(rtl ? 1 : -1);
    else if (e.key === "Tab") { // حصر التركيز داخل النافذة
      var f = Array.prototype.filter.call(root.querySelectorAll("button"), function (b) { return !b.hidden && b.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  function open(list, start, alt, trigger) {
    build();
    state.list = list; state.alt = alt || ""; state.trigger = trigger || document.activeElement;
    thumbs.innerHTML = "";
    list.forEach(function (src, k) {
      var b = el("button", "lb__thumb", '<img src="' + src + '" alt="" width="64" height="80">'); b.type = "button";
      b.setAttribute("aria-label", t("p.zoom", { n: k + 1 }));
      b.addEventListener("click", function () { show(k); });
      thumbs.appendChild(b);
    });
    labels(); root.hidden = false; document.body.classList.add("no-scroll");
    show(start || 0); btnClose.focus();
  }
  function close() {
    if (!root || root.hidden) return;
    root.hidden = true; document.body.classList.remove("no-scroll");
    if (state.trigger && state.trigger.focus) state.trigger.focus();
  }

  window.ATHAR_LB = { open: open, close: close };
})();
