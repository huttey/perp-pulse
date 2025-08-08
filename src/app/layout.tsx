
export const metadata = {
  title: 'PerpPulse',
  description: 'Perp futures signals (1–5) with MACD + StochRSI',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
