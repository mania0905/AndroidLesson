import Link from 'next/link';
import { Heart, Shield, Sparkles, CreditCard } from 'lucide-react';

export default function MatchLandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-rose-200/50 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
            素マッチ
          </span>
          <nav className="flex gap-4">
            <Link
              href="/match/partners"
              className="text-gray-600 dark:text-gray-400 hover:text-rose-600 text-sm"
            >
              おすすめスポット
            </Link>
            <Link
              href="/match/premium"
              className="text-gray-600 dark:text-gray-400 hover:text-rose-600 text-sm"
            >
              プレミアム
            </Link>
            <Link
              href="/match/onboarding"
              className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              無料で始める
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <section className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            お金がなくても、
            <br />
            <span className="text-rose-600 dark:text-rose-400">素の自分で</span>
            付き合える
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-xl mx-auto">
            見栄を張らなくていい。予算を正直に伝えて、価値観の合う人と出会える。
            無料デートでも、500円のコーヒーでも、一緒に楽しめる人を。
          </p>
          <Link
            href="/match/onboarding"
            className="inline-block bg-rose-600 hover:bg-rose-700 text-white px-10 py-4 rounded-full font-semibold text-lg transition-colors shadow-lg shadow-rose-500/25"
          >
            無料で始める
          </Link>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            {
              icon: Heart,
              title: '見栄なし',
              desc: '「予算〜500円」でOK。無料デートでも大歓迎。',
            },
            {
              icon: Shield,
              title: '価値観マッチ',
              desc: 'お金の使い方で合う人だけ。気まずい思いをしない。',
            },
            {
              icon: Sparkles,
              title: '素の自分',
              desc: '背伸びしない。飾らない。本当の仲間を。',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-2xl bg-white dark:bg-gray-800/50 border border-rose-200/50 dark:border-gray-700 shadow-sm"
            >
              <Icon className="w-10 h-10 text-rose-500 mb-4" />
              <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{desc}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl bg-rose-600/10 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 p-8 mb-20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            収益の使い道
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-2xl mx-auto mb-6">
            素マッチは有料プランで収益を得ています。その一部を、
            無料イベントの開催や、経済的に厳しい方へのサポートに活用しています。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm font-medium">
              プレミアム会員 ¥480/月
            </span>
            <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm font-medium">
              プロフィールブースト
            </span>
            <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm font-medium">
              おすすめスポット紹介
            </span>
          </div>
        </section>

        <section className="text-center">
          <Link
            href="/match/onboarding"
            className="inline-block bg-rose-600 hover:bg-rose-700 text-white px-10 py-4 rounded-full font-semibold transition-colors"
          >
            今すぐ無料で始める
          </Link>
        </section>
      </main>
    </div>
  );
}
