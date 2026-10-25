import { useMemo, useState } from 'react';
import { BarChart3, ImagePlus, ListFilter, PlusCircle, Search, ShieldCheck, Sparkles } from 'lucide-react';

const seedPrompts = [
  { title: 'Cinematic Sunset Portrait', status: 'Published', date: '2025-10-01' },
  { title: 'Anime Fantasy Character', status: 'Draft', date: '2025-09-26' },
  { title: 'Minimal Product Photography', status: 'Scheduled', date: '2025-09-18' },
];

export function AdminDashboard() {
  const [tab, setTab] = useState('Overview');
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');

  const filteredPrompts = useMemo(() => {
    return seedPrompts.filter((prompt) => prompt.title.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Admin dashboard</p>
            <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-[var(--text)]">Editorial publishing dashboard</h1>
          </div>
          <button type="button" className="btn-primary">
            <PlusCircle className="mr-2 h-4 w-4" /> Add a prompt
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Published prompts', value: '184', icon: Sparkles },
          { label: 'Draft prompts', value: '12', icon: ListFilter },
          { label: 'Scheduled', value: '6', icon: ImagePlus },
          { label: 'Deployment health', value: '99.9%', icon: ShieldCheck },
        ].map((item) => (
          <div key={item.label} className="card-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">{item.label}</span>
              <item.icon className="h-4 w-4 text-[var(--primary)]" />
            </div>
            <div className="mt-5 font-display text-3xl font-black text-[var(--text)]">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-soft">
        <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-4">
          {['Overview', 'Prompts', 'Categories', 'Media', 'Publishing'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-full px-3 py-2 text-sm font-medium ${tab === item ? 'bg-[var(--primary-soft)] text-[var(--primary)]' : 'text-[var(--muted)]'}`}
            >
              {item}
            </button>
          ))}
        </div>

        {tab === 'Overview' && (
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-bold text-[var(--text)]">Recent activity</h2>
                <BarChart3 className="h-4 w-4 text-[var(--muted)]" />
              </div>
              <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                {seedPrompts.map((prompt) => (
                  <div key={prompt.title} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                    <span className="font-medium text-[var(--text)]">{prompt.title}</span>
                    <span>{prompt.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-5">
              <h2 className="font-display text-2xl font-bold text-[var(--text)]">Quick create</h2>
              <div className="mt-4 space-y-3">
                <label className="block text-sm text-[var(--muted)]">
                  Prompt title
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--text)] outline-none focus:border-[var(--primary)]" placeholder="New prompt title" />
                </label>
                <button type="button" className="btn-primary w-full">Create draft</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'Prompts' && (
          <div className="mt-6">
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3">
              <Search className="h-4 w-4 text-[var(--muted)]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search prompt library" className="w-full border-0 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none" />
            </div>
            <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--surface-alt)]">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-[var(--text)]">Title</th>
                    <th className="px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                    <th className="px-4 py-3 font-semibold text-[var(--text)]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrompts.map((prompt) => (
                    <tr key={prompt.title} className="border-t border-[var(--border)]">
                      <td className="px-4 py-3 text-[var(--text)]">{prompt.title}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{prompt.status}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{prompt.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
