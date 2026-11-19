/* لوحة الإدارة — المخزون، التصنيفات، التوصيل والجغرافيا */
(function () {
  "use strict";
  var A = window.ADM, html = A.html, raw = A.raw, mount = A.mount, esc = A.esc, V = A.views, opt = A.opt, badge = A.badge;
  function adminOnly(root, t, perm) { if (A.can(perm)) return false; mount(root, html`<h1>${t}</h1><p class="muted">لا تملك صلاحية هذا القسم.</p>`); return true; }
  function rowVals(tr) { var o = {}; Array.prototype.forEach.call(tr.querySelectorAll("[data-f]"), function (i) { o[i.dataset.f] = i.type === "checkbox" ? i.checked : i.value; }); return o; }
  function n(v) { v = String(v == null ? "" : v).trim(); return v === "" ? null : Number(v); }

  /* ================= المخزون ================= */
  V.inventory = async function (root) {
    if (adminOnly(root, "المخزون", "inventory")) return;
    mount(root, html`<h1>المخزون</h1><p class="muted">جارٍ التحميل…</p>`);
    var r = await Promise.all([A.get("products?select=id,name_ar,brand,status&order=name_ar.asc&limit=500"), A.get("inventory?select=*&limit=1000")]);
    var inv = {}; r[1].forEach(function (i) { inv[i.product_id] = i; });
    var onlyLow = false;
    function draw() {
      var rows = r[0].filter(function (p) { var i = inv[p.id]; return !onlyLow || (i && i.track_inventory && i.quantity <= i.low_stock_threshold); });
      root.querySelector("#ilist").innerHTML = rows.length ? rows.map(function (p) {
        var i = inv[p.id] || { quantity: 0, low_stock_threshold: 3, track_inventory: true }, low = i.track_inventory && i.quantity <= i.low_stock_threshold;
        return html`<div class="irow" data-id="${p.id}"><div class="iname"><a href="#/products/${p.id}"><b>${p.name_ar}</b></a><small>${p.brand} ${badge(low ? (i.quantity <= 0 ? "bad" : "warn") : "ok", i.track_inventory ? (i.quantity <= 0 ? "نفد" : low ? "منخفض" : "متوفر") : "غير متتبَّع")}</small></div>
          <div class="qty"><button class="ib" data-a="dec" aria-label="إنقاص">−</button><input data-f="quantity" type="number" inputmode="numeric" min="0" value="${i.quantity}" aria-label="الكمية"><button class="ib" data-a="inc" aria-label="زيادة">+</button></div>
          <label class="chk small"><input data-f="track_inventory" type="checkbox" ${i.track_inventory ? "checked" : ""}> تتبّع</label><button class="btn pri sm" data-a="save">حفظ</button></div>`.__raw;
      }).join("") : '<p class="muted">لا عطور.</p>';
    }
    mount(root, html`<h1>المخزون</h1><label class="chk"><input type="checkbox" id="low"> عرض المنخفض والنافد فقط</label><div id="ilist" class="card"></div>`);
    draw();
    root.onchange = function (e) { if (e.target.id === "low") { onlyLow = e.target.checked; draw(); } };
    root.onclick = function (e) {
      var b = e.target.closest("[data-a]"); if (!b) return; var tr = b.closest(".irow"), q = tr.querySelector("[data-f=quantity]");
      if (b.dataset.a === "dec") q.value = Math.max(0, (+q.value || 0) - 1); else if (b.dataset.a === "inc") q.value = (+q.value || 0) + 1;
      else if (b.dataset.a === "save") A.busy(b, async function () {
        var v = rowVals(tr), qty = n(v.quantity); if (qty == null || qty < 0 || qty % 1) throw new Error("الكمية رقم صحيح لا يقل عن صفر.");
        var res = await A.rest("PATCH", "inventory?product_id=eq." + tr.dataset.id, { quantity: qty, track_inventory: !!v.track_inventory });
        inv[tr.dataset.id] = res.data[0]; A.toast("تم حفظ المخزون ✔", "ok"); draw();
      });
    };
  };

  /* ================= التصنيفات ================= */
  V.categories = async function (root) {
    if (adminOnly(root, "التصنيفات", "categories")) return;
    var list = await A.get("categories?select=*&order=sort_order.asc");
    function row(c) {
      return html`<div class="crow" data-id="${c ? c.id : ""}"><input data-f="name_ar" placeholder="الاسم بالعربية" value="${c ? c.name_ar : ""}" aria-label="الاسم بالعربية"><input data-f="name_fr" dir="ltr" placeholder="Nom en français" value="${c ? c.name_fr : ""}" aria-label="الاسم بالفرنسية">
        <input data-f="slug" dir="ltr" placeholder="slug" value="${c ? c.slug : ""}" ${c ? "readonly" : ""} aria-label="الرابط"><input data-f="sort_order" type="number" inputmode="numeric" value="${c ? c.sort_order : list.length + 1}" aria-label="الترتيب" class="s">
        <label class="chk small"><input data-f="is_active" type="checkbox" ${!c || c.is_active ? "checked" : ""}> ظاهر</label>
        <button class="btn pri sm" data-a="save">${c ? "حفظ" : "إضافة"}</button>${c ? raw('<button class="btn danger sm" data-a="del">حذف</button>') : ""}</div>`;
    }
    mount(root, html`<h1>التصنيفات</h1><p class="muted small">التصنيفات الثلاثة (شرقية، فاخرة، اقتصادية) مرتبطة بفلاتر المتجر؛ لا تغيّر رابطها (slug). أي تصنيف جديد يُدار هنا لكنه لن يظهر كفلتر في المتجر قبل ربطه برمجياً.</p>
      <div class="card">${list.map(row)}</div><h2>إضافة تصنيف</h2><div class="card">${row(null)}</div>`);
    root.onclick = function (e) {
      var b = e.target.closest("[data-a]"); if (!b) return; var tr = b.closest(".crow"), id = tr.dataset.id;
      A.busy(b, async function () {
        if (b.dataset.a === "del") { if (!(await A.confirm("حذف التصنيف؟ سيُفصل عن العطور المرتبطة به.", "حذف", true))) return; await A.rest("DELETE", "categories?id=eq." + id, undefined, { minimal: true }); A.toast("تم الحذف", "ok"); return V.categories(root); }
        var v = rowVals(tr); if (!v.name_ar.trim() || !v.name_fr.trim()) throw new Error("الاسمان بالعربية والفرنسية إلزاميان.");
        if (!id) { if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v.slug)) throw new Error("slug: أحرف لاتينية صغيرة وأرقام وشرطات."); await A.rest("POST", "categories", { slug: v.slug, name_ar: v.name_ar.trim(), name_fr: v.name_fr.trim(), sort_order: n(v.sort_order) || 0, is_active: !!v.is_active }, { minimal: true }); }
        else await A.rest("PATCH", "categories?id=eq." + id, { name_ar: v.name_ar.trim(), name_fr: v.name_fr.trim(), sort_order: n(v.sort_order) || 0, is_active: !!v.is_active }, { minimal: true });
        A.toast("تم الحفظ ✔", "ok"); V.categories(root);
      });
    };
  };

  /* ================= التوصيل والجغرافيا ================= */
  V.delivery = async function (root, tab) {
    if (adminOnly(root, "التوصيل", "delivery")) return;
    tab = tab === "geo" ? "geo" : "fees";
    var head = html`<h1>التوصيل والمناطق</h1><div class="tabs"><a class="${tab === "fees" ? "on" : ""}" href="#/delivery">أسعار التوصيل</a><a class="${tab === "geo" ? "on" : ""}" href="#/delivery/geo">الدوائر والبلديات</a></div>`;
    mount(root, html`${head}<p class="muted">جارٍ التحميل…</p>`);
    if (tab === "fees") return fees(root, head);
    return geo(root, head);
  };

  async function fees(root, head) {
    var r = await Promise.all([A.get("wilayas?select=code,name_ar,name_fr,is_active&order=code.asc"), A.get("delivery_zones?select=*")]);
    var z = {}; r[1].forEach(function (x) { z[x.wilaya_code] = x; });
    var set = r[1].filter(function (x) { return x.fee_dzd != null; }).length;
    mount(root, html`${head}<div class="card"><p><b>${set}</b> من <b>${r[0].length}</b> ولاية لها سعر توصيل. الولاية بلا سعر يُسجَّل طلبها بعبارة «التوصيل قيد التحديد».</p>
      <div class="row gap wrap"><input id="bulk" type="number" inputmode="decimal" min="0" placeholder="سعر موحّد (د.ج)" aria-label="سعر موحد"><button class="btn" id="bulkb">تطبيق على الولايات التي بلا سعر</button></div></div>
      <div class="card"><div class="frow fhead"><span>الولاية</span><span>السعر د.ج</span><span>من (يوم)</span><span>إلى (يوم)</span><span>متاحة</span><span></span></div>
      ${r[0].map(function (w) { var d = z[w.code] || {}; return html`<div class="frow" data-w="${w.code}"><span class="wn"><b>${w.code}</b> ${w.name_ar}<small dir="ltr">${w.name_fr}</small></span>
        <input data-f="fee_dzd" type="number" inputmode="decimal" min="0" step="0.01" value="${d.fee_dzd == null ? "" : d.fee_dzd}" placeholder="غير محدد" aria-label="سعر ${w.name_ar}">
        <input data-f="min_days" type="number" inputmode="numeric" min="0" value="${d.min_days == null ? "" : d.min_days}" aria-label="أقل مدة"><input data-f="max_days" type="number" inputmode="numeric" min="0" value="${d.max_days == null ? "" : d.max_days}" aria-label="أكثر مدة">
        <label class="chk small"><input data-f="active" type="checkbox" ${w.is_active && d.is_active !== false ? "checked" : ""}></label><button class="btn pri sm" data-a="save">حفظ</button></div>`; })}</div>`);
    async function saveRow(tr) {
      var v = rowVals(tr), fee = n(v.fee_dzd), mn = n(v.min_days), mx = n(v.max_days);
      if (fee != null && fee < 0) throw new Error("سعر التوصيل لا يكون سالباً."); if (mx != null && mx < (mn || 0)) throw new Error("«إلى» يجب ألا تقل عن «من».");
      var code = tr.dataset.w, body = { fee_dzd: fee, min_days: mn, max_days: mx, is_active: !!v.active };
      if (z[code]) await A.rest("PATCH", "delivery_zones?wilaya_code=eq." + code, body, { minimal: true }); else { body.wilaya_code = code; await A.rest("POST", "delivery_zones", body, { minimal: true }); }
      await A.rest("PATCH", "wilayas?code=eq." + code, { is_active: !!v.active }, { minimal: true });
    }
    root.onclick = function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.id === "bulkb") A.busy(b, async function () {
        var v = n(root.querySelector("#bulk").value); if (v == null || v < 0) throw new Error("اكتب سعراً صحيحاً.");
        if (!(await A.confirm("تعيين " + A.money(v) + " لكل ولاية بلا سعر (" + (r[0].length - set) + " ولاية)؟ يمكنك تعديل كل ولاية بعدها.", "تطبيق"))) return;
        await A.rest("PATCH", "delivery_zones?fee_dzd=is.null", { fee_dzd: v }, { minimal: true }); A.toast("تم التطبيق ✔", "ok"); V.delivery(root, "fees");
      });
      else if (b.dataset.a === "save") A.busy(b, async function () { await saveRow(b.closest(".frow")); A.toast("تم الحفظ ✔", "ok"); });
    };
  }

  async function geo(root, head) {
    var wil = await A.get("wilayas?select=code,name_ar,name_fr,is_active&order=code.asc"), cur = (sessionStorage.getItem("adm_geo") || "12");
    async function draw(code) {
      try { sessionStorage.setItem("adm_geo", code); } catch (e) { }
      var w = wil.filter(function (x) { return x.code === code; })[0] || wil[0];
      var r = await Promise.all([A.get("districts?select=*&wilaya_code=eq." + w.code + "&order=sort_order.asc,code.asc"), A.get("communes?select=*&wilaya_code=eq." + w.code + "&order=sort_order.asc,code.asc")]);
      var ds = r[0], cs = r[1];
      mount(root, html`${head}<div class="card"><label class="fld"><span>اختر الولاية</span><select id="wsel">${wil.map(function (x) { return opt(x.code, x.code + " — " + x.name_ar, x.code === w.code); })}</select></label>
        <div class="crow" data-t="w" data-id="${w.code}"><input data-f="name_ar" value="${w.name_ar}" aria-label="اسم الولاية بالعربية"><input data-f="name_fr" dir="ltr" value="${w.name_fr}" aria-label="اسم الولاية بالفرنسية"><button class="btn pri sm" data-a="save">حفظ اسم الولاية</button></div>
        ${cs.length ? "" : html`<p class="muted small">هذه الولاية بلا بلديات في القائمة: الزبون يكتب اسم بلديته نصاً حراً. بعد إضافة أول بلدية سيصبح اختيار البلدية من القائمة إلزامياً (كما في تبسة) فأضف كل بلدياتها.</p>`}</div>
        ${ds.map(function (d) {
          var mine = cs.filter(function (c) { return c.district_id === d.id; });
          return html`<section class="card"><div class="crow" data-t="d" data-id="${d.id}"><input data-f="name_ar" value="${d.name_ar}" aria-label="اسم الدائرة"><input data-f="name_fr" dir="ltr" value="${d.name_fr}" aria-label="Nom de la daïra"><span class="code" dir="ltr">${d.code}</span><input data-f="sort_order" type="number" class="s" value="${d.sort_order}" aria-label="الترتيب"><label class="chk small"><input data-f="is_active" type="checkbox" ${d.is_active ? "checked" : ""}> ظاهرة</label><button class="btn pri sm" data-a="save">حفظ</button></div>
            ${mine.map(function (c) { return html`<div class="crow sub" data-t="c" data-id="${c.id}"><input data-f="name_ar" value="${c.name_ar}" aria-label="اسم البلدية"><input data-f="name_fr" dir="ltr" value="${c.name_fr}" aria-label="Nom de la commune"><span class="code" dir="ltr">${c.code}</span><input data-f="sort_order" type="number" class="s" value="${c.sort_order}" aria-label="الترتيب"><label class="chk small"><input data-f="is_active" type="checkbox" ${c.is_active ? "checked" : ""}> ظاهرة</label><button class="btn pri sm" data-a="save">حفظ</button></div>`; })}
            <div class="crow sub add" data-t="nc" data-d="${d.id}"><input data-f="name_ar" placeholder="+ بلدية جديدة (عربي)" aria-label="بلدية جديدة"><input data-f="name_fr" dir="ltr" placeholder="Commune (fr)"><input data-f="code" dir="ltr" class="s" placeholder="${d.code}.${mine.length + 1}" aria-label="رمز البلدية"><button class="btn sm" data-a="save">إضافة</button></div></section>`;
        })}
        <section class="card"><h2>دائرة جديدة</h2><div class="crow add" data-t="nd"><input data-f="name_ar" placeholder="اسم الدائرة (عربي)"><input data-f="name_fr" dir="ltr" placeholder="Nom (fr)"><input data-f="code" dir="ltr" class="s" placeholder="رمز" value="${ds.length + 1}" aria-label="رمز الدائرة"><button class="btn sm" data-a="save">إضافة</button></div></section>`);
      root.onchange = function (e) { if (e.target.id === "wsel") draw(e.target.value); };
      root.onclick = function (e) {
        var b = e.target.closest("[data-a=save]"); if (!b) return; var tr = b.closest("[data-t]"), t = tr.dataset.t, v = rowVals(tr);
        A.busy(b, async function () {
          if (!String(v.name_ar || "").trim() || !String(v.name_fr || "").trim()) throw new Error("الاسمان بالعربية والفرنسية إلزاميان.");
          var base = { name_ar: v.name_ar.trim(), name_fr: v.name_fr.trim() };
          if (t === "w") await A.rest("PATCH", "wilayas?code=eq." + tr.dataset.id, base, { minimal: true });
          else if (t === "d" || t === "c") await A.rest("PATCH", (t === "d" ? "districts" : "communes") + "?id=eq." + tr.dataset.id, Object.assign(base, { sort_order: n(v.sort_order) || 0, is_active: !!v.is_active }), { minimal: true });
          else if (t === "nd") { if (!String(v.code).trim()) throw new Error("اكتب رمز الدائرة."); await A.rest("POST", "districts", Object.assign(base, { wilaya_code: w.code, code: String(v.code).trim(), sort_order: ds.length + 1 }), { minimal: true }); }
          else if (t === "nc") { if (!String(v.code).trim()) throw new Error("اكتب رمز البلدية."); await A.rest("POST", "communes", Object.assign(base, { wilaya_code: w.code, district_id: tr.dataset.d, code: String(v.code).trim(), sort_order: cs.length + 1 }), { minimal: true }); }
          A.toast("تم الحفظ ✔", "ok"); if (t === "w") { wil.forEach(function (x) { if (x.code === w.code) { x.name_ar = base.name_ar; x.name_fr = base.name_fr; } }); } draw(w.code);
        });
      };
    }
    draw(cur);
  }
})();
