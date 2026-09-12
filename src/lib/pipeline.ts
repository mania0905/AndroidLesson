import type {
  AgentMessage,
  AgentRole,
  Deliverables,
  ImageDraft,
  SlideDraft,
  TodoItem,
} from '../types';

function uid(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function extractTopic(input: string): string {
  const cleaned = input.replace(/\s+/g, ' ').trim();
  if (!cleaned) return '無題セッション';
  const clipped = cleaned.length > 48 ? `${cleaned.slice(0, 48)}…` : cleaned;
  return clipped;
}

function detectIntent(input: string) {
  const text = input.toLowerCase();
  return {
    wantsPresentation:
      /プレゼン|スライド|パワポ|powerpoint|資料|提案書|ピッチ/.test(text),
    wantsImage:
      /画像|デザイン|ビジュアル|バナー|ポスター|サムネ|イラスト|キービジュアル/.test(
        text,
      ),
    wantsTodos: /todo|タスク|やること|宿題|アクション|宿題/.test(text) || true,
    isProduct: /アプリ|サービス|プロダクト|機能|ux|ui/.test(text),
    isMarketing: /マーケ|広告|キャンペーン|集客|ブランド/.test(text),
    isMeeting: /会議|打合|打ち合わせ|ミーティング|議事/.test(text),
  };
}

function researchBullets(topic: string, intent: ReturnType<typeof detectIntent>) {
  const base = [
    `「${topic}」に近い公開事例では、移動中の音声入力→構造化メモが主流。`,
    '車内利用では、画面確認より「承認/却下」の短い発話フローが継続率が高い。',
    '成果物は完成品より下書きテンプレ（議事録・TODO・資料骨子）から始めると失敗が少ない。',
  ];
  if (intent.isMarketing) {
    base.push('訴求は「誰の・どの移動シーンの・何の不便」を一文で固定すると資料がブレない。');
  }
  if (intent.isProduct) {
    base.push('MVPは音声会議・カテゴリボード・下書き生成の3画面に絞ると検証が早い。');
  }
  return base;
}

function buildDecisions(topic: string, intent: ReturnType<typeof detectIntent>) {
  const decisions = [
    `当面の成果物範囲は「動画以外の下書き」（議事録 / メモ / TODO / プレゼン / 画像）に限定する。`,
    `今回の主題「${topic}」について、車内では方針決定、停車後にプレビュー確認する運用とする。`,
  ];
  if (intent.wantsPresentation) {
    decisions.push('プレゼンはまず構成案（見出し＋箇条書き）まで自動生成し、デザイン調整は後段とする。');
  }
  if (intent.wantsImage) {
    decisions.push('画像はコンセプト・配色・生成プロンプトの下書きまでを自動作成する。');
  }
  decisions.push('最終承認は利用者が行い、将来的に信頼できたタスク種別だけ全自動へ移行する。');
  return decisions;
}

function buildMinutes(
  topic: string,
  userText: string,
  research: string[],
  decisions: string[],
): string {
  return [
    `# 議事録（下書き）`,
    ``,
    `## 主題`,
    topic,
    ``,
    `## 参加者（AIクルー）`,
    `- 進行役`,
    `- Webリサーチャー`,
    `- 決定者`,
    `- 成果物作成者`,
    ``,
    `## 利用者発言の要約`,
    userText.trim() || '（発言なし）',
    ``,
    `## 調査サマリー`,
    ...research.map((r) => `- ${r}`),
    ``,
    `## 決定事項`,
    ...decisions.map((d) => `- ${d}`),
    ``,
    `## 次回`,
    `- 下書きのプレビュー確認`,
    `- 修正指示があれば再生成`,
    `- 動画制作は対象外のまま据え置き`,
  ].join('\n');
}

function buildMemos(topic: string, research: string[]): string[] {
  return [
    `論点: ${topic} を「車内で決めること」と「後で仕上げること」に分離する。`,
    ...research.slice(0, 2).map((r) => `根拠メモ: ${r}`),
    'リスク: 走行中の画面操作は禁止。音声のみで承認できるUIが必須。',
  ];
}

function buildTodos(topic: string, intent: ReturnType<typeof detectIntent>): TodoItem[] {
  const items: TodoItem[] = [
    {
      id: uid('todo'),
      title: `「${topic}」の成功条件を1文で確定する`,
      owner: '利用者',
      due: '本日中',
      priority: 'high',
    },
    {
      id: uid('todo'),
      title: '議事録・メモ・TODO下書きをレビューする',
      owner: '利用者',
      due: '停車後',
      priority: 'high',
    },
    {
      id: uid('todo'),
      title: '次回セッション用のカテゴリテンプレを固定する',
      owner: '成果物作成者',
      due: '今週',
      priority: 'medium',
    },
  ];
  if (intent.wantsPresentation) {
    items.push({
      id: uid('todo'),
      title: 'プレゼン下書きの見出しを確認し、不足スライドを指示する',
      owner: '利用者',
      due: '帰宅後',
      priority: 'medium',
    });
  }
  if (intent.wantsImage) {
    items.push({
      id: uid('todo'),
      title: '画像デザイン下書きのプロンプトを調整して再生成する',
      owner: '成果物作成者',
      due: '次回作業時',
      priority: 'medium',
    });
  }
  return items;
}

function buildPresentation(topic: string, decisions: string[], research: string[]): SlideDraft {
  return {
    title: topic,
    subtitle: 'CABIN セッション下書き — 動画を除く成果物パッケージ',
    slides: [
      {
        heading: '課題と目的',
        bullets: [
          '車移動中でも仕事を進めたい（運転中は不可）',
          '音声会議で方針を固め、下書きまで自動で埋める',
          `今回の主題: ${topic}`,
        ],
      },
      {
        heading: 'AIクルー体制',
        bullets: [
          '進行役: 議題とターンを管理',
          'Webリサーチャー: 要点調査',
          '決定者: 選択肢を絞り推奨',
          '成果物作成者: カテゴリ別に下書き生成',
        ],
      },
      {
        heading: '調査ハイライト',
        bullets: research.slice(0, 3),
      },
      {
        heading: '決定事項',
        bullets: decisions.slice(0, 4),
      },
      {
        heading: '成果物スコープ',
        bullets: [
          '議事録 / メモ / TODO',
          'プレゼン資料の構成下書き',
          '画像デザインのコンセプト下書き',
          '動画は対象外',
        ],
      },
      {
        heading: '次アクション',
        bullets: [
          '下書きレビュー',
          '修正指示 → 再生成',
          '慣れた領域から承認ゲートを外し自動化',
        ],
      },
    ],
  };
}

function buildImageDraft(topic: string): ImageDraft {
  return {
    title: `${topic} — キービジュアル下書き`,
    concept:
      '車内の後部座席から見える、静かな夕方のハイウェイ。手前に薄いホログラムの会議ボードが浮かび、AIクルーがカテゴリ別に成果物を埋めていく気配。',
    style:
      'シネマティックな実写寄り、浅い被写界深度、落ち着いた緑灰と真鍮色のアクセント。文字は入れない。',
    prompt: `Cinematic passenger-seat view inside a modern car at dusk, soft highway lights bokeh, floating translucent work board with sorted notes, calm teal-sage palette with brass accents, no readable text, photoreal, shallow depth of field, --ar 16:9`,
    palette: ['#1A3A32', '#D4A85A', '#F2EDE4', '#6F8F86', '#2C2A26'],
  };
}

export interface PipelineResult {
  topic: string;
  agentMessages: AgentMessage[];
  deliverables: Deliverables;
}

function say(role: AgentRole, text: string): AgentMessage {
  return { id: uid(role), role, text, at: Date.now() };
}

export async function runCabinPipeline(
  userText: string,
  onAgent?: (message: AgentMessage) => void,
): Promise<PipelineResult> {
  const topic = extractTopic(userText);
  const intent = detectIntent(userText);
  const research = researchBullets(topic, intent);
  const decisions = buildDecisions(topic, intent);
  const messages: AgentMessage[] = [];

  const emit = async (role: AgentRole, text: string, delay = 450) => {
    await new Promise((r) => setTimeout(r, delay));
    const message = say(role, text);
    messages.push(message);
    onAgent?.(message);
  };

  await emit(
    'facilitator',
    `主題を「${topic}」として進めます。調査→決定→下書きの順で回します。動画は作らず、それ以外の下書きに集中します。`,
    280,
  );

  await emit(
    'researcher',
    `調査結果です。\n${research.map((r, i) => `${i + 1}. ${r}`).join('\n')}`,
    700,
  );

  await emit(
    'decider',
    `推奨方針をまとめました。\n${decisions.map((d, i) => `${i + 1}. ${d}`).join('\n')}\n最終承認はあなたが行ってください。`,
    700,
  );

  const deliverables: Deliverables = {
    decisions,
    minutes: buildMinutes(topic, userText, research, decisions),
    memos: buildMemos(topic, research),
    todos: buildTodos(topic, intent),
    presentation:
      intent.wantsPresentation || intent.isProduct || intent.isMarketing || true
        ? buildPresentation(topic, decisions, research)
        : null,
    image:
      intent.wantsImage || intent.isMarketing || intent.isProduct || true
        ? buildImageDraft(topic)
        : null,
  };

  await emit(
    'creator',
    '成果物ボードを更新しました。議事録・メモ・TODO・プレゼン下書き・画像デザイン下書きをカテゴリ別に整理済みです。',
    600,
  );

  await emit(
    'facilitator',
    '一通り埋まりました。修正したい点を音声か文字で指示してください。同じフローで再生成できます。',
    400,
  );

  return { topic, agentMessages: messages, deliverables };
}

export function emptyDeliverables(): Deliverables {
  return {
    decisions: [],
    minutes: '',
    memos: [],
    todos: [],
    presentation: null,
    image: null,
  };
}

export function exportSessionMarkdown(
  topic: string,
  deliverables: Deliverables,
): string {
  const lines = [
    `# CABIN Session — ${topic}`,
    '',
    '## 決定事項',
    ...deliverables.decisions.map((d) => `- ${d}`),
    '',
    deliverables.minutes,
    '',
    '## メモ',
    ...deliverables.memos.map((m) => `- ${m}`),
    '',
    '## TODO',
    ...deliverables.todos.map(
      (t) => `- [${t.priority}] ${t.title}（${t.owner} / ${t.due}）`,
    ),
    '',
  ];

  if (deliverables.presentation) {
    lines.push('## プレゼン下書き', `### ${deliverables.presentation.title}`, '');
    for (const slide of deliverables.presentation.slides) {
      lines.push(`#### ${slide.heading}`);
      lines.push(...slide.bullets.map((b) => `- ${b}`), '');
    }
  }

  if (deliverables.image) {
    lines.push(
      '## 画像デザイン下書き',
      `### ${deliverables.image.title}`,
      '',
      deliverables.image.concept,
      '',
      `スタイル: ${deliverables.image.style}`,
      '',
      'プロンプト:',
      '```',
      deliverables.image.prompt,
      '```',
      '',
      `配色: ${deliverables.image.palette.join(', ')}`,
    );
  }

  return lines.join('\n');
}
