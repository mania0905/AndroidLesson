import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: '振る請求 - 世界初・スマホを振って送る請求書',
  description: '誰も考えたことがない。声で入力、振って送る。スマホだけで完結する革命的な請求体験。',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function ShakeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen min-h-[100dvh] bg-black text-white overflow-x-hidden">
      {children}
    </div>
  );
}
