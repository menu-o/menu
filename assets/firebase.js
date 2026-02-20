import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  push,
  remove,
  query,
  orderByChild,
  equalTo,
  limitToFirst,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

import { FIREBASE_CONFIG } from "./firebase-config.js";

const app = initializeApp(FIREBASE_CONFIG);
const db = getDatabase(app);

function nowMs() {
  return Date.now();
}

function uid12() {
  return Math.random().toString(16).slice(2, 8) + Math.random().toString(16).slice(2, 8);
}

export async function dbGet(path) {
  const snap = await get(ref(db, path));
  return snap.exists() ? snap.val() : null;
}

export async function dbSet(path, value) {
  await set(ref(db, path), value);
}

export async function dbUpdate(path, value) {
  await update(ref(db, path), value);
}

export async function dbRemove(path) {
  await remove(ref(db, path));
}

export async function listSections(type) {
  const data = await dbGet(`sections/${type}`);
  return data ? Object.values(data) : [];
}

export async function listItemsBySection(type, sectionId) {
  const data = await dbGet(`items/${type}/${sectionId}`);
  return data ? Object.entries(data).map(([id, v]) => ({ id, ...v, type, sectionId })) : [];
}

export async function getItemById(id) {
  const idx = await dbGet(`itemIndex/${id}`);
  if (!idx) return null;
  const item = await dbGet(`items/${idx.type}/${idx.sectionId}/${id}`);
  return item ? { id, ...item, type: idx.type, sectionId: idx.sectionId } : null;
}

export async function searchItems(qText, typeFilter) {
  const q = String(qText || '').trim().toLowerCase();
  if (!q) {
    const all = await dbGet('itemIndex');
    if (!all) return [];
    const ids = Object.keys(all).slice(0, 40);
    const out = [];
    for (const id of ids) {
      const it = await getItemById(id);
      if (it) out.push(it);
    }
    return typeFilter ? out.filter(x => x.type === typeFilter) : out;
  }

  // exact id
  const byId = await getItemById(q);
  if (byId && (!typeFilter || byId.type === typeFilter)) return [byId];

  // name search (client-side; requires reading index)
  const nameIndex = await dbGet('nameIndex');
  if (!nameIndex) return [];

  const ids = Object.keys(nameIndex)
    .filter(id => {
      const v = String(nameIndex[id] || '').toLowerCase();
      return v.includes(q);
    })
    .slice(0, 40);

  const out = [];
  for (const id of ids) {
    const it = await getItemById(id);
    if (it && (!typeFilter || it.type === typeFilter)) out.push(it);
  }
  return out;
}

export function computeDiscount(item) {
  const price = Number(item.price);
  const discount = Number(item.discountPercent || 0);
  const until = Number(item.discountUntil || 0);
  const active = discount > 0 && (!until || nowMs() < until);
  if (!active) return { active: false };
  const discounted = Math.max(0, Math.round(price * (1 - discount / 100)));
  return { active: true, discounted };
}

export async function initSections() {
  const existing = await dbGet('sections') || {};
  
  const defaultSections = {
    cafe: {
      coffee: { id: 'coffee', name: 'القهوة', description: 'Coffee' },
      hot_drinks: { id: 'hot_drinks', name: 'مشروبات ساخنه', description: 'Hot Drinks' },
      latte: { id: 'latte', name: 'لايته', description: 'Latte' },
      tea: { id: 'tea', name: 'شاي', description: 'Tea' },
      mojito: { id: 'mojito', name: 'موهيتو', description: 'Mojito' },
      smoothie: { id: 'smoothie', name: 'سموذي', description: 'Smoothie' },
      natural_juices: { id: 'natural_juices', name: 'عصائر طبيعيه', description: 'Natural Juices' },
      frappuccino: { id: 'frappuccino', name: 'فراباشينو', description: 'Frappuccino' },
      matcha: { id: 'matcha', name: 'ماتشا', description: 'Matcha' }
    },
    food: {
      breakfast: { id: 'breakfast', name: 'الفطور', description: 'Breakfast' },
      croissants: { id: 'croissants', name: 'كرواسون', description: 'Croissants' },
      sandwiches: { id: 'sandwiches', name: 'ساندويتشات', description: 'Sandwiches' },
      lunch_dinner: { id: 'lunch_dinner', name: 'غداء وعشاء', description: 'Lunch and Dinner' },
      burgers: { id: 'burgers', name: 'البركر', description: 'Burgers' }
    }
  };

  // Merge existing with defaults, adding missing ones
  for (const type of ['cafe', 'food']) {
    if (!existing[type]) existing[type] = {};
    for (const [id, section] of Object.entries(defaultSections[type])) {
      if (!existing[type][id]) {
        existing[type][id] = section;
      }
    }
  }

  await dbSet('sections', existing);
}

export async function adminLogin(username, password) {
  // Initialize sections on first login attempt
  await initSections();
  
  username = String(username || '').trim();
  if (username !== 'admin') throw new Error('Only admin');

  const admin = (await dbGet('admin')) || {};
  if (!admin.passwordHash) {
    // first time init
    await dbSet('admin', { passwordHash: await sha256(password) });
  }

  const hash = await sha256(password);
  const fresh = await dbGet('admin');
  if (!fresh || fresh.passwordHash !== hash) throw new Error('Wrong password');

  const token = uid12() + uid12();
  const tokenUntil = nowMs() + (7 * 24 * 60 * 60 * 1000);
  await dbUpdate('admin', { token, tokenUntil });
  return { token, tokenUntil };
}

export async function verifyToken(token) {
  const admin = await dbGet('admin');
  if (!admin || !admin.token || admin.token !== token) throw new Error('Invalid token');
  if (nowMs() > Number(admin.tokenUntil || 0)) throw new Error('Token expired');
}

export async function adminListAll(token) {
  await verifyToken(token);
  const sections = await dbGet('sections');
  const itemIndex = await dbGet('itemIndex');
  const items = [];
  if (itemIndex) {
    const ids = Object.keys(itemIndex);
    for (const id of ids) {
      const it = await getItemById(id);
      if (it) items.push(it);
    }
  }

  // attach sectionName
  const out = items.map(it => {
    const s = sections && sections[it.type] && sections[it.type][it.sectionId];
    return { ...it, sectionName: s ? s.name : '' };
  });

  return { sections, items: out };
}

export async function adminUpsertItem(token, item) {
  await verifyToken(token);

  const type = String(item.type || '').toLowerCase();
  if (type !== 'cafe' && type !== 'food') throw new Error('Invalid type');
  const sectionId = String(item.sectionId || '').trim();
  if (!sectionId) throw new Error('Missing sectionId');

  const name = String(item.name || '').trim();
  if (!name) throw new Error('Missing name');

  const price = Math.round(Number(item.price));
  if (!Number.isFinite(price) || price < 0) throw new Error('Invalid price');

  const description = String(item.description || '').trim();
  const imageUrl = String(item.imageUrl || '').trim();

  const id = String(item.id || '').trim() || uid12();

  const existing = await getItemById(id);
  const discountPercent = existing ? Number(existing.discountPercent || 0) : 0;
  const discountUntil = existing ? Number(existing.discountUntil || 0) : 0;

  await dbSet(`items/${type}/${sectionId}/${id}`, {
    name,
    price,
    description,
    imageUrl,
    discountPercent,
    discountUntil,
    updatedAt: nowMs(),
    createdAt: existing ? existing.createdAt || nowMs() : nowMs(),
  });

  await dbSet(`itemIndex/${id}`, { type, sectionId });
  await dbSet(`nameIndex/${id}`, name);

  return { id };
}

export async function adminDeleteItem(token, id) {
  await verifyToken(token);
  const it = await getItemById(id);
  if (!it) throw new Error('Item not found');
  await dbRemove(`items/${it.type}/${it.sectionId}/${id}`);
  await dbRemove(`itemIndex/${id}`);
  await dbRemove(`nameIndex/${id}`);
}

export async function adminSetDiscount(token, id, percent, duration) {
  await verifyToken(token);
  const it = await getItemById(id);
  if (!it) throw new Error('Item not found');

  const p = Math.max(1, Math.min(100, Math.floor(Number(percent))));
  const unit = String(duration && duration.unit ? duration.unit : '').toLowerCase();
  const amount = Math.floor(Number(duration && duration.amount ? duration.amount : 0));

  let until = 0;
  if (unit === 'forever') {
    until = 0;
  } else {
    const hour = 60 * 60 * 1000;
    let ms = 0;
    if (unit === 'hours') ms = amount * hour;
    if (unit === 'days') ms = amount * 24 * hour;
    if (unit === 'years') ms = amount * 365 * 24 * hour;
    until = ms > 0 ? (nowMs() + ms) : 0;
  }

  await dbUpdate(`items/${it.type}/${it.sectionId}/${id}`, {
    discountPercent: p,
    discountUntil: until,
    updatedAt: nowMs(),
  });
}

export async function adminClearDiscount(token, id) {
  await verifyToken(token);
  const it = await getItemById(id);
  if (!it) throw new Error('Item not found');
  await dbUpdate(`items/${it.type}/${it.sectionId}/${id}`, {
    discountPercent: 0,
    discountUntil: 0,
    updatedAt: nowMs(),
  });
}

export async function adminUpsertSection(token, type, section) {
  await verifyToken(token);

  type = String(type || '').toLowerCase();
  if (type !== 'cafe' && type !== 'food') throw new Error('Invalid type');

  const id = String(section && section.id ? section.id : '').trim() || uid12();
  const name = String(section && section.name ? section.name : '').trim();
  const description = String(section && section.description ? section.description : '').trim();
  if (!name) throw new Error('Missing name');

  await dbSet(`sections/${type}/${id}`, { id, name, description });
  return { id };
}

export async function adminDeleteSection(token, type, sectionId) {
  await verifyToken(token);

  type = String(type || '').toLowerCase();
  if (type !== 'cafe' && type !== 'food') throw new Error('Invalid type');

  sectionId = String(sectionId || '').trim();
  if (!sectionId) throw new Error('Missing sectionId');

  const existing = await dbGet(`items/${type}/${sectionId}`);
  if (existing && Object.keys(existing).length) throw new Error('Section not empty');

  await dbRemove(`sections/${type}/${sectionId}`);
}

async function sha256(text) {
  const buf = new TextEncoder().encode(String(text));
  const hash = await crypto.subtle.digest('SHA-256', buf);
  const bytes = Array.from(new Uint8Array(hash));
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}
