
'use client';
import { useEffect, useMemo, useState } from 'react';
import { useMarket } from '@/store/useMarket';
import { scoreAggregate } from '@/lib/score';
import ScoreBadge from '@/components/ScoreBadge';
import MonitorChart from '@/components/MonitorChart';

export default function Home(){
  const { symbol, intervals, init, indicators, klines, ready } = useMarket();
  const [show, setShow] = useState(false);

  useEffect(()=>{ init(symbol, intervals as any); },[]);

  const snap = useMemo(()=>({
    '1m': indicators['1m'], '3m': indicators['3m'], '5m': indicators['5m']
  }),[indicators]);

  const { score, direction, reason } = useMemo(()=>scoreAggregate(snap), [snap]);

  const data = useMemo(()=>{
    const len = Math.min(klines['1m'].length, klines['3m'].length, klines['5m'].length) || 0;
    const out: any[] = [];
    for (let i = Math.max(0, len-60); i < len; i++) {
      const t = Date.now() - (len - i) * 60_000;
      out.push({ t, close: klines['1m'][i], k: indicators['1m'].k[i], d: indicators['1m'].d[i], hist: indicators['1m'].hist[i] });
    }
    return out.filter(Boolean);
  },[klines, indicators]);

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">PerpPulse</h1>
        <div className="flex items-center gap-3">
          <ScoreBadge score={score} direction={direction} />
          <button onClick={()=>setShow(s=>!s)} className="px-4 py-2 rounded-2xl bg-slate-800 text-white">Monitor</button>
        </div>
      </header>

      {show && <MonitorChart data={data} />}
      <p className="text-sm text-slate-500 mt-3">{reason}</p>
    </main>
  );
}
