function store_() {
  return PropertiesService.getScriptProperties();
}

function getJson_(key, fallback) {
  const raw = store_().getProperty(key);
  if (!raw) return fallback;
  return JSON.parse(raw);
}

function setJson_(key, value) {
  store_().setProperty(key, JSON.stringify(value));
}

function nowMs_() {
  return new Date().getTime();
}

function uid_() {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(nowMs_()) + ':' + Math.random());
  const hex = bytes.map(b => (b + 256).toString(16).slice(-2)).join('');
  return hex.slice(0, 12);
}

function normalizeType_(t) {
  t = String(t || '').toLowerCase();
  if (t === 'cafe' || t === 'food') return t;
  return '';
}

function requireString_(v, name) {
  const s = String(v || '').trim();
  if (!s) throw new Error('Missing ' + name);
  return s;
}

function clampInt_(n, min, max) {
  n = Math.floor(Number(n));
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function ensureDb_() {
  const db = getJson_('db', null);
  if (db) return db;

  const initial = {
    version: 1,
    admin: {
      username: 'admin',
      passwordHash: '',
      token: '',
      tokenUntil: 0,
    },
    sections: {
      cafe: [
        { id: 'coffee', name: 'القهوة', description: 'coffee' },
        { id: 'tea', name: 'الشاي', description: 'tea' },
        { id: 'mojito', name: 'الموميتو', description: 'mojito' },
        { id: 'smoothie', name: 'سموثي', description: 'smoothie' },
      ],
      food: [
        { id: 'breakfast', name: 'الفطور', description: 'breakfast' },
        { id: 'croissants', name: 'كروسان', description: 'croissants' },
      ],
    },
    items: [],
  };

  setJson_('db', initial);
  return initial;
}

function saveDb_(db) {
  setJson_('db', db);
}

function hash_(text) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text));
  return bytes.map(b => (b + 256).toString(16).slice(-2)).join('');
}

function verifyAdminToken_(token) {
  const db = ensureDb_();
  if (!token) throw new Error('Missing token');
  if (db.admin.token !== token) throw new Error('Invalid token');
  if (nowMs_() > Number(db.admin.tokenUntil || 0)) throw new Error('Token expired');
  return db;
}
