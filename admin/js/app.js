/* لوحة إدارة أثر ديزاد — الدخول والتوجيه والقائمة */
(function () {
  "use strict";
  var A = window.ADM, html = A.html, raw = A.raw, mount = A.mount, esc = A.esc;
  var app = document.getElementById("app");
  /* [المسار، العنوان، الأيقونة، الصلاحية المطلوبة]: null = كل مخوَّل، "@admin" = المدير فقط */
  var NAV = [["dashboard", "اللوحة", "◧", null], ["products", "العطور", "✦", "products"], ["inventory", "المخزون", "▤", "inventory"], ["categories", "التصنيفات", "❖", "categories"], ["delivery", "التوصيل", "➤", "delivery"], ["orders", "الطلبات", "☰", "orders"], ["users", "المستخدمون والصلاحيات", "👥", "@admin"], ["selfcheck", "فحص النظام", "✔", "@admin"], ["settings", "الإعدادات", "⚙", null]];
  function allowedNav(n) { return !n[3] || (n[3] === "@admin" ? A.role === "admin" : A.can(n[3])); }


  /* ---------- جرس الطلبات الجديدة ---------- */
  var bellT = null, seen = null, pending = [], snd = false, SK = "athar_admin_bell";
  function pref(k, v) { try { if (v === undefined) return localStorage.getItem(SK + k); localStorage.setItem(SK + k, v); } catch (e) { } }
  function beep() { if (pref("snd") !== "1") return; try { var C = window.AudioContext || window.webkitAudioContext, c = new C(), o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value = 880; g.gain.setValueAtTime(.2, c.currentTime); g.gain.exponentialRampToValueAtTime(.001, c.currentTime + .7); o.start(); o.stop(c.currentTime + .7); } catch (e) { } }
  function paint() {
    var bc = document.getElementById("bc"); if (!bc) return; bc.hidden = !pending.length; bc.textContent = pending.length > 99 ? "99+" : pending.length;
    document.title = (pending.length ? "(" + pending.length + ") " : "") + "لوحة إدارة أثر ديزاد";
  }
  async function poll() {
    try {
      var rows = await A.get("orders?select=id,order_number,customer_name,total_amount,created_at&status=eq.pending&order=created_at.desc&limit=100"); pending = rows;
      var ids = rows.map(function (o) { return o.id; });
      if (seen === null) seen = ids; else {
        var fresh = rows.filter(function (o) { return seen.indexOf(o.id) < 0; }); seen = seen.concat(fresh.map(function (o) { return o.id; }));
        if (fresh.length) {
          A.toast("🔔 طلب جديد: " + fresh[0].order_number + (fresh.length > 1 ? " (+" + (fresh.length - 1) + ")" : ""), "ok"); beep();
          try { if (window.Notification && Notification.permission === "granted" && pref("ntf") === "1") new Notification("طلب جديد — أثر ديزاد", { body: fresh[0].order_number + " · " + A.money(fresh[0].total_amount) }); } catch (e) { }
        }
      }
      paint();
    } catch (e) { if (e && e.auth) A.onAuthLost(); }
  }
  function bellInit() {
    seen = null; pending = []; poll(); clearInterval(bellT); bellT = setInterval(poll, window.ATHAR_ADMIN_POLL || 30000);
    document.getElementById("bell").onclick = function () {
      var can = !!window.Notification;
      A.modal(html`<h2>🔔 الطلبات الجديدة (${pending.length})</h2>${pending.length ? html`<ul class="plain">${pending.slice(0, 10).map(function (o) { return html`<li><b>${o.order_number}</b> — ${o.customer_name} — ${A.money(o.total_amount)}<small>${A.dt(o.created_at)}</small></li>`; })}</ul>` : html`<p class="muted">لا طلبات جديدة. (استقبال الطلبات الحقيقية غير مفعّل بعد.)</p>`}
        <label class="chk"><input type="checkbox" id="bs" ${pref("snd") === "1" ? "checked" : ""}> صوت عند وصول طلب جديد</label>
        ${can ? html`<label class="chk"><input type="checkbox" id="bn" ${pref("ntf") === "1" && Notification.permission === "granted" ? "checked" : ""}> إشعار على الجهاز</label>` : ""}
        <p class="muted small">التنبيه يعمل ما دامت صفحة اللوحة مفتوحة (يتحقق كل 30 ثانية). على الهاتف أبقِ الصفحة مفتوحة.</p>
        <div class="row end"><button class="btn" data-mclose="">إغلاق</button><a class="btn pri" href="#/orders" data-mclose="go">فتح الطلبات</a></div>`, {
        onOpen: function (b) {
          b.querySelector("#bs").onchange = function (e) { pref("snd", e.target.checked ? "1" : "0"); if (e.target.checked) beep(); };
          var n = b.querySelector("#bn"); if (n) n.onchange = async function (e) { if (e.target.checked) { var r = Notification.permission === "granted" ? "granted" : await Notification.requestPermission(); e.target.checked = r === "granted"; pref("ntf", r === "granted" ? "1" : "0"); } else pref("ntf", "0"); };
        }
      });
    };
  }
  function bellStop() { clearInterval(bellT); bellT = null; document.title = "لوحة إدارة أثر ديزاد"; }

  function loginScreen(msg) {
    mount(app, html`<main class="login"><form id="lf" class="lbox" autocomplete="on" novalidate><div class="logo">أثر ديزاد</div><div class="sub">لوحة الإدارة</div>
      ${A.cfg.ready ? "" : html`<p class="err">إعداد الاتصال بالقاعدة غير موجود.</p>`}${msg ? html`<p class="err" role="alert">${msg}</p>` : ""}
      <label class="fld"><span>البريد الإلكتروني</span><input id="em" type="email" dir="ltr" autocomplete="username" inputmode="email" required></label>
      <label class="fld"><span>كلمة المرور</span><input id="pw" type="password" dir="ltr" autocomplete="current-password" required></label>
      <button class="btn pri wide" type="submit">دخول</button><p class="muted small">دخول المخوَّلين فقط. لا يوجد تسجيل عام.</p></form></main>`);
    var f = document.getElementById("lf");
    f.onsubmit = async function (e) {
      e.preventDefault(); var em = f.em.value.trim(), pw = f.pw.value;
      if (!em || !pw) return loginScreen("اكتب البريد وكلمة المرور.");
      var b = f.querySelector("button"); b.disabled = true; b.textContent = "…";
      try { await A.login(em, pw); await start(); } catch (err) { loginScreen(err.message); }
    };
  }

  async function profile() {
    var s = A.session(); if (!s || !s.user || !s.user.id) return null;
    var r = await A.get("profiles?select=role,is_active,full_name,permissions&id=eq." + encodeURIComponent(s.user.id));
    var p = r[0]; return p && p.is_active && (p.role === "admin" || p.role === "staff") ? p : null;
  }

  async function start() {
    A.onAuthLost = function () { bellStop(); A.logout(); loginScreen("انتهت الجلسة، سجّل الدخول من جديد."); };
    if (!A.cfg.ready) return loginScreen();
    if (!A.loadS()) return loginScreen();
    var p;
    try { p = await profile(); } catch (e) { if (e.auth) return loginScreen("انتهت الجلسة، سجّل الدخول من جديد."); p = null; }
    if (!p) { await A.logout(); return loginScreen("هذا الحساب غير مخوَّل للدخول إلى لوحة الإدارة."); }
    A.role = p.role; A.perms = p.permissions || {}; shell(p);
  }

  function shell(p) {
    var items = NAV.filter(allowedNav);
    mount(app, html`<div class="shell"><header class="top"><button class="menu" id="mb" aria-label="القائمة" aria-expanded="false">☰</button><b class="brand">أثر ديزاد <small>الإدارة</small></b><button class="bell" id="bell" aria-label="تنبيهات الطلبات الجديدة">🔔<span id="bc" hidden>0</span></button><span class="who">${p.full_name || ""} · ${A.role === "admin" ? "مدير" : "موظف"}</span><button class="btn sm" id="lo">خروج</button></header>
      <nav class="nav" id="nav" aria-label="الأقسام">${items.map(function (n) { return html`<a data-r="${n[0]}" href="#/${n[0]}"><i aria-hidden="true">${n[2]}</i>${n[1]}</a>`; })}${/^https?:$/.test(location.protocol) && !/standalone/.test(location.pathname) ? html`<a href="../index.html" target="_blank" rel="noopener"><i aria-hidden="true">↗</i>عرض المتجر</a>` : ""}</nav>
      <main id="view" tabindex="-1"></main></div><div id="toasts" aria-live="polite"></div>`);
    A.root = document.getElementById("view");
    document.getElementById("lo").onclick = function () { bellStop(); A.logout().then(function () { loginScreen(); }); };
    var nav = document.getElementById("nav"), mb = document.getElementById("mb");
    mb.onclick = function () { var o = nav.classList.toggle("open"); mb.setAttribute("aria-expanded", o); };
    nav.onclick = function () { nav.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); };
    if (A.can("orders")) bellInit(); else { var bb = document.getElementById("bell"); if (bb) bb.style.display = "none"; }
    window.onhashchange = route; route();
  }

  async function route() {
    var parts = (location.hash.replace(/^#\/?/, "") || "dashboard").split("/"), name = parts[0], v = A.views[name];
    var allowed = NAV.filter(function (n) { return n[0] === name && allowedNav(n); }).length;
    if (!v || !allowed) { location.hash = "#/dashboard"; return; }
    Array.prototype.forEach.call(document.querySelectorAll("#nav a[data-r]"), function (a) { a.classList.toggle("on", a.dataset.r === name); });
    /* حاوية جديدة لكل تنقّل: أي عرض قديم ما زال يحمّل يكتب في حاوية منفصلة ولا يطغى على العرض الحالي */
    var holder = document.getElementById("view"), root = document.createElement("div"); holder.innerHTML = ""; holder.appendChild(root); A.root = root;
    try { await v(root, parts[1]); } catch (e) { if (e.auth) A.onAuthLost(); else mount(root, html`<h1>تعذّر التحميل</h1><p class="err">${e.message}</p>`); }
    window.scrollTo(0, 0);
  }

  start();
})();
