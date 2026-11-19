/* قناة تسجيل الطلب في Supabase عبر الدالة الآمنة create_order — غير مُحمَّلة في أي صفحة وغير مفعّلة (مرحلة لاحقة بعد موافقة المالك).
   لا يُرسل المتصفح أي سعر: القاعدة تقرأ الأسعار والمخزون بنفسها. تُرجع وعداً بملخص الطلب {order_number,total,...} أو ترفضه برمز خطأ. */
(function () {
  "use strict";
  function send(cfg, customer, items, clientRef) {
    var ds = cfg.dataSource;
    if (!ds.supabaseUrl || !ds.supabaseKey) return Promise.reject(new Error("not_configured"));
    var body = {
      p_customer: {
        full_name: customer.fullName, phone: customer.phone, wilaya_code: customer.wilayaCode,
        commune_code: customer.communeCode || null, commune_name: customer.communeName || null,
        address: customer.address, notes: customer.notes || null, lang: customer.lang || "ar", client_ref: clientRef || null
      },
      p_items: items.map(function (i) { return { slug: i.slug, quantity: i.quantity }; })
    };
    return fetch(ds.supabaseUrl.replace(/\/+$/, "") + "/rest/v1/rpc/create_order", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ds.supabaseKey, Authorization: "Bearer " + ds.supabaseKey },
      body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) { var e = new Error(j && j.message || "error"); e.code = j && j.message; e.detail = j && j.details; throw e; }
        return j;
      });
    });
  }
  (typeof window !== "undefined" ? window : globalThis).ATHAR_SUPABASE_ORDER = { send: send };
})();
