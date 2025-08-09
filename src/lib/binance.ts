export async function fetchKlines(symbol: string, interval: string, limit = 200) {
  const sym = symbol.trim().toUpperCase();
  const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${sym}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url, { cache: 'no-store' });

  let raw: any;
  try {
    raw = await res.json();
  } catch {
    throw new Error(`Failed to parse klines for ${sym}`);
  }

  if (!Array.isArray(raw)) {
    const msg = raw?.msg || `HTTP ${res.status}`;
    throw new Error(`Binance klines error for ${sym}: ${msg}`);
  }

  return raw.map((k: any) => ({
    t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5],
  }));
}

export function wsUrl(symbol: string, interval: string) {
  return `wss://fstream.binance.com/ws/${symbol.trim().toLowerCase()}@kline_${interval}`;
}
