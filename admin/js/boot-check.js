/* إن لم تُحمَّل ملفات اللوحة خلال 5 ثوانٍ تظهر رسالة توضيحية بدل «جاري التحميل» الأبدي */
setTimeout(function () {
  if (window.ADM && window.ADM.views && window.ADM.views.orders) return;
  var a = document.getElementById("app"); if (!a) return;
  a.innerHTML = '<p class="boot" style="line-height:2">تعذّر تحميل ملفات اللوحة.<br>افتح الملف <b>admin-standalone.html</b> (ملف واحد يعمل مباشرة من الهاتف)،<br>أو شغّل الموقع على خادم/استضافة ثم افتح <b>/admin/</b>.</p>';
}, 5000);
