import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (request: Request) => {
  const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') ?? 'https://promptaveron.github.io';
  const origin = request.headers.get('Origin');
  const headers = {
    ...corsHeaders,
    'Access-Control-Allow-Origin': allowedOrigin,
    Vary: 'Origin',
  };

  if (origin && origin !== allowedOrigin) {
    return Response.json({ error: 'Origin is not allowed' }, { status: 403, headers });
  }

  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405, headers });
  }

  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return Response.json({ error: 'Authentication is required' }, { status: 401, headers });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const githubToken = Deno.env.get('GITHUB_TOKEN');
  const repository = Deno.env.get('GITHUB_REPOSITORY');
  const workflow = Deno.env.get('GITHUB_WORKFLOW') ?? 'deploy.yml';

  if (!supabaseUrl || !anonKey || !githubToken || !repository) {
    return Response.json({ error: 'Publishing trigger is not configured on the server' }, { status: 500, headers });
  }

  const token = authorization.slice('Bearer '.length);
  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userResult, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userResult.user) {
    return Response.json({ error: 'Invalid or expired session' }, { status: 401, headers });
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userResult.user.id)
    .maybeSingle();

  if (profileError) {
    return Response.json({ error: 'Unable to verify administrator permissions' }, { status: 500, headers });
  }
  if (profile?.role !== 'admin') {
    return Response.json({ error: 'Administrator access is required' }, { status: 403, headers });
  }

  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository) || !/^[A-Za-z0-9_.-]+$/.test(workflow)) {
    return Response.json({ error: 'Publishing target configuration is invalid' }, { status: 500, headers });
  }

  const response = await fetch(`https://api.github.com/repos/${repository}/actions/workflows/${workflow}/dispatches`, {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${githubToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ref: 'main' }),
  });

  if (!response.ok) {
    return Response.json({ error: `GitHub rejected the rebuild request (${response.status})` }, { status: 502, headers });
  }

  return Response.json({ accepted: true }, { status: 202, headers });
});
