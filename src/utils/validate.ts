export function isNumeric(val: string): boolean {
  const s = String(val ?? "").trim();
  if (s === "") return true;
  const n = Number(s);
  return !Number.isNaN(n);
}

export function isInteger(val: string): boolean {
  const s = String(val ?? "").trim();
  if (s === "") return true;
  const n = Number(s);
  return !Number.isNaN(n) && Number.isInteger(n) && n >= 0;
}
