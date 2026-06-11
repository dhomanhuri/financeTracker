/**
 * Format angka ke format Rupiah Indonesia
 * Contoh: 1500000 → "Rp 1.500.000"
 */
export function formatRupiah(amount: number | string | null | undefined, withPrefix = true): string {
  const num = Number(amount ?? 0);
  if (isNaN(num)) return withPrefix ? 'Rp 0' : '0';

  const formatted = Math.abs(num).toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return withPrefix ? `Rp ${formatted}` : formatted;
}

/**
 * Format angka ke format Rupiah singkat
 * Contoh: 1500000 → "Rp 1,5jt"
 */
export function formatRupiahShort(amount: number | string | null | undefined): string {
  const num = Number(amount ?? 0);
  if (isNaN(num)) return 'Rp 0';

  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) return `Rp ${(abs / 1_000_000_000).toFixed(1)}M`;
  if (abs >= 1_000_000)     return `Rp ${(abs / 1_000_000).toFixed(1)}jt`;
  if (abs >= 1_000)         return `Rp ${(abs / 1_000).toFixed(0)}rb`;
  return formatRupiah(num);
}

/**
 * Parse string angka dari DB (Decimal/Numeric) ke number
 */
export function toNumber(val: unknown): number {
  const n = Number(val);
  return isNaN(n) ? 0 : n;
}
