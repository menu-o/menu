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
export { moneyIQD, calcDiscountedPrice };
