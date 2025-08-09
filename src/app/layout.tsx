import './globals.css';

export const metadata = {
  title: 'PerpPulse',
  description: 'Perp futures signals (MACD + StochRSI)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0d1117] text-[#d0d0d0]">{children}</body>
    </html>
  );
}
