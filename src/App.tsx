import { useEffect, useMemo, useRef, useState } from 'react';
import {
  emptyDeliverables,
  exportSessionMarkdown,
  runCabinPipeline,
} from './lib/pipeline';
import { createSpeechListener, isSpeechSupported } from './lib/speech';
import {
  AGENT_META,
  CATEGORY_META,
  type AgentMessage,
  type AgentRole,
  type CategoryId,
  type Deliverables,
  type UserMessage,
} from './types';
import './App.css';

type ChatItem =
  | ({ kind: 'user' } & UserMessage)
  | ({ kind: 'agent' } & AgentMessage);

const SAMPLE =
  '新サービス「移動中に音声で企画会議できるアプリ」の方針を決めたい。プレゼン資料とキービジュアルの下書き、議事録とTODOも作って。';

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [topic, setTopic] = useState('CABIN セッション');
  const [input, setInput] = useState('');
  const [partial, setPartial] = useState('');
  const [listening, setListening] = useState(false);
  const [running, setRunning] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryId>('minutes');
  const [chat, setChat] = useState<ChatItem[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverables>(emptyDeliverables());
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<ReturnType<typeof createSpeechListener>>(null);
  const speechSupported = useMemo(() => isSpeechSupported(), []);

  useEffect(() => {
    feedRef.current?.scrollTo({
      top: feedRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [chat, partial, running]);

  useEffect(() => {
    return () => speechRef.current?.stop();
  }, []);

  async function runSession(text: string, source: 'voice' | 'text') {
    const trimmed = text.trim();
    if (!trimmed || running) return;

    setStarted(true);
    setRunning(true);
    setSpeechError(null);
    setInput('');
    setPartial('');

    const userMessage: ChatItem = {
      kind: 'user',
      id: `user-${crypto.randomUUID().slice(0, 8)}`,
      text: trimmed,
      at: Date.now(),
      source,
    };
    setChat((prev) => [...prev, userMessage]);

    const result = await runCabinPipeline(trimmed, (message) => {
      setChat((prev) => [...prev, { kind: 'agent', ...message }]);
    });

    setTopic(result.topic);
    setDeliverables(result.deliverables);
    setRunning(false);
  }

  function toggleListen() {
    if (!speechSupported) {
      setSpeechError('このブラウザでは音声認識に対応していません。文字入力を使ってください。');
      return;
    }

    if (listening) {
      speechRef.current?.stop();
      setListening(false);
      return;
    }

    const listener = createSpeechListener({
      onPartial: setPartial,
      onFinal: (text) => {
        setPartial('');
        void runSession(text, 'voice');
      },
      onError: (message) => {
        setSpeechError(`音声認識エラー: ${message}`);
        setListening(false);
      },
      onEnd: () => setListening(false),
    });

    if (!listener) return;
    speechRef.current = listener;
    setSpeechError(null);
    setListening(true);
    listener.start();
  }

  function handleExport() {
    const md = exportSessionMarkdown(topic, deliverables);
    downloadText(`cabin-${Date.now()}.md`, md);
  }

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden="true" />

      {!started ? (
        <header className="hero">
          <div className="hero__brand">
            <span className="hero__mark" aria-hidden="true" />
            <h1>CABIN</h1>
          </div>
          <p className="hero__lead">
            車の同乗中に、AIクルーと音声で会議し、動画以外の下書きをカテゴリごとに埋める。
          </p>
          <div className="hero__actions">
            <button type="button" className="btn btn--primary" onClick={toggleListen}>
              {listening ? '聴取を停止' : '音声で始める'}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => void runSession(SAMPLE, 'text')}
            >
              サンプルで試す
            </button>
          </div>
          <p className="hero__note">運転中は利用しません。同乗・停車時向けです。</p>
        </header>
      ) : (
        <header className="topbar">
          <div className="topbar__brand">
            <span className="hero__mark hero__mark--sm" aria-hidden="true" />
            <div>
              <strong>CABIN</strong>
              <span>{topic}</span>
            </div>
          </div>
          <div className="topbar__actions">
            <button type="button" className="btn btn--ghost" onClick={handleExport} disabled={!deliverables.minutes}>
              Markdown書き出し
            </button>
          </div>
        </header>
      )}

      <main className={`workspace ${started ? 'workspace--active' : ''}`}>
        <section className="meeting" aria-label="会議">
          <div className="crew" aria-label="AIクルー">
            {(Object.keys(AGENT_META) as AgentRole[]).map((role) => (
              <div key={role} className={`crew__chip crew__chip--${role}`}>
                <span>{AGENT_META[role].short}</span>
                <strong>{AGENT_META[role].label}</strong>
              </div>
            ))}
          </div>

          <div className="feed" ref={feedRef}>
            {chat.length === 0 && (
              <div className="feed__empty">
                <p>話したいテーマを音声か文字で渡してください。</p>
                <p>進行役 → リサーチャー → 決定者 → 成果物作成者の順で下書きを埋めます。</p>
              </div>
            )}
            {chat.map((item) =>
              item.kind === 'user' ? (
                <article key={item.id} className="bubble bubble--user">
                  <header>
                    <span>あなた</span>
                    <span>{item.source === 'voice' ? '音声' : '文字'}</span>
                  </header>
                  <p>{item.text}</p>
                </article>
              ) : (
                <article key={item.id} className={`bubble bubble--agent bubble--${item.role}`}>
                  <header>
                    <span>{AGENT_META[item.role].label}</span>
                  </header>
                  <p>{item.text}</p>
                </article>
              ),
            )}
            {partial && (
              <article className="bubble bubble--user bubble--partial">
                <header>
                  <span>認識中</span>
                </header>
                <p>{partial}</p>
              </article>
            )}
            {running && <div className="running">クルーが作業中…</div>}
          </div>

          <form
            className="composer"
            onSubmit={(e) => {
              e.preventDefault();
              void runSession(input, 'text');
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="例: 新機能の方針を決めて、議事録とスライド下書きを作って"
              rows={3}
              disabled={running}
            />
            <div className="composer__row">
              <button
                type="button"
                className={`btn ${listening ? 'btn--danger' : 'btn--ghost'}`}
                onClick={toggleListen}
                disabled={running}
              >
                {listening ? '停止' : '音声入力'}
              </button>
              <button type="submit" className="btn btn--primary" disabled={running || !input.trim()}>
                会議を回す
              </button>
            </div>
            {speechError && <p className="error">{speechError}</p>}
          </form>
        </section>

        <section className="board" aria-label="成果物ボード">
          <div className="board__head">
            <h2>成果物ボード</h2>
            <p>動画以外の下書きをカテゴリ別に整理</p>
          </div>

          <div className="tabs" role="tablist" aria-label="カテゴリ">
            {(Object.keys(CATEGORY_META) as CategoryId[]).map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeCategory === id}
                className={`tabs__item ${activeCategory === id ? 'is-active' : ''}`}
                onClick={() => setActiveCategory(id)}
              >
                {CATEGORY_META[id].label}
              </button>
            ))}
          </div>

          <div className="panel" role="tabpanel">
            <p className="panel__desc">{CATEGORY_META[activeCategory].description}</p>
            <CategoryView category={activeCategory} deliverables={deliverables} />
          </div>
        </section>
      </main>
    </div>
  );
}

function CategoryView({
  category,
  deliverables,
}: {
  category: CategoryId;
  deliverables: Deliverables;
}) {
  if (category === 'decisions') {
    if (!deliverables.decisions.length) return <EmptyState />;
    return (
      <ul className="list">
        {deliverables.decisions.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (category === 'minutes') {
    if (!deliverables.minutes) return <EmptyState />;
    return <pre className="doc">{deliverables.minutes}</pre>;
  }

  if (category === 'memos') {
    if (!deliverables.memos.length) return <EmptyState />;
    return (
      <ul className="list">
        {deliverables.memos.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  if (category === 'todos') {
    if (!deliverables.todos.length) return <EmptyState />;
    return (
      <ul className="todo-list">
        {deliverables.todos.map((todo) => (
          <li key={todo.id}>
            <div>
              <strong>{todo.title}</strong>
              <span>
                {todo.owner} · {todo.due}
              </span>
            </div>
            <em className={`prio prio--${todo.priority}`}>{todo.priority}</em>
          </li>
        ))}
      </ul>
    );
  }

  if (category === 'presentation') {
    const deck = deliverables.presentation;
    if (!deck) return <EmptyState />;
    return (
      <div className="slides">
        <header>
          <h3>{deck.title}</h3>
          <p>{deck.subtitle}</p>
        </header>
        <div className="slides__grid">
          {deck.slides.map((slide, index) => (
            <article key={slide.heading}>
              <span>Slide {index + 1}</span>
              <h4>{slide.heading}</h4>
              <ul>
                {slide.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    );
  }

  const image = deliverables.image;
  if (!image) return <EmptyState />;
  return (
    <div className="image-draft">
      <div className="image-draft__preview" aria-hidden="true">
        <div className="image-draft__glow" />
        <p>画像下書きプレビュー</p>
      </div>
      <h3>{image.title}</h3>
      <p>{image.concept}</p>
      <p className="muted">{image.style}</p>
      <div className="swatches">
        {image.palette.map((color) => (
          <span key={color} style={{ background: color }} title={color} />
        ))}
      </div>
      <pre className="doc doc--prompt">{image.prompt}</pre>
    </div>
  );
}

function EmptyState() {
  return <p className="empty">まだ下書きがありません。会議を回すとここに埋まります。</p>;
}
