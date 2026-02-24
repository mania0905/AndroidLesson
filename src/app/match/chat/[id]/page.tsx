'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { matchStorage } from '@/lib/match-storage';
import { BUDGET_LABELS } from '@/types/match';
import type { MatchProfile } from '@/types/match';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [profile, setProfile] = useState<MatchProfile | null>(null);

  useEffect(() => {
    const userId = matchStorage.getCurrentUserId();
    if (!userId) {
      router.push('/match/onboarding');
      return;
    }

    const profiles = matchStorage.getProfiles();
    const p = profiles.find((x) => x.id === id);
    if (!p) {
      router.push('/match/matches');
      return;
    }

    const pairs = matchStorage.getPairs();
    const isMatch = pairs.some(
      (pair) =>
        (pair.userId1 === userId && pair.userId2 === id) ||
        (pair.userId1 === id && pair.userId2 === userId)
    );
    if (!isMatch) {
      router.push('/match/matches');
      return;
    }

    setProfile(p);
  }, [id, router]);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center gap-4 p-4 border-b border-rose-200/50 dark:border-gray-800">
        <Link href="/match/matches" className="text-rose-600">
          ←
        </Link>
        <div>
          <h1 className="font-bold text-gray-900 dark:text-white">{profile.nickname}</h1>
          <p className="text-sm text-rose-600 dark:text-rose-400">
            {BUDGET_LABELS[profile.budgetLevel]}
          </p>
        </div>
      </header>

      <main className="flex-1 p-6 flex flex-col items-center justify-center">
        <div className="max-w-sm w-full text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            メッセージ機能はプレミアム会員向けです。
          </p>
          <p className="text-sm text-gray-400 mb-8">
            {profile.nickname}さんとのマッチングは成立しています！
            プレミアムにアップグレードすると、メッセージのやり取りができます。
          </p>
          <Link
            href="/match/premium"
            className="inline-block bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-full font-medium"
          >
            プレミアムを見る
          </Link>
        </div>
      </main>
    </div>
  );
}
