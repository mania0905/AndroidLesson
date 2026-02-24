import Link from 'next/link';
import { Check } from 'lucide-react';

const PLANS = [
  {
    name: '無料',
    price: 0,
    description: 'お試し用',
    features: ['月5件まで請求書作成', '基本的な機能', 'ローカル保存'],
    cta: '今すぐ始める',
    href: '/dashboard',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 980,
    description: 'フリーランス・個人事業主に最適',
    features: ['無制限の請求書・見積書', '顧客管理', 'PDF出力', 'クラウド保存', 'メールサポート'],
    cta: '14日間無料トライアル',
    href: '/dashboard?plan=pro',
    highlighted: true,
  },
  {
    name: 'Business',
    price: 2980,
    description: 'チーム・法人向け',
    features: [
      'Proの全機能',
      'チームメンバー招待',
      '複数事業所対応',
      '優先サポート',
      'API連携',
    ],
    cta: 'お問い合わせ',
    href: '/dashboard?plan=business',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            InvoiceFlow
          </Link>
          <nav className="flex gap-6">
            <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-emerald-600">
              ホーム
            </Link>
            <Link href="/dashboard" className="text-emerald-600 font-medium">
              ダッシュボード
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            シンプルな料金プラン
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            月額固定料金で、予測可能なコスト。追加料金は一切ありません。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-500/25 scale-105'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                  おすすめ
                </div>
              )}
              <h3
                className={`text-xl font-bold mb-2 ${
                  plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}
              >
                {plan.name}
              </h3>
              <p
                className={`mb-6 ${
                  plan.highlighted ? 'text-emerald-100' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {plan.description}
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  ¥{plan.price.toLocaleString()}
                </span>
                <span className={plan.highlighted ? 'text-emerald-200' : 'text-gray-500'}>
                  /月
                </span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        plan.highlighted ? 'text-emerald-200' : 'text-emerald-500'
                      }`}
                    />
                    <span
                      className={
                        plan.highlighted ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                      }
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                  plan.highlighted
                    ? 'bg-white text-emerald-600 hover:bg-emerald-50'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
