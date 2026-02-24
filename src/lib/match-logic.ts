import type { MatchProfile, MatchLike, MatchPair } from '@/types/match';

/** 予算レベルが近いほどスコアが高い */
function budgetScore(a: MatchProfile['budgetLevel'], b: MatchProfile['budgetLevel']): number {
  const order: MatchProfile['budgetLevel'][] = ['free', '500', '1000', '3000', '5000', 'flexible'];
  const ia = order.indexOf(a);
  const ib = order.indexOf(b);
  if (a === 'flexible' || b === 'flexible') return 1;
  const diff = Math.abs(ia - ib);
  return Math.max(0, 1 - diff * 0.3);
}

/** 目的が合うか */
function purposeScore(a: MatchProfile['purpose'], b: MatchProfile['purpose']): number {
  if (a === b) return 1;
  if (a === 'both' || b === 'both') return 0.8;
  return 0;
}

/** 興味の重なり */
function interestScore(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0.5;
  const set = new Set(b);
  const overlap = a.filter((x) => set.has(x)).length;
  return Math.min(1, overlap / Math.max(a.length, b.length) + 0.3);
}

export function calculateMatchScore(me: MatchProfile, other: MatchProfile): number {
  const b = budgetScore(me.budgetLevel, other.budgetLevel);
  const p = purposeScore(me.purpose, other.purpose);
  const i = interestScore(me.interests, other.interests);
  return b * 0.5 + p * 0.3 + i * 0.2;
}

export function getRecommendedProfiles(
  profiles: MatchProfile[],
  likes: MatchLike[],
  currentUserId: string,
  limit = 10
): MatchProfile[] {
  const me = profiles.find((p) => p.id === currentUserId);
  if (!me) return [];

  const likedIds = new Set(
    likes.filter((l) => l.fromId === currentUserId).map((l) => l.toId)
  );
  const exclude = new Set([currentUserId, ...Array.from(likedIds)]);

  const candidates = profiles
    .filter((p) => !exclude.has(p.id))
    .map((p) => ({ profile: p, score: calculateMatchScore(me, p) }))
    .sort((a, b) => b.score - a.score);

  const boosted = candidates.filter((c) => c.profile.isBoosted);
  const normal = candidates.filter((c) => !c.profile.isBoosted);
  const merged = [...boosted, ...normal];

  return merged.slice(0, limit).map((c) => c.profile);
}

export function checkMutualLike(
  likes: MatchLike[],
  userId1: string,
  userId2: string
): boolean {
  const set1 = new Set(
    likes.filter((l) => l.fromId === userId1 && l.toId === userId2).map(() => 1)
  );
  const set2 = new Set(
    likes.filter((l) => l.fromId === userId2 && l.toId === userId1).map(() => 1)
  );
  return set1.size > 0 && set2.size > 0;
}
