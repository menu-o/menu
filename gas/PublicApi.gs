function listSections_(type) {
  const db = ensureDb_();
  type = normalizeType_(type);
  if (!type) throw new Error('Invalid type');
  return db.sections[type] || [];
}

function listItems_(type, sectionId) {
  const db = ensureDb_();
  type = normalizeType_(type);
  if (!type) throw new Error('Invalid type');
  sectionId = String(sectionId || '');
  cleanupExpiredDiscounts_(db);

  const out = db.items
    .filter(x => x.type === type)
    .filter(x => !sectionId || x.sectionId === sectionId)
    .map(x => publicItem_(x, db));

  return out;
}

function getItem_(id) {
  const db = ensureDb_();
  id = String(id || '');
  cleanupExpiredDiscounts_(db);

  const item = db.items.find(x => x.id === id);
  if (!item) throw new Error('Item not found');
  return publicItem_(item, db);
}

function searchItems_(q, type) {
  const db = ensureDb_();
  cleanupExpiredDiscounts_(db);

  q = String(q || '').trim().toLowerCase();
  type = normalizeType_(type);

  let items = db.items;
  if (type) items = items.filter(x => x.type === type);

  if (!q) {
    return items.slice(0, 40).map(x => publicItem_(x, db));
  }

  const byId = items.filter(x => x.id.toLowerCase() === q);
  if (byId.length) return byId.map(x => publicItem_(x, db));

  return items
    .filter(x => String(x.name || '').toLowerCase().includes(q))
    .slice(0, 40)
    .map(x => publicItem_(x, db));
}

function publicItem_(item, db) {
  const sectionName = findSectionName_(db, item.type, item.sectionId);
  return {
    id: item.id,
    type: item.type,
    sectionId: item.sectionId,
    sectionName: sectionName,
    name: item.name,
    description: item.description || '',
    imageUrl: item.imageUrl || '',
    price: item.price,
    discountPercent: item.discountPercent || 0,
    discountUntil: item.discountUntil || 0,
    ratingAvg: item.ratingAvg || 0,
    ratingCount: item.ratingCount || 0,
  };
}

function findSectionName_(db, type, sectionId) {
  const list = (db.sections && db.sections[type]) ? db.sections[type] : [];
  const s = list.find(x => x.id === sectionId);
  return s ? s.name : '';
}

function cleanupExpiredDiscounts_(db) {
  let changed = false;
  const now = nowMs_();
  for (const it of db.items) {
    if (it.discountPercent && it.discountUntil && now >= Number(it.discountUntil)) {
      it.discountPercent = 0;
      it.discountUntil = 0;
      changed = true;
    }
  }
  if (changed) saveDb_(db);
}

function rateItem_(id, value) {
  const db = ensureDb_();
  id = String(id || '');
  value = clampInt_(value, 1, 5);

  const item = db.items.find(x => x.id === id);
  if (!item) throw new Error('Item not found');

  const count = Number(item.ratingCount || 0);
  const avg = Number(item.ratingAvg || 0);

  const newCount = count + 1;
  const newAvg = ((avg * count) + value) / newCount;

  item.ratingCount = newCount;
  item.ratingAvg = Math.round(newAvg * 10) / 10;

  saveDb_(db);
  return { id: id, ratingAvg: item.ratingAvg, ratingCount: item.ratingCount };
}
