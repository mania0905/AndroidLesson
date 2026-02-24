import Link from 'next/link';
import { MapPin, Coffee } from 'lucide-react';

const SPOTS = [
  {
    name: '公園カフェ 〇〇',
    desc: 'ドリンク500円〜。公園の隣でゆったり',
    budget: '〜500円',
    area: '東京・渋谷',
  },
  {
    name: '無料イベント広場',
    desc: '週末の無料ライブ・マルシェ',
    budget: '無料',
    area: '全国',
  },
  {
    name: 'シェアキッチン △△',
    desc: 'おうちごはん作ってデート。1人500円',
    budget: '〜1,000円',
    area: '東京・新宿',
  },
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen">
      <header className="p-4 border-b border-rose-200/50 dark:border-gray-800">
        <Link href="/match" className="text-rose-600 font-bold">
          素マッチ
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-4 py-12">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          おすすめスポット
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">
          予算を気にせず楽しめるデートスポット。パートナーから紹介されています。
        </p>

        <div className="space-y-4">
          {SPOTS.map((s) => (
            <div
              key={s.name}
              className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-rose-100 dark:border-gray-700 flex gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                <Coffee className="w-6 h-6 text-rose-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {s.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {s.desc}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded text-xs">
                    {s.budget}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                    <MapPin className="w-3 h-3" />
                    {s.area}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-8 text-center">
          掲載スポットはパートナー契約に基づき紹介しています
        </p>
      </main>
    </div>
  );
}
