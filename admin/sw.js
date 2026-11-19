/* عامل خدمة بسيط: يسمح بتثبيت اللوحة كتطبيق. لا يخزّن أي بيانات من Supabase ولا الطلبات. */
var C = "athar-admin-shell-v1", SHELL = ["./", "admin.css", "icon-192.png"];
self.addEventListener("install", function (e) { e.waitUntil(caches.open(C).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener("activate", function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== C; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener("fetch", function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin || u.pathname.indexOf("/admin/") !== 0) return; /* كل ما عداه يمرّ مباشرة للشبكة */
  e.respondWith(fetch(r).catch(function () { return caches.match(r).then(function (m) { return m || (r.mode === "navigate" ? caches.match("./") : Response.error()); }); }));
});
