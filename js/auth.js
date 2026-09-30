// ── Bejelentkezés ──
async function cloudCheckSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  updateAuthUI(session);
  return session;
}
// A Profil-gombon (a topbar jobb szélén) nincs hely egy teljes email címnek — helyette
// a felhasználó "monogramját" mutatjuk (pl. "dobos.brigitta@..." → "DB"), a teljes
// email cím pedig a Profil-menü tetején, kiírva jelenik meg.
function getUserInitials(email) {
  if (!email) return '👤';
  const local = email.split('@')[0];
  const parts = local.split(/[.\-_+0-9]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return '👤';
}
function updateAuthUI(session) {
  const gate = document.getElementById('auth-gate');
  const emailSpan = document.getElementById('profile-menu-email');
  const profileBtn = document.getElementById('btn-profile');
  // Az induláskor (még a bejelentkezés eldőlte előtt) lefutó showHomeView() a Projekt-listát
  // hitelesítés nélkül próbálja lekérni — ez üresen/hibásan tér vissza, mert a Supabase még
  // nem tudja, ki vagyunk. Ha ilyenkor épp most (ebben a hívásban) válik érvényessé a
  // munkamenet — vagyis a belépő ablak eddig látszott, most tűnik el —, a Kezdőlapon lévő
  // Projekt-listát újra le kell kérni és ki kell rajzolni, különben üresen maradna addig,
  // amíg valaki rá nem kattint a 🏠 gombra.
  const wasGateVisible = gate && !gate.classList.contains('hidden');
  if (session && session.user) {
    gate.classList.add('hidden');
    state.isAuthed = true;
    const email = session.user.email || '';
    if (emailSpan) emailSpan.textContent = email;
    if (profileBtn) profileBtn.textContent = getUserInitials(email);
    // Induláskor (state.booting) a navigációról az app.js initApp() dönt.
    if (!state.booting && wasGateVisible) onLoggedIn();
  } else {
    gate.classList.remove('hidden');
    state.isAuthed = false;
    if (emailSpan) emailSpan.textContent = '';
    if (profileBtn) profileBtn.textContent = '👤';
  }
}
// Bejelentkezés utáni navigáció: megosztott link → az; félbehagyott felhő
// Dokumentum → újranyitás a felhőből; egyébként a Kezdőlap (ha épp azon állunk).
function onLoggedIn() {
  const shared = parseSharedViewHash();
  if (shared) { openSharedView(shared.projectId, shared.docId); return; }
  const resume = state.pendingCloudResume;
  if (resume) {
    state.pendingCloudResume = null;
    cloudLoadProject(resume.cloudFolder, resume.topProjectId, resume.docId);
    return;
  }
  showHomeView();
}
supabaseClient.auth.onAuthStateChange((_event, session) => updateAuthUI(session));

// ── Megosztható Dokumentum-link (#view/{projektId}/{dokumentumId}) ──
// Csak bejelentkezett felhasználónak nyílik meg — lásd updateAuthUI, ahol a
// bejelentkezés-utáni átirányítás a Kezdőlap helyett ide vezet, ha a hash ilyen
// linket tartalmaz. A megnyitott tartalom mindig a dokumentum AKTUÁLIS állapota
// (megnyitáskor állítjuk össze a felhőben lévő fejezetekből) — nem kell semmit generálni.
function parseSharedViewHash() {
  const h = location.hash || '';
  const m = h.match(/^#view\/([^/]+)\/([^/]+)$/);
  if (!m) return null;
  return { projectId: decodeURIComponent(m[1]), docId: decodeURIComponent(m[2]) };
}
function getDocShareUrl(projectId, docId) {
  return location.origin + location.pathname + location.search +
    '#view/' + encodeURIComponent(projectId) + '/' + encodeURIComponent(docId);
}
async function openSharedView(projectId, docId) {
  // A szerkesztő felülete ne villanjon fel: a kész kézikönyv megjelenéséig a takaró látszik.
  showBootCover('Kézikönyv betöltése…');
  let proj = null;
  try { proj = await loadDocForExport(projectId, docId); } catch(e) { console.error(e); }
  if (!proj) {
    toast('⚠ Ez a dokumentum nem található (lehet, hogy törölték vagy áthelyezték).', 'err', 6000);
    history.replaceState(null, '', location.pathname + location.search);
    showHomeView();
    return;
  }
  let html;
  try { html = await buildDocHtml(proj); }
  catch(e) { console.error(e); toast('⚠ A kézikönyv összeállítása nem sikerült.', 'err', 6000); showHomeView(); return; }
  // A teljes oldal tartalmát lecseréljük a kész kézikönyvre — ugyanúgy, mintha
  // közvetlenül a letöltött HTML fájlt nyitottad volna meg.
  document.open();
  document.write(html);
  document.close();
}
window.addEventListener('hashchange', () => {
  if (!state.isAuthed) return;
  const shared = parseSharedViewHash();
  if (shared) openSharedView(shared.projectId, shared.docId);
});
// 🔗 gomb: a kész kézikönyvet új lapon megnyitja, és a linkjét a vágólapra is másolja.
async function copyDocShareLink(projectId, docId) {
  const url = getDocShareUrl(projectId, docId);
  const win = window.open(url, '_blank'); // a kattintáshoz kötve, különben a böngésző blokkolná
  let copied = false;
  try { await navigator.clipboard.writeText(url); copied = true; } catch(e) { /* nem baj */ }
  if (!win) toast('A böngésző blokkolta az új lapot — engedélyezd a felugró ablakokat.' + (copied ? ' A link a vágólapon van.' : ''), 'err', 6000);
  else toast(copied ? '✓ Megnyitva új lapon, a link a vágólapra másolva' : '✓ Megnyitva új lapon', 'ok', 3000);
}

async function cloudLogin() {
  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const errEl = document.getElementById('auth-error');
  errEl.textContent = '';
  if (!email || !password) { errEl.textContent = 'Add meg az email címet és a jelszót.'; return; }
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) { errEl.textContent = 'Hibás email vagy jelszó.'; return; }
  document.getElementById('auth-password').value = '';
}
async function cloudLogout() {
  clearHomeCache(); // a dokumentumlista helyi másolata ne maradjon a gépen
  await supabaseClient.auth.signOut();
  showHomeView();
}

// Elfelejtett jelszó — a bejelentkező képernyőn, még bejelentkezés előtt.
// Figyelem: ez is a Supabase alapértelmezett email-küldőjén megy, ami szigorúan
// korlátozott (lásd README) — ha nem érkezik meg az email, ez lehet az oka.
async function cloudForgotPassword() {
  const email = document.getElementById('auth-email').value.trim();
  const errEl = document.getElementById('auth-error');
  if (!email) { errEl.textContent = 'Előbb írd be az email címedet a mezőbe.'; return; }
  const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
  if (error) { errEl.textContent = 'Hiba történt: ' + error.message; return; }
  errEl.style.color = 'var(--green)';
  errEl.textContent = 'Ha ez a cím regisztrálva van, hamarosan kapsz egy emailt a jelszó visszaállításához.';
}

// Jelszó módosítása — már bejelentkezett felhasználónak.
function openPasswordModal() {
  document.getElementById('pw-new').value = '';
  document.getElementById('pw-confirm').value = '';
  document.getElementById('pw-error').textContent = '';
  document.getElementById('pw-modal-backdrop').classList.add('open');
}
function closePasswordModal() {
  document.getElementById('pw-modal-backdrop').classList.remove('open');
}
async function changePassword() {
  const pw1 = document.getElementById('pw-new').value;
  const pw2 = document.getElementById('pw-confirm').value;
  const errEl = document.getElementById('pw-error');
  errEl.textContent = '';
  if (!pw1 || pw1.length < 6) { errEl.textContent = 'A jelszó legalább 6 karakter legyen.'; return; }
  if (pw1 !== pw2) { errEl.textContent = 'A két jelszó nem egyezik.'; return; }
  const { error } = await supabaseClient.auth.updateUser({ password: pw1 });
  if (error) { errEl.textContent = 'Hiba: ' + error.message; return; }
  closePasswordModal();
  toast('✓ Jelszó módosítva');
}
document.getElementById('auth-password').addEventListener('keydown', e => {
  if (e.key === 'Enter') cloudLogin();
});
