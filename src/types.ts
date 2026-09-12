export type AgentRole =
  | 'facilitator'
  | 'researcher'
  | 'decider'
  | 'creator';

export type CategoryId =
  | 'decisions'
  | 'minutes'
  | 'memos'
  | 'todos'
  | 'presentation'
  | 'image';

export interface AgentMessage {
  id: string;
  role: AgentRole;
  text: string;
  at: number;
}

export interface UserMessage {
  id: string;
  text: string;
  at: number;
  source: 'voice' | 'text';
}

export interface TodoItem {
  id: string;
  title: string;
  owner: string;
  due: string;
  priority: 'high' | 'medium' | 'low';
}

export interface SlideDraft {
  title: string;
  subtitle: string;
  slides: { heading: string; bullets: string[] }[];
}

export interface ImageDraft {
  title: string;
  concept: string;
  style: string;
  prompt: string;
  palette: string[];
}

export interface Deliverables {
  decisions: string[];
  minutes: string;
  memos: string[];
  todos: TodoItem[];
  presentation: SlideDraft | null;
  image: ImageDraft | null;
}

export interface SessionState {
  topic: string;
  messages: (UserMessage | (AgentMessage & { kind: 'agent' }) | (UserMessage & { kind: 'user' }))[];
  deliverables: Deliverables;
  phase: 'idle' | 'listening' | 'running' | 'done';
}

export const CATEGORY_META: Record<
  CategoryId,
  { label: string; description: string }
> = {
  decisions: {
    label: '決定事項',
    description: '方針・採用案・次の一手',
  },
  minutes: {
    label: '議事録',
    description: '会議の流れと要約',
  },
  memos: {
    label: 'メモ',
    description: '論点・気づき・根拠メモ',
  },
  todos: {
    label: 'TODO',
    description: '実行タスクの下書き',
  },
  presentation: {
    label: 'プレゼン下書き',
    description: 'スライド構成（動画以外）',
  },
  image: {
    label: '画像デザイン下書き',
    description: 'コンセプト・プロンプト・配色',
  },
};

export const AGENT_META: Record<
  AgentRole,
  { label: string; short: string }
> = {
  facilitator: { label: '進行役', short: '進行' },
  researcher: { label: 'Webリサーチャー', short: '調査' },
  decider: { label: '決定者', short: '決定' },
  creator: { label: '成果物作成者', short: '作成' },
};
