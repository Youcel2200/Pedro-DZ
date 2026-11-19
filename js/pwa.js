/* تثبيت المتجر كتطبيق أندرويد (PWA): تسجيل عامل الخدمة + زر «تثبيت التطبيق» عندما يسمح المتصفح. */
(function () {
  "use strict";
  var fr = (document.documentElement.lang || "ar") === "fr", dp = null;
  var T = fr ? { i: "Installer l'application", x: "Fermer", ios: "Pour installer : Partager ← « Sur l'écran d'accueil »." } : { i: "تثبيت التطبيق", x: "إغلاق", ios: "للتثبيت: زر المشاركة ← «إضافة إلى الشاشة الرئيسية»." };
  function isStandalone() { return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; }
  function dismissed() { try { return localStorage.getItem("athar_pwa_x") === "1"; } catch (e) { return false; } }
  function bar(text, withBtn) {
    if (isStandalone() || dismissed() || document.getElementById("pwa-bar")) return;
    var d = document.createElement("div"); d.id = "pwa-bar"; d.setAttribute("role", "region");
    d.style.cssText = "position:fixed;inset-inline:12px;bottom:12px;z-index:9999;background:#27382a;color:#fff;border-radius:12px;padding:10px 12px;display:flex;gap:8px;align-items:center;justify-content:space-between;box-shadow:0 6px 24px rgba(0,0,0,.3);font:600 14px Tajawal,system-ui,sans-serif;max-width:420px;margin-inline:auto";
    var s = document.createElement("span"); s.textContent = text; d.appendChild(s);
    var w = document.createElement("span"); w.style.cssText = "display:flex;gap:6px;flex:none";
    if (withBtn) { var b = document.createElement("button"); b.type = "button"; b.textContent = T.i; b.style.cssText = "background:#c9a24a;color:#1b1b1b;border:0;border-radius:8px;padding:8px 12px;font:700 14px inherit;cursor:pointer"; b.onclick = function () { if (!dp) return; dp.prompt(); dp.userChoice.then(function () { dp = null; d.remove(); }); }; w.appendChild(b); }
    var x = document.createElement("button"); x.type = "button"; x.setAttribute("aria-label", T.x); x.textContent = "✕"; x.style.cssText = "background:transparent;color:#fff;border:0;font-size:16px;padding:6px 8px;cursor:pointer";
    x.onclick = function () { try { localStorage.setItem("athar_pwa_x", "1"); } catch (e) { } d.remove(); }; w.appendChild(x); d.appendChild(w); document.body.appendChild(d);
  }
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); dp = e; bar(fr ? "Installez Athar DZ sur votre téléphone" : "ثبّت متجر أثر ديزاد على هاتفك", true); });
  window.addEventListener("appinstalled", function () { var d = document.getElementById("pwa-bar"); if (d) d.remove(); });
  if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !isStandalone()) window.addEventListener("load", function () { setTimeout(function () { bar(T.ios, false); }, 2500); });
  if ("serviceWorker" in navigator && location.protocol === "https:") window.addEventListener("load", function () { try { navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(function () { }); } catch (e) { } });
})();
