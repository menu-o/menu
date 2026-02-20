export const LANG_KEY = 'mu_lang';

const dict = {
  ar: {
    admin_login: 'تسجيل آدمن',
    home: 'الرئيسية',
    back: 'رجوع',
    search: 'بحث',
    admin: 'آدمن',
    admin_panel: 'لوحة الأدمن',
    logout: 'خروج',
    add_item: '+ إضافة طبق/مشروب',
    manage_sections: '+ إضافة/تعديل الأقسام',
    search_title: 'بحث',
    cafe_menu: 'قائمة المشروبات',
    food_menu: 'قائمة الطعام',
    cafe_menu_title: 'CAFE MENU',
    food_menu_title: 'FOOD MENU',
    username: 'يوزر',
    password: 'باسوورد',
    login: 'دخول',
    type_all: 'عام',
    type_cafe: 'مشروب',
    type_food: 'أكلة',
    price_iqd: 'السعر (IQD)',
    name: 'الاسم',
    description: 'الوصف',
    image_url: 'رابط الصورة (اختياري)',
    save: 'حفظ',
    cancel: 'إلغاء',
    empty_items: 'لا توجد عناصر',
    empty_results: 'لا توجد نتائج',
    lang_ar: 'عربي',
    lang_en: 'English',
  },
  en: {
    admin_login: 'Admin Login',
    home: 'Home',
    back: 'Back',
    search: 'Search',
    admin: 'Admin',
    admin_panel: 'Admin Panel',
    logout: 'Logout',
    add_item: '+ Add Item',
    manage_sections: '+ Manage Sections',
    search_title: 'Search',
    cafe_menu: 'Cafe Menu',
    food_menu: 'Food Menu',
    cafe_menu_title: 'CAFE MENU',
    food_menu_title: 'FOOD MENU',
    username: 'Username',
    password: 'Password',
    login: 'Login',
    type_all: 'All',
    type_cafe: 'Cafe',
    type_food: 'Food',
    price_iqd: 'Price (IQD)',
    name: 'Name',
    description: 'Description',
    image_url: 'Image URL (optional)',
    save: 'Save',
    cancel: 'Cancel',
    empty_items: 'No items',
    empty_results: 'No results',
    lang_ar: 'Arabic',
    lang_en: 'English',
  }
};

export function getLang() {
  const v = localStorage.getItem(LANG_KEY);
  return v === 'en' ? 'en' : 'ar';
}

export function setLang(lang) {
  const v = lang === 'en' ? 'en' : 'ar';
  localStorage.setItem(LANG_KEY, v);
}

export function t(key) {
  const lang = getLang();
  const table = dict[lang] || dict.ar;
  return table[key] || (dict.ar && dict.ar[key]) || key;
}

export function applyLangToDocument() {
  const lang = getLang();
  document.documentElement.lang = lang;
  document.documentElement.dir = 'rtl';
  document.body && document.body.classList.toggle('lang-en', lang === 'en');
}

export function mountLangSwitcher(container) {
  if (!container) return;

  container.innerHTML = '';
  const lang = getLang();

  const btn = document.createElement('button');
  btn.className = 'icon-btn';
  btn.type = 'button';
  btn.id = 'langBtn';
  btn.textContent = lang === 'en' ? dict.en.lang_ar : dict.ar.lang_en;
  btn.addEventListener('click', () => {
    setLang(lang === 'en' ? 'ar' : 'en');
    location.reload();
  });

  container.appendChild(btn);
}
