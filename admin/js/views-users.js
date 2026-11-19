/* لوحة الإدارة — المستخدمون والأدوار والصلاحيات (للمدير فقط) */
(function () {
  "use strict";
  var A = window.ADM, html = A.html, raw = A.raw, mount = A.mount, V = A.views, opt = A.opt, badge = A.badge;
  var PERMS = [["products", "العطور والصور والنشر"], ["inventory", "المخزون"], ["categories", "التصنيفات"], ["delivery", "التوصيل والمناطق"], ["orders", "الطلبات"], ["settings", "إعدادات المتجر"]];
  var ALL = PERMS.map(function (p) { return p[0]; });
  var PRESETS = [
    ["manager", "مشرف المتجر (كل شيء عدا المستخدمين)", ALL],
    ["orders", "موظف طلبات", ["orders"]],
    ["stock", "موظف مخزون", ["inventory"]],
    ["editor", "محرر عطور (عطور + تصنيفات + مخزون)", ["products", "categories", "inventory"]],
    ["custom", "مخصص (أحدّد بنفسي)", null]
  ];
  var PL = {}; PERMS.forEach(function (p) { PL[p[0]] = p[1]; });
  function roleLabel(u) {
    if (!u.role) return "بلا صلاحية"; if (u.role === "admin") return "مدير";
    var ks = ALL.filter(function (k) { return u.permissions && u.permissions[k] === true; });
    for (var i = 0; i < PRESETS.length - 1; i++) if (PRESETS[i][2].length === ks.length && PRESETS[i][2].every(function (k) { return ks.indexOf(k) > -1; })) return PRESETS[i][1].split(" (")[0];
    return ks.length ? "موظف مخصص" : "موظف بلا صلاحيات";
  }
  function ref() { try { return new URL(A.cfg.url).hostname.split(".")[0]; } catch (e) { return ""; } }

  V.users = async function (root) {
    if (A.role !== "admin") return mount(root, html`<h1>المستخدمون والصلاحيات</h1><p class="muted">هذا القسم للمدير فقط.</p>`);
    mount(root, html`<h1>المستخدمون والصلاحيات</h1><p class="muted">جارٍ التحميل…</p>`);
    var users = (await A.rest("POST", "rpc/admin_list_users", {})).data || [], me = (A.session() && A.session().user && A.session().user.id) || "";
    mount(root, html`<h1>المستخدمون والصلاحيات</h1>
      <div class="note"><b>إضافة موظف:</b> من هنا تنشئ حسابه وتختار كلمة مروره وصلاحياته مباشرة، دون الدخول إلى Supabase. أعطِ الموظف بريده وكلمة المرور، ويمكنه تغييرها بنفسه من «حسابي».
        <div class="row gap wrap"><button class="btn pri sm" id="addu">＋ إضافة مستخدم</button><button class="btn sm" id="rf">تحديث القائمة</button></div></div>
      <div class="card">${users.length ? users.map(function (u) {
        var st = !u.role ? badge("mut", "بلا صلاحية") : u.is_active ? badge("ok", "مفعّل") : badge("bad", "معطّل");
        var ps = u.role === "admin" ? "كل الصلاحيات" : ALL.filter(function (k) { return u.permissions && u.permissions[k] === true; }).map(function (k) { return PL[k]; }).join("، ") || "—";
        return html`<div class="urow" data-id="${u.id}"><div><b dir="ltr">${u.email || "(بلا بريد)"}</b>${u.id === me ? raw(' <small>(حسابك)</small>') : ""}<small>${u.full_name || ""} · آخر دخول: ${u.last_sign_in_at ? A.dt(u.last_sign_in_at) : "—"}</small><small>${ps}</small></div>
          <div class="ustat">${badge(u.role === "admin" ? "info" : "mut", roleLabel(u))} ${st}</div>${u.id === me ? "" : raw('<div class="row gap wrap"><button class="btn pri sm" data-a="edit">تعديل الدور</button><button class="btn sm" data-a="pw">كلمة المرور</button><button class="btn sm danger" data-a="del">حذف</button></div>')}</div>`;
      }) : html`<p class="muted">لا مستخدمين.</p>`}</div>
      <section class="card"><h2>الأدوار المتاحة</h2><ul class="plain"><li><b>مدير:</b> كل الصلاحيات + إدارة المستخدمين.</li>${PRESETS.slice(0, 4).map(function (p) { return html`<li><b>${p[1].split(" (")[0]}:</b> ${p[2].map(function (k) { return PL[k]; }).join("، ")}</li>`; })}<li><b>مخصص:</b> تختار أي مجموعة من الصلاحيات الست.</li></ul>
        <p class="muted small">الصلاحيات مطبّقة في قاعدة البيانات نفسها، فلا يستطيع الموظف تجاوزها حتى لو عبث بالواجهة. لا يمكنك تعديل حسابك ولا تعطيل آخر مدير.</p></section>`);
    root.querySelector("#rf").onclick = function () { V.users(root); };
    root.querySelector("#addu").onclick = function () { add(function () { V.users(root); }); };
    root.onclick = function (e) {
      var b = e.target.closest("[data-a]"); if (!b) return;
      var u = users.filter(function (x) { return x.id === b.closest(".urow").dataset.id; })[0], done = function () { V.users(root); };
      if (b.dataset.a === "edit") edit(u, done); else if (b.dataset.a === "pw") setPw(u); else if (b.dataset.a === "del") del(u, done);
    };
  };

  /* استدعاء دالة الخادم (المفتاح السري عند الخادم فقط) */
  async function fn(body) {
    var r = await A.req(A.cfg.url + "/functions/v1/admin-users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    var j = null; try { j = await r.json(); } catch (e) { }
    if (!r.ok || !j || j.ok !== true) throw new Error((j && j.error) || "تعذّر تنفيذ العملية، حاول مرة أخرى.");
    return j;
  }
  function genPw() { var c = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789", a = new Uint32Array(12), o = ""; crypto.getRandomValues(a); for (var i = 0; i < 12; i++) o += c[a[i] % c.length]; return o; }
  function pwField(id) { return html`<label class="fld"><span>كلمة المرور (8 أحرف فأكثر)</span><input id="${id}" type="text" dir="ltr" autocomplete="off" maxlength="72"></label><div class="row gap wrap"><button class="btn sm" type="button" data-gen="${id}">توليد كلمة قوية</button></div>`; }

  function add(done) {
    A.modal(html`<h2>إضافة مستخدم</h2>
      <label class="fld"><span>البريد الإلكتروني</span><input id="ne" type="email" dir="ltr" autocomplete="off" maxlength="120"></label>
      <label class="fld"><span>الاسم (للعرض)</span><input id="nn" maxlength="60"></label>
      ${pwField("np")}
      <label class="fld"><span>الدور</span><select id="nr">${opt("staff", "موظف (بصلاحيات أحدّدها)", true)}${opt("admin", "مدير (كل الصلاحيات + المستخدمون)", false)}</select></label>
      <div id="sbox"><label class="fld"><span>قالب جاهز</span><select id="up">${PRESETS.map(function (p) { return opt(p[0], p[1], p[0] === "orders"); })}</select></label>
        <fieldset><legend>الصلاحيات</legend>${PERMS.map(function (p) { return html`<label class="chk"><input type="checkbox" data-p="${p[0]}" ${p[0] === "orders" ? "checked" : ""}> ${p[1]}</label>`; })}</fieldset></div>
      <p class="muted small">سجّل كلمة المرور وأعطها للموظف الآن؛ لن تظهر لك لاحقاً.</p>
      <div class="row end"><button class="btn" data-mclose="">إلغاء</button><button class="btn pri" id="nsave">إنشاء الحساب</button></div>`, {
      onOpen: function (b, close) {
        var sbox = b.querySelector("#sbox"), role = b.querySelector("#nr");
        function vis() { sbox.style.display = role.value === "staff" ? "" : "none"; } role.onchange = vis; vis();
        b.querySelector("[data-gen]").onclick = function () { b.querySelector("#np").value = genPw(); };
        b.querySelector("#up").onchange = function (e) { var p = PRESETS.filter(function (x) { return x[0] === e.target.value; })[0]; if (p && p[2]) Array.prototype.forEach.call(b.querySelectorAll("[data-p]"), function (c) { c.checked = p[2].indexOf(c.dataset.p) > -1; }); };
        b.querySelector("#nsave").onclick = function (e) {
          A.busy(e.target, async function () {
            var email = b.querySelector("#ne").value.trim(), pw = b.querySelector("#np").value, r = role.value, perms = {};
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("اكتب بريداً إلكترونياً صحيحاً.");
            if (pw.length < 8) throw new Error("كلمة المرور 8 أحرف على الأقل.");
            if (r === "staff") Array.prototype.forEach.call(b.querySelectorAll("[data-p]"), function (c) { if (c.checked) perms[c.dataset.p] = true; });
            if (r === "staff" && !Object.keys(perms).length && !(await A.confirm("لم تحدد أي صلاحية: سيدخل الموظف اللوحة دون أن يستطيع فعل شيء. متابعة؟", "متابعة"))) return;
            if (r === "admin" && !(await A.confirm("المدير يملك كل شيء بما فيه إدارة المستخدمين. متأكد؟", "نعم، مدير"))) return;
            await fn({ action: "create", email: email, password: pw, full_name: b.querySelector("#nn").value.trim() || null, role: r, permissions: perms });
            close("ok"); A.toast("تم إنشاء الحساب ✔", "ok"); done();
          });
        };
      }
    });
  }

  function setPw(u) {
    A.modal(html`<h2>تعيين كلمة مرور</h2><p dir="ltr"><b>${u.email}</b></p>${pwField("sp")}
      <div class="row end"><button class="btn" data-mclose="">إلغاء</button><button class="btn pri" id="spsave">حفظ كلمة المرور</button></div>`, {
      onOpen: function (b, close) {
        b.querySelector("[data-gen]").onclick = function () { b.querySelector("#sp").value = genPw(); };
        b.querySelector("#spsave").onclick = function (e) {
          A.busy(e.target, async function () {
            var pw = b.querySelector("#sp").value; if (pw.length < 8) throw new Error("كلمة المرور 8 أحرف على الأقل.");
            await fn({ action: "set_password", user_id: u.id, password: pw }); close("ok"); A.toast("تم تغيير كلمة المرور ✔", "ok");
          });
        };
      }
    });
  }

  async function del(u, done) {
    if (!(await A.confirm("حذف حساب " + u.email + " نهائياً؟ لن يستطيع الدخول مجدداً.", "حذف الحساب", true))) return;
    try { await fn({ action: "delete", user_id: u.id }); A.toast("تم حذف الحساب ✔", "ok"); done(); } catch (err) { A.toast(err.message, "err"); }
  }

  function edit(u, done) {
    var cur = u.role === "admin" ? "admin" : u.role === "staff" ? "staff" : "none";
    var ks = ALL.filter(function (k) { return u.permissions && u.permissions[k] === true; });
    A.modal(html`<h2>دور المستخدم</h2><p dir="ltr"><b>${u.email}</b></p>
      <label class="fld"><span>الاسم (للعرض)</span><input id="un" value="${u.full_name || ""}" maxlength="60"></label>
      <label class="fld"><span>الدور</span><select id="ur">${opt("none", "بلا صلاحية (لا يدخل اللوحة)", cur === "none")}${opt("staff", "موظف (بصلاحيات أحدّدها)", cur === "staff")}${opt("admin", "مدير (كل الصلاحيات + المستخدمون)", cur === "admin")}</select></label>
      <div id="sbox"><label class="fld"><span>قالب جاهز</span><select id="up">${PRESETS.map(function (p) { return opt(p[0], p[1], p[0] === "custom"); })}</select></label>
        <fieldset><legend>الصلاحيات</legend>${PERMS.map(function (p) { return html`<label class="chk"><input type="checkbox" data-p="${p[0]}" ${ks.indexOf(p[0]) > -1 ? "checked" : ""}> ${p[1]}</label>`; })}</fieldset></div>
      <label class="chk"><input type="checkbox" id="ua" ${u.role ? (u.is_active ? "checked" : "") : "checked"}> الحساب مفعّل</label>
      <div class="row end"><button class="btn" data-mclose="">إلغاء</button><button class="btn pri" id="usave">حفظ</button></div>`, {
      onOpen: function (b, close) {
        var sbox = b.querySelector("#sbox"), role = b.querySelector("#ur");
        function vis() { sbox.style.display = role.value === "staff" ? "" : "none"; } role.onchange = vis; vis();
        b.querySelector("#up").onchange = function (e) { var p = PRESETS.filter(function (x) { return x[0] === e.target.value; })[0]; if (p && p[2]) Array.prototype.forEach.call(b.querySelectorAll("[data-p]"), function (c) { c.checked = p[2].indexOf(c.dataset.p) > -1; }); };
        b.querySelector("#usave").onclick = function (e) {
          A.busy(e.target, async function () {
            var r = role.value, name = b.querySelector("#un").value.trim() || null, act = b.querySelector("#ua").checked;
            if (r === "none") { if (u.role) { if (!(await A.confirm("سحب كل الصلاحيات من هذا الحساب؟", "سحب", true))) return; await A.rest("DELETE", "profiles?id=eq." + u.id, undefined, { minimal: true }); } close("ok"); A.toast("تم الحفظ ✔", "ok"); return done(); }
            var perms = {}; if (r === "staff") Array.prototype.forEach.call(b.querySelectorAll("[data-p]"), function (c) { if (c.checked) perms[c.dataset.p] = true; });
            if (r === "staff" && !Object.keys(perms).length && !(await A.confirm("لم تحدد أي صلاحية: سيدخل الموظف اللوحة دون أن يستطيع فعل شيء. متابعة؟", "متابعة"))) return;
            if (r === "admin" && u.role !== "admin" && !(await A.confirm("المدير يملك كل شيء بما فيه إدارة المستخدمين. متأكد؟", "نعم، مدير"))) return;
            try { await A.rest("POST", "profiles?on_conflict=id", { id: u.id, full_name: name, role: r, is_active: act, permissions: perms }, { minimal: true, upsert: true }); }
            catch (err) { if (/last_admin_protected/.test((err.raw && err.raw.message) || err.message || "")) throw new Error("لا يمكن تنزيل أو تعطيل آخر مدير فعّال."); throw err; }
            close("ok"); A.toast("تم الحفظ ✔", "ok"); done();
          });
        };
      }
    });
  }
})();
