
export type Kline = { t: number; o: number; h: number; l: number; c: number; v: number };

export function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out: number[] = [];
  let prev = 0;
  values.forEach((v, i) => {
    if (i === 0) prev = v;
    prev = v * k + prev * (1 - k);
    out.push(prev);
  });
  return out;
}

export function macd(close: number[], fast = 12, slow = 26, signal = 9) {
  if (close.length < slow + signal) return { macd: [], signal: [], hist: [] };
  const emaFast = ema(close, fast);
  const emaSlow = ema(close, slow);
  const macdLine = emaFast.map((v, i) => v - (emaSlow[i] ?? v));
  const signalLine = ema(macdLine.slice(-Math.max(macdLine.length - slow + fast, 0)), signal);
  const pad = macdLine.length - signalLine.length;
  const sig = Array(Math.max(pad,0)).fill(NaN).concat(signalLine);
  const hist = macdLine.map((v, i) => (isNaN(sig[i]) ? NaN : v - sig[i]));
  return { macd: macdLine, signal: sig, hist };
}

export function rsi(close: number[], period = 14): number[] {
  if (close.length < period + 1) return [];
  const gains: number[] = [], losses: number[] = [];
  for (let i = 1; i < close.length; i++) {
    const diff = close[i] - close[i - 1];
    gains.push(Math.max(diff, 0));
    losses.push(Math.max(-diff, 0));
  }
  const avg = (arr: number[], p: number) => {
    let sum = 0; const out: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      if (i < p) sum += arr[i];
      if (i === p) sum += arr[i];
      if (i >= p) sum = sum - arr[i - p] + arr[i];
      if (i >= p - 1) out.push(sum / p);
    }
    return out;
  };
  const avgGain = avg(gains, period);
  const avgLoss = avg(losses, period);
  const rsiVals: number[] = [];
  for (let i = 0; i < avgGain.length; i++) {
    const gl = avgLoss[i] ?? 0;
    const rs = gl === 0 ? 100 : avgGain[i] / gl;
    const r = 100 - 100 / (1 + rs);
    rsiVals.push(r);
  }
  return Array(close.length - rsiVals.length).fill(NaN).concat(rsiVals);
}

export function stochRsi(close: number[], rsiPeriod = 14, stochPeriod = 14, k = 3, d = 3) {
  const r = rsi(close, rsiPeriod);
  const valid = r.filter((x) => !Number.isNaN(x));
  if (valid.length < stochPeriod + Math.max(k, d)) return { k: [], d: [] };
  const stoch: number[] = [];
  for (let i = 0; i < r.length; i++) {
    const slice = r.slice(Math.max(0, i - stochPeriod + 1), i + 1).filter((x) => !Number.isNaN(x));
    if (slice.length < stochPeriod) { stoch.push(NaN); continue; }
    const minV = Math.min(...slice);
    const maxV = Math.max(...slice);
    const cur = r[i];
    const val = (cur - minV) / (maxV - minV) * 100;
    stoch.push(val);
  }
  const smooth = (arr: number[], p: number) => {
    const out: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      const slice = arr.slice(Math.max(0, i - p + 1), i + 1);
      out.push(slice.reduce((a, b) => a + b, 0) / slice.length);
    }
    return out;
  };
  const K = smooth(stoch, k);
  const D = smooth(K, d);
  return { k: K, d: D };
}
