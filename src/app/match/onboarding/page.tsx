'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { matchStorage } from '@/lib/match-storage';
import { generateId } from '@/lib/utils';
import type { MatchProfile, BudgetLevel, MatchPurpose } from '@/types/match';
import { BUDGET_LABELS } from '@/types/match';

const BUDGET_OPTIONS: BudgetLevel[] = ['free', '500', '1000', '3000', '5000', 'flexible'];
const PURPOSE_OPTIONS: { value: MatchPurpose; label: string }[] = [
  { value: 'dating', label: '恋愛・デート' },
  { value: 'friends', label: '友達・仲間' },
  { value: 'both', label: 'どちらでも' },
];
const INTEREST_OPTIONS = [
  '散歩', 'カフェ', 'おうちごはん', '映画', '読書', 'ゲーム',
  '無料イベント', '節約', 'DIY', '音楽', '公園', 'その他',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel>('1000');
  const [purpose, setPurpose] = useState<MatchPurpose>('both');
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState('');

  const toggleInterest = (s: string) => {
    setInterests((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }

    const profile: MatchProfile = {
      id: generateId(),
      nickname: nickname.trim(),
      bio: bio.trim(),
      budgetLevel,
      purpose,
      interests,
      createdAt: new Date().toISOString(),
      isPremium: false,
      isBoosted: false,
    };

    const profiles = matchStorage.getProfiles();
    if (profiles.length === 0) {
      profiles.push(profile);
    } else {
      const idx = profiles.findIndex((p) => p.id === matchStorage.getCurrentUserId());
      if (idx >= 0) {
        profiles[idx] = { ...profile, id: profiles[idx].id };
      } else {
        profiles.push(profile);
      }
    }
    matchStorage.saveProfiles(profiles);
    matchStorage.setCurrentUserId(profile.id);
    router.push('/match/swipe');
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">
        <Link href="/match" className="text-rose-600 hover:underline text-sm mb-6 inline-block">
          ← 戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          プロフィール設定
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ニックネーム *
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="例: たろう"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              自己紹介
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="どんな人と出会いたい？ どんなデートが好き？"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              デートの予算感（正直に！）
            </label>
            <div className="grid grid-cols-2 gap-2">
              {BUDGET_OPTIONS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudgetLevel(b)}
                  className={`px-4 py-3 rounded-xl border text-left text-sm transition-colors ${
                    budgetLevel === b
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400'
                      : 'border-gray-300 dark:border-gray-600 hover:border-rose-300'
                  }`}
                >
                  {BUDGET_LABELS[b]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              目的
            </label>
            <div className="flex flex-wrap gap-2">
              {PURPOSE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPurpose(value)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    purpose === value
                      ? 'bg-rose-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              興味・趣味（複数選択可）
            </label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleInterest(s)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    interests.includes(s)
                      ? 'bg-rose-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors"
          >
            マッチングを始める
          </button>
        </form>
      </div>
    </div>
  );
}
