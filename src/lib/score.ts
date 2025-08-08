
export type IndicatorSnapshot = {
  hist: number[]; macd: number[]; signal: number[]; k: number[]; d: number[];
};

function last2(arr: number[]) { const n = arr.length; return [arr[n-2], arr[n-1]] as const; }

function scoreOne(tf: IndicatorSnapshot) {
  if (!tf || tf.hist.length < 2 || tf.k.length < 2 || tf.d.length < 2) return 0;
  const [h0, h1] = last2(tf.hist);
  const [k0, k1] = last2(tf.k);
  const [d0, d1] = last2(tf.d);
  let s = 0;
  if (h1 > 0 && h1 > h0) s += 1;
  if (k0 < d0 && k1 > d1 && k1 < 20) s += 1;
  if (h1 < 0 && h1 < h0) s -= 1;
  if (k0 > d0 && k1 < d1 && k1 > 80) s -= 1;
  return s;
}

export function scoreAggregate(snaps: Record<string, IndicatorSnapshot>) {
  const w: Record<string, number> = { '1m': 0.3, '3m': 0.3, '5m': 0.4 };
  let sum = 0, wsum = 0;
  for (const tf of Object.keys(w)) {
    if (!snaps[tf]) continue; sum += scoreOne(snaps[tf]) * w[tf]; wsum += w[tf];
  }
  const norm = wsum ? sum / wsum : 0;
  const scaled = Math.round(((norm + 2) / 4) * 4 + 1); // 1..5
  const direction = scaled >= 4 ? 'LONG' : scaled <= 2 ? 'SHORT' : 'NEUTRAL';
  const reason = `wScore=${norm.toFixed(2)} from MACD & StochRSI signals`;
  return { score: scaled, direction, reason };
}
