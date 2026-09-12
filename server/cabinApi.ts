import type { Plugin } from 'vite';
import { loadEnv } from 'vite';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

type SessionPayload = {
  topic: string;
  research: string[];
  decisions: string[];
  minutes: string;
  memos: string[];
  todos: {
    id: string;
    title: string;
    owner: string;
    due: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  presentation: {
    title: string;
    subtitle: string;
    slides: { heading: string; bullets: string[] }[];
  };
  image: {
    title: string;
    concept: string;
    style: string;
    prompt: string;
    palette: string[];
  };
  agentLines: {
    facilitatorOpen: string;
    researcher: string;
    decider: string;
    creator: string;
    facilitatorClose: string;
  };
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function normalizePayload(raw: Record<string, unknown>, webNotes: string[]): SessionPayload {
  const agentLinesRaw = (raw.agentLines ?? {}) as Record<string, unknown>;
  const presentationRaw = (raw.presentation ?? {}) as Record<string, unknown>;
  const imageRaw = (raw.image ?? {}) as Record<string, unknown>;
  const todosRaw = Array.isArray(raw.todos) ? raw.todos : [];
  const slidesRaw = Array.isArray(presentationRaw.slides) ? presentationRaw.slides : [];

  const research = [...webNotes, ...asStringArray(raw.research)].slice(0, 6);
  const decisions = asStringArray(raw.decisions);

  return {
    topic: String(raw.topic || 'CABINセッション'),
    research,
    decisions,
    minutes: String(raw.minutes || ''),
    memos: asStringArray(raw.memos),
    todos: todosRaw.map((todo, index) => {
      const t = (todo ?? {}) as Record<string, unknown>;
      const priority = String(t.priority || 'medium');
      return {
        id: String(t.id || `todo-${index + 1}`),
        title: String(t.title || `タスク ${index + 1}`),
        owner: String(t.owner || '利用者'),
        due: String(t.due || '未定'),
        priority: (['high', 'medium', 'low'].includes(priority)
          ? priority
          : 'medium') as 'high' | 'medium' | 'low',
      };
    }),
    presentation: {
      title: String(presentationRaw.title || raw.topic || 'プレゼン下書き'),
      subtitle: String(presentationRaw.subtitle || 'CABIN draft'),
      slides: slidesRaw.map((slide, index) => {
        const s = (slide ?? {}) as Record<string, unknown>;
        return {
          heading: String(s.heading || `スライド ${index + 1}`),
          bullets: asStringArray(s.bullets),
        };
      }),
    },
    image: {
      title: String(imageRaw.title || `${String(raw.topic || 'CABIN')} 画像下書き`),
      concept: String(imageRaw.concept || ''),
      style: String(imageRaw.style || ''),
      prompt: String(imageRaw.prompt || 'Calm cinematic cabin interior, soft light, no text'),
      palette: asStringArray(imageRaw.palette).length
        ? asStringArray(imageRaw.palette)
        : ['#1A3A32', '#D4A85A', '#F2EDE4', '#6F8F86', '#2C2A26'],
    },
    agentLines: {
      facilitatorOpen: String(
        agentLinesRaw.facilitatorOpen ||
          `主題「${String(raw.topic || '')}」で進めます。調査→決定→下書きの順です。`,
      ),
      researcher: String(
        agentLinesRaw.researcher ||
          `調査結果です。\n${research.map((r, i) => `${i + 1}. ${r}`).join('\n')}`,
      ),
      decider: String(
        agentLinesRaw.decider ||
          `推奨方針です。\n${decisions.map((d, i) => `${i + 1}. ${d}`).join('\n')}`,
      ),
      creator: String(
        agentLinesRaw.creator ||
          '成果物ボードを更新しました。議事録・メモ・TODO・プレゼン・画像下書きを整理済みです。',
      ),
      facilitatorClose: String(
        agentLinesRaw.facilitatorClose ||
          '一通り埋まりました。修正点があれば指示してください。',
      ),
    },
  };
}

function readBody(req: import('http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function sendJson(res: import('http').ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function getConfig(mode: string) {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY || '';
  const baseUrl = (env.OPENAI_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(
    /\/$/,
    '',
  );
  const model = env.OPENAI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';
  const imageModel = env.OPENAI_IMAGE_MODEL || process.env.OPENAI_IMAGE_MODEL || 'dall-e-3';
  return { apiKey, baseUrl, model, imageModel };
}

async function wikiSnippets(query: string): Promise<string[]> {
  try {
    const url = `https://ja.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query.slice(0, 80))}&limit=4&namespace=0&format=json&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = (await res.json()) as [string, string[], string[], string[]];
    const titles = data[1] ?? [];
    const descs = data[2] ?? [];
    return titles.slice(0, 3).map((title, i) => {
      const desc = descs[i]?.trim();
      return desc ? `Wikipedia: ${title} — ${desc}` : `Wikipedia: ${title}`;
    });
  } catch {
    return [];
  }
}

async function openaiChat(
  config: ReturnType<typeof getConfig>,
  messages: ChatMessage[],
): Promise<string> {
  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI chat failed (${res.status}): ${text.slice(0, 240)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI chat returned empty content');
  return content;
}

async function openaiImage(
  config: ReturnType<typeof getConfig>,
  prompt: string,
): Promise<string | null> {
  const res = await fetch(`${config.baseUrl}/images/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.imageModel,
      prompt: prompt.slice(0, 3500),
      size: '1024x1024',
      n: 1,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI image failed (${res.status}): ${text.slice(0, 240)}`);
  }
  const data = (await res.json()) as {
    data?: { url?: string; b64_json?: string }[];
  };
  const first = data.data?.[0];
  if (first?.url) return first.url;
  if (first?.b64_json) return `data:image/png;base64,${first.b64_json}`;
  return null;
}

function buildSystemPrompt(webNotes: string[]) {
  return [
    'あなたは車内同乗向けAIクルー「CABIN」の司令塔です。',
    '動画は作らず、議事録・メモ・TODO・プレゼン下書き・画像デザイン下書きだけを日本語で作成します。',
    '必ず有効なJSONのみを返してください。スキーマ:',
    `{
  "topic": "短い主題",
  "research": ["調査ポイント", "..."],
  "decisions": ["決定事項", "..."],
  "minutes": "議事録本文（Markdown可）",
  "memos": ["メモ", "..."],
  "todos": [{"id":"todo-1","title":"...","owner":"...","due":"...","priority":"high|medium|low"}],
  "presentation": {"title":"...","subtitle":"...","slides":[{"heading":"...","bullets":["..."]}]},
  "image": {"title":"...","concept":"...","style":"...","prompt":"English image prompt","palette":["#1A3A32","#D4A85A","#F2EDE4","#6F8F86","#2C2A26"]},
  "agentLines": {
    "facilitatorOpen":"進行役の開始発言",
    "researcher":"調査役の発言",
    "decider":"決定役の発言",
    "creator":"作成役の発言",
    "facilitatorClose":"進行役の締め"
  }
}`,
    'presentation.slides は4〜7枚。image.prompt は英語。todos は3〜6件。',
    webNotes.length
      ? `参考Webメモ:\n${webNotes.map((n) => `- ${n}`).join('\n')}`
      : '参考Webメモは取得できませんでした。一般知見で補ってください。',
  ].join('\n');
}

async function handleSession(
  config: ReturnType<typeof getConfig>,
  userText: string,
): Promise<{ mode: 'llm' | 'unavailable'; payload?: SessionPayload; error?: string }> {
  if (!config.apiKey) {
    return { mode: 'unavailable' };
  }

  const webNotes = await wikiSnippets(userText);
  try {
    const raw = await openaiChat(config, [
      { role: 'system', content: buildSystemPrompt(webNotes) },
      {
        role: 'user',
        content: `利用者の依頼:\n${userText}\n\n必ず上記JSONスキーマで返してください。`,
      },
    ]);
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const payload = normalizePayload(parsed, webNotes);
    return { mode: 'llm', payload };
  } catch (error) {
    return {
      mode: 'unavailable',
      error: error instanceof Error ? error.message : 'LLM request failed',
    };
  }
}

export function cabinApiPlugin(mode = 'development'): Plugin {
  const attach = (middlewares: {
    use: (fn: (req: import('http').IncomingMessage, res: import('http').ServerResponse, next: (err?: unknown) => void) => void) => void;
  }) => {
    middlewares.use(async (req, res, next) => {
      const url = req.url?.split('?')[0] ?? '';
      if (!url.startsWith('/api/')) {
        next();
        return;
      }

      const config = getConfig(mode);

      try {
        if (req.method === 'GET' && url === '/api/status') {
          sendJson(res, 200, {
            llm: Boolean(config.apiKey),
            image: Boolean(config.apiKey),
            model: config.apiKey ? config.model : null,
            imageModel: config.apiKey ? config.imageModel : null,
          });
          return;
        }

        if (req.method === 'POST' && url === '/api/session') {
          const body = JSON.parse((await readBody(req)) || '{}') as { text?: string };
          const text = body.text?.trim() ?? '';
          if (!text) {
            sendJson(res, 400, { error: 'text is required' });
            return;
          }
          const result = await handleSession(config, text);
          sendJson(res, 200, result);
          return;
        }

        if (req.method === 'POST' && url === '/api/image') {
          if (!config.apiKey) {
            sendJson(res, 200, { mode: 'unavailable', previewUrl: null });
            return;
          }
          const body = JSON.parse((await readBody(req)) || '{}') as { prompt?: string };
          const prompt = body.prompt?.trim() ?? '';
          if (!prompt) {
            sendJson(res, 400, { error: 'prompt is required' });
            return;
          }
          try {
            const previewUrl = await openaiImage(config, prompt);
            sendJson(res, 200, { mode: 'openai', previewUrl });
          } catch (error) {
            sendJson(res, 200, {
              mode: 'unavailable',
              previewUrl: null,
              error: error instanceof Error ? error.message : 'image failed',
            });
          }
          return;
        }

        sendJson(res, 404, { error: 'not found' });
      } catch (error) {
        sendJson(res, 500, {
          error: error instanceof Error ? error.message : 'server error',
        });
      }
    });
  };

  return {
    name: 'cabin-api',
    configureServer(server) {
      attach(server.middlewares);
    },
    configurePreviewServer(server) {
      attach(server.middlewares);
    },
  };
}
