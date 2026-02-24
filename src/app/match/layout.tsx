import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '素マッチ - 見栄を張らない、お金の心配をせず付き合える',
  description: 'お金がなくても大丈夫。予算を気にせず、素の自分で出会えるマッチング。',
};

export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 dark:from-gray-950 dark:via-gray-900 dark:to-rose-950">
      {children}
    </div>
  );
}
