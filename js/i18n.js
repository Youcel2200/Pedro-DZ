/* الترجمة وتبديل اللغة والاتجاه (عربي RTL / فرنسي LTR) */
(function () {
  var LS_KEY = "athar_lang";

  var D = {
    ar: {
      "meta.home.title": "أثر ديزاد | Athar DZ — متجر العطور الفاخرة",
      "meta.home.desc": "أثر ديزاد | Athar DZ: متجر عطور فاخرة. اكتشفوا عطوراً رجالية ونسائية وللجنسين، شرقية وفاخرة.",
      "meta.catalog.title": "جميع العطور | أثر ديزاد Athar DZ",
      "meta.catalog.desc": "تصفّح كتالوج العطور الكامل مع البحث والتصفية حسب الفئة والسعر والحجم والتركيز.",
      "meta.product.title": "عطر | أثر ديزاد Athar DZ",
      "meta.privacy.title": "سياسة الخصوصية | أثر ديزاد Athar DZ",
      "meta.terms.title": "شروط الاستخدام | أثر ديزاد Athar DZ",
      "meta.notfound.title": "الصفحة غير موجودة | أثر ديزاد Athar DZ",

      "nav.home": "الرئيسية", "nav.all": "جميع العطور", "nav.men": "عطور رجالية", "nav.women": "عطور نسائية",
      "nav.unisex": "عطور للجنسين", "nav.oriental": "عطور شرقية", "nav.luxury": "عطور فاخرة", "nav.offers": "عروض خاصة",
      "nav.menu": "القائمة", "nav.close": "إغلاق", "nav.skip": "تخطّي إلى المحتوى",
      "ui.search": "بحث", "ui.cart": "السلة", "ui.lang": "Français", "ui.langTitle": "Changer la langue en français",
      "ui.cartSoon": "السلة ستتوفر في المرحلة القادمة.",
      "ui.searchPlaceholder": "ابحث باسم العطر أو العلامة التجارية…", "ui.searchGo": "بحث",
      "ui.noResultsShort": "لا توجد نتائج مطابقة.",
      "demo.notice": "بيانات تجريبية للاختبار فقط — هذه العطور ليست منتجات حقيقية متوفرة للبيع.",
      "demo.tag": "تجريبي",

      "hero.eyebrow": "متجر العطور الفاخرة", "hero.cta": "اكتشف العطور", "hero.cta2": "عطور فاخرة",
      "hero.imgAlt": "صورة توضيحية لقارورة عطر فاخرة بالأخضر والذهبي",
      "logo.alt": "شعار أثر ديزاد Athar DZ",

      "cats.title": "تسوّق حسب القسم", "cats.sub": "اختر ما يناسب ذوقك",
      "cat.men": "عطور رجالية", "cat.women": "عطور نسائية", "cat.unisex": "عطور للجنسين", "cat.oriental": "عطور شرقية",
      "cat.luxury": "عطور فاخرة", "cat.economy": "عطور اقتصادية", "cat.new": "أحدث الإصدارات", "cat.bestsellers": "الأكثر طلباً",
      "cat.offers": "عروض خاصة", "cat.all": "جميع العطور",
      "cats.explore": "استكشف",

      "home.latest": "أحدث العطور", "home.latestSub": "آخر ما أُضيف إلى المتجر", "home.viewAll": "عرض كل العطور",
      "home.featured": "العطور المميزة", "home.featuredSub": "اختيارات فاخرة لمن يبحث عن الأثر الأعمق",

      "card.details": "عرض التفاصيل", "card.new": "جديد", "card.best": "الأكثر طلباً", "card.offer": "عرض",
      "card.inspired": "عطر مستوحى", "card.original": "عطر أصلي", "card.originalVerified": "أصلي موثّق",
      "stock.in_stock": "متوفر", "stock.low_stock": "كمية محدودة", "stock.out_of_stock": "غير متوفر",
      "gender.men": "رجالي", "gender.women": "نسائي", "gender.unisex": "للجنسين",
      "conc.EDP": "Eau de Parfum", "conc.EDT": "Eau de Toilette", "conc.Parfum": "Parfum", "conc.EDC": "Eau de Cologne", "conc.Extrait": "Extrait de Parfum",
      "ml": "مل",
      "fam.oriental": "شرقي", "fam.floral": "زهري", "fam.fresh": "منعش", "fam.woody": "خشبي", "fam.oud": "عودي", "fam.musky": "مسكي",

      "cat.h1": "جميع العطور", "cat.lead": "تصفّح الكتالوج الكامل، وابحث وصفِّ حسب ما يناسبك.",
      "f.search": "بحث بالاسم أو العلامة", "f.category": "الفئة", "f.priceMin": "السعر من", "f.priceMax": "إلى",
      "f.size": "الحجم", "f.concentration": "التركيز", "f.type": "النوع", "f.typeAll": "الكل",
      "f.typeOriginal": "أصلي", "f.typeInspired": "مستوحى / بديل",
      "f.sort": "الترتيب", "f.sortNewest": "الأحدث", "f.sortPriceAsc": "السعر: من الأقل", "f.sortPriceDesc": "السعر: من الأعلى",
      "f.sortPopular": "الأكثر طلباً", "f.reset": "إعادة التعيين", "f.filters": "التصفية", "f.apply": "عرض النتائج",
      "f.inStock": "المتوفر فقط",
      "res.count": "{n} عطر", "res.none": "لا توجد عطور مطابقة لبحثك.", "res.noneHint": "جرّب تعديل الفلاتر أو إعادة تعيينها.",
      "res.error": "تعذّر تحميل العطور. حدّث الصفحة وحاول مجدداً.",

      "p.back": "جميع العطور", "p.brand": "العلامة التجارية", "p.size": "الحجم", "p.concentration": "التركيز", "p.target": "الفئة المستهدفة",
      "p.origin": "بلد المنشأ", "p.family": "العائلة العطرية", "p.type": "النوع", "p.availability": "التوفر", "p.id": "المرجع",
      "p.description": "وصف الرائحة", "p.notes": "النوتات العطرية", "p.top": "النوتات العليا", "p.heart": "نوتات القلب", "p.base": "نوتات القاعدة",
      "p.similar": "عطور مشابهة", "p.orderSoon": "الطلب عبر الموقع سيتوفر قريباً.",
      "p.inspiredNote": "عطر مستوحى من أسلوب عطري معيّن وليس عطراً أصلياً لعلامة تجارية.",
      "p.originalUnverified": "عطر أصلي (لم يُرفق بعد إثبات توثيق).",
      "p.notFound": "هذا العطر غير موجود أو لم يعد متاحاً.", "p.gallery": "صور العطر", "p.zoom": "صورة {n}",
      "p.demoNote": "منتج تجريبي لأغراض الاختبار فقط.",
      "p.save": "وفّرت {n}",

      "country.FR": "فرنسا", "country.DZ": "الجزائر", "country.AE": "الإمارات العربية المتحدة", "country.IT": "إيطاليا",
      "country.SA": "المملكة العربية السعودية", "country.GB": "المملكة المتحدة", "country.US": "الولايات المتحدة", "country.ES": "إسبانيا", "country.MA": "المغرب",

      "foot.shop": "أقسام المتجر", "foot.contact": "التواصل", "foot.follow": "تابعونا", "foot.legal": "معلومات قانونية",
      "foot.privacy": "سياسة الخصوصية", "foot.terms": "شروط الاستخدام",
      "foot.contactSoon": "ستُضاف بيانات التواصل قريباً.",
      "foot.rights": "جميع الحقوق محفوظة.",
      "contact.phone": "الهاتف", "contact.email": "البريد الإلكتروني", "contact.address": "العنوان", "contact.hours": "ساعات العمل",
      "soc.facebook": "فيسبوك", "soc.instagram": "إنستغرام", "soc.tiktok": "تيك توك", "soc.youtube": "يوتيوب", "soc.whatsapp": "واتساب",

      "legal.draft": "نص مبدئي للمراجعة القانونية قبل الإطلاق الفعلي.",
      "nf.h1": "الصفحة غير موجودة", "nf.p": "الرابط الذي تبحث عنه غير متاح.", "nf.cta": "العودة إلى الرئيسية"
    },

    fr: {
      "meta.home.title": "Athar DZ | أثر ديزاد — Parfumerie de luxe",
      "meta.home.desc": "Athar DZ : boutique de parfums de luxe. Découvrez des parfums pour homme, femme et mixtes, orientaux et de prestige.",
      "meta.catalog.title": "Tous les parfums | Athar DZ",
      "meta.catalog.desc": "Parcourez tout le catalogue avec recherche et filtres par catégorie, prix, contenance et concentration.",
      "meta.product.title": "Parfum | Athar DZ",
      "meta.privacy.title": "Politique de confidentialité | Athar DZ",
      "meta.terms.title": "Conditions d'utilisation | Athar DZ",
      "meta.notfound.title": "Page introuvable | Athar DZ",

      "nav.home": "Accueil", "nav.all": "Tous les parfums", "nav.men": "Parfums homme", "nav.women": "Parfums femme",
      "nav.unisex": "Parfums mixtes", "nav.oriental": "Parfums orientaux", "nav.luxury": "Parfums de luxe", "nav.offers": "Offres spéciales",
      "nav.menu": "Menu", "nav.close": "Fermer", "nav.skip": "Aller au contenu",
      "ui.search": "Rechercher", "ui.cart": "Panier", "ui.lang": "العربية", "ui.langTitle": "التبديل إلى العربية",
      "ui.cartSoon": "Le panier sera disponible dans la prochaine étape.",
      "ui.searchPlaceholder": "Rechercher un parfum ou une marque…", "ui.searchGo": "Rechercher",
      "ui.noResultsShort": "Aucun résultat.",
      "demo.notice": "Données de test uniquement — ces parfums ne sont pas de vrais produits disponibles à la vente.",
      "demo.tag": "Démo",

      "hero.eyebrow": "Parfumerie de luxe", "hero.cta": "Découvrir les parfums", "hero.cta2": "Parfums de luxe",
      "hero.imgAlt": "Illustration d'un flacon de parfum de luxe vert et or",
      "logo.alt": "Logo Athar DZ أثر ديزاد",

      "cats.title": "Acheter par univers", "cats.sub": "Choisissez ce qui vous ressemble",
      "cat.men": "Parfums homme", "cat.women": "Parfums femme", "cat.unisex": "Parfums mixtes", "cat.oriental": "Parfums orientaux",
      "cat.luxury": "Parfums de luxe", "cat.economy": "Parfums économiques", "cat.new": "Nouveautés", "cat.bestsellers": "Les plus demandés",
      "cat.offers": "Offres spéciales", "cat.all": "Tous les parfums",
      "cats.explore": "Explorer",

      "home.latest": "Dernières nouveautés", "home.latestSub": "Les derniers ajouts à la boutique", "home.viewAll": "Voir tous les parfums",
      "home.featured": "Parfums d'exception", "home.featuredSub": "Une sélection de prestige pour une signature inoubliable",

      "card.details": "Voir les détails", "card.new": "Nouveau", "card.best": "Plus demandé", "card.offer": "Offre",
      "card.inspired": "Parfum inspiré", "card.original": "Parfum original", "card.originalVerified": "Original vérifié",
      "stock.in_stock": "En stock", "stock.low_stock": "Stock limité", "stock.out_of_stock": "Indisponible",
      "gender.men": "Homme", "gender.women": "Femme", "gender.unisex": "Mixte",
      "conc.EDP": "Eau de Parfum", "conc.EDT": "Eau de Toilette", "conc.Parfum": "Parfum", "conc.EDC": "Eau de Cologne", "conc.Extrait": "Extrait de Parfum",
      "ml": "ml",
      "fam.oriental": "Oriental", "fam.floral": "Floral", "fam.fresh": "Frais", "fam.woody": "Boisé", "fam.oud": "Oud", "fam.musky": "Musqué",

      "cat.h1": "Tous les parfums", "cat.lead": "Parcourez le catalogue complet, recherchez et filtrez selon vos envies.",
      "f.search": "Rechercher par nom ou marque", "f.category": "Catégorie", "f.priceMin": "Prix de", "f.priceMax": "à",
      "f.size": "Contenance", "f.concentration": "Concentration", "f.type": "Type", "f.typeAll": "Tous",
      "f.typeOriginal": "Original", "f.typeInspired": "Inspiré / alternative",
      "f.sort": "Trier par", "f.sortNewest": "Plus récents", "f.sortPriceAsc": "Prix croissant", "f.sortPriceDesc": "Prix décroissant",
      "f.sortPopular": "Les plus demandés", "f.reset": "Réinitialiser", "f.filters": "Filtres", "f.apply": "Voir les résultats",
      "f.inStock": "En stock uniquement",
      "res.count": "{n} parfum(s)", "res.none": "Aucun parfum ne correspond à votre recherche.", "res.noneHint": "Essayez de modifier ou de réinitialiser les filtres.",
      "res.error": "Impossible de charger les parfums. Actualisez la page et réessayez.",

      "p.back": "Tous les parfums", "p.brand": "Marque", "p.size": "Contenance", "p.concentration": "Concentration", "p.target": "Public visé",
      "p.origin": "Pays d'origine", "p.family": "Famille olfactive", "p.type": "Type", "p.availability": "Disponibilité", "p.id": "Référence",
      "p.description": "Description olfactive", "p.notes": "Notes olfactives", "p.top": "Notes de tête", "p.heart": "Notes de cœur", "p.base": "Notes de fond",
      "p.similar": "Parfums similaires", "p.orderSoon": "La commande en ligne sera bientôt disponible.",
      "p.inspiredNote": "Parfum inspiré d'un style olfactif ; il ne s'agit pas d'un parfum original d'une marque.",
      "p.originalUnverified": "Parfum original (preuve d'authenticité pas encore jointe).",
      "p.notFound": "Ce parfum n'existe pas ou n'est plus disponible.", "p.gallery": "Photos du parfum", "p.zoom": "Photo {n}",
      "p.demoNote": "Produit de démonstration pour les tests uniquement.",
      "p.save": "Économisez {n}",

      "country.FR": "France", "country.DZ": "Algérie", "country.AE": "Émirats arabes unis", "country.IT": "Italie",
      "country.SA": "Arabie saoudite", "country.GB": "Royaume-Uni", "country.US": "États-Unis", "country.ES": "Espagne", "country.MA": "Maroc",

      "foot.shop": "Boutique", "foot.contact": "Contact", "foot.follow": "Suivez-nous", "foot.legal": "Informations légales",
      "foot.privacy": "Politique de confidentialité", "foot.terms": "Conditions d'utilisation",
      "foot.contactSoon": "Les coordonnées seront ajoutées prochainement.",
      "foot.rights": "Tous droits réservés.",
      "contact.phone": "Téléphone", "contact.email": "E-mail", "contact.address": "Adresse", "contact.hours": "Horaires",
      "soc.facebook": "Facebook", "soc.instagram": "Instagram", "soc.tiktok": "TikTok", "soc.youtube": "YouTube", "soc.whatsapp": "WhatsApp",

      "legal.draft": "Texte provisoire à faire valider juridiquement avant le lancement.",
      "nf.h1": "Page introuvable", "nf.p": "Le lien que vous cherchez n'est pas disponible.", "nf.cta": "Retour à l'accueil"
    }
  };

  var lang = "ar";
  try {
    var saved = localStorage.getItem(LS_KEY);
    var cfg = (window.ATHAR_CONFIG && window.ATHAR_CONFIG.defaultLang) || "ar";
    lang = saved === "fr" || saved === "ar" ? saved : cfg;
  } catch (e) { lang = "ar"; }

  function t(key, vars) {
    var s = (D[lang] && D[lang][key]);
    if (s === undefined) s = D.ar[key];
    if (s === undefined) return key;
    if (vars) for (var k in vars) s = s.replace("{" + k + "}", vars[k]);
    return s;
  }

  function pick(obj, base) { // يختار الحقل بحسب اللغة: nameAr/nameFr
    if (!obj) return "";
    var a = obj[base + "Ar"], f = obj[base + "Fr"];
    return lang === "fr" ? (f || a || "") : (a || f || "");
  }

  function fmtPrice(n) {
    if (n == null || isNaN(n)) return "";
    var s = String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    var cur = window.ATHAR_CONFIG.currency[lang] || "DA";
    return lang === "ar" ? s + " " + cur : s + " " + cur;
  }

  function apply() {
    var h = document.documentElement;
    h.lang = lang;
    h.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var p = pair.split(":"); if (p.length === 2) el.setAttribute(p[0].trim(), t(p[1].trim()));
      });
    });
    var tk = document.body && document.body.getAttribute("data-title-key");
    if (tk) document.title = t(tk);
    var dk = document.body && document.body.getAttribute("data-desc-key");
    if (dk) { var m = document.querySelector('meta[name="description"]'); if (m) m.setAttribute("content", t(dk)); }
  }

  function setLang(l) {
    if (l !== "ar" && l !== "fr") return;
    lang = l;
    try { localStorage.setItem(LS_KEY, l); } catch (e) {}
    apply();
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: l } }));
  }

  function extend(l, dict) { D[l] = Object.assign(D[l] || {}, dict); }

  window.ATHAR_I18N = {
    extend: extend,
    t: t, pick: pick, fmtPrice: fmtPrice, apply: apply, setLang: setLang,
    get lang() { return lang; }, toggle: function () { setLang(lang === "ar" ? "fr" : "ar"); }
  };

  // تطبيق مبكر للاتجاه لتفادي الوميض
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
})();
