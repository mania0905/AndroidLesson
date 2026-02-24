/** 素マッチ - 見栄を張らない、お金の心配をせず付き合えるマッチング */

export type BudgetLevel = 'free' | '500' | '1000' | '3000' | '5000' | 'flexible';

export const BUDGET_LABELS: Record<BudgetLevel, string> = {
  free: '無料で楽しみたい',
  '500': '〜500円程度',
  '1000': '〜1,000円程度',
  '3000': '〜3,000円程度',
  '5000': '〜5,000円程度',
  flexible: 'その時々で',
};

export type MatchPurpose = 'dating' | 'friends' | 'both';

export interface MatchProfile {
  id: string;
  nickname: string;
  bio: string;
  budgetLevel: BudgetLevel;
  purpose: MatchPurpose;
  interests: string[];
  createdAt: string;
  isPremium: boolean;
  isBoosted: boolean;
}

export interface MatchLike {
  fromId: string;
  toId: string;
  createdAt: string;
}

export interface MatchPair {
  id: string;
  userId1: string;
  userId2: string;
  matchedAt: string;
}

export type SubscriptionPlan = 'free' | 'premium';
