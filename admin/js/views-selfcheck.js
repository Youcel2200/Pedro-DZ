/* لوحة الإدارة — «فحص النظام»: اختبار حقيقي بحساب المدير نفسه على القاعدة الحقيقية، بلا كلمات مرور في المحادثة.
   ينشئ عطراً تجريبياً مؤقتاً (zz-selftest-…) بصورة، يعدّله ويتحقق من ظهوره في المتجر، ثم يحذفه ويتحقق من خلو القاعدة والتخزين منه.
   لا يلمس أي بيانات حقيقية (يعمل فقط على صفوف بالبادئة zz-selftest- التي ينشئها بنفسه). */
(function () {
  "use strict";
  var A = window.ADM, html = A.html, raw = A.raw, mount = A.mount, V = A.views;
  var PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  function png() { var b = atob(PNG), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new Blob([u], { type: "image/png" }); }
  async function anon(path, opts) { // طلب بالمفتاح العام فقط = زائر غير مسجّل
    opts = opts || {}; opts.headers = Object.assign({ apikey: A.cfg.key }, opts.headers); return fetch(A.cfg.url + path, opts);
  }

  V.selfcheck = async function (root) {
    if (A.role !== "admin") return mount(root, html`<h1>فحص النظام</h1><p class="muted">هذا القسم للمدير فقط.</p>`);
    mount(root, html`<h1>فحص النظام</h1><p class="muted">اختبار حقيقي لحسابك وللقاعدة والتخزين وظهور البيانات في المتجر. يُنشئ عطراً تجريبياً مؤقتاً ثم يحذفه بالكامل ويتحقق من النظافة. لا يغيّر أي بيانات حقيقية ولا كلمات مرور ولا حسابات.</p>
      <div class="row gap"><button class="btn pri" id="go">▶ تشغيل الفحص</button></div><div class="card" id="out"><p class="muted">اضغط «تشغيل الفحص».</p></div>`);
    var out = root.querySelector("#out");
    root.querySelector("#go").onclick = function (e) { A.busy(e.target, async function () { await run(out); }); };
  };

  async function run(out) {
    var rows = [], fails = 0;
    function draw(final) {
      out.innerHTML = '<ul class="chk-list">' + rows.map(function (r) { return '<li class="' + r[0] + '">' + (r[0] === "ok" ? "✔" : r[0] === "warn" ? "⚠" : r[0] === "bad" ? "✘" : "…") + " " + A.esc(r[1]) + (r[2] ? "<small>" + A.esc(r[2]) + "</small>" : "") + "</li>"; }).join("") + "</ul>" +
        (final ? '<p><b>' + (fails ? "❌ فشلت " + fails + " فحوص — أرسل لي لقطة شاشة لهذه الصفحة." : "✅ نجحت كل الفحوص الحرجة.") + "</b></p>" : "");
    }
    function add(st, name, d) { if (st === "bad") fails++; rows.push([st, name, d || ""]); draw(false); }
    async function step(name, fn, warnOnly) { try { var d = await fn(); add("ok", name, d || ""); return true; } catch (e) { add(warnOnly ? "warn" : "bad", name, e && e.message ? e.message : String(e)); return false; } }
    function must(c, m) { if (!c) throw new Error(m); }
    var id = null, slug = "zz-selftest-" + Math.random().toString(36).slice(2, 8), path = null, sess = A.session() || {}, uid = sess.user && sess.user.id;

    // ===== أ) الإعداد والحساب =====
    await step("الإعداد: رابط Supabase والمفتاح العام موجودان", async function () { must(A.cfg.url && A.cfg.key, "ناقص"); must(!new RegExp("service"+"_role|sb_"+"secret").test(A.cfg.key), "المفتاح سري!"); try { var p = JSON.parse(atob(A.cfg.key.split(".")[1] || "")); must(p.role !== "service"+"_role", "المفتاح service_role!"); } catch (e) { if (e.message === "المفتاح service_role!") throw e; } return A.cfg.url; });
    await step("الدخول: جلسة صالحة لحساب مسجّل", async function () { must(uid, "لا جلسة"); return (sess.user && sess.user.email) || ""; });
    await step("الصلاحية: ملف الإدارة = مدير مفعّل", async function () { var r = await A.get("profiles?select=role,is_active&id=eq." + uid); must(r[0] && r[0].role === "admin" && r[0].is_active === true, "الحساب ليس مديراً مفعّلاً"); return "admin / مفعّل"; });
    await step("المستخدمون: قراءة قائمة الحسابات (للمدير فقط)", async function () { var r = (await A.rest("POST", "rpc/admin_list_users", {})).data; must(Array.isArray(r) && r.length >= 1, "فشلت"); return r.length + " حساب"; });

    // ===== ب) إعدادات Supabase Auth (عامة ومقروءة من المتصفح) =====
    await step("Auth: التسجيل العام مغلق (disable_signup)", async function () {
      var r = await anon("/auth/v1/settings"), j = await r.json(); must(r.ok, "تعذّرت القراءة"); must(j.disable_signup === true, "التسجيل العام مفتوح! أطفئ Allow new users to sign up من Authentication ← Sign In / Providers");
      return "مغلق";
    });
    await step("Auth: مزودو الدخول المفعّلون", async function () { var j = await (await anon("/auth/v1/settings")).json(), on = Object.keys(j.external || {}).filter(function (k) { return j.external[k] && k !== "email" && k !== "phone"; }); must(!on.length, "مفعّل: " + on.join("، ") + " (غير مطلوب؛ أطفئه)"); return "البريد وكلمة المرور فقط"; }, true);

    // ===== ج) الزائر غير المسجل =====
    await step("الزائر: لا يقرأ الطلبات", async function () { var r = await anon("/rest/v1/orders?select=id&limit=1"); var j = await r.json().catch(function () { return null; }); must(Array.isArray(j) && j.length === 0 || r.status === 401 || r.status === 403, "ظهرت بيانات!"); return "لا شيء"; });
    await step("الزائر: لا يقرأ ملفات الإدارة", async function () { var r = await anon("/rest/v1/profiles?select=id&limit=1"), j = await r.json().catch(function () { return null; }); must(Array.isArray(j) && j.length === 0 || r.status >= 400, "ظهرت بيانات!"); return "لا شيء"; });
    await step("الزائر: لا يستطيع إضافة عطر", async function () { var r = await anon("/rest/v1/products", { method: "POST", headers: { "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ slug: "zz-visitor-should-fail", name_ar: "x", name_fr: "x", brand: "x", price: 1 }) }); must(r.status === 401 || r.status === 403, "قُبلت الكتابة! (" + r.status + ")"); return "مرفوض (" + r.status + ")"; });
    await step("الزائر: لا يعدّل التوصيل ولا الإعدادات", async function () { var a = await anon("/rest/v1/delivery_zones?wilaya_code=eq.12", { method: "PATCH", headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify({ fee_dzd: 1 }) }); var t = await a.text(); must(a.status >= 400 || t === "[]", "قُبل التعديل!"); var b = await anon("/rest/v1/store_settings?key=eq.currency", { method: "PATCH", headers: { "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify({ value: "x" }) }); var t2 = await b.text(); must(b.status >= 400 || t2 === "[]", "قُبل التعديل!"); return "مرفوض"; });
    await step("الزائر: لا يرفع ملفاً ولا يستدعي قائمة المستخدمين", async function () { var a = await anon("/storage/v1/object/" + A.cfg.bucket + "/00000000-0000-4000-8000-000000000000/x.png", { method: "POST", headers: { "Content-Type": "image/png" }, body: png() }); must(a.status === 400 || a.status === 401 || a.status === 403, "قُبل الرفع! (" + a.status + ")"); var b = await anon("/rest/v1/rpc/admin_list_users", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }); must(b.status >= 400, "قُبل الاستدعاء!"); return "مرفوض"; });

    // ===== د) عطر تجريبي كامل =====
    var created = await step("إضافة عطر تجريبي (مسودة)", async function () {
      var r = await A.rest("POST", "products", { slug: slug, name_ar: "عطر فحص مؤقت", name_fr: "Parfum test", brand: "ZZ-TEST", price: 1111, status: "draft" }); id = r.data[0].id; must(id, "لا معرّف"); return slug;
    });
    if (created) {
      await step("المسودة مخفية عن الزائر", async function () { var j = await (await anon("/rest/v1/products?slug=eq." + slug + "&select=id")).json(); must(Array.isArray(j) && j.length === 0, "ظاهرة للزائر!"); });
      await step("المخزون: يُنشأ تلقائياً ويُعدَّل", async function () { await A.rest("PATCH", "inventory?product_id=eq." + id, { quantity: 5 }, { minimal: true }); var r = await A.get("inventory?select=quantity&product_id=eq." + id); must(r[0] && r[0].quantity === 5, "لم يُحفظ"); return "5"; });
      await step("رفع صورة تجريبية إلى Storage", async function () { path = id + "/selftest.png"; await A.upload(path, png()); var r = await A.rest("POST", "product_images", { product_id: id, storage_path: path, sort_order: 0, is_primary: true, alt_ar: "فحص" }); must(r.data[0], "لا صف"); return path; });
      await step("الصورة متاحة علناً عبر الرابط العام", async function () { var r = await fetch(A.publicUrl(path), { cache: "no-store" }); must(r.ok, "HTTP " + r.status); return "HTTP " + r.status; });
      await step("النشر ثم ظهور العطر في المتجر للزائر (بالسعر والصورة والمخزون)", async function () {
        await A.rest("PATCH", "products?id=eq." + id, { status: "published" }, { minimal: true });
        var j = await (await anon("/rest/v1/storefront_products?slug=eq." + slug + "&select=slug,price,images,stock_status,stock_qty")).json();
        must(Array.isArray(j) && j.length === 1, "لا يظهر في storefront_products"); must(Number(j[0].price) === 1111, "السعر مختلف"); must(j[0].images && j[0].images.length === 1, "الصورة لا تظهر"); must(j[0].stock_status === "in_stock" && j[0].stock_qty === 5, "المخزون مختلف"); return "السعر 1111 · صورة · متوفر 5";
      });
      await step("التعديل: السعر الجديد يظهر للزائر", async function () { await A.rest("PATCH", "products?id=eq." + id, { price: 2222 }, { minimal: true }); var j = await (await anon("/rest/v1/storefront_products?slug=eq." + slug + "&select=price")).json(); must(j[0] && Number(j[0].price) === 2222, "لم يتغير"); return "2222"; });
    }
    // ===== هـ) التنظيف (يعمل دائماً) =====
    var clean = true;
    if (id) {
      clean = await step("حذف الصورة من Storage", async function () { if (path) await A.removeFiles([path]); return "تم"; }) && clean;
      clean = await step("حذف العطر التجريبي (والصور والمخزون المرتبطة)", async function () { await A.rest("DELETE", "products?id=eq." + id, undefined, { minimal: true }); return "تم"; }) && clean;
    }
    await step("النظافة: لا بقايا zz-selftest في العطور", async function () { var r = await A.get("products?select=id&slug=like.zz-selftest-*"); must(r.length === 0, r.length + " بقايا!"); return "0"; });
    await step("النظافة: لا بقايا في المخزون وصور المنتجات", async function () { var a = await A.get("product_images?select=id&storage_path=like.*selftest.png"); must(a.length === 0, "صور متبقية"); if (id) { var b = await A.get("inventory?select=product_id&product_id=eq." + id); must(b.length === 0, "مخزون متبقٍ"); } return "0"; });
    await step("النظافة: لا ملف متبقٍ في Storage", async function () { if (!id) return "لا شيء"; var r = await A.req(A.cfg.url + "/storage/v1/object/list/" + A.cfg.bucket, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prefix: id, limit: 10 }) }), j = await r.json(); must(r.ok && Array.isArray(j) && j.length === 0, "ملفات متبقية: " + (Array.isArray(j) ? j.length : r.status)); return "0"; });

    // ===== و) الطلبات وواتساب =====
    await step("الطلبات الحقيقية مفعّلة (channel = supabase)", async function () { var c = (window.ATHAR_CONFIG || {}).order || {}; must(c.channel === "supabase", "القناة = " + c.channel + " (غير مفعّلة)"); return "supabase"; });
    await step("واتساب: الرابط الحالي كما هو", async function () { var u = ((window.ATHAR_CONFIG || {}).social || {}).whatsapp; must(/wa\.me\/213771683294/.test(u || ""), "تغيّر: " + u); return u; });
    await step("لا طلبات حقيقية في القاعدة", async function () { var r = await A.rest("GET", "orders?select=id&limit=1", undefined, { count: true }); return "عدد الطلبات: " + ((r.count == null) ? r.data.length : r.count); }, true);
    draw(true);
  }
})();
