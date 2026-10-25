import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { BarChart3, LogOut, PlusCircle, Search, ShieldCheck, Sparkles } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '../lib/supabase';

type PromptRow = {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  updated_at: string;
  main_prompt: string;
  published_at: string | null;
};

type ProfileRow = {
  role: string;
};

const supabase = getSupabaseClient();

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [prompts, setPrompts] = useState<PromptRow[]>([]);
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [mainPrompt, setMainPrompt] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [deploymentError, setDeploymentError] = useState('');

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const checkSession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!mounted) return;
      if (sessionError) setError(sessionError.message);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };
    void checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        setIsAdmin(false);
        setPrompts([]);
        setError('');
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !user) return;
    let mounted = true;

    const loadAdminData = async () => {
      setLoading(true);
      setError('');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (!mounted) return;
      if (profileError) {
        setError(`Unable to verify administrator access: ${profileError.message}`);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if ((profile as ProfileRow | null)?.role !== 'admin') {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      const { data, error: promptError } = await supabase
        .from('prompts')
        .select('id,title,slug,status,updated_at,main_prompt:prompt_text,published_at')
        .order('updated_at', { ascending: false });

      if (!mounted) return;
      if (promptError) setError(`Unable to load prompts: ${promptError.message}`);
      else setPrompts((data ?? []) as PromptRow[]);
      setLoading(false);
    };

    void loadAdminData();
    return () => {
      mounted = false;
    };
  }, [user]);

  const filteredPrompts = useMemo(
    () => prompts.filter((prompt) => `${prompt.title} ${prompt.slug}`.toLowerCase().includes(query.toLowerCase())),
    [prompts, query],
  );

  const counts = useMemo(
    () => ({
      published: prompts.filter((prompt) => prompt.status === 'published').length,
      drafts: prompts.filter((prompt) => prompt.status === 'draft').length,
      scheduled: prompts.filter((prompt) => prompt.status === 'scheduled').length,
    }),
    [prompts],
  );

  const signIn = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setError('');
    setSaving(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) setError(signInError.message);
    setSaving(false);
  };

  const createDraft = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !user) return;
    setError('');
    setNotice('');
    setSaving(true);
    const { data, error: insertError } = await supabase
      .from('prompts')
      .insert({
        title: title.trim(),
        slug: slugify(slug || title),
        excerpt: excerpt.trim() || null,
        prompt_text: mainPrompt.trim(),
        status: 'draft',
      })
      .select('id,title,slug,status,updated_at,main_prompt:prompt_text,published_at')
      .single();

    if (insertError) setError(`Draft was not saved: ${insertError.message}`);
    else {
      setPrompts((current) => [data as PromptRow, ...current]);
      setTitle('');
      setSlug('');
      setExcerpt('');
      setMainPrompt('');
      setNotice('Draft saved successfully.');
    }
    setSaving(false);
  };

  const publishPrompt = async (prompt: PromptRow) => {
    if (!supabase || !user) return;
    setError('');
    setNotice('');
    setDeploymentError('');
    setSaving(true);
    const { error: updateError } = await supabase
      .from('prompts')
      .update({
        status: 'published',
        published_at: prompt.published_at ?? new Date().toISOString(),
      })
      .eq('id', prompt.id);

    if (updateError) {
      setError(`Prompt was not published: ${updateError.message}`);
      setSaving(false);
      return;
    }

    const updated = { ...prompt, status: 'published' as const, published_at: prompt.published_at ?? new Date().toISOString() };
    setPrompts((current) => current.map((row) => row.id === prompt.id ? updated : row));
    const { error: invokeError } = await supabase.functions.invoke('publish-site');
    if (invokeError) {
      setDeploymentError(`Prompt is published in Supabase, but the static site rebuild could not be triggered: ${invokeError.message}`);
    } else {
      setNotice('Prompt published. The static site rebuild was requested.');
    }
    setSaving(false);
  };

  const retryDeployment = async () => {
    if (!supabase) return;
    setDeploymentError('');
    const { error: invokeError } = await supabase.functions.invoke('publish-site');
    if (invokeError) setDeploymentError(`Rebuild request failed: ${invokeError.message}`);
    else setNotice('Static site rebuild requested.');
  };

  const signOut = async () => {
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(`Unable to sign out: ${signOutError.message}`);
  };

  if (!supabase) {
    return (
      <div className="card-surface p-8">
        <p className="eyebrow">Admin setup required</p>
        <h1 className="mt-4 font-display text-3xl font-black text-[var(--text)]">Connect Supabase to sign in</h1>
        <p className="mt-3 text-[var(--muted)]">Set the public Supabase URL and anon key in the build environment. Administrative access is checked against the protected profiles table.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="card-surface p-8 text-[var(--muted)]" role="status">Checking your session and administrator access…</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-soft">
        <p className="eyebrow">Admin sign in</p>
        <h1 className="mt-4 font-display text-3xl font-black text-[var(--text)]">Welcome back</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Sign in with an administrator account. Registration is disabled.</p>
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</p>}
        <form onSubmit={signIn} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-[var(--text)]">Email
            <input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 outline-none focus:border-[var(--primary)]" />
          </label>
          <label className="block text-sm font-medium text-[var(--text)]">Password
            <input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2.5 outline-none focus:border-[var(--primary)]" />
          </label>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="card-surface p-8">
        <p className="eyebrow">Access denied</p>
        <h1 className="mt-4 font-display text-3xl font-black text-[var(--text)]">Administrator access required</h1>
        <p className="mt-3 text-[var(--muted)]">This account is signed in but does not have the administrator role.</p>
        {error && <p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}
        <button type="button" onClick={signOut} className="btn-secondary mt-6"><LogOut className="mr-2 h-4 w-4" /> Sign out</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Admin dashboard</p>
            <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-[var(--text)]">Editorial publishing dashboard</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">Signed in as {user.email}</p>
          </div>
          <button type="button" onClick={signOut} className="btn-secondary"><LogOut className="mr-2 h-4 w-4" /> Sign out</button>
        </div>
      </div>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}
      {notice && <p className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800" role="status">{notice}</p>}
      {deploymentError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="alert">
          <p>{deploymentError}</p>
          <button type="button" onClick={retryDeployment} className="mt-3 font-semibold underline">Retry site rebuild</button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Published prompts', value: counts.published, icon: Sparkles },
          { label: 'Draft prompts', value: counts.drafts, icon: PlusCircle },
          { label: 'Scheduled prompts', value: counts.scheduled, icon: ShieldCheck },
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

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={createDraft} className="card-surface space-y-4 p-6">
          <div>
            <p className="eyebrow">New content</p>
            <h2 className="mt-3 font-display text-2xl font-bold text-[var(--text)]">Create a prompt draft</h2>
          </div>
          <label className="block text-sm font-medium text-[var(--text)]">Title
            <input required maxLength={180} value={title} onChange={(event) => { setTitle(event.target.value); if (!slug) setSlug(slugify(event.target.value)); }} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--primary)]" />
          </label>
          <label className="block text-sm font-medium text-[var(--text)]">URL slug
            <input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={slug} onChange={(event) => setSlug(slugify(event.target.value))} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--primary)]" />
          </label>
          <label className="block text-sm font-medium text-[var(--text)]">Summary
            <textarea rows={2} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--primary)]" />
          </label>
          <label className="block text-sm font-medium text-[var(--text)]">Image prompt
            <textarea required rows={5} value={mainPrompt} onChange={(event) => setMainPrompt(event.target.value)} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:border-[var(--primary)]" />
          </label>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving…' : 'Save draft'}</button>
        </form>

        <div className="card-surface p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Content</p>
              <h2 className="mt-3 font-display text-2xl font-bold text-[var(--text)]">Prompts</h2>
            </div>
            <label className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
              <Search className="h-4 w-4 text-[var(--muted)]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search prompts" placeholder="Search prompts" className="w-48 bg-transparent text-sm outline-none" />
            </label>
          </div>
          <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--border)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--surface-alt)]">
                <tr>
                  <th className="px-4 py-3 font-semibold text-[var(--text)]">Title</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text)]">Status</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text)]">Updated</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text)]">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrompts.map((prompt) => (
                  <tr key={prompt.id} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3 text-[var(--text)]">
                      <span className="block font-medium">{prompt.title}</span>
                      <span className="text-xs text-[var(--muted)]">/{prompt.slug}</span>
                    </td>
                    <td className="px-4 py-3 capitalize text-[var(--muted)]">{prompt.status}</td>
                    <td className="px-4 py-3 text-[var(--muted)]">{new Date(prompt.updated_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {prompt.status !== 'published' && (
                        <button type="button" disabled={saving} onClick={() => publishPrompt(prompt)} className="font-semibold text-[var(--primary)] disabled:opacity-50">Publish</button>
                      )}
                      {prompt.status === 'published' && <span className="inline-flex items-center gap-1 text-xs text-[var(--success)]"><BarChart3 className="h-3 w-3" /> Published</span>}
                    </td>
                  </tr>
                ))}
                {filteredPrompts.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-[var(--muted)]">No prompts found. Create a draft to get started.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
