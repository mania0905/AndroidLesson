'use client';

import type { MatchProfile, MatchLike, MatchPair } from '@/types/match';

const KEYS = {
  PROFILES: 'sumatch_profiles',
  LIKES: 'sumatch_likes',
  PAIRS: 'sumatch_pairs',
  CURRENT_USER: 'sumatch_current_user',
} as const;

function get<T>(key: string, def: T): T {
  if (typeof window === 'undefined') return def;
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : def;
  } catch {
    return def;
  }
}

function set(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    //
  }
}

export const matchStorage = {
  getProfiles(): MatchProfile[] {
    return get(KEYS.PROFILES, []);
  },
  saveProfiles(p: MatchProfile[]): void {
    set(KEYS.PROFILES, p);
  },
  getLikes(): MatchLike[] {
    return get(KEYS.LIKES, []);
  },
  saveLikes(l: MatchLike[]): void {
    set(KEYS.LIKES, l);
  },
  getPairs(): MatchPair[] {
    return get(KEYS.PAIRS, []);
  },
  savePairs(p: MatchPair[]): void {
    set(KEYS.PAIRS, p);
  },
  getCurrentUserId(): string | null {
    return get(KEYS.CURRENT_USER, null);
  },
  setCurrentUserId(id: string | null): void {
    set(KEYS.CURRENT_USER, id);
  },
};
