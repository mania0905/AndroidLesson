import Link from 'next/link';
import { FileText, Zap, Shield, CreditCard } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950">
      <header className="border-b border-gray-200/50 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            InvoiceFlow
          </Link>
          <nav className="flex gap-6">
            <Link
              href="/match"
              className="text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              素マッチ
            </Link>
            <Link
              href="/pricing"
              className="text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              料金
            </Link>
            <Link
              href="/dashboard"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              無料で始める
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-20">
        <section className="text-center mb-24">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            請求書・見積書を
            <br />
            <span className="text-emerald-600 dark:text-emerald-400">シンプルに</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            月額980円の固定料金で、プロフェッショナルな請求書・見積書を簡単作成。
            フリーランス・小規模ビジネスに最適な、シンプルで確実な収益モデル。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-emerald-500/25"
            >
              無料トライアル開始
            </Link>
            <Link
              href="/pricing"
              className="border-2 border-gray-300 dark:border-gray-600 hover:border-emerald-500 text-gray-700 dark:text-gray-300 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              料金プランを見る
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {[
            {
              icon: FileText,
              title: '請求書・見積書',
              desc: 'ワンクリックでプロ仕様の書類を作成',
            },
            {
              icon: Zap,
              title: '振る請求',
              desc: '世界初！スマホを振って送る請求書',
              href: '/shake',
            },
            {
              icon: Shield,
              title: '固定料金',
              desc: '月額980円で使い放題、予測可能なコスト',
            },
            {
              icon: CreditCard,
              title: '確実な収益',
              desc: 'サブスクリプションで安定した売上',
            },
          ].map(({ icon: Icon, title, desc, href }) => (
            href ? (
              <Link
                key={title}
                href={href}
                className="p-6 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow hover:border-amber-500/50 block"
              >
                <Icon className="w-10 h-10 text-amber-500 mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{desc}</p>
              </Link>
            ) : (
              <div
                key={title}
                className="p-6 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <Icon className="w-10 h-10 text-emerald-500 mb-4" />
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">{title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            )
          ))}
        </section>

        <section className="text-center py-16 border-t border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            InvoiceFlow - 無料で開発、固定収益を実現する革新的なSaaS
          </p>
        </section>
      </main>
    </div>
  );
}
