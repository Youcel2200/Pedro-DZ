/* لوحة الإدارة — اللوحة الرئيسية + المنتجات والصور */
(function () {
  "use strict";
  var A = window.ADM, html = A.html, raw = A.raw, mount = A.mount, esc = A.esc, V = A.views;
  function opt(v, label, sel) { return raw('<option value="' + esc(v) + '"' + (sel ? " selected" : "") + ">" + esc(label) + "</option>"); }
  function badge(kind, text) { return raw('<span class="badge ' + kind + '">' + esc(text) + "</span>"); }
  A.opt = opt; A.badge = badge;
  var PKIND = { published: "ok", draft: "warn", archived: "mut" };
  var SKIND = { pending: "warn", confirmed: "info", preparing: "info", shipped: "info", delivered: "ok", cancelled: "bad", returned: "bad" };
  A.SKIND = SKIND;

  /* ================= لوحة التحكم ================= */
  V.dashboard = async function (root) {
    mount(root, html`<h1>لوحة التحكم</h1><p class="muted">جارٍ التحميل…</p>`);
    var canO = A.can("orders"), admin = A.can("products"), E = Promise.resolve([]);
    var jobs = [canO ? A.get("admin_sales_daily?select=day,orders_count,revenue_dzd&order=day.desc&limit=14") : E, canO ? A.get("orders?select=status&limit=1000") : E,
      canO ? A.get("orders?select=order_number,customer_name,total_amount,status,created_at&order=created_at.desc&limit=5") : E];
    if (admin) jobs.push(A.get("products?select=id,status&limit=1000"), A.get("inventory?select=product_id,quantity,low_stock_threshold,track_inventory&track_inventory=eq.true"), A.get("delivery_zones?select=fee_dzd&is_active=eq.true"), A.get("product_images?select=product_id&limit=1000"));
    var r = await Promise.all(jobs), sales = r[0].slice().reverse(), orders = r[1], recent = r[2];
    var byS = {}; orders.forEach(function (o) { byS[o.status] = (byS[o.status] || 0) + 1; });
    var rev = sales.reduce(function (s, x) { return s + Number(x.revenue_dzd || 0); }, 0), cnt = sales.reduce(function (s, x) { return s + Number(x.orders_count || 0); }, 0);
    var max = Math.max.apply(null, sales.map(function (x) { return Number(x.revenue_dzd || 0); }).concat([1]));
    var chart = sales.length ? html`<div class="bars" role="img" aria-label="مبيعات آخر الأيام">${sales.map(function (x) { return raw('<div class="bar" title="' + esc(x.day + ": " + A.money(x.revenue_dzd)) + '"><i style="height:' + Math.max(3, Math.round(Number(x.revenue_dzd || 0) / max * 100)) + '%"></i><small>' + esc(String(x.day).slice(5)) + "</small></div>"); })}</div>` : html`<p class="muted">لا مبيعات بعد.</p>`;
    var prod = "", ready = "";
    if (admin) {
      var ps = r[3], inv = r[4], zones = r[5], imgs = r[6], pub = ps.filter(function (p) { return p.status === "published"; }).length, dr = ps.filter(function (p) { return p.status === "draft"; }).length;
      var fees = zones.filter(function (z) { return z.fee_dzd != null; }).length, low = inv.filter(function (i) { return i.quantity <= i.low_stock_threshold; });
      var withImg = {}; imgs.forEach(function (i) { withImg[i.product_id] = 1; });
      var noImg = ps.filter(function (p) { return p.status === "published" && !withImg[p.id]; }).length;
      prod = html`<div class="cards">
        <a class="card stat" href="#/products"><b>${pub}</b><span>عطر منشور</span></a>
        <a class="card stat" href="#/products"><b>${dr}</b><span>مسودات</span></a>
        <a class="card stat" href="#/inventory"><b>${low.length}</b><span>مخزون منخفض/نافد</span></a>
        <a class="card stat" href="#/delivery"><b>${fees}/${zones.length}</b><span>ولايات بسعر توصيل</span></a></div>`;
      var chk = function (ok, t, href) { return raw('<li class="' + (ok ? "ok" : "no") + '"><span>' + (ok ? "✔" : "○") + '</span><a href="' + href + '">' + esc(t) + "</a></li>"); };
      ready = html`<section class="card"><h2>جاهزية المتجر للإطلاق</h2><ul class="check">
        ${chk(pub > 0, "منتجات منشورة (" + pub + ")", "#/products")}${chk(pub > 0 && noImg === 0, "كل منتج منشور له صورة", "#/products")}
        ${chk(fees === zones.length && zones.length > 0, "أسعار التوصيل محددة (" + fees + "/" + zones.length + ")", "#/delivery")}
        ${chk(!!A.cfg.whatsapp, "رقم واتساب المتجر في إعدادات الموقع (config.js)", "#/settings")}</ul>
        <p class="muted small">تفعيل استقبال الطلبات الحقيقية خطوة منفصلة تتم بعد اكتمال القائمة وموافقتك.</p></section>`;
      A._low = low;
      if (low.length) {
        var names = await A.get("products?select=id,name_ar&id=in.(" + low.slice(0, 8).map(function (l) { return l.product_id; }).join(",") + ")");
        var nm = {}; names.forEach(function (n) { nm[n.id] = n.name_ar; });
        prod = html`${prod}<section class="card"><h2>تنبيه المخزون</h2><ul class="plain">${low.slice(0, 8).map(function (l) { return raw("<li><a href=\"#/products/" + esc(l.product_id) + '">' + esc(nm[l.product_id] || "—") + "</a> — " + (l.quantity <= 0 ? '<span class="badge bad">نفد</span>' : '<span class="badge warn">باقي ' + esc(l.quantity) + "</span>") + "</li>"); })}</ul></section>`;
      }
    }
    mount(root, html`<h1>لوحة التحكم</h1>
      ${canO ? html`<div class="cards">
        <div class="card stat"><b>${cnt}</b><span>طلبات آخر 14 يوماً</span></div>
        <div class="card stat"><b>${A.money(rev)}</b><span>مبيعات (بدون الملغى والمرتجع)</span></div>
        <a class="card stat" href="#/orders"><b>${byS.pending || 0}</b><span>طلبات جديدة</span></a>
        <a class="card stat" href="#/orders"><b>${(byS.confirmed || 0) + (byS.preparing || 0) + (byS.shipped || 0)}</b><span>طلبات قيد المعالجة</span></a></div>` : ""}
      ${prod}${ready}
      ${canO ? html`<section class="card"><h2>المبيعات اليومية</h2>${chart}</section>
      <section class="card"><h2>آخر الطلبات</h2>${recent.length ? html`<div class="tbl"><table><thead><tr><th>الرقم</th><th>الزبون</th><th>المجموع</th><th>الحالة</th></tr></thead><tbody>${recent.map(function (o) { return html`<tr><td><a href="#/orders">${o.order_number}</a></td><td>${o.customer_name}</td><td>${A.money(o.total_amount)}</td><td>${badge(SKIND[o.status], A.STATUS_AR[o.status])}</td></tr>`; })}</tbody></table></div>` : html`<p class="muted">لا طلبات بعد (استقبال الطلبات الحقيقية غير مفعّل حالياً).</p>`}</section>` : ""}`);
  };

  /* ================= قائمة المنتجات ================= */
  V.products = async function (root, param) {
    if (!A.can("products")) return mount(root, html`<h1>المنتجات</h1><p class="muted">لا تملك صلاحية إدارة المنتجات.</p>`);
    if (param) return form(root, param);
    mount(root, html`<h1>العطور</h1><p class="muted">جارٍ التحميل…</p>`);
    var r = await Promise.all([A.get("products?select=id,slug,name_ar,name_fr,brand,price,status,updated_at&order=updated_at.desc&limit=500"), A.get("product_images?select=product_id,storage_path,is_primary,sort_order&order=sort_order.asc&limit=2000"), A.get("inventory?select=product_id,quantity,track_inventory&limit=1000")]);
    var img = {}, qty = {}; r[1].forEach(function (i) { if (!img[i.product_id] || i.is_primary) img[i.product_id] = i.storage_path; }); r[2].forEach(function (i) { qty[i.product_id] = i; });
    var list = r[0], st = { q: "", s: "" };
    function draw() {
      var rows = list.filter(function (p) { var t = (p.name_ar + " " + p.name_fr + " " + p.brand + " " + p.slug).toLowerCase(); return (!st.q || t.indexOf(st.q) > -1) && (!st.s || p.status === st.s); });
      root.querySelector("#plist").innerHTML = rows.length ? rows.map(function (p) {
        var inv = qty[p.id];
        return html`<a class="prow" href="#/products/${p.id}"><span class="thumb">${img[p.id] ? raw('<img loading="lazy" alt="" src="' + esc(A.publicUrl(img[p.id])) + '">') : raw("<i>بلا صورة</i>")}</span>
          <span class="pinfo"><b>${p.name_ar}</b><small>${p.name_fr} · ${p.brand}</small><small>${A.money(p.price)}${inv && inv.track_inventory ? " · المخزون: " + inv.quantity : ""}</small></span>${badge(PKIND[p.status], A.PSTATUS_AR[p.status])}</a>`.__raw;
      }).join("") : '<p class="muted">لا نتائج.</p>';
    }
    mount(root, html`<div class="row between"><h1>العطور</h1><a class="btn pri" href="#/products/new">+ إضافة عطر</a></div>
      <div class="row gap"><input id="q" type="search" placeholder="بحث بالاسم أو الماركة…" aria-label="بحث"><select id="sf" aria-label="الحالة"><option value="">كل الحالات</option>${["published", "draft", "archived"].map(function (s) { return opt(s, A.PSTATUS_AR[s]); })}</select></div>
      <div id="plist" class="plist"></div>${list.length ? "" : html`<p class="muted">لا عطور بعد. اضغط «إضافة عطر» لإدخال أول عطر حقيقي.</p>`}`);
    draw();
    root.oninput = function (e) { if (e.target.id === "q") { st.q = e.target.value.trim().toLowerCase(); draw(); } };
    root.onchange = function (e) { if (e.target.id === "sf") { st.s = e.target.value; draw(); } };
  };

  /* ================= نموذج المنتج + الصور ================= */
  async function form(root, id) {
    var isNew = id === "new", P = null, imgs = [], cats = await A.get("categories?select=id,slug,name_ar&order=sort_order.asc"), sel = {}, inv = { quantity: 0, low_stock_threshold: 3, track_inventory: true };
    if (!isNew) {
      var rr = await Promise.all([A.get("products?select=*&id=eq." + encodeURIComponent(id)), A.get("product_images?select=*&product_id=eq." + encodeURIComponent(id) + "&order=sort_order.asc"), A.get("product_categories?select=category_id&product_id=eq." + encodeURIComponent(id)), A.get("inventory?select=*&product_id=eq." + encodeURIComponent(id))]);
      if (!rr[0].length) return mount(root, html`<h1>العطر غير موجود</h1><a class="btn" href="#/products">رجوع</a>`);
      P = rr[0][0]; imgs = rr[1]; rr[2].forEach(function (c) { sel[c.category_id] = 1; }); if (rr[3][0]) inv = rr[3][0];
    } else P = { status: "draft", gender: "unisex", authenticity_type: "original", badges: [], notes: {}, currency: "DZD" };
    var notes = P.notes || {};
    function lines(k) { return (notes[k] || []).map(function (n) { return n.ar + (n.fr && n.fr !== n.ar ? " | " + n.fr : ""); }).join("\n"); }
    function f(label, input, hint) { return raw('<label class="fld"><span>' + esc(label) + "</span>" + input.__raw + (hint ? "<small>" + esc(hint) + "</small>" : "") + "</label>"); }
    function inp(name, v, extra) { return html`<input name="${name}" value="${v == null ? "" : v}" ${raw(extra || "")}>`; }
    mount(root, html`<div class="row between"><h1>${isNew ? "إضافة عطر" : "تعديل: " + P.name_ar}</h1><a class="btn" href="#/products">← القائمة</a></div>
    <form id="pf" class="card formgrid" novalidate>
      ${f("الاسم بالعربية *", inp("name_ar", P.name_ar, "required maxlength=120"))}${f("الاسم بالفرنسية *", inp("name_fr", P.name_fr, "required maxlength=120 dir=ltr"))}
      ${f("الماركة *", inp("brand", P.brand, "required maxlength=80 dir=ltr"))}${f("الرابط (slug) *", inp("slug", P.slug, "required dir=ltr pattern=[a-z0-9-]+"), "أحرف لاتينية صغيرة وأرقام وشرطات، يُولَّد تلقائياً من الاسم الفرنسي")}
      ${f("السعر بالدينار *", inp("price", P.price, "type=number inputmode=decimal min=1 step=0.01 required"))}${f("السعر قبل التخفيض (اختياري)", inp("compare_at_price", P.compare_at_price, "type=number inputmode=decimal min=0 step=0.01"), "يجب أن يكون أكبر من السعر الحالي")}
      ${f("الوصف بالعربية", html`<textarea name="description_ar" rows="4">${P.description_ar || ""}</textarea>`)}${f("الوصف بالفرنسية", html`<textarea name="description_fr" rows="4" dir="ltr">${P.description_fr || ""}</textarea>`)}
      ${f("الحجم (مل)", inp("size_ml", P.size_ml, "type=number inputmode=numeric min=1"))}
      ${f("التركيز", html`<select name="concentration">${opt("", "—", !P.concentration)}${["EDP", "EDT", "Parfum"].map(function (c) { return opt(c, c, P.concentration === c); })}</select>`)}
      ${f("الفئة", html`<select name="gender">${opt("men", "رجالي", P.gender === "men")}${opt("women", "نسائي", P.gender === "women")}${opt("unisex", "للجنسين", P.gender === "unisex")}</select>`)}
      ${f("العائلة العطرية", html`<select name="family">${opt("", "—", !P.family)}${[["oriental", "شرقي"], ["floral", "زهري"], ["oud", "عود"], ["fresh", "منعش"], ["woody", "خشبي"], ["musky", "مسكي"]].map(function (c) { return opt(c[0], c[1], P.family === c[0]); })}</select>`)}
      ${f("بلد المنشأ (حرفان)", inp("origin_country", (P.origin_country || "").trim(), "maxlength=2 dir=ltr style=text-transform:uppercase"))}
      ${f("النوع", html`<select name="authenticity_type">${opt("original", "أصلي", P.authenticity_type === "original")}${opt("inspired", "مستوحى", P.authenticity_type === "inspired")}</select>`)}
      <label class="fld chk"><input type="checkbox" name="authenticity_verified" ${P.authenticity_verified ? "checked" : ""}> <span>تم التحقق من الأصالة</span></label>
      ${f("ترتيب الشعبية (رقم، اختياري)", inp("popularity", P.popularity, "type=number inputmode=numeric min=0"))}
      <fieldset class="full"><legend>التصنيفات</legend><div class="row wrap">${cats.map(function (c) { return raw('<label class="chk"><input type="checkbox" name="cat" value="' + esc(c.id) + '"' + (sel[c.id] ? " checked" : "") + "> " + esc(c.name_ar) + "</label>"); })}</div></fieldset>
      <fieldset class="full"><legend>الشارات</legend><div class="row wrap">${[["new", "جديد"], ["bestseller", "الأكثر مبيعاً"]].map(function (b) { return raw('<label class="chk"><input type="checkbox" name="badge" value="' + b[0] + '"' + ((P.badges || []).indexOf(b[0]) > -1 ? " checked" : "") + "> " + b[1] + "</label>"); })}</div></fieldset>
      <fieldset class="full"><legend>النوتات العطرية (سطر لكل نوتة، والفرنسية بعد الخط | اختيارياً)</legend><div class="formgrid inner">
        ${f("القمة", html`<textarea name="n_top" rows="3">${lines("top")}</textarea>`)}${f("القلب", html`<textarea name="n_heart" rows="3">${lines("heart")}</textarea>`)}${f("القاعدة", html`<textarea name="n_base" rows="3">${lines("base")}</textarea>`)}</div></fieldset>
      <fieldset class="full"><legend>المخزون</legend><div class="formgrid inner">
        ${f("الكمية المتوفرة", inp("quantity", inv.quantity, "type=number inputmode=numeric min=0"))}${f("تنبيه عند أقل من أو يساوي", inp("low_stock_threshold", inv.low_stock_threshold, "type=number inputmode=numeric min=0"))}
        <label class="fld chk"><input type="checkbox" name="track_inventory" ${inv.track_inventory ? "checked" : ""}> <span>تتبّع المخزون (إن أُلغي يُعتبر متوفراً دائماً)</span></label></div></fieldset>
      ${f("حالة النشر", html`<select name="status">${["draft", "published", "archived"].map(function (s) { return opt(s, A.PSTATUS_AR[s], P.status === s); })}</select>`, "المسودة والمؤرشف لا يراهما الزوار. النشر يتطلب صورة واحدة على الأقل.")}
      <div class="full row end gap"><button type="submit" class="btn pri" id="save">${isNew ? "حفظ ومتابعة لرفع الصور" : "حفظ التعديلات"}</button></div>
    </form>
    ${isNew ? "" : html`<section class="card" id="imgs"></section>
      <section class="card danger-zone"><h2>منطقة الحذف</h2><p class="muted small">حذف عطر مرتبط بطلبات غير ممكن (يحفظ سجل المبيعات) — أرشفته تخفيه عن المتجر.</p><div class="row gap"><button class="btn" id="arch">أرشفة العطر</button><button class="btn danger" id="del">حذف نهائي</button></div></section>`}`);
    var F = root.querySelector("#pf");
    var slugTouched = !isNew;
    F.elements.slug.addEventListener("input", function () { slugTouched = true; });
    F.elements.name_fr.addEventListener("input", function () { if (!slugTouched) F.elements.slug.value = A.slugify(F.elements.name_fr.value); });
    function num(v) { v = String(v).trim(); return v === "" ? null : Number(v); }
    function parseNotes(t) { return String(t || "").split("\n").map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) { var p = l.split("|"); var ar = p[0].trim(); return { ar: ar, fr: (p[1] || ar).trim() }; }); }

    F.addEventListener("submit", function (e) {
      e.preventDefault();
      A.busy(root.querySelector("#save"), async function () {
        var E = F.elements, body = {
          name_ar: E.name_ar.value.trim(), name_fr: E.name_fr.value.trim(), brand: E.brand.value.trim(), slug: E.slug.value.trim(),
          price: num(E.price.value), compare_at_price: num(E.compare_at_price.value), description_ar: E.description_ar.value.trim() || null, description_fr: E.description_fr.value.trim() || null,
          size_ml: num(E.size_ml.value), concentration: E.concentration.value || null, gender: E.gender.value, family: E.family.value || null,
          origin_country: E.origin_country.value.trim().toUpperCase() || null, authenticity_type: E.authenticity_type.value, authenticity_verified: E.authenticity_verified.checked,
          popularity: num(E.popularity.value), status: E.status.value,
          badges: Array.prototype.map.call(F.querySelectorAll("[name=badge]:checked"), function (c) { return c.value; }),
          notes: { top: parseNotes(E.n_top.value), heart: parseNotes(E.n_heart.value), base: parseNotes(E.n_base.value) }
        };
        if (!body.name_ar || !body.name_fr || !body.brand) throw new Error("الاسم بالعربية والفرنسية والماركة إلزامية.");
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(body.slug)) throw new Error("الرابط (slug) يجب أن يكون أحرفاً لاتينية صغيرة وأرقاماً وشرطات.");
        if (!(body.price > 0)) throw new Error("السعر يجب أن يكون أكبر من صفر.");
        if (body.compare_at_price != null && !(body.compare_at_price > body.price)) throw new Error("السعر قبل التخفيض يجب أن يكون أكبر من السعر الحالي (أو اتركه فارغاً).");
        if (body.origin_country && !/^[A-Z]{2}$/.test(body.origin_country)) throw new Error("بلد المنشأ حرفان لاتينيان مثل FR.");
        if (body.status === "published" && (isNew || !imgs.length)) { if (isNew) body.status = "draft"; else throw new Error("لا يمكن نشر عطر بلا صورة. ارفع صورة أولاً."); if (isNew) A.toast("حُفظ كمسودة: ارفع صورة ثم انشره.", "info"); }
        var q = num(E.quantity.value), th = num(E.low_stock_threshold.value);
        if (q != null && (q < 0 || q % 1)) throw new Error("الكمية رقم صحيح لا يقل عن صفر.");
        var pid = isNew ? null : P.id, res;
        if (isNew) { res = await A.rest("POST", "products", body); pid = res.data[0].id; } else await A.rest("PATCH", "products?id=eq." + pid, body);
        var want = Array.prototype.map.call(F.querySelectorAll("[name=cat]:checked"), function (c) { return c.value; }), cur = Object.keys(sel);
        var rm = cur.filter(function (c) { return want.indexOf(c) < 0; }), add = want.filter(function (c) { return cur.indexOf(c) < 0; });
        if (rm.length) await A.rest("DELETE", "product_categories?product_id=eq." + pid + "&category_id=in.(" + rm.join(",") + ")", undefined, { minimal: true });
        if (add.length) await A.rest("POST", "product_categories", add.map(function (c) { return { product_id: pid, category_id: c }; }), { minimal: true });
        await A.rest("PATCH", "inventory?product_id=eq." + pid, { quantity: q == null ? 0 : q, low_stock_threshold: th == null ? 3 : th, track_inventory: E.track_inventory.checked }, { minimal: true });
        A.toast("تم الحفظ ✔", "ok");
        if (isNew) location.hash = "#/products/" + pid; else { V.products(root, pid); }
      });
    });
    if (isNew) return;

    /* ---- الصور ---- */
    var box = root.querySelector("#imgs");
    function drawImgs() {
      mount(box, html`<h2>صور العطر (${imgs.length})</h2><p class="muted small">الصورة المميّزة (★) تظهر أولاً في المتجر. تُصغَّر الصور تلقائياً قبل الرفع.</p>
        <div class="igrid">${imgs.map(function (im, i) { return raw('<figure class="im' + (im.is_primary ? " pri" : "") + '"><img alt="" src="' + esc(A.publicUrl(im.storage_path)) + '"><figcaption>' +
          '<button type="button" class="ib" data-a="star" data-i="' + i + '" title="اجعلها الرئيسية" aria-label="الصورة الرئيسية">' + (im.is_primary ? "★" : "☆") + "</button>" +
          '<button type="button" class="ib" data-a="left" data-i="' + i + '" ' + (i === 0 ? "disabled" : "") + ' aria-label="تقديم">→</button><button type="button" class="ib" data-a="right" data-i="' + i + '" ' + (i === imgs.length - 1 ? "disabled" : "") + ' aria-label="تأخير">←</button>' +
          '<button type="button" class="ib bad" data-a="del" data-i="' + i + '" aria-label="حذف الصورة">🗑</button></figcaption></figure>'); })}</div>
        <label class="btn pri upl">+ رفع صور<input id="file" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden></label><span id="ust" class="muted small"></span>`);
    }
    async function reloadImgs() { imgs = await A.get("product_images?select=*&product_id=eq." + P.id + "&order=sort_order.asc"); drawImgs(); }
    drawImgs();
    async function reindex(order) { for (var k = 0; k < order.length; k++) if (order[k].sort_order !== k) await A.rest("PATCH", "product_images?id=eq." + order[k].id, { sort_order: k }, { minimal: true }); }
    box.onclick = function (e) {
      var b = e.target.closest("[data-a]"); if (!b) return; var i = +b.dataset.i, a = b.dataset.a, im = imgs[i];
      A.busy(b, async function () {
        if (a === "star") { await A.rest("PATCH", "product_images?product_id=eq." + P.id, { is_primary: false }, { minimal: true }); await A.rest("PATCH", "product_images?id=eq." + im.id, { is_primary: true }, { minimal: true }); }
        else if (a === "left" || a === "right") { var j = a === "left" ? i - 1 : i + 1, o = imgs.slice(); var t = o[i]; o[i] = o[j]; o[j] = t; await reindex(o); }
        else if (a === "del") {
          if (!(await A.confirm("حذف هذه الصورة نهائياً؟", "حذف", true))) return;
          if (P.status === "published" && imgs.length === 1) throw new Error("لا يمكن حذف آخر صورة لعطر منشور. أخفِ العطر أولاً (مسودة).");
          await A.removeFiles([im.storage_path]); await A.rest("DELETE", "product_images?id=eq." + im.id, undefined, { minimal: true });
          var rest_ = imgs.filter(function (x) { return x.id !== im.id; });
          if (im.is_primary && rest_.length) await A.rest("PATCH", "product_images?id=eq." + rest_[0].id, { is_primary: true }, { minimal: true });
        }
        await reloadImgs();
      });
    };
    box.onchange = async function (e) {
      if (e.target.id !== "file") return; var files = Array.prototype.slice.call(e.target.files), st = box.querySelector("#ust"); e.target.value = "";
      await A.busy(null, async function () {
        for (var k = 0; k < files.length; k++) {
          st.textContent = "رفع " + (k + 1) + " من " + files.length + "…";
          var pr = await A.prepareImage(files[k]), path = P.id + "/" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7) + "." + pr.ext;
          await A.upload(path, pr.blob);
          try { await A.rest("POST", "product_images", { product_id: P.id, storage_path: path, sort_order: imgs.length + k, is_primary: imgs.length === 0 && k === 0, alt_ar: P.name_ar, alt_fr: P.name_fr }, { minimal: true }); }
          catch (er) { try { await A.removeFiles([path]); } catch (x) { } throw er; }
        }
        A.toast("تم رفع الصور ✔", "ok"); await reloadImgs();
      });
    };
    root.querySelector("#arch").onclick = function (e) { A.busy(e.target, async function () { if (!(await A.confirm("أرشفة العطر وإخفاؤه عن المتجر؟", "أرشفة"))) return; await A.rest("PATCH", "products?id=eq." + P.id, { status: "archived" }, { minimal: true }); A.toast("تمت الأرشفة", "ok"); V.products(root, P.id); }); };
    root.querySelector("#del").onclick = function (e) {
      A.busy(e.target, async function () {
        if (!(await A.confirm("حذف العطر «" + P.name_ar + "» وكل صوره نهائياً؟ لا يمكن التراجع.", "حذف نهائي", true))) return;
        var paths = imgs.map(function (x) { return x.storage_path; });
        await A.rest("DELETE", "products?id=eq." + P.id, undefined, { minimal: true });
        if (paths.length) { try { await A.removeFiles(paths); } catch (x) { } }
        A.toast("تم الحذف", "ok"); location.hash = "#/products";
      });
    };
  }
})();
