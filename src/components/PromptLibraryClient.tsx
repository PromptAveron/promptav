import { useMemo, useState } from 'react';
import type { PromptRecord } from '../lib/site';

const filters = ['All', 'Portraits', 'Photography', 'Anime', 'Fantasy', 'Product', 'Editorial'];

export function PromptLibraryClient({ prompts }: { prompts: PromptRecord[] }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('All');

  const visible = useMemo(() => {
    const lower = query.toLowerCase();
    return prompts.filter((prompt) => {
      const matchesCategory = active === 'All' || prompt.category.toLowerCase().includes(active.toLowerCase()) || prompt.tags.some((tag) => tag.toLowerCase().includes(active.toLowerCase()));
      const matchesText = !lower || `${prompt.title} ${prompt.excerpt} ${prompt.mainPrompt} ${prompt.category} ${prompt.tags.join(' ')} ${prompt.aiModel} ${prompt.style}`.toLowerCase().includes(lower);
      return matchesCategory && matchesText;
    });
  }, [active, prompts, query]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Prompt library</p>
          <h1 className="mt-3 font-display text-4xl font-black tracking-tight text-[var(--text)]">Discover the full prompt library</h1>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-soft">
          <svg className="h-5 w-5 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" /></svg>
          <input
            aria-label="Search prompt library"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search prompts, styles, subjects, or tools"
            className="w-72 max-w-full border-0 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none"
          />
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2 text-sm">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActive(filter)}
            className={`rounded-full border px-3 py-2 font-medium ${active === filter ? 'border-[var(--primary)] bg-[var(--primary-soft)] text-[var(--primary)]' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]'}`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mb-6 text-sm text-[var(--muted)]">{visible.length} results</div>

      {visible.length === 0 ? (
        <div className="card-surface p-10 text-center">
          <h2 className="font-display text-2xl font-bold text-[var(--text)]">No prompts match your filters.</h2>
          <p className="mt-3 text-[var(--muted)]">Try a broader search or reset the selected category.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((prompt) => (
            <article key={prompt.id} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-soft">
              <img src={prompt.imageUrl} alt={prompt.imageAlt || prompt.title} className="h-60 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)]">
                  <span>{prompt.category}</span>
                  <span>{prompt.aiModel}</span>
                </div>
                <h2 className="mt-3 font-display text-2xl font-bold text-[var(--text)]">{prompt.title}</h2>
                <p className="mt-2 text-sm text-[var(--muted)]">{prompt.excerpt}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-[var(--muted)]">{new Date(prompt.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <a href={`/prompts/${prompt.slug}`} className="btn-secondary">View prompt</a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
