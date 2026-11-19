/* لوحة إدارة أثر ديزاد — النواة: الإعداد، الأدوات، المصادقة (Supabase Auth)، REST، Storage.
   لا يوجد هنا أي سر: المفتاح العام فقط؛ الحماية الحقيقية في سياسات RLS داخل القاعدة. */
(function () {
  "use strict";
  var DS = ((window.ATHAR_CONFIG || {}).dataSource) || {};
  var URL_ = (DS.supabaseUrl || "").replace(/\/+$/, ""), KEY = DS.supabaseKey || "", BUCKET = "product-images", SKEY = "athar_admin_session";
  var session = null;

  /* ---------- نص آمن ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function raw(s) { return { __raw: String(s == null ? "" : s) }; }
  function ins(v) { if (v == null || v === false) return ""; if (Array.isArray(v)) return v.map(ins).join(""); if (typeof v === "object" && v.__raw !== undefined) return v.__raw; return esc(v); }
  function html(strings) { var vals = Array.prototype.slice.call(arguments, 1), o = ""; strings.forEach(function (s, i) { o += s + (i < vals.length ? ins(vals[i]) : ""); }); return raw(o); }
  function mount(el, h) { el.innerHTML = h && h.__raw !== undefined ? h.__raw : String(h || ""); }

  /* ---------- تنسيق ---------- */
  function money(n) { if (n == null || n === "") return "—"; return Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 }) + " د.ج"; }
  function dt(s) { if (!s) return "—"; var d = new Date(s); if (isNaN(d)) return "—"; return d.toLocaleDateString("fr-DZ") + " " + d.toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit" }); }
  function slugify(s) { return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
  var STATUS_AR = { pending: "جديد", confirmed: "مؤكَّد", preparing: "قيد التجهيز", shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغى", returned: "مرتجع" };
  var PSTATUS_AR = { draft: "مسودة (مخفي)", published: "منشور", archived: "مؤرشف (مخفي)" };

  /* ---------- أخطاء ---------- */
  var ERR_AR = { "23505": "القيمة مكرّرة (موجودة من قبل).", "23503": "لا يمكن إتمام العملية لوجود بيانات مرتبطة (مثل طلبات). يمكنك أرشفة العنصر بدل حذفه.", "23514": "قيمة غير مقبولة، تحقق من الأرقام والحقول.", "23502": "حقل إلزامي فارغ.", "42501": "ليست لديك صلاحية لهذه العملية.", "P0001": "العملية مرفوضة من القاعدة." };
  function apiError(status, j) { var e = new Error((j && ERR_AR[j.code]) || (status === 403 ? ERR_AR["42501"] : (j && (j.message || j.msg)) || ("خطأ " + status))); e.status = status; e.code = j && j.code; e.raw = j; return e; }
  function authErr() { var e = new Error("انتهت الجلسة، سجّل الدخول من جديد."); e.auth = true; return e; }

  /* ---------- الجلسة ---------- */
  function saveS(s) { session = s; try { if (s) localStorage.setItem(SKEY, JSON.stringify(s)); else localStorage.removeItem(SKEY); } catch (e) { } }
  function loadS() { try { session = JSON.parse(localStorage.getItem(SKEY) || "null"); } catch (e) { session = null; } return session; }
  function setSession(j) { saveS({ access_token: j.access_token, refresh_token: j.refresh_token, expires_at: j.expires_at || (Math.floor(Date.now() / 1000) + (j.expires_in || 3600)), user: { id: j.user && j.user.id, email: j.user && j.user.email } }); }
  async function login(email, password) {
    var r = await fetch(URL_ + "/auth/v1/token?grant_type=password", { method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email: email, password: password }) });
    var j = await r.json().catch(function () { return {}; });
    if (!r.ok) { var e = new Error(r.status === 400 || r.status === 401 ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : "تعذّر تسجيل الدخول، حاول لاحقاً."); e.status = r.status; throw e; }
    setSession(j);
  }
  async function refresh() {
    if (!session || !session.refresh_token) return false;
    var r = await fetch(URL_ + "/auth/v1/token?grant_type=refresh_token", { method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: session.refresh_token }) });
    if (!r.ok) { saveS(null); return false; }
    setSession(await r.json()); return true;
  }
  async function logout() {
    var t = session && session.access_token; saveS(null);
    try { if (t) await fetch(URL_ + "/auth/v1/logout", { method: "POST", headers: { apikey: KEY, Authorization: "Bearer " + t } }); } catch (e) { }
  }
  async function req(url, opts, retried) {
    if (!session) throw authErr();
    if (session.expires_at - Date.now() / 1000 < 60) await refresh();
    if (!session) throw authErr();
    opts.headers = Object.assign({}, opts.headers, { apikey: KEY, Authorization: "Bearer " + session.access_token });
    var r = await fetch(url, opts);
    if (r.status === 401 && !retried) { if (await refresh()) return req(url, opts, true); saveS(null); throw authErr(); }
    return r;
  }

  /* ---------- REST ---------- */
  async function rest(method, path, body, o) {
    o = o || {};
    var h = { "Content-Type": "application/json" }, pref = [];
    if (o.count) pref.push("count=exact");
    if (method !== "GET") pref.push(o.minimal ? "return=minimal" : "return=representation");
    if (o.upsert) pref.push("resolution=merge-duplicates");
    if (pref.length) h.Prefer = pref.join(",");
    var r = await req(URL_ + "/rest/v1/" + path, { method: method, headers: h, body: body !== undefined ? JSON.stringify(body) : undefined });
    var txt = await r.text(), j = null; try { j = txt ? JSON.parse(txt) : null; } catch (e) { }
    if (!r.ok) throw apiError(r.status, j);
    var cr = r.headers.get("content-range");
    return { data: j, count: cr && cr.indexOf("/") > -1 && cr.split("/")[1] !== "*" ? parseInt(cr.split("/")[1], 10) : null };
  }
  function get(path, o) { return rest("GET", path, undefined, o).then(function (r) { return r.data || []; }); }
  function encPath(p) { return String(p).split("/").map(encodeURIComponent).join("/"); }

  /* ---------- Storage ---------- */
  async function upload(path, blob) {
    var r = await req(URL_ + "/storage/v1/object/" + BUCKET + "/" + encPath(path), { method: "POST", headers: { "Content-Type": blob.type || "application/octet-stream", "x-upsert": "false", "cache-control": "max-age=31536000" }, body: blob });
    if (!r.ok) { var j = await r.json().catch(function () { return {}; }); throw new Error(r.status === 403 || r.status === 401 ? ERR_AR["42501"] : (j.message || "فشل رفع الصورة (" + r.status + ")")); }
  }
  async function removeFiles(paths) {
    var r = await req(URL_ + "/storage/v1/object/" + BUCKET, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prefixes: paths }) });
    if (!r.ok) throw new Error("فشل حذف ملف الصورة (" + r.status + ")");
  }
  function publicUrl(path) { return URL_ + "/storage/v1/object/public/" + BUCKET + "/" + encPath(path); }
  /* تصغير الصورة قبل الرفع (أخفّ على الهاتف والقاعدة): أقصى 1600px، WebP ثم JPEG احتياطاً، وأقل من 5MB */
  async function prepareImage(file) {
    if (!/^image\/(jpeg|png|webp|avif|gif)$/.test(file.type)) throw new Error("نوع الملف غير مدعوم (استعمل JPG أو PNG أو WebP).");
    var bmp = await createImageBitmap(file), max = 1600, k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    var c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    function toBlob(type, q) { return new Promise(function (res) { c.toBlob(res, type, q); }); }
    var b = await toBlob("image/webp", 0.85), ext = "webp";
    if (!b || b.type !== "image/webp") { b = await toBlob("image/jpeg", 0.88); ext = "jpg"; }
    if (!b) throw new Error("تعذّرت معالجة الصورة.");
    if (b.size > 5 * 1024 * 1024) throw new Error("الصورة كبيرة جداً بعد المعالجة (أكثر من 5 ميغابايت).");
    return { blob: b, ext: ext };
  }

  /* ---------- واجهة ---------- */
  function toast(msg, kind) {
    var box = document.getElementById("toasts"); if (!box) return;
    var d = document.createElement("div"); d.className = "toast " + (kind || ""); d.setAttribute("role", "status"); d.textContent = msg; box.appendChild(d);
    setTimeout(function () { d.remove(); }, kind === "err" ? 6000 : 3000);
  }
  function modal(content, opts) {
    return new Promise(function (resolve) {
      var ov = document.createElement("div"); ov.className = "ov"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
      var b = document.createElement("div"); b.className = "modal"; mount(b, content); ov.appendChild(b); document.body.appendChild(ov);
      function close(v) { ov.remove(); resolve(v); }
      ov.addEventListener("click", function (e) { if (e.target === ov && !(opts && opts.sticky)) close(null); var a = e.target.closest("[data-mclose]"); if (a) close(a.getAttribute("data-mclose")); });
      b.__close = close; ov.__box = b; var f = b.querySelector("input,select,textarea,button"); if (f) f.focus();
      if (opts && opts.onOpen) opts.onOpen(b, close);
    });
  }
  function confirmBox(msg, okText, danger) {
    return modal(html`<p class="mtxt">${msg}</p><div class="row end"><button class="btn" data-mclose="">إلغاء</button><button class="btn ${danger ? "danger" : "pri"}" data-mclose="yes">${okText || "تأكيد"}</button></div>`).then(function (v) { return v === "yes"; });
  }
  async function busy(btn, fn) {
    if (btn) { if (btn.disabled) return; btn.disabled = true; btn.dataset.t = btn.textContent; btn.textContent = "…"; }
    try { return await fn(); } catch (e) { if (e && e.auth) { window.ADM.onAuthLost && window.ADM.onAuthLost(); } else toast(e.message || "حدث خطأ", "err"); }
    finally { if (btn) { btn.disabled = false; btn.textContent = btn.dataset.t; } }
  }

  window.ADM = { cfg: { url: URL_, key: KEY, bucket: BUCKET, ready: !!(URL_ && KEY), mode: DS.mode, whatsapp: ((window.ATHAR_CONFIG || {}).order || {}).whatsappNumber || "" },
    esc: esc, raw: raw, html: html, mount: mount, money: money, dt: dt, slugify: slugify, STATUS_AR: STATUS_AR, PSTATUS_AR: PSTATUS_AR,
    loadS: loadS, login: login, logout: logout, refresh: refresh, session: function () { return session; }, get: get, rest: rest,
    upload: upload, removeFiles: removeFiles, publicUrl: publicUrl, prepareImage: prepareImage, req: req, toast: toast, modal: modal, confirm: confirmBox, busy: busy, views: {}, perms: {},
    can: function (p) { var A = window.ADM; return A.role === "admin" || (A.role === "staff" && !!A.perms && A.perms[p] === true); } };
})();
