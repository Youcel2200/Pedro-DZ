/* عامل خدمة المتجر: يتيح تثبيته كتطبيق. الشبكة أولاً دائماً (الأسعار والمخزون حيّة)، والتخزين فقط للرجوع عند انقطاع الإنترنت.
   لا يلمس Supabase ولا الطلبات ولا لوحة الإدارة. */
var C = "athar-store-v1";
self.addEventListener("install", function (e) { e.waitUntil(caches.open(C).then(function (c) { return c.addAll(["/", "/css/style.css", "/assets/icons/icon-192.png"]); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener("activate", function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener("fetch", function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin || u.pathname.indexOf("/admin/") === 0) return;
  e.respondWith(fetch(r).then(function (res) {
    if (res && res.ok && r.mode === "navigate") { var cp = res.clone(); caches.open(C).then(function (c) { c.put(r, cp); }); }
    return res;
  }).catch(function () { return caches.match(r).then(function (m) { return m || (r.mode === "navigate" ? caches.match("/") : Response.error()); }); }));
});
