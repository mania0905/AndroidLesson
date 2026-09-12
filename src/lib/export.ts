import type { Deliverables, ImageDraft, SlideDraft } from '../types';

export function buildSvgPreview(
  image: Pick<ImageDraft, 'title' | 'concept' | 'palette'>,
): string {
  const [c0, c1, c2, c3] = [
    image.palette[0] ?? '#1A3A32',
    image.palette[1] ?? '#D4A85A',
    image.palette[2] ?? '#F2EDE4',
    image.palette[3] ?? '#6F8F86',
  ];
  const title = escapeXml(image.title.slice(0, 42));
  const concept = escapeXml(image.concept.slice(0, 90));
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c0}"/>
      <stop offset="55%" stop-color="${c3}"/>
      <stop offset="100%" stop-color="${c1}"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="720" fill="url(#bg)"/>
  <circle cx="980" cy="180" r="160" fill="${c1}" fill-opacity="0.35"/>
  <circle cx="240" cy="520" r="220" fill="${c2}" fill-opacity="0.18"/>
  <rect x="120" y="160" width="620" height="360" rx="28" fill="${c2}" fill-opacity="0.16" stroke="${c2}" stroke-opacity="0.45"/>
  <text x="150" y="230" fill="${c2}" font-size="34" font-family="Georgia, serif">${title}</text>
  <foreignObject x="150" y="260" width="560" height="220">
    <div xmlns="http://www.w3.org/1999/xhtml" style="color:${c2};font:22px/1.5 sans-serif;opacity:.9">${concept}</div>
  </foreignObject>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function ensureImagePreview(image: ImageDraft): ImageDraft {
  if (image.previewUrl) {
    return {
      ...image,
      previewSource: image.previewSource ?? 'openai',
    };
  }
  return {
    ...image,
    previewUrl: buildSvgPreview(image),
    previewSource: 'svg-fallback',
  };
}

export function withIds(deliverables: Deliverables): Deliverables {
  return {
    ...deliverables,
    todos: deliverables.todos.map((todo, index) => ({
      ...todo,
      id: todo.id || `todo-${index + 1}`,
      priority: (['high', 'medium', 'low'] as const).includes(todo.priority)
        ? todo.priority
        : 'medium',
    })),
    image: deliverables.image ? ensureImagePreview(deliverables.image) : null,
  };
}

export async function exportPresentationPptx(deck: SlideDraft, filename?: string) {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const pptx = new PptxGenJS();
  pptx.author = 'CABIN';
  pptx.title = deck.title;

  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: '1A3A32' };
  titleSlide.addText(deck.title, {
    x: 0.6,
    y: 2.1,
    w: 8.8,
    h: 1.2,
    fontSize: 32,
    color: 'F2EDE4',
    fontFace: 'Arial',
    bold: true,
  });
  titleSlide.addText(deck.subtitle || 'CABIN draft', {
    x: 0.6,
    y: 3.4,
    w: 8.8,
    h: 0.6,
    fontSize: 16,
    color: 'D4A85A',
    fontFace: 'Arial',
  });

  for (const slide of deck.slides) {
    const s = pptx.addSlide();
    s.background = { color: 'F7F4EC' };
    s.addText(slide.heading, {
      x: 0.5,
      y: 0.4,
      w: 9,
      h: 0.7,
      fontSize: 26,
      color: '1A3A32',
      fontFace: 'Arial',
      bold: true,
    });
    s.addText(
      slide.bullets.map((b) => ({ text: b, options: { breakLine: true } })),
      {
        x: 0.7,
        y: 1.3,
        w: 8.6,
        h: 4.2,
        fontSize: 16,
        color: '2C2A26',
        fontFace: 'Arial',
        bullet: true,
        paraSpaceAfter: 8,
      },
    );
  }

  await pptx.writeFile({ fileName: filename ?? `cabin-${Date.now()}.pptx` });
}
