import { useEffect, useMemo, useState, type ChangeEvent, type SyntheticEvent } from 'react';
import {
  Check,
  Clock3,
  FileText,
  ImagePlus,
  LayoutGrid,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '../lib/supabase';

type PromptStatus = 'draft' | 'published' | 'scheduled' | 'archived';

type PromptRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  prompt_text: string;
  negative_prompt: string | null;
  featured_image_url: string | null;
  image_alt: string | null;
  style: string | null;
  ai_model: string | null;
  aspect_ratio: string | string[] | null;
  seo_title: string | null;
  meta_description: string | null;
  category_id: string | null;
  tags: string[] | null;
  status: PromptStatus;
  is_featured: boolean;
  is_trending: boolean;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_path: string | null;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  is_active: boolean;
};

type PromptForm = {
  title: string;
  slug: string;
  excerpt: string;
  description: string;
  prompt_text: string;
  negative_prompt: string;
  featured_image_url: string;
  image_alt: string;
  style: string;
  ai_model: string;
  aspect_ratio: string;
  seo_title: string;
  meta_description: string;
  category_id: string;
  tags: string;
  status: PromptStatus;
  is_featured: boolean;
  is_trending: boolean;
  scheduled_at: string;
};

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  image_path: string;
  seo_title: string;
  seo_description: string;
  sort_order: string;
  is_active: boolean;
};

const supabase = getSupabaseClient();
const inputClass = 'mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15';
const labelClass = 'block text-sm font-medium text-[var(--text)]';
const blankPrompt: PromptForm = {
  title: '',
  slug: '',
  excerpt: '',
  description: '',
  prompt_text: '',
  negative_prompt: '',
  featured_image_url: '',
  image_alt: '',
  style: '',
  ai_model: '',
  aspect_ratio: '',
  seo_title: '',
  meta_description: '',
  category_id: '',
  tags: '',
  status: 'draft',
  is_featured: false,
  is_trending: false,
  scheduled_at: '',
};
const blankCategory: CategoryForm = {
  name: '',
  slug: '',
  description: '',
  image_path: '',
  seo_title: '',
  seo_description: '',
  sort_order: '0',
  is_active: true,
};

function slugify(value: string) {
  return value.toLowerCase().trim().normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function toAspectRatios(value: PromptRow['aspect_ratio']) {
  if (Array.isArray(value)) return value.join(', ');
  return value ?? '';
}

function getPromptForm(prompt?: PromptRow): PromptForm {
  if (!prompt) return blankPrompt;
  return {
    title: prompt.title,
    slug: prompt.slug,
    excerpt: prompt.excerpt ?? '',
    description: prompt.description ?? '',
    prompt_text: prompt.prompt_text,
    negative_prompt: prompt.negative_prompt ?? '',
    featured_image_url: prompt.featured_image_url ?? '',
    image_alt: prompt.image_alt ?? '',
    style: prompt.style ?? '',
    ai_model: prompt.ai_model ?? '',
    aspect_ratio: toAspectRatios(prompt.aspect_ratio),
    seo_title: prompt.seo_title ?? '',
    meta_description: prompt.meta_description ?? '',
    category_id: prompt.category_id ?? '',
    tags: (prompt.tags ?? []).join(', '),
    status: prompt.status,
    is_featured: prompt.is_featured,
    is_trending: prompt.is_trending,
    scheduled_at: prompt.scheduled_at ? new Date(prompt.scheduled_at).toISOString().slice(0, 16) : '',
  };
}

function getCategoryForm(category?: CategoryRow): CategoryForm {
  if (!category) return blankCategory;
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? '',
    image_path: category.image_path ?? '',
    seo_title: category.seo_title ?? '',
    seo_description: category.seo_description ?? '',
    sort_order: String(category.sort_order ?? 0),
    is_active: category.is_active,
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'An unexpected error occurred.';
}

export function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deploymentError, setDeploymentError] = useState('');
  const [prompts, setPrompts] = useState<PromptRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [extendedCmsReady, setExtendedCmsReady] = useState(false);
  const [section, setSection] = useState<'prompts' | 'categories'>('prompts');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PromptStatus>('all');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptRow | null>(null);
  const [promptForm, setPromptForm] = useState<PromptForm>(blankPrompt);
  const [categoryEditorOpen, setCategoryEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(blankCategory);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const reloadData = async () => {
    if (!supabase) return;
    const [promptResult, categoryResult, extendedSchemaResult] = await Promise.all([
      supabase.from('prompts')
        .select('id,title,slug,excerpt,description,prompt_text,negative_prompt,featured_image_url,image_alt,style,aspect_ratio,seo_title,category_id,tags,status,is_featured,published_at,created_at,updated_at')
        .order('updated_at', { ascending: false }),
      supabase.from('categories')
        .select('id,name,slug,description,image_path,seo_title,seo_description,sort_order,is_active')
        .order('sort_order', { ascending: true }),
      supabase.from('prompts').select('ai_model,meta_description,is_trending,scheduled_at,created_by,updated_by').limit(0),
    ]);
    if (promptResult.error) throw new Error(`Could not load prompts: ${promptResult.error.message}`);
    if (categoryResult.error) throw new Error(`Could not load categories: ${categoryResult.error.message}`);
    setExtendedCmsReady(!extendedSchemaResult.error);
    setPrompts((promptResult.data ?? []).map((row) => ({
      ...row,
      ai_model: null,
      meta_description: null,
      is_trending: false,
      scheduled_at: null,
    })) as PromptRow[]);
    setCategories((categoryResult.data ?? []) as CategoryRow[]);
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let mounted = true;
    const checkSession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!mounted) return;
      if (sessionError) setError(`Unable to restore your session: ${sessionError.message}`);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };
    void checkSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setIsAdmin(false);
      setPrompts([]);
      setCategories([]);
      setError('');
      setNotice('');
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
        .from('profiles').select('role').eq('id', user.id).maybeSingle();
      if (!mounted) return;
      if (profileError) {
        setError(`Unable to verify administrator access: ${profileError.message}`);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      if (profile?.role !== 'admin') {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);
      try {
        await reloadData();
      } catch (loadError) {
        if (mounted) setError(errorMessage(loadError));
      }
      if (mounted) setLoading(false);
    };
    void loadAdminData();
    return () => { mounted = false; };
  }, [user]);

  const filteredPrompts = useMemo(() => prompts.filter((prompt) => {
    const matchesQuery = `${prompt.title} ${prompt.slug} ${prompt.tags?.join(' ') ?? ''}`
      .toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (statusFilter === 'all' || prompt.status === statusFilter);
  }), [prompts, query, statusFilter]);

  const stats = useMemo(() => ({
    total: prompts.length,
    published: prompts.filter((prompt) => prompt.status === 'published').length,
    drafts: prompts.filter((prompt) => prompt.status === 'draft').length,
    categories: categories.length,
  }), [prompts, categories]);

  const signIn = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setError('');
    setSaving(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) setError(signInError.message);
    setSaving(false);
  };

  const signOut = async () => {
    if (!supabase) return;
    setError('');
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(`Unable to sign out: ${signOutError.message}`);
  };

  const openPromptEditor = (prompt?: PromptRow) => {
    setEditingPrompt(prompt ?? null);
    setPromptForm(getPromptForm(prompt));
    setEditorOpen(true);
    setError('');
    setNotice('');
  };

  const savePrompt = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !user) return;
    setError('');
    setNotice('');
    setDeploymentError('');
    setSaving(true);
    const now = new Date().toISOString();
    const payload = {
      title: promptForm.title.trim(),
      slug: slugify(promptForm.slug),
      excerpt: promptForm.excerpt.trim() || null,
      description: promptForm.description.trim() || null,
      prompt_text: promptForm.prompt_text.trim(),
      negative_prompt: promptForm.negative_prompt.trim() || null,
      featured_image_url: promptForm.featured_image_url.trim() || null,
      image_alt: promptForm.image_alt.trim() || null,
      style: promptForm.style.trim() || null,
      ai_model: promptForm.ai_model.trim() || null,
      aspect_ratio: promptForm.aspect_ratio.split(',').map((item) => item.trim()).filter(Boolean).join(', '),
      seo_title: promptForm.seo_title.trim() || null,
      ...(extendedCmsReady ? { meta_description: promptForm.meta_description.trim() || null } : {}),
      category_id: promptForm.category_id || null,
      tags: [...new Set(promptForm.tags.split(',').map((item) => item.trim()).filter(Boolean))],
      status: promptForm.status,
      is_featured: promptForm.is_featured,
      ...(extendedCmsReady ? {
        is_trending: promptForm.is_trending,
        scheduled_at: promptForm.status === 'scheduled' && promptForm.scheduled_at
          ? new Date(promptForm.scheduled_at).toISOString()
          : null,
        ai_model: promptForm.ai_model.trim() || null,
        updated_by: user.id,
        ...(editingPrompt ? {} : { created_by: user.id }),
      } : {}),
      published_at: promptForm.status === 'published'
        ? editingPrompt?.published_at ?? now
        : editingPrompt?.published_at ?? null,
      updated_at: now,
    };

    const result = editingPrompt
      ? await supabase.from('prompts').update(payload).eq('id', editingPrompt.id).select().single()
      : await supabase.from('prompts').insert(payload).select().single();

    if (result.error) {
      setError(`Prompt was not saved: ${result.error.message}`);
      setSaving(false);
      return;
    }
    const wasOrIsPublished = editingPrompt?.status === 'published' || payload.status === 'published';
    setEditorOpen(false);
    setNotice(editingPrompt ? 'Prompt changes saved.' : 'Prompt created.');
    try {
      await reloadData();
    } catch (loadError) {
      setError(errorMessage(loadError));
    }
    if (wasOrIsPublished) await triggerRebuild();
    setSaving(false);
  };

  const triggerRebuild = async () => {
    if (!supabase) return;
    const { error: invokeError } = await supabase.functions.invoke('publish-site');
    if (invokeError) {
      setDeploymentError(`Changes are saved in Supabase, but the site rebuild could not be triggered: ${invokeError.message}`);
    } else {
      setNotice('Changes saved. A static-site rebuild has been requested.');
    }
  };

  const changeStatus = async (prompt: PromptRow, status: PromptStatus) => {
    if (!supabase) return;
    if (status === 'scheduled' && !prompt.scheduled_at) {
      setError('Set a schedule date in the prompt editor before marking it scheduled.');
      openPromptEditor(prompt);
      return;
    }
    setError('');
    setNotice('');
    setDeploymentError('');
    setSaving(true);
    const patch = {
      status,
      published_at: status === 'published' ? prompt.published_at ?? new Date().toISOString() : prompt.published_at,
      updated_at: new Date().toISOString(),
    };
    const { error: updateError } = await supabase.from('prompts').update(patch).eq('id', prompt.id);
    if (updateError) {
      setError(`Prompt status was not changed: ${updateError.message}`);
    } else {
      setNotice(`“${prompt.title}” is now ${status}.`);
      try {
        await reloadData();
      } catch (loadError) {
        setError(errorMessage(loadError));
      }
      if (status === 'published' || prompt.status === 'published') await triggerRebuild();
    }
    setSaving(false);
  };

  const deletePrompt = async (prompt: PromptRow) => {
    if (!supabase || !window.confirm(`Permanently delete “${prompt.title}”? This cannot be undone.`)) return;
    setError('');
    setNotice('');
    setSaving(true);
    const { error: deleteError } = await supabase.from('prompts').delete().eq('id', prompt.id);
    if (deleteError) setError(`Prompt was not deleted: ${deleteError.message}`);
    else {
      setPrompts((current) => current.filter((row) => row.id !== prompt.id));
      setNotice(`“${prompt.title}” was deleted.`);
      if (prompt.status === 'published') await triggerRebuild();
    }
    setSaving(false);
  };

  const openCategoryEditor = (category?: CategoryRow) => {
    setEditingCategory(category ?? null);
    setCategoryForm(getCategoryForm(category));
    setCategoryEditorOpen(true);
    setError('');
    setNotice('');
  };

  const saveCategory = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setError('');
    setNotice('');
    setSaving(true);
    const payload = {
      name: categoryForm.name.trim(),
      slug: slugify(categoryForm.slug),
      description: categoryForm.description.trim() || null,
      image_path: categoryForm.image_path.trim() || null,
      seo_title: categoryForm.seo_title.trim() || null,
      seo_description: categoryForm.seo_description.trim() || null,
      sort_order: Number(categoryForm.sort_order) || 0,
      is_active: categoryForm.is_active,
      updated_at: new Date().toISOString(),
    };
    const result = editingCategory
      ? await supabase.from('categories').update(payload).eq('id', editingCategory.id)
      : await supabase.from('categories').insert(payload);
    if (result.error) setError(`Category was not saved: ${result.error.message}`);
    else {
      setCategoryEditorOpen(false);
      setNotice(editingCategory ? 'Category changes saved.' : 'Category created.');
      try { await reloadData(); } catch (loadError) { setError(errorMessage(loadError)); }
      await triggerRebuild();
    }
    setSaving(false);
  };

  const deleteCategory = async (category: CategoryRow) => {
    if (!supabase || !window.confirm(`Delete the “${category.name}” category? Prompts using it must be reassigned first.`)) return;
    setError('');
    setSaving(true);
    const { error: deleteError } = await supabase.from('categories').delete().eq('id', category.id);
    if (deleteError) setError(`Category was not deleted: ${deleteError.message}`);
    else {
      setCategories((current) => current.filter((row) => row.id !== category.id));
      setNotice(`“${category.name}” was deleted.`);
      await triggerRebuild();
    }
    setSaving(false);
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>, onUploaded: (url: string) => void) => {
    if (!supabase || !user) return;
    if (!extendedCmsReady) {
      setError('Apply supabase/migrations/002_cms_features.sql to enable image uploads.');
      event.target.value = '';
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Images must be smaller than 8 MB.');
      return;
    }
    setError('');
    setNotice('');
    setSaving(true);
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, '-');
    const path = `${user.id}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from('prompt-images').upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) {
      setError(`Image upload failed: ${uploadError.message}. Apply the CMS storage migration and try again.`);
    } else {
      const { data } = supabase.storage.from('prompt-images').getPublicUrl(path);
      onUploaded(data.publicUrl);
      setNotice('Image uploaded.');
    }
    setSaving(false);
    event.target.value = '';
  };

  const retryDeployment = async () => {
    setDeploymentError('');
    setSaving(true);
    await triggerRebuild();
    setSaving(false);
  };

  if (!supabase) {
    return <SetupCard title="Connect Supabase to open the CMS" description="Set the public Supabase URL and anon key in the build environment. Administrator access is verified against the profiles table." />;
  }

  if (loading) return <div className="card-surface p-8 text-[var(--muted)]" role="status">Loading your workspace…</div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-md rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-soft">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]"><ShieldCheck className="h-6 w-6" /></div>
        <p className="eyebrow mt-5">PromptAveron CMS</p>
        <h1 className="mt-4 font-display text-3xl font-black text-[var(--text)]">Welcome back</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Sign in with your administrator account to manage prompts and categories.</p>
        {error && <Alert tone="error">{error}</Alert>}
        <form onSubmit={signIn} className="mt-6 space-y-4">
          <label className={labelClass}>Email<input required type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} /></label>
          <label className={labelClass}>Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} /></label>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Signing in…' : 'Sign in to CMS'}</button>
        </form>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="card-surface p-8">
        <p className="eyebrow">Access restricted</p>
        <h1 className="mt-4 font-display text-3xl font-black text-[var(--text)]">Administrator access required</h1>
        <p className="mt-3 text-[var(--muted)]">The signed-in account does not have the administrator role in Supabase.</p>
        {error && <Alert tone="error">{error}</Alert>}
        <button type="button" onClick={signOut} className="btn-secondary mt-6"><LogOut className="mr-2 h-4 w-4" /> Sign out</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--surface)] shadow-soft">
        <div className="flex flex-col gap-5 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow"><Sparkles className="h-3.5 w-3.5" /> Editorial workspace</p>
            <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-[var(--text)] sm:text-4xl">PromptAveron CMS</h1>
            <p className="mt-2 text-sm text-[var(--muted)]">Manage your prompt library and publishing workflow.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 hidden text-sm text-[var(--muted)] sm:inline">{user.email}</span>
            <button type="button" onClick={() => { setLoading(true); void reloadData().catch((err) => setError(errorMessage(err))).finally(() => setLoading(false)); }} className="btn-secondary" aria-label="Refresh content"><RefreshCw className="mr-2 h-4 w-4" /> Refresh</button>
            <button type="button" onClick={signOut} className="btn-secondary" aria-label="Sign out"><LogOut className="mr-2 h-4 w-4" /> Sign out</button>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-[var(--border)] bg-[var(--surface-alt)] sm:grid-cols-4">
          <Stat label="All prompts" value={stats.total} icon={FileText} />
          <Stat label="Published" value={stats.published} icon={Send} />
          <Stat label="Drafts" value={stats.drafts} icon={Pencil} />
          <Stat label="Categories" value={stats.categories} icon={Tag} />
        </div>
      </header>

      {error && <Alert tone="error">{error}</Alert>}
      {notice && <Alert tone="success">{notice}</Alert>}
      {deploymentError && <Alert tone="warning">{deploymentError}<button type="button" onClick={retryDeployment} disabled={saving} className="ml-2 font-semibold underline">Retry rebuild</button></Alert>}
      {!extendedCmsReady && <Alert tone="warning">Your database is missing the CMS migration. Apply <code>002_cms_features.sql</code> to enable complete admin permissions, image uploads, advanced prompt metadata, and scheduling fields.</Alert>}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1" aria-label="CMS sections">
          <button type="button" onClick={() => setSection('prompts')} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${section === 'prompts' ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}><FileText className="h-4 w-4" /> Prompts</button>
          <button type="button" onClick={() => setSection('categories')} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${section === 'categories' ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}><LayoutGrid className="h-4 w-4" /> Categories</button>
        </nav>
        {section === 'prompts'
          ? <button type="button" onClick={() => openPromptEditor()} className="btn-primary"><Plus className="mr-2 h-4 w-4" /> New prompt</button>
          : <button type="button" onClick={() => openCategoryEditor()} className="btn-primary"><Plus className="mr-2 h-4 w-4" /> New category</button>}
      </div>

      {section === 'prompts' ? (
        <section className="card-surface overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-[var(--border)] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="font-display text-xl font-bold text-[var(--text)]">Prompt library</h2><p className="mt-1 text-sm text-[var(--muted)]">{filteredPrompts.length} of {prompts.length} entries</p></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2"><Search className="h-4 w-4 text-[var(--muted)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search prompts" placeholder="Search prompts or tags" className="w-full bg-transparent text-sm outline-none sm:w-52" /></label>
              <label className="sr-only" htmlFor="status-filter">Filter status</label>
              <select id="status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | PromptStatus)} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--primary)]">
                <option value="all">All statuses</option><option value="draft">Drafts</option><option value="published">Published</option><option value="scheduled">Scheduled</option><option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {filteredPrompts.map((prompt) => {
              const category = categories.find((item) => item.id === prompt.category_id)?.name;
              return (
                <article key={prompt.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-alt)]">
                    {prompt.featured_image_url ? <img src={prompt.featured_image_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[var(--muted)]"><ImagePlus className="h-5 w-5" /></div>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-[var(--text)]">{prompt.title}</h3>
                      <StatusBadge status={prompt.status} />
                      {prompt.is_featured && <span className="rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)]">Featured</span>}
                    </div>
                    <p className="mt-1 truncate text-xs text-[var(--muted)]">/{prompt.slug}{category ? ` · ${category}` : ''}</p>
                    <p className="mt-1 line-clamp-1 text-sm text-[var(--muted)]">{prompt.excerpt || prompt.prompt_text}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="hidden text-xs text-[var(--muted)] md:inline">{new Date(prompt.updated_at).toLocaleDateString()}</span>
                    <button type="button" onClick={() => openPromptEditor(prompt)} className="btn-secondary !px-3 !py-2" aria-label={`Edit ${prompt.title}`}><Pencil className="h-4 w-4" /><span className="ml-2">Edit</span></button>
                    <select aria-label={`Change ${prompt.title} status`} value={prompt.status} disabled={saving} onChange={(event) => void changeStatus(prompt, event.target.value as PromptStatus)} className="max-w-32 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-xs text-[var(--text)]">
                      <option value="draft">Draft</option><option value="published">Published</option>{extendedCmsReady && <><option value="scheduled">Scheduled</option><option value="archived">Archived</option></>}
                    </select>
                    <button type="button" onClick={() => void deletePrompt(prompt)} disabled={saving} className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--muted)] transition hover:border-red-300 hover:text-red-600" aria-label={`Delete ${prompt.title}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </article>
              );
            })}
            {filteredPrompts.length === 0 && <div className="px-6 py-16 text-center"><FileText className="mx-auto h-8 w-8 text-[var(--muted)]" /><h3 className="mt-3 font-semibold text-[var(--text)]">{prompts.length ? 'No matching prompts' : 'Your CMS is ready for its first prompt'}</h3><p className="mt-1 text-sm text-[var(--muted)]">{prompts.length ? 'Try another search or status filter.' : 'Create a draft and publish it when you are ready.'}</p>{!prompts.length && <button type="button" onClick={() => openPromptEditor()} className="btn-primary mt-5"><Plus className="mr-2 h-4 w-4" /> Create prompt</button>}</div>}
          </div>
        </section>
      ) : (
        <section className="card-surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--border)] p-5"><div><h2 className="font-display text-xl font-bold text-[var(--text)]">Categories</h2><p className="mt-1 text-sm text-[var(--muted)]">Organize prompts and manage category metadata.</p></div><span className="eyebrow">{categories.length} total</span></div>
          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <article key={category.id} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
                {category.image_path ? <img src={category.image_path} alt="" className="h-36 w-full object-cover" /> : <div className="flex h-36 items-center justify-center bg-[var(--surface-alt)] text-[var(--muted)]"><LayoutGrid className="h-8 w-8" /></div>}
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-[var(--text)]">{category.name}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${category.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-[var(--surface-alt)] text-[var(--muted)]'}`}>{category.is_active ? 'Active' : 'Hidden'}</span></div>
                  <p className="mt-1 text-xs text-[var(--muted)]">/{category.slug} · {prompts.filter((item) => item.category_id === category.id).length} prompts</p>
                  <p className="mt-2 line-clamp-2 min-h-10 text-sm text-[var(--muted)]">{category.description || 'No description yet.'}</p>
                  <div className="mt-4 flex gap-2"><button type="button" onClick={() => openCategoryEditor(category)} className="btn-secondary flex-1 !py-2"><Pencil className="mr-2 h-4 w-4" /> Edit</button><button type="button" onClick={() => void deleteCategory(category)} disabled={saving} className="rounded-xl border border-[var(--border)] px-3 text-[var(--muted)] hover:border-red-300 hover:text-red-600" aria-label={`Delete ${category.name}`}><Trash2 className="h-4 w-4" /></button></div>
                </div>
              </article>
            ))}
            {categories.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--muted)]">No categories yet. Create one to organize your library.</div>}
          </div>
        </section>
      )}

      {editorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setEditorOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="prompt-editor-title" className="mx-auto my-2 max-w-5xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl sm:my-6">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4 sm:px-7">
              <div><p className="eyebrow">{editingPrompt ? 'Edit content' : 'Create content'}</p><h2 id="prompt-editor-title" className="mt-2 font-display text-2xl font-bold text-[var(--text)]">{editingPrompt ? 'Edit prompt' : 'New prompt'}</h2></div>
              <button type="button" onClick={() => setEditorOpen(false)} disabled={saving} aria-label="Close editor" className="rounded-xl p-2 text-[var(--muted)] hover:bg-[var(--surface-alt)]"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={savePrompt} className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_300px]">
              <div className="space-y-6">
                <EditorSection title="Content" description="Write a clear title and useful editorial context.">
                  <label className={labelClass}>Title<input required maxLength={180} value={promptForm.title} onChange={(event) => setPromptForm((f) => ({ ...f, title: event.target.value, slug: f.slug || slugify(event.target.value) }))} className={inputClass} placeholder="e.g. Cinematic sunset portrait" /></label>
                  <label className={labelClass}>URL slug<div className="mt-1.5 flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"><span className="text-sm text-[var(--muted)]">/prompts/</span><input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={promptForm.slug} onChange={(event) => setPromptForm((f) => ({ ...f, slug: slugify(event.target.value) }))} className="w-full bg-transparent py-2.5 text-sm outline-none" /></div></label>
                  <label className={labelClass}>Short summary<textarea maxLength={300} rows={2} value={promptForm.excerpt} onChange={(event) => setPromptForm((f) => ({ ...f, excerpt: event.target.value }))} className={inputClass} placeholder="A concise description shown in search and prompt cards." /><span className="mt-1 block text-right text-xs text-[var(--muted)]">{promptForm.excerpt.length}/300</span></label>
                  <label className={labelClass}>Full description<textarea rows={4} value={promptForm.description} onChange={(event) => setPromptForm((f) => ({ ...f, description: event.target.value }))} className={inputClass} placeholder="Explain the visual approach, intended use, and what makes this prompt useful." /></label>
                </EditorSection>
                <EditorSection title="Prompt text" description="The prompt and optional negative prompt shown on the detail page.">
                  <label className={labelClass}>Main prompt<textarea required rows={7} value={promptForm.prompt_text} onChange={(event) => setPromptForm((f) => ({ ...f, prompt_text: event.target.value }))} className={`${inputClass} font-mono leading-6`} placeholder="Write the complete image-generation prompt…" /></label>
                  <label className={labelClass}>Negative prompt<textarea rows={3} value={promptForm.negative_prompt} onChange={(event) => setPromptForm((f) => ({ ...f, negative_prompt: event.target.value }))} className={`${inputClass} font-mono leading-6`} placeholder="Optional exclusions or negative prompt." /></label>
                </EditorSection>
                <EditorSection title="Cover image" description="Upload an image or paste an existing public image URL.">
                  {promptForm.featured_image_url && <img src={promptForm.featured_image_url} alt="Prompt cover preview" className="max-h-64 w-full rounded-xl border border-[var(--border)] object-cover" />}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <label className={`btn-secondary ${extendedCmsReady ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}><Upload className="mr-2 h-4 w-4" /> Upload image<input type="file" accept="image/*" className="sr-only" disabled={saving || !extendedCmsReady} onChange={(event) => void uploadImage(event, (url) => setPromptForm((f) => ({ ...f, featured_image_url: url })))} /></label>
                    <span className="self-center text-xs text-[var(--muted)]">JPG, PNG, WebP up to 8 MB</span>
                  </div>
                  <label className={labelClass}>Image URL<input type="url" value={promptForm.featured_image_url} onChange={(event) => setPromptForm((f) => ({ ...f, featured_image_url: event.target.value }))} className={inputClass} placeholder="https://…" /></label>
                  <label className={labelClass}>Image alt text<input value={promptForm.image_alt} onChange={(event) => setPromptForm((f) => ({ ...f, image_alt: event.target.value }))} className={inputClass} placeholder="Describe the image for accessibility." /></label>
                </EditorSection>
                <EditorSection title="Search appearance" description="Optional metadata for search engines and social sharing.">
                  <label className={labelClass}>SEO title<input maxLength={70} value={promptForm.seo_title} onChange={(event) => setPromptForm((f) => ({ ...f, seo_title: event.target.value }))} className={inputClass} placeholder="Defaults to the prompt title." /><span className="mt-1 block text-right text-xs text-[var(--muted)]">{promptForm.seo_title.length}/70</span></label>
                  <label className={labelClass}>Meta description<textarea disabled={!extendedCmsReady} rows={3} maxLength={160} value={promptForm.meta_description} onChange={(event) => setPromptForm((f) => ({ ...f, meta_description: event.target.value }))} className={inputClass} placeholder={extendedCmsReady ? 'Defaults to the short summary.' : 'Apply CMS migration to enable'} /><span className="mt-1 block text-right text-xs text-[var(--muted)]">{promptForm.meta_description.length}/160</span></label>
                </EditorSection>
              </div>

              <aside className="space-y-5">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                  <h3 className="flex items-center gap-2 font-semibold text-[var(--text)]"><Settings2 className="h-4 w-4" /> Publishing</h3>
                  <label className={`${labelClass} mt-4`}>Status<select value={promptForm.status} onChange={(event) => setPromptForm((f) => ({ ...f, status: event.target.value as PromptStatus }))} className={inputClass}><option value="draft">Draft</option><option value="published">Published</option>{extendedCmsReady && <><option value="scheduled">Scheduled</option><option value="archived">Archived</option></>}</select></label>
                  {promptForm.status === 'scheduled' && extendedCmsReady && <label className={`${labelClass} mt-4`}>Publish date<input required type="datetime-local" value={promptForm.scheduled_at} onChange={(event) => setPromptForm((f) => ({ ...f, scheduled_at: event.target.value }))} className={inputClass} /><span className="mt-1 block text-xs text-[var(--muted)]">The content will be marked scheduled. A site rebuild is still required to publish it.</span></label>}
                  <label className="mt-4 flex items-center gap-3 rounded-xl bg-[var(--surface-alt)] p-3 text-sm font-medium text-[var(--text)]"><input type="checkbox" checked={promptForm.is_featured} onChange={(event) => setPromptForm((f) => ({ ...f, is_featured: event.target.checked }))} className="h-4 w-4 accent-[var(--primary)]" /> Feature on homepage</label>
                  <label className="mt-3 flex items-center gap-3 rounded-xl bg-[var(--surface-alt)] p-3 text-sm font-medium text-[var(--text)]"><input type="checkbox" disabled={!extendedCmsReady} checked={promptForm.is_trending} onChange={(event) => setPromptForm((f) => ({ ...f, is_trending: event.target.checked }))} className="h-4 w-4 accent-[var(--primary)]" /> Mark as trending</label>
                  <div className="mt-5 grid gap-2"><button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving…' : <><Check className="mr-2 h-4 w-4" /> Save prompt</>}</button><button type="button" disabled={saving} onClick={() => setEditorOpen(false)} className="btn-secondary w-full">Cancel</button></div>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                  <h3 className="flex items-center gap-2 font-semibold text-[var(--text)]"><Tag className="h-4 w-4" /> Organization</h3>
                  <label className={`${labelClass} mt-4`}>Category<select value={promptForm.category_id} onChange={(event) => setPromptForm((f) => ({ ...f, category_id: event.target.value }))} className={inputClass}><option value="">Uncategorized</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}{category.is_active ? '' : ' (hidden)'}</option>)}</select></label>
                  <label className={`${labelClass} mt-4`}>Tags<input value={promptForm.tags} onChange={(event) => setPromptForm((f) => ({ ...f, tags: event.target.value }))} className={inputClass} placeholder="portrait, cinematic, editorial" /><span className="mt-1 block text-xs text-[var(--muted)]">Separate tags with commas.</span></label>
                  <label className={`${labelClass} mt-4`}>Style<input value={promptForm.style} onChange={(event) => setPromptForm((f) => ({ ...f, style: event.target.value }))} className={inputClass} placeholder="e.g. Cinematic" /></label>
                  <label className={`${labelClass} mt-4`}>AI model<input disabled={!extendedCmsReady} value={promptForm.ai_model} onChange={(event) => setPromptForm((f) => ({ ...f, ai_model: event.target.value }))} className={inputClass} placeholder={extendedCmsReady ? 'e.g. Midjourney' : 'Apply CMS migration to enable'} /></label>
                  <label className={`${labelClass} mt-4`}>Aspect ratios<input value={promptForm.aspect_ratio} onChange={(event) => setPromptForm((f) => ({ ...f, aspect_ratio: event.target.value }))} className={inputClass} placeholder="1:1, 4:5, 9:16" /></label>
                </div>
              </aside>
            </form>
          </section>
        </div>
      )}

      {categoryEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setCategoryEditorOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="category-editor-title" className="mx-auto my-8 max-w-2xl rounded-3xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6 py-5"><div><p className="eyebrow">Library organization</p><h2 id="category-editor-title" className="mt-2 font-display text-2xl font-bold text-[var(--text)]">{editingCategory ? 'Edit category' : 'New category'}</h2></div><button type="button" onClick={() => setCategoryEditorOpen(false)} aria-label="Close category editor" className="rounded-xl p-2 text-[var(--muted)] hover:bg-[var(--surface-alt)]"><X className="h-5 w-5" /></button></div>
            <form onSubmit={saveCategory} className="space-y-4 p-6">
              <label className={labelClass}>Name<input required maxLength={100} value={categoryForm.name} onChange={(event) => setCategoryForm((f) => ({ ...f, name: event.target.value, slug: f.slug || slugify(event.target.value) }))} className={inputClass} /></label>
              <label className={labelClass}>URL slug<input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={categoryForm.slug} onChange={(event) => setCategoryForm((f) => ({ ...f, slug: slugify(event.target.value) }))} className={inputClass} /></label>
              <label className={labelClass}>Description<textarea rows={3} value={categoryForm.description} onChange={(event) => setCategoryForm((f) => ({ ...f, description: event.target.value }))} className={inputClass} /></label>
              {categoryForm.image_path && <img src={categoryForm.image_path} alt="Category cover preview" className="max-h-48 w-full rounded-xl object-cover" />}
              <div className="flex flex-wrap gap-3"><label className="btn-secondary cursor-pointer"><Upload className="mr-2 h-4 w-4" /> Upload cover<input type="file" accept="image/*" className="sr-only" disabled={saving} onChange={(event) => void uploadImage(event, (url) => setCategoryForm((f) => ({ ...f, image_path: url })))} /></label><span className="self-center text-xs text-[var(--muted)]">or paste a URL below</span></div>
              <label className={labelClass}>Cover image URL<input type="url" value={categoryForm.image_path} onChange={(event) => setCategoryForm((f) => ({ ...f, image_path: event.target.value }))} className={inputClass} /></label>
              <div className="grid gap-4 sm:grid-cols-2"><label className={labelClass}>SEO title<input maxLength={70} value={categoryForm.seo_title} onChange={(event) => setCategoryForm((f) => ({ ...f, seo_title: event.target.value }))} className={inputClass} /></label><label className={labelClass}>Sort order<input type="number" value={categoryForm.sort_order} onChange={(event) => setCategoryForm((f) => ({ ...f, sort_order: event.target.value }))} className={inputClass} /></label></div>
              <label className={labelClass}>SEO description<textarea rows={2} maxLength={160} value={categoryForm.seo_description} onChange={(event) => setCategoryForm((f) => ({ ...f, seo_description: event.target.value }))} className={inputClass} /></label>
              <label className="flex items-center gap-3 text-sm font-medium text-[var(--text)]"><input type="checkbox" checked={categoryForm.is_active} onChange={(event) => setCategoryForm((f) => ({ ...f, is_active: event.target.checked }))} className="h-4 w-4 accent-[var(--primary)]" /> Active in the library</label>
              <div className="flex justify-end gap-3 border-t border-[var(--border)] pt-4"><button type="button" onClick={() => setCategoryEditorOpen(false)} className="btn-secondary">Cancel</button><button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save category'}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function SetupCard({ title, description }: { title: string; description: string }) {
  return <div className="card-surface p-8"><p className="eyebrow">CMS setup required</p><h1 className="mt-4 font-display text-3xl font-black text-[var(--text)]">{title}</h1><p className="mt-3 text-[var(--muted)]">{description}</p></div>;
}

function Alert({ tone, children }: { tone: 'error' | 'success' | 'warning'; children: ReactNode }) {
  const classes = tone === 'error' ? 'border-red-200 bg-red-50 text-red-800' : tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900';
  return <div className={`rounded-xl border p-4 text-sm ${classes}`} role={tone === 'error' ? 'alert' : 'status'}>{children}</div>;
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: typeof FileText }) {
  return <div className="border-r border-[var(--border)] p-4 last:border-r-0 sm:px-6"><div className="flex items-center gap-2 text-xs font-medium text-[var(--muted)]"><Icon className="h-4 w-4 text-[var(--primary)]" />{label}</div><p className="mt-2 font-display text-2xl font-black text-[var(--text)]">{value}</p></div>;
}

function StatusBadge({ status }: { status: PromptStatus }) {
  const className = status === 'published' ? 'bg-emerald-50 text-emerald-700' : status === 'scheduled' ? 'bg-blue-50 text-blue-700' : status === 'archived' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700';
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${className}`}>{status === 'scheduled' ? <Clock3 className="h-3 w-3" /> : null}{status}</span>;
}

function EditorSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><div><h3 className="font-display text-lg font-bold text-[var(--text)]">{title}</h3><p className="mt-1 text-xs text-[var(--muted)]">{description}</p></div>{children}</section>;
}
