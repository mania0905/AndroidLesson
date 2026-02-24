import type { MatchProfile } from '@/types/match';

export const DEMO_PROFILES: Omit<MatchProfile, 'id'>[] = [
  {
    nickname: 'さくら',
    bio: '散歩とカフェが好き。お金かけなくても楽しく過ごしたい！',
    budgetLevel: '500',
    purpose: 'both',
    interests: ['散歩', 'カフェ', '節約', '公園'],
    createdAt: new Date().toISOString(),
    isPremium: false,
    isBoosted: true,
  },
  {
    nickname: 'けんと',
    bio: '無料イベント巡りが趣味。一緒に探してくれる人募集中',
    budgetLevel: 'free',
    purpose: 'friends',
    interests: ['無料イベント', '散歩', '音楽', '公園'],
    createdAt: new Date().toISOString(),
    isPremium: true,
    isBoosted: false,
  },
  {
    nickname: 'ゆい',
    bio: 'おうちごはん作るの好き。節約しながら美味しく食べたい',
    budgetLevel: '1000',
    purpose: 'dating',
    interests: ['おうちごはん', '節約', '映画', '読書'],
    createdAt: new Date().toISOString(),
    isPremium: false,
    isBoosted: false,
  },
  {
    nickname: 'だいき',
    bio: 'ゲームと映画。予算少なめで楽しみたい派',
    budgetLevel: '500',
    purpose: 'both',
    interests: ['ゲーム', '映画', 'カフェ', '読書'],
    createdAt: new Date().toISOString(),
    isPremium: false,
    isBoosted: false,
  },
  {
    nickname: 'なな',
    bio: '公園でおしゃべりとか、シンプルなデートが好き',
    budgetLevel: 'free',
    purpose: 'friends',
    interests: ['公園', '散歩', 'カフェ', '無料イベント'],
    createdAt: new Date().toISOString(),
    isPremium: false,
    isBoosted: true,
  },
];

export function ensureDemoProfiles(profiles: MatchProfile[], currentUserId: string): MatchProfile[] {
  const hasDemo = profiles.some((p) => p.nickname === 'さくら');
  if (hasDemo) return profiles;

  const ids = new Set(profiles.map((p) => p.id));
  const newOnes = DEMO_PROFILES.map((d, i) => ({
    ...d,
    id: `demo-${i}-${Date.now()}`,
  })).filter((p) => p.id !== currentUserId && !ids.has(p.id));

  return [...profiles, ...newOnes];
}
