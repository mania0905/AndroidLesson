'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { matchStorage } from '@/lib/match-storage';
import { BUDGET_LABELS } from '@/types/match';
import type { MatchProfile } from '@/types/match';

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<MatchProfile | null>(null);

  useEffect(() => {
    const userId = matchStorage.getCurrentUserId();
    if (!userId) {
      router.push('/match/onboarding');
      return;
    }

    const profiles = matchStorage.getProfiles();
    const pairs = matchStorage.getPairs();
    const me = profiles.find((p) => p.id === userId);
    if (!me) {
      router.push('/match/onboarding');
      return;
    }
    setCurrentUser(me);

    const matchIds = pairs
      .filter((p) => p.userId1 === userId || p.userId2 === userId)
      .map((p) => (p.userId1 === userId ? p.userId2 : p.userId1));

    const matchProfiles = profiles.filter((p) => matchIds.includes(p.id));
    setMatches(matchProfiles);
  }, [router]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between p-4 border-b border-rose-200/50 dark:border-gray-800">
        <Link href="/match" className="text-rose-600 font-bold">
          素マッチ
        </Link>
        <Link href="/match/swipe" className="text-sm text-gray-600 dark:text-gray-400">
          スワイプへ
        </Link>
      </header>

      <main className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          マッチング
        </h1>

        {matches.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              まだマッチングしていません
            </p>
            <p className="text-sm text-gray-400 mb-8">
              スワイプで気になる人にいいねを送ってみましょう
            </p>
            <Link
              href="/match/swipe"
              className="inline-block bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-full font-medium"
            >
              スワイプを始める
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((p) => (
              <div
                key={p.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-rose-100 dark:border-gray-700 flex items-center justify-between"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {p.nickname}
                  </h3>
                  <p className="text-sm text-rose-600 dark:text-rose-400">
                    {BUDGET_LABELS[p.budgetLevel]}
                  </p>
                </div>
                <Link
                  href={`/match/chat/${p.id}`}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-full"
                >
                  メッセージ
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
