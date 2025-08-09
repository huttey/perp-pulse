import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { fetchKlines } from '@/lib/binance';
import { macd, stochRsi } from '@/lib/indicators';
import { scoreAggregate } from '@/lib/score';

export const runtime = 'nodejs';

const resend = new Resend(process.env.RESEND_API_KEY!);
const SYMBOLS = (process.env.NEXT_PUBLIC_SYMBOLS || 'BTCUSDT,ETHUSDT')
  .split(',')
  .map(s => s.trim().toUpperCase())
  .filter(Boolean);

async function processSymbol(symbol: string){
  const snaps: any = {};
  for (const tf of ['1m','3m','5m']){
    const ks = await fetchKlines(symbol, tf, 300);
    const close = ks.map((k:any)=>k.c);
    const m = macd(close); const sr = stochRsi(close);
    snaps[tf] = { hist:m.hist, macd:m.macd, signal:m.signal, k:sr.k, d:sr.d };
  }
  return scoreAggregate(snaps);
}

export async function GET(req: Request){
  const token = process.env.CRON_SECRET;
  if (token) {
    const incoming = req.headers.get('x-cron-secret') || new URL(req.url).searchParams.get('token');
    if (incoming !== token) return NextResponse.json({ ok:false, error:'unauthorized' }, { status: 401 });
  }

  const results:any[] = [];
  for (const s of SYMBOLS){
    try {
      const r = await processSymbol(s);
      results.push({ symbol: s, ...r });
      if ((r.score >= 4 || r.score <= 2) && process.env.ALERT_FROM && process.env.ALERT_TO){
        await resend.emails.send({
          from: process.env.ALERT_FROM!, to: process.env.ALERT_TO!,
          subject: `${s} ${r.direction} ${r.score}/5`, text: `${s} → ${r.direction} (${r.score}/5)\n${r.reason}`,
        });
      }
    } catch (e:any) {
      results.push({ symbol: s, error: e?.message || 'fetch failed' });
    }
  }
  return NextResponse.json({ ok: true, results });
}
