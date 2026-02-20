function adminInit_(username, password) {
  const db = ensureDb_();
  username = String(username || '').trim();
  password = String(password || '');

  if (username !== 'admin') throw new Error('Only admin is allowed');

  if (db.admin.passwordHash) {
    throw new Error('Already initialized');
  }

  const pw = requireString_(password, 'password');
  db.admin.passwordHash = hash_(pw);
  saveDb_(db);
  return { initialized: true };
}

function adminLogin_(username, password) {
  const db = ensureDb_();
  username = String(username || '').trim();
  password = String(password || '');

  if (username !== 'admin') throw new Error('Invalid username');
  if (!db.admin.passwordHash) {
    throw new Error('Admin not initialized');
  }

  if (hash_(password) !== db.admin.passwordHash) {
    throw new Error('Wrong password');
  }

  db.admin.token = uid_() + uid_();
  db.admin.tokenUntil = nowMs_() + (7 * 24 * 60 * 60 * 1000);
  saveDb_(db);

  return { token: db.admin.token, tokenUntil: db.admin.tokenUntil };
}

function adminListAll_(token) {
  const db = verifyAdminToken_(token);
  cleanupExpiredDiscounts_(db);
  return {
    sections: db.sections,
    items: db.items.map(x => publicItem_(x, db)),
  };
}

function adminUpsertItem_(body) {
  const db = verifyAdminToken_(String(body.token || ''));

  const type = normalizeType_(body.type);
  if (!type) throw new Error('Invalid type');

  const sectionId = requireString_(body.sectionId, 'sectionId');
  const name = requireString_(body.name, 'name');
  const description = String(body.description || '').trim();
  const imageUrl = String(body.imageUrl || '').trim();

  const price = Math.round(Number(body.price));
  if (!Number.isFinite(price) || price < 0) throw new Error('Invalid price');

  let id = String(body.id || '').trim();
  let item = id ? db.items.find(x => x.id === id) : null;

  if (!item) {
    id = uid_();
    item = {
      id: id,
      type: type,
      sectionId: sectionId,
      name: name,
      description: description,
      imageUrl: imageUrl,
      price: price,
      discountPercent: 0,
      discountUntil: 0,
      ratingAvg: 0,
      ratingCount: 0,
      createdAt: nowMs_(),
      updatedAt: nowMs_(),
    };
    db.items.unshift(item);
  } else {
    item.type = type;
    item.sectionId = sectionId;
    item.name = name;
    item.description = description;
    item.imageUrl = imageUrl;
    item.price = price;
    item.updatedAt = nowMs_();
  }

  saveDb_(db);
  return { item: publicItem_(item, db) };
}

function adminDeleteItem_(token, id) {
  const db = verifyAdminToken_(String(token || ''));
  id = String(id || '');
  const idx = db.items.findIndex(x => x.id === id);
  if (idx === -1) throw new Error('Item not found');
  db.items.splice(idx, 1);
  saveDb_(db);
  return { deleted: true };
}

function parseDurationMs_(duration) {
  if (!duration) return 0;
  const amount = Math.floor(Number(duration.amount));
  const unit = String(duration.unit || '').toLowerCase();
  if (!Number.isFinite(amount) || amount <= 0) return 0;

  const hour = 60 * 60 * 1000;
  switch (unit) {
    case 'hours':
      return amount * hour;
    case 'days':
      return amount * 24 * hour;
    case 'years':
      return amount * 365 * 24 * hour;
    case 'forever':
      return -1;
    default:
      return 0;
  }
}

function adminSetDiscount_(token, id, percent, duration) {
  const db = verifyAdminToken_(String(token || ''));

  id = String(id || '');
  percent = clampInt_(percent, 1, 100);

  const item = db.items.find(x => x.id === id);
  if (!item) throw new Error('Item not found');

  const ms = parseDurationMs_(duration);
  item.discountPercent = percent;
  item.discountUntil = ms === -1 ? 0 : (ms ? (nowMs_() + ms) : 0);
  item.updatedAt = nowMs_();

  saveDb_(db);
  return { item: publicItem_(item, db) };
}

function adminClearDiscount_(token, id) {
  const db = verifyAdminToken_(String(token || ''));

  id = String(id || '');
  const item = db.items.find(x => x.id === id);
  if (!item) throw new Error('Item not found');

  item.discountPercent = 0;
  item.discountUntil = 0;
  item.updatedAt = nowMs_();

  saveDb_(db);
  return { item: publicItem_(item, db) };
}
