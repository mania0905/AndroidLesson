import Link from 'next/link';
import { Check, Zap, MessageCircle, Star } from 'lucide-react';

export default function PremiumPage() {
  return (
    <div className="min-h-screen">
      <header className="p-4 border-b border-rose-200/50 dark:border-gray-800">
        <Link href="/match" className="text-rose-600 font-bold">
          素マッチ
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          素マッチ プレミアム
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-12">
          より多くの人と、素の自分で出会える
        </p>

        <div className="bg-rose-600 rounded-2xl p-8 text-white mb-8">
          <div className="text-center mb-6">
            <p className="text-4xl font-black">¥480</p>
            <p className="text-rose-200">/月</p>
          </div>
          <ul className="space-y-4 mb-8">
            {[
              { icon: MessageCircle, text: 'マッチング相手と無制限メッセージ' },
              { icon: Zap, text: '誰がいいねしたか見れる' },
              { icon: Star, text: '推薦の優先表示' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <Check className="w-5 h-5 flex-shrink-0" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <button className="w-full py-4 bg-white text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-colors">
            14日間無料で始める
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-rose-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              プロフィールブースト
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              1日間、推薦の上位に表示
            </p>
            <p className="text-xl font-bold text-rose-600">¥300</p>
            <p className="text-xs text-gray-500">/回</p>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-rose-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              スーパーライク
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              相手に特別通知でアピール
            </p>
            <p className="text-xl font-bold text-rose-600">¥100</p>
            <p className="text-xs text-gray-500">/回</p>
          </div>
        </div>

        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            収益の使い道
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            月額料金の一部は、無料イベント開催や、経済的に厳しい方へのサポートに活用しています。
          </p>
        </div>
      </main>
    </div>
  );
}
