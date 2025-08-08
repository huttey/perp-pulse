
# PerpPulse (Starter)

Next.js 14 + Tailwind + Recharts + Vercel Cron + Resend + Supabase.

## Quick start
1) Copy `.env.example` to `.env.local` and fill values.
2) `npm i` then `npm run dev`.
3) Deploy on Vercel and add the same env vars.
4) Confirm `/api/alert` returns JSON.

## Supabase
Create table:
```sql
create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  symbol text,
  direction text,
  score smallint,
  reason text,
  created_at timestamptz default now()
);
```

## Resend
Create API key and verify a sender domain. Set `ALERT_FROM` to something like `PerpPulse <alerts@yourdomain.com>`.
