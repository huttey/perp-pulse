
export async function fetchKlines(symbol: string, interval: string, limit = 200) {
  const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url, { cache: 'no-store' });
  const raw = await res.json();
  return raw.map((k: any) => ({
    t: k[0], o: +k[1], h: +k[2], l: +k[3], c: +k[4], v: +k[5]
  }));
}

export function wsUrl(symbol: string, interval: string) {
  return `wss://fstream.binance.com/ws/${symbol.toLowerCase()}@kline_${interval}`;
}
