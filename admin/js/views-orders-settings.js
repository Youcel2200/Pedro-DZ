/* لوحة الإدارة — الطلبات والإعدادات */
(function () {
  "use strict";
  var A = window.ADM, html = A.html, raw = A.raw, mount = A.mount, V = A.views, opt = A.opt, badge = A.badge;
  var ST = ["pending", "confirmed", "preparing", "shipped", "delivered", "cancelled", "returned"];

  /* ================= الطلبات ================= */
  V.orders = async function (root) {
    if (!A.can("orders")) return mount(root, html`<h1>الطلبات</h1><p class="muted">لا تملك صلاحية إدارة الطلبات.</p>`);
    var f = { status: "", q: "" };
    mount(root, html`<h1>الطلبات</h1><div class="note">استقبال الطلبات الحقيقية من المتجر <b>غير مفعّل حالياً</b>. هذا القسم جاهز: ستظهر الطلبات هنا وتتحكم في حالتها عند التفعيل.</div>
      <div class="row gap wrap"><select id="fs" aria-label="الحالة"><option value="">كل الحالات</option>${ST.map(function (s) { return opt(s, A.STATUS_AR[s], false); })}</select>
      <input id="fq" type="search" placeholder="بحث: رقم الطلب أو الهاتف أو الاسم" aria-label="بحث"></div><div id="ol" class="card"><p class="muted">جارٍ التحميل…</p></div>`);
    async function load() {
      var p = "orders?select=id,order_number,customer_name,customer_phone,wilaya_code,commune_name,status,total_amount,delivery_fee,created_at&order=created_at.desc&limit=100";
      if (f.status) p += "&status=eq." + f.status;
      if (f.q) { var q = f.q.replace(/[^\p{L}\p{N} \-]/gu, "").trim(); if (q) p += "&or=(order_number.ilike.*" + encodeURIComponent(q) + "*,customer_phone.ilike.*" + encodeURIComponent(q) + "*,customer_name.ilike.*" + encodeURIComponent(q) + "*)"; }
      var rows = await A.get(p), box = root.querySelector("#ol");
      mount(box, rows.length ? html`<div class="tbl"><table><thead><tr><th>الرقم</th><th>الزبون</th><th>الولاية</th><th>المجموع</th><th>الحالة</th><th>التاريخ</th></tr></thead><tbody>${rows.map(function (o) {
        return html`<tr class="clk" data-id="${o.id}"><td><b>${o.order_number}</b></td><td>${o.customer_name}<small dir="ltr">${o.customer_phone}</small></td><td>${o.wilaya_code} · ${o.commune_name}</td><td>${A.money(o.total_amount)}${o.delivery_fee == null ? raw('<small>توصيل قيد التحديد</small>') : ""}</td><td>${badge(A.SKIND[o.status], A.STATUS_AR[o.status])}</td><td>${A.dt(o.created_at)}</td></tr>`; })}</tbody></table></div>` : html`<p class="muted">لا توجد طلبات.</p>`);
    }
    await load().catch(function (e) { if (e.auth) A.onAuthLost(); else A.toast(e.message, "err"); });
    var t; root.querySelector("#fs").onchange = function (e) { f.status = e.target.value; load(); };
    root.querySelector("#fq").oninput = function (e) { clearTimeout(t); t = setTimeout(function () { f.q = e.target.value; load(); }, 350); };
    root.querySelector("#ol").onclick = function (e) { var tr = e.target.closest("tr[data-id]"); if (tr) detail(tr.dataset.id, load); };
  };

  async function detail(id, reload) {
    var r = await Promise.all([A.get("orders?select=*&id=eq." + id), A.get("order_items?select=*&order_id=eq." + id)]), o = r[0][0], items = r[1];
    if (!o) return A.toast("الطلب غير موجود", "err");
    var final = o.status === "cancelled";
    A.modal(html`<h2>طلب ${o.order_number}</h2>
      <div class="kv"><span>الزبون</span><b>${o.customer_name}</b><span>الهاتف</span><b dir="ltr"><a href="tel:${o.customer_phone}">${o.customer_phone}</a></b>
      <span>العنوان</span><b>${o.wilaya_code} — ${o.commune_name} — ${o.address}</b>${o.notes ? html`<span>ملاحظة الزبون</span><b>${o.notes}</b>` : ""}<span>التاريخ</span><b>${A.dt(o.created_at)}</b></div>
      <div class="tbl"><table><thead><tr><th>العطر</th><th>السعر</th><th>الكمية</th><th>الإجمالي</th></tr></thead><tbody>${items.map(function (i) { return html`<tr><td>${i.product_name_ar}<small>${i.brand || ""} ${i.size_ml ? i.size_ml + "ml" : ""}</small></td><td>${A.money(i.unit_price)}</td><td>${i.quantity}</td><td>${A.money(i.line_total)}</td></tr>`; })}</tbody></table></div>
      <p>المجموع الفرعي: <b>${A.money(o.subtotal)}</b> · التوصيل: <b>${o.delivery_fee == null ? "قيد التحديد" : A.money(o.delivery_fee)}</b> · الإجمالي: <b>${A.money(o.total_amount)}</b></p>
      <label class="fld"><span>الحالة ${final ? "(الإلغاء نهائي)" : ""}</span><select id="ost" ${final ? "disabled" : ""}>${ST.map(function (s) { return opt(s, A.STATUS_AR[s], s === o.status); })}</select></label>
      <label class="fld"><span>ملاحظات داخلية (لا يراها الزبون)</span><textarea id="onote" rows="3">${o.admin_notes || ""}</textarea></label>
      <p class="muted small">عند إلغاء الطلب تُعاد كميّاته للمخزون تلقائياً، والإلغاء لا رجعة فيه.</p>
      <div class="row end"><button class="btn" data-mclose="">إغلاق</button><button class="btn pri" id="osave">حفظ</button></div>`, {
      onOpen: function (b, close) {
        b.querySelector("#osave").onclick = function (e) {
          A.busy(e.target, async function () {
            var st = b.querySelector("#ost").value, body = { admin_notes: b.querySelector("#onote").value.trim() || null };
            if (st !== o.status) { if (st === "cancelled" && !(await A.confirm("إلغاء الطلب نهائي ويعيد المخزون. متأكد؟", "إلغاء الطلب", true))) return; body.status = st; }
            await A.rest("PATCH", "orders?id=eq." + id, body, { minimal: true }); A.toast("تم الحفظ ✔", "ok"); close("ok"); reload();
          });
        };
      }
    });
  }

  /* ================= الإعدادات ================= */
  var KEYS = [["brand_name_ar", "اسم المتجر بالعربية", "text"], ["brand_name_latin", "اسم المتجر باللاتينية", "text"], ["max_qty_per_item", "أقصى كمية للعطر الواحد في الطلب", "number"]];
  V.settings = async function (root) {
    var rows = await A.get("store_settings?select=*"), m = {}; rows.forEach(function (r) { m[r.key] = r.value; });
    var admin = A.can("settings"), s = A.session();
    mount(root, html`<h1>الإعدادات</h1>
      <section class="card"><h2>إعدادات المتجر</h2>${admin ? "" : html`<p class="muted">لا تملك صلاحية تعديل الإعدادات.</p>`}
        ${KEYS.map(function (k) { return html`<label class="fld"><span>${k[1]}</span><input data-k="${k[0]}" type="${k[2]}" ${k[2] === "number" ? raw('min="1" max="100" inputmode="numeric"') : ""} value="${m[k[0]] == null ? "" : m[k[0]]}" ${admin ? "" : "disabled"}></label>`; })}
        <p class="muted small">العملة: ${m.currency || "DZD"} · اللغات: عربية وفرنسية (ثابتة).</p>${admin ? raw('<button class="btn pri" id="sset">حفظ الإعدادات</button>') : ""}</section>
      <section class="card"><h2>حالة الطلبات</h2><p>استقبال الطلبات الحقيقية: <b>غير مفعّل</b>. يتم التفعيل في مرحلة لاحقة بموافقتك فقط.</p></section>
      <section class="card"><h2>حسابي</h2><p>البريد: <b dir="ltr">${(s && s.user && s.user.email) || ""}</b> · الدور: <b>${A.role === "admin" ? "مدير" : "موظف"}</b></p>
        <label class="fld"><span>كلمة مرور جديدة (8 أحرف على الأقل)</span><input id="np" type="password" autocomplete="new-password" minlength="8"></label><button class="btn" id="spw">تغيير كلمة المرور</button></section>`);
    var sb = root.querySelector("#sset");
    if (sb) sb.onclick = function () {
      A.busy(sb, async function () {
        var inputs = root.querySelectorAll("[data-k]"), body = [];
        Array.prototype.forEach.call(inputs, function (i) {
          var v = i.value.trim(); if (!v) throw new Error("لا تترك حقلاً فارغاً.");
          if (i.type === "number") { v = Number(v); if (!(v >= 1 && v <= 100) || v % 1) throw new Error("الكمية القصوى بين 1 و100."); }
          body.push({ key: i.dataset.k, value: v, is_public: true });
        });
        await A.rest("POST", "store_settings?on_conflict=key", body, { minimal: true, upsert: true }); A.toast("تم الحفظ ✔", "ok");
      });
    };
    var pb = root.querySelector("#spw");
    pb.onclick = function () {
      A.busy(pb, async function () {
        var p = root.querySelector("#np").value; if (p.length < 8) throw new Error("كلمة المرور 8 أحرف على الأقل.");
        var r = await A.req(A.cfg.url + "/auth/v1/user", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: p }) });
        if (!r.ok) throw new Error("تعذّر تغيير كلمة المرور."); root.querySelector("#np").value = ""; A.toast("تم تغيير كلمة المرور ✔", "ok");
      });
    };
  };
})();
