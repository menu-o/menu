<<<<<<< HEAD
async function apiGet(path, params = {}) {
  if (!GAS_BASE_URL) throw new Error('GAS_BASE_URL is empty. Paste your Apps Script web app URL in assets/app-config.js');
  const url = new URL(GAS_BASE_URL);
  url.searchParams.set('path', path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), { method: 'GET' });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'API error');
  return data;
}

async function apiPost(path, body = {}) {
  if (!GAS_BASE_URL) throw new Error('GAS_BASE_URL is empty. Paste your Apps Script web app URL in assets/app-config.js');
  const url = new URL(GAS_BASE_URL);
  url.searchParams.set('path', path);
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'API error');
  return data;
}

=======
>>>>>>> d4105c8 (deploy MU project)
function moneyIQD(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return '';
  return x.toLocaleString('en-US');
}

function calcDiscountedPrice(price, discountPercent) {
  const p = Number(price);
  const d = Number(discountPercent);
  if (!Number.isFinite(p) || !Number.isFinite(d) || d <= 0) return null;
  const v = Math.round(p * (1 - (d / 100)));
  return Math.max(0, v);
}
<<<<<<< HEAD
=======

export { moneyIQD, calcDiscountedPrice };
>>>>>>> d4105c8 (deploy MU project)
