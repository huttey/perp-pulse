
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { fetchKlines } from '@/lib/binance';
import { macd, stochRsi } from '@/lib/indicators';
import { scoreAggregate } from '@/lib/score';

const resend = new Resend(process.env.RESEND_API_KEY!);
const SYMBOLS = (process.env.NEXT_PUBLIC_SYMBOLS||'BTCUSDT,ETHUSDT').split(',');

async function processSymbol(symbol: string){
  const snaps: any = {};
  for (const tf of ['1m','3m','5m']){
    const ks = await fetchKlines(symbol, tf, 300);
    const close = ks.map((k:any)=>k.c);
    const m = macd(close); const sr = stochRsi(close);
    snaps[tf] = { hist:m.hist, macd:m.macd, signal:m.signal, k:sr.k, d:sr.d };
  }
  const { score, direction, reason } = scoreAggregate(snaps);
  return { score, direction, reason };
}

export async function GET(){
  try {
    const results = [] as any[];
    for (const s of SYMBOLS){
      const r = await processSymbol(s);
      results.push({ symbol: s, ...r });
      if ((r.score >= 4 || r.score <= 2) && process.env.ALERT_FROM && process.env.ALERT_TO){
        await resend.emails.send({
          from: process.env.ALERT_FROM!,
          to: process.env.ALERT_TO!,
          subject: `${s} ${r.direction} ${r.score}/5`,
          text: `${s} → ${r.direction} (${r.score}/5)\n${r.reason}`,
        });
      }
    }
    return NextResponse.json({ ok: true, results });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message||'unknown' }, { status: 500 });
  }
}
