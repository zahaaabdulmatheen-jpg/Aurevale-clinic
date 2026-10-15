(function () {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
    });
  }
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();
  const pass = document.querySelector('#password');
  const passToggle = document.querySelector('#toggle-password');
  if (pass && passToggle) passToggle.addEventListener('click', function () { const show = pass.type === 'password'; pass.type = show ? 'text' : 'password'; passToggle.textContent = show ? 'Hide' : 'Show'; });

  const cfg = window.AUREVALE_CONFIG || {};
  const hasConfig = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey);
  const library = window.supabase;
  const form = document.querySelector('#login-form');
  const msg = document.querySelector('#form-message');
  const show = function (text, kind) { if (msg) { msg.textContent = text; msg.className = 'form-message show ' + kind; } };
  let client = null;
  if (hasConfig && library && typeof library.createClient === 'function') {
    client = library.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    show('Supabase browser configuration loaded. Sign-in also requires the profiles table and secure access policies.', 'notice');
  }
  if (form) form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!client) { show('Sign-in is not active. Add the separate Aurevale Supabase Project URL and publishable anon key to config.js first. No credentials have been sent.', 'notice'); return; }
    const email = document.querySelector('#email').value.trim();
    const password = document.querySelector('#password').value;
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true; submit.textContent = 'Signing in…';
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('The authentication service did not return a user.');
      const { data: profile, error: profileError } = await client.from('profiles').select('id,full_name,role,is_active').eq('id', data.user.id).maybeSingle();
      if (profileError) { await client.auth.signOut(); throw new Error('Sign-in worked, but the staff profile is not ready. Ask the administrator to configure profiles and access policies.'); }
      if (!profile || profile.is_active !== true || !['Administrator','Reception','Doctor'].includes(profile.role)) { await client.auth.signOut(); throw new Error('This account has no active Aurevale staff role. Ask the administrator to provision the account.'); }
      sessionStorage.setItem('aurevaleDisplayName', profile.full_name || data.user.email || 'Team member');
      sessionStorage.setItem('aurevaleRole', profile.role);
      window.location.href = 'dashboard.html';
    } catch (err) { show(err && err.message ? err.message : 'Sign-in failed. Check your details or contact the administrator.', 'error'); }
    finally { submit.disabled = false; submit.innerHTML = 'Continue securely <span>↗</span>'; }
  });

  const dashboardMessage = document.querySelector('#dashboard-message');
  const roleElement = document.querySelector('#staff-role');
  const nameElement = document.querySelector('#staff-name');
  const signout = document.querySelector('#signout-button');
  if (dashboardMessage || signout) {
    if (!client) {
      if (dashboardMessage) dashboardMessage.textContent = 'Setup pending: connect the new Aurevale Supabase project. This page does not contain patient records and cannot grant access on its own.';
      if (roleElement) roleElement.textContent = 'Preview only';
      if (signout) signout.addEventListener('click', function () { window.location.href = 'portal.html'; });
    } else {
      (async function () {
        try {
          const { data: { session }, error } = await client.auth.getSession();
          if (error || !session) { window.location.replace('portal.html'); return; }
          const { data: profile, error: pError } = await client.from('profiles').select('id,full_name,role,is_active').eq('id', session.user.id).maybeSingle();
          if (pError || !profile || profile.is_active !== true || !['Administrator','Reception','Doctor'].includes(profile.role)) { await client.auth.signOut(); window.location.replace('portal.html'); return; }
          if (nameElement) nameElement.textContent = (profile.full_name || 'team member') + '.';
          if (roleElement) roleElement.textContent = profile.role;
          if (dashboardMessage) dashboardMessage.textContent = 'Authenticated staff session verified. Clinical modules remain disabled until database policies and role-specific features are implemented and tested.';
        } catch (e) { if (dashboardMessage) dashboardMessage.textContent = 'Could not verify staff access. Please sign in again.'; }
      })();
      if (signout) signout.addEventListener('click', async function () { await client.auth.signOut(); sessionStorage.clear(); window.location.href = 'portal.html'; });
    }
  }
})();
