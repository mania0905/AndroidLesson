# CABIN

車の同乗中に、役割分担したAIクルーと音声（または文字）で会議し、**動画以外の下書き**をカテゴリ別に埋めるWebアプリです。

## できること

- AIクルー: 進行役 / Webリサーチャー / 決定者 / 成果物作成者
- 成果物:
  - 決定事項 / 議事録 / メモ / TODO
  - プレゼン下書き（画面表示 + **PPTX書き出し**）
  - 画像デザイン下書き（コンセプト・配色・プロンプト + プレビュー）
- 音声入力（Web Speech API）
- Markdown / PowerPoint 書き出し
- OpenAI API 接続時は実LLM + 画像生成、未設定時はデモモード

動画生成は対象外です。

## 起動

```bash
npm install
cp .env.example .env   # 任意: OPENAI_API_KEY を入れると LLM/画像生成が有効
npm run dev
```

```bash
npm run build
```

## 環境変数

| 変数 | 説明 |
|------|------|
| `OPENAI_API_KEY` | 設定すると `/api/session` と `/api/image` が実APIを利用 |
| `OPENAI_BASE_URL` | 省略時 `https://api.openai.com/v1` |
| `OPENAI_MODEL` | 省略時 `gpt-4o-mini` |
| `OPENAI_IMAGE_MODEL` | 省略時 `dall-e-3` |

キー未設定でもデモパイプラインで全画面を操作できます。

## 注意

- 運転中の利用は想定していません（同乗・停車時向け）
- Webリサーチ補助として Wikipedia オープサーチを利用します
