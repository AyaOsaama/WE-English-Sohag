import { Fragment } from 'react';

// Tiny, safe renderer for lesson content / AI replies: ## headings, - bullets, 1. lists, **bold**, *italic*.
// Builds React elements only (never injects raw HTML).
function inline(text, keyBase = '') {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={keyBase + i}>{p.slice(2, -2)}</strong>;
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={keyBase + i}>{p.slice(1, -1)}</em>;
    return <Fragment key={keyBase + i}>{p}</Fragment>;
  });
}

export default function Markdown({ text = '', className = '' }) {
  const lines = text.split('\n');
  const blocks = [];
  let list = null;
  const flush = () => { if (list) { blocks.push(list); list = null; } };

  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (!line.trim()) { flush(); return; }
    if (line.startsWith('## ')) { flush(); blocks.push({ type: 'h', text: line.slice(3), key: i }); return; }
    const bullet = line.match(/^\s*[-•]\s+(.*)/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)/);
    if (bullet || numbered) {
      const kind = bullet ? 'ul' : 'ol';
      if (!list || list.type !== kind) { flush(); list = { type: kind, items: [], key: i }; }
      list.items.push((bullet || numbered)[1]);
      return;
    }
    flush();
    blocks.push({ type: 'p', text: line, key: i });
  });
  flush();

  return (
    <div className={`space-y-3 ${className}`} dir="auto">
      {blocks.map((b) => {
        if (b.type === 'h') return <h3 key={b.key} className="text-base font-bold text-we-900 pt-2">{inline(b.text)}</h3>;
        if (b.type === 'ul') return <ul key={b.key} className="list-disc pl-5 space-y-1">{b.items.map((t, i) => <li key={i}>{inline(t)}</li>)}</ul>;
        if (b.type === 'ol') return <ol key={b.key} className="list-decimal pl-5 space-y-1">{b.items.map((t, i) => <li key={i}>{inline(t)}</li>)}</ol>;
        return <p key={b.key}>{inline(b.text)}</p>;
      })}
    </div>
  );
}
