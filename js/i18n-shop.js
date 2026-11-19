/* ترجمات المرحلة 2: السلة، إتمام الطلب، المعرض، فلتر الجنس */
(function () {
  var I = window.ATHAR_I18N;
  I.extend("ar", {
    "cart.title": "سلة المشتريات", "cart.empty": "سلتك فارغة", "cart.emptyHint": "تصفّح العطور وأضف ما يعجبك إلى السلة.",
    "cart.continue": "متابعة التسوق", "cart.checkout": "إتمام الطلب", "cart.subtotal": "مجموع المنتجات",
    "cart.delivery": "التوصيل", "cart.deliveryPending": "يُحدَّد لاحقاً", "cart.total": "الإجمالي", "cart.totalPartial": "الإجمالي (دون التوصيل)",
    "cart.remove": "حذف", "cart.qty": "الكمية", "cart.inc": "زيادة الكمية", "cart.dec": "تقليل الكمية", "cart.unit": "سعر الوحدة", "cart.lineTotal": "المجموع",
    "cart.unavailable": "غير متوفر حالياً — لن يُدرج في الطلب", "cart.adjusted": "عُدّلت الكمية إلى {n} (الحد المتاح).",
    "cart.missing": "أُزيل من السلة عطر لم يعد متاحاً في الكتالوج.", "cart.clear": "تفريغ السلة", "cart.items": "{n} قطعة", "cart.maxNote": "الحد الأقصى {n} لكل عطر.",
    "cart.aria": "السلة ({n})", "cart.loadError": "تعذّر تحميل السلة. حدّث الصفحة وحاول مجدداً.",
    "add.btn": "أضف إلى السلة", "add.added": "أُضيف «{name}» إلى السلة", "add.viewCart": "عرض السلة", "add.max": "بلغت الحد الأقصى ({n}) لهذا العطر.",
    "add.out": "هذا العطر غير متوفر حالياً.", "add.partial": "أُضيف جزء من الكمية؛ الحد الأقصى {n}.", "add.outBtn": "غير متوفر", "add.quick": "إضافة سريعة إلى السلة",
    "add.inCart": "في سلتك: {n}", "p.qtyAvail": "الكمية المتاحة", "p.qty": "الكمية",
    "demo.cartNote": "بيانات تجريبية: السلة والطلب هنا لأغراض الاختبار فقط، ولا يُنفَّذ أي طلب حقيقي.",
    "co.title": "إتمام الطلب", "co.back": "العودة إلى السلة", "co.customer": "بيانات الزبون", "co.fullName": "الاسم الكامل", "co.phone": "رقم الهاتف",
    "co.phoneHint": "رقم جزائري محمول، مثال: 0555 12 34 56", "co.wilaya": "الولاية", "co.wilayaPick": "اختر الولاية", "co.commune": "البلدية",
    "co.address": "العنوان التفصيلي", "co.notes": "ملاحظات إضافية (اختياري)", "co.summary": "ملخص الطلب",
    "co.send": "إرسال الطلب عبر واتساب", "co.copy": "نسخ ملخص الطلب", "co.copied": "تم نسخ ملخص الطلب.",
    "co.noWa": "الإرسال عبر واتساب غير مفعّل بعد لأن رقم المتجر لم يُضبط. يمكنك نسخ ملخص الطلب وإرساله بنفسك.",
    "co.honest": "ملاحظة: لا يُحفظ الطلب في أي قاعدة بيانات؛ يُرسل فقط عبر واتساب عند توفره، ولا يُعد مؤكداً حتى يردّ عليك المتجر.",
    "co.fixErrors": "يرجى تصحيح الحقول المشار إليها.", "co.emptyCart": "لا توجد منتجات في السلة. أضف عطراً أولاً.",
    "co.sentTitle": "تم فتح واتساب بالرسالة الجاهزة", "co.sentText": "أرسل الرسالة من واتساب لإكمال طلبك. لم يُسجَّل الطلب في أي نظام، ولا يُعد مؤكداً حتى يردّ عليك المتجر.",
    "co.submitDb": "تأكيد الطلب", "co.sending": "جارٍ إرسال الطلب…", "co.placedTitle": "تم تسجيل طلبك", "co.placedText": "استلمنا طلبك وسنتصل بك قريباً لتأكيده.", "co.orderNo": "رقم الطلب", "co.placedFee": "سعر التوصيل سيُحدَّد ويُبلَّغ به عند الاتصال بك.", "co.honestDb": "عند التأكيد يُسجَّل طلبك لدى المتجر، ولا يُعد نهائياً حتى نتصل بك ونؤكده.",
    "dberr.generic": "تعذّر تسجيل الطلب، حاول مجدداً بعد قليل.", "dberr.network": "تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مجدداً.", "dberr.insufficient_stock": "الكمية المطلوبة من أحد العطور غير متوفرة حالياً. عدّل السلة وحاول مجدداً.", "dberr.product_unavailable": "أحد العطور لم يعد متاحاً. عدّل السلة وحاول مجدداً.", "dberr.too_many_orders": "تجاوزت عدد الطلبات المسموح به مؤقتاً. حاول لاحقاً أو تواصل معنا عبر واتساب.", "dberr.service_busy": "الخدمة مشغولة الآن، حاول بعد دقائق.", "dberr.quantity_exceeds_limit": "الكمية تتجاوز الحد المسموح لعطر واحد.",
    "co.ref": "مرجع الطلب", "co.textBox": "نص الطلب (يمكنك نسخه وإرساله)", "co.feeNote": "سيُحدَّد سعر التوصيل لاحقاً ويُبلَّغ به الزبون قبل التأكيد.",
    "co.unavailableWarn": "بعض المنتجات غير متوفرة ولن تُدرج في الطلب.", "co.reviewing": "راجع طلبك",
    "err.required": "هذا الحقل مطلوب.", "err.fullname": "اكتب الاسم الكامل (الاسم واللقب).", "err.phone": "رقم هاتف جزائري غير صالح (05 أو 06 أو 07 متبوعاً بثمانية أرقام).",
    "err.wilaya": "اختر ولاية صحيحة.", "err.short": "القيمة قصيرة جداً.", "err.address": "اكتب عنواناً تفصيلياً (8 أحرف على الأقل).",
    "meta.cart.title": "سلة المشتريات | أثر ديزاد Athar DZ", "meta.checkout.title": "إتمام الطلب | أثر ديزاد Athar DZ",
    "home.best": "الأكثر طلباً", "home.bestSub": "العطور الأكثر طلباً لدى زبائننا", "home.offers": "عروض خاصة", "home.offersSub": "تخفيضات على عطور مختارة",
    "f.gender": "الفئة المستهدفة", "f.genderAll": "الكل",
    "lb.open": "تكبير الصورة", "lb.close": "إغلاق", "lb.prev": "الصورة السابقة", "lb.next": "الصورة التالية", "lb.zoom": "تكبير / تصغير", "lb.counter": "{i} / {n}"
  });
  I.extend("fr", {
    "cart.title": "Panier", "cart.empty": "Votre panier est vide", "cart.emptyHint": "Parcourez les parfums et ajoutez vos favoris au panier.",
    "cart.continue": "Continuer mes achats", "cart.checkout": "Passer la commande", "cart.subtotal": "Sous-total",
    "cart.delivery": "Livraison", "cart.deliveryPending": "À définir", "cart.total": "Total", "cart.totalPartial": "Total (hors livraison)",
    "cart.remove": "Supprimer", "cart.qty": "Quantité", "cart.inc": "Augmenter la quantité", "cart.dec": "Diminuer la quantité", "cart.unit": "Prix unitaire", "cart.lineTotal": "Total",
    "cart.unavailable": "Indisponible actuellement — non inclus dans la commande", "cart.adjusted": "Quantité ajustée à {n} (maximum disponible).",
    "cart.missing": "Un parfum qui n'est plus au catalogue a été retiré du panier.", "cart.clear": "Vider le panier", "cart.items": "{n} article(s)", "cart.maxNote": "Maximum {n} par parfum.",
    "cart.aria": "Panier ({n})", "cart.loadError": "Impossible de charger le panier. Actualisez la page et réessayez.",
    "add.btn": "Ajouter au panier", "add.added": "« {name} » ajouté au panier", "add.viewCart": "Voir le panier", "add.max": "Vous avez atteint le maximum ({n}) pour ce parfum.",
    "add.out": "Ce parfum est actuellement indisponible.", "add.partial": "Quantité partiellement ajoutée ; maximum {n}.", "add.outBtn": "Indisponible", "add.quick": "Ajout rapide au panier",
    "add.inCart": "Dans votre panier : {n}", "p.qtyAvail": "Quantité disponible", "p.qty": "Quantité",
    "demo.cartNote": "Données de test : le panier et la commande ne servent qu'aux essais ; aucune vraie commande n'est traitée.",
    "co.title": "Finaliser la commande", "co.back": "Retour au panier", "co.customer": "Vos informations", "co.fullName": "Nom complet", "co.phone": "Téléphone",
    "co.phoneHint": "Mobile algérien, ex. : 0555 12 34 56", "co.wilaya": "Wilaya", "co.wilayaPick": "Choisir la wilaya", "co.commune": "Commune",
    "co.address": "Adresse détaillée", "co.notes": "Remarques (facultatif)", "co.summary": "Récapitulatif",
    "co.send": "Envoyer la commande par WhatsApp", "co.copy": "Copier le récapitulatif", "co.copied": "Récapitulatif copié.",
    "co.noWa": "L'envoi par WhatsApp n'est pas encore activé : le numéro de la boutique n'est pas configuré. Vous pouvez copier le récapitulatif et l'envoyer vous-même.",
    "co.honest": "Remarque : la commande n'est enregistrée dans aucune base de données ; elle est seulement envoyée par WhatsApp lorsque disponible, et n'est confirmée qu'après réponse de la boutique.",
    "co.fixErrors": "Veuillez corriger les champs indiqués.", "co.emptyCart": "Votre panier est vide. Ajoutez d'abord un parfum.",
    "co.sentTitle": "WhatsApp s'est ouvert avec le message prêt", "co.sentText": "Envoyez le message depuis WhatsApp pour finaliser. La commande n'est enregistrée dans aucun système et n'est confirmée qu'après réponse de la boutique.",
    "co.submitDb": "Confirmer la commande", "co.sending": "Envoi de la commande…", "co.placedTitle": "Votre commande est enregistrée", "co.placedText": "Nous avons bien reçu votre commande et vous appellerons bientôt pour la confirmer.", "co.orderNo": "N° de commande", "co.placedFee": "Les frais de livraison seront fixés et communiqués lors de l'appel.", "co.honestDb": "En confirmant, votre commande est enregistrée auprès de la boutique ; elle n'est définitive qu'après notre appel de confirmation.",
    "dberr.generic": "La commande n'a pas pu être enregistrée, réessayez dans un instant.", "dberr.network": "Connexion au serveur impossible. Vérifiez votre connexion et réessayez.", "dberr.insufficient_stock": "La quantité demandée d'un parfum n'est plus disponible. Modifiez le panier et réessayez.", "dberr.product_unavailable": "Un des parfums n'est plus disponible. Modifiez le panier et réessayez.", "dberr.too_many_orders": "Nombre de commandes temporairement dépassé. Réessayez plus tard ou contactez-nous sur WhatsApp.", "dberr.service_busy": "Service occupé, réessayez dans quelques minutes.", "dberr.quantity_exceeds_limit": "La quantité dépasse la limite par parfum.",
    "co.ref": "Référence", "co.textBox": "Texte de la commande (à copier et envoyer)", "co.feeNote": "Les frais de livraison seront communiqués avant confirmation.",
    "co.unavailableWarn": "Certains produits sont indisponibles et ne seront pas inclus.", "co.reviewing": "Vérifiez votre commande",
    "err.required": "Ce champ est obligatoire.", "err.fullname": "Saisissez le nom complet (prénom et nom).", "err.phone": "Numéro algérien invalide (05, 06 ou 07 suivi de 8 chiffres).",
    "err.wilaya": "Choisissez une wilaya valide.", "err.short": "Valeur trop courte.", "err.address": "Saisissez une adresse détaillée (8 caractères minimum).",
    "meta.cart.title": "Panier | Athar DZ", "meta.checkout.title": "Finaliser la commande | Athar DZ",
    "home.best": "Les plus demandés", "home.bestSub": "Les parfums les plus demandés par nos clients", "home.offers": "Offres spéciales", "home.offersSub": "Des remises sur une sélection de parfums",
    "f.gender": "Public visé", "f.genderAll": "Tous",
    "lb.open": "Agrandir l'image", "lb.close": "Fermer", "lb.prev": "Image précédente", "lb.next": "Image suivante", "lb.zoom": "Zoom avant / arrière", "lb.counter": "{i} / {n}"
  });
  /* ترجمات التعديلات: «اطلب الآن»، دوائر وبلديات تبسة، وسائل التواصل */
  I.extend("ar", {
    "buy.now": "اطلب الآن", "buy.nowShort": "اطلب الآن", "buy.nowAria": "اطلب الآن: {name}",
    "co.directTitle": "طلب مباشر", "co.directNote": "هذا طلب مباشر لهذا العطر فقط؛ لم يُضف إلى السلة ولم تتغير محتويات سلتك.",
    "co.directCart": "عرض السلة", "co.directBack": "العودة إلى العطر",
    "co.nowUnavailable": "هذا العطر غير متوفر حالياً ولا يمكن طلبه.", "co.nowMissing": "العطر المطلوب غير موجود في الكتالوج.",
    "co.daira": "الدائرة", "co.dairaPick": "اختر الدائرة", "co.communePick": "اختر البلدية", "co.communePickFirst": "اختر الدائرة أولاً",
    "err.daira": "اختر دائرة من القائمة.", "err.commune": "اختر بلدية من القائمة.",
    "contact.help": "تحتاج مساعدة قبل إتمام الطلب؟", "contact.helpText": "تواصل معنا مباشرة عبر واتساب أو الهاتف.",
    "contact.whatsappCta": "تواصل عبر واتساب", "contact.callUs": "اتصل بنا", "contact.social": "حساباتنا",
    "wa.float": "تواصل معنا عبر واتساب", "wa.floatShort": "واتساب", "ext.new": "يفتح في نافذة جديدة"
  });
  I.extend("fr", {
    "buy.now": "Commander maintenant", "buy.nowShort": "Commander", "buy.nowAria": "Commander maintenant : {name}",
    "co.directTitle": "Commande directe", "co.directNote": "Commande directe pour ce parfum uniquement : il n'a pas été ajouté au panier et votre panier n'a pas changé.",
    "co.directCart": "Voir le panier", "co.directBack": "Retour au parfum",
    "co.nowUnavailable": "Ce parfum est actuellement indisponible et ne peut pas être commandé.", "co.nowMissing": "Le parfum demandé n'existe pas au catalogue.",
    "co.daira": "Daïra", "co.dairaPick": "Choisir la daïra", "co.communePick": "Choisir la commune", "co.communePickFirst": "Choisissez d'abord la daïra",
    "err.daira": "Choisissez une daïra dans la liste.", "err.commune": "Choisissez une commune dans la liste.",
    "contact.help": "Besoin d'aide avant de commander ?", "contact.helpText": "Contactez-nous directement par WhatsApp ou par téléphone.",
    "contact.whatsappCta": "Écrire sur WhatsApp", "contact.callUs": "Appelez-nous", "contact.social": "Nos réseaux",
    "wa.float": "Discuter avec nous sur WhatsApp", "wa.floatShort": "WhatsApp", "ext.new": "S'ouvre dans un nouvel onglet"
  });
})();
