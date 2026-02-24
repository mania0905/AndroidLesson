'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, X, Users, Sparkles } from 'lucide-react';
import { matchStorage } from '@/lib/match-storage';
import { ensureDemoProfiles } from '@/lib/match-seed';
import { getRecommendedProfiles } from '@/lib/match-logic';
import { BUDGET_LABELS } from '@/types/match';
import type { MatchProfile } from '@/types/match';

export default function SwipePage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<MatchProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<MatchProfile | null>(null);

  useEffect(() => {
    const userId = matchStorage.getCurrentUserId();
    if (!userId) {
      router.push('/match/onboarding');
      return;
    }

    let all = matchStorage.getProfiles();
    all = ensureDemoProfiles(all, userId);
    matchStorage.saveProfiles(all);

    const me = all.find((p) => p.id === userId);
    if (!me) {
      router.push('/match/onboarding');
      return;
    }
    setCurrentUser(me);

    const likes = matchStorage.getLikes();
    const recommended = getRecommendedProfiles(all, likes, userId, 20);
    setProfiles(recommended);
  }, [router]);

  const current = profiles[currentIndex];

  const handleLike = () => {
    if (!current || !currentUser) return;
    const likes = matchStorage.getLikes();
    likes.push({
      fromId: currentUser.id,
      toId: current.id,
      createdAt: new Date().toISOString(),
    });
    matchStorage.saveLikes(likes);

    const pairs = matchStorage.getPairs();
    const mutual = likes.some(
      (l) => l.fromId === current.id && l.toId === currentUser.id
    );
    if (mutual) {
      pairs.push({
        id: `${currentUser.id}-${current.id}`,
        userId1: currentUser.id,
        userId2: current.id,
        matchedAt: new Date().toISOString(),
      });
      matchStorage.savePairs(pairs);
    }

    setCurrentIndex((i) => Math.min(i + 1, profiles.length - 1));
  };

  const handlePass = () => {
    setCurrentIndex((i) => Math.min(i + 1, profiles.length - 1));
  };

  const matchCount = matchStorage.getPairs().filter(
    (p) => p.userId1 === currentUser?.id || p.userId2 === currentUser?.id
  ).length;

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-safe">
      <header className="flex items-center justify-between p-4 border-b border-rose-200/50 dark:border-gray-800">
        <Link href="/match" className="text-rose-600 font-bold">
          素マッチ
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/match/matches"
            className="flex items-center gap-1 text-gray-600 dark:text-gray-400"
          >
            <Users className="w-5 h-5" />
            <span>{matchCount}</span>
          </Link>
          <Link
            href="/match/premium"
            className="text-sm text-rose-600 font-medium"
          >
            プレミアム
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {!current ? (
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              今日の推薦はここまで！
            </p>
            <p className="text-sm text-gray-400 mb-8">
              また明日チェックしたり、プレミアムでより多くの人と出会えます。
            </p>
            <Link
              href="/match/matches"
              className="inline-block bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-full font-medium"
            >
              マッチ一覧を見る
            </Link>
          </div>
        ) : (
          <>
            <div className="w-full max-w-sm">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-rose-100 dark:border-gray-700">
                {current.isBoosted && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium mb-4">
                    <Sparkles className="w-3 h-3" />
                    ブースト中
                  </span>
                )}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {current.nickname}
                </h2>
                <p className="text-sm text-rose-600 dark:text-rose-400 mb-3">
                  {BUDGET_LABELS[current.budgetLevel]}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 whitespace-pre-wrap">
                  {current.bio || '自己紹介なし'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {current.interests.slice(0, 5).map((s) => (
                    <span
                      key={s}
                      className="px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-full text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-8 mt-10">
              <button
                onClick={handlePass}
                className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={handleLike}
                className="w-16 h-16 rounded-full bg-rose-500 flex items-center justify-center hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/30"
              >
                <Heart className="w-8 h-8 text-white fill-white" />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
