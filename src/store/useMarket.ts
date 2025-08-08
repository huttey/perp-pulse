
'use client';
import { create } from 'zustand';
import { fetchKlines, wsUrl } from '@/lib/binance';
import { macd, stochRsi } from '@/lib/indicators';

export type TF = '1m'|'3m'|'5m';

type State = {
  symbol: string;
  intervals: TF[];
  klines: Record<TF, number[]>;
  indicators: Record<TF, { hist:number[]; macd:number[]; signal:number[]; k:number[]; d:number[] }>
  ready: boolean;
  setSymbol: (s: string) => void;
  init: (symbol: string, intervals: TF[]) => Promise<void>;
};

export const useMarket = create<State>((set, get) => ({
  symbol: process.env.NEXT_PUBLIC_SYMBOLS?.split(',')[0] ?? 'BTCUSDT',
  intervals: (process.env.NEXT_PUBLIC_INTERVALS?.split(',') as TF[]) ?? ['1m','3m','5m'],
  klines: { '1m': [], '3m': [], '5m': [] },
  indicators: { '1m': {hist:[],macd:[],signal:[],k:[],d:[]}, '3m': {hist:[],macd:[],signal:[],k:[],d:[]}, '5m': {hist:[],macd:[],signal:[],k:[],d:[]} },
  ready: false,
  setSymbol: (s) => set({ symbol: s, ready: false }),
  init: async (symbol, intervals) => {
    const updates: any = { symbol, intervals };
    for (const tf of intervals) {
      const ks = await fetchKlines(symbol, tf, 300);
      const close = ks.map(k => k.c);
      updates.klines = { ...(updates.klines||get().klines), [tf]: close };
      const m = macd(close);
      const sr = stochRsi(close);
      updates.indicators = { ...(updates.indicators||get().indicators), [tf]: { hist: m.hist, macd: m.macd, signal: m.signal, k: sr.k, d: sr.d } };
      const w = new WebSocket(wsUrl(symbol, tf));
      w.onmessage = (ev) => {
        const j = JSON.parse(ev.data);
        const c = +j.k.c;
        const arr = get().klines[tf].slice(); arr[arr.length-1] = c;
        const m2 = macd(arr); const sr2 = stochRsi(arr);
        set({ klines: { ...get().klines, [tf]: arr }, indicators: { ...get().indicators, [tf]: { hist:m2.hist, macd:m2.macd, signal:m2.signal, k:sr2.k, d:sr2.d } } });
      };
    }
    set({ ...(updates as any), ready: true });
  }
}));
