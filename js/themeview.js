// ── Megjelenés oldal (projekt téma) ──────────────────────────────────────────
// Teljes oldalas nézet: balra a beállítások (logó + színek), jobbra egy minta
// kézikönyv-oldal, amin MINDEN formázás megtalálható — így egy pillantással látszik,
// mire hat egy-egy szín. A beállítás a projekt összes dokumentumára érvényes.

const TV = { projectId: null, projectName: '', vars: null, saved: null, logo: '', savedLogo: '', returnTo: null, timer: null };

// Minta tartalom: minden formázási elem egy helyen.
const THEME_SAMPLE = {
  intro: `# Minta kézikönyv

Ez egy **minta oldal**: itt látszik, hogyan fognak kinézni a projekt dokumentumai. A bekezdésben van *dőlt*, **félkövér**, \`kód\` és egy [belső link](#hasznalat).

> Kiemelt doboz: fontos tudnivaló vagy figyelmeztetés a felhasználónak.

## Címsor 2

### Címsor 3

Egy [link másik oldalra](https://example.com) a másodlagos színnel.`,
  usage: `# Használat

## Lépések

1. Nyisd meg a felületet :house:
2. Kattints a **Beállítások** gombra :settings:
3. Mentsd el a módosításokat :check:

- Felsorolás első eleme
- Második elem egy ikonnal :star:

![Minta képernyőkép](SAMPLE_IMG)
*Képaláírás a kép alatt*

| Mező | Leírás |
|---|---|
| Név | A felhasználó teljes neve |
| E-mail | Belépéshez használt cím |

<!-- accordion -->
+++ Gyakori kérdés: hogyan lépek be?
A bejelentkező oldalon add meg az e-mail címed és a jelszavad.

+++ Mi van, ha elfelejtettem a jelszavam?
Kattints az **Elfelejtett jelszó** linkre.
<!-- /accordion -->

\`\`\`
Példa kódblokk
\`\`\``,
  faq: `# Gyakori kérdések

Rövid bekezdés a harmadik fejezetben, egy [külső hivatkozással](https://example.com).`,
};

function sampleImageDataUrl(v) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="360"><rect width="800" height="360" fill="#eef1f5"/><rect x="0" y="0" width="800" height="44" fill="${v.primary}"/><rect x="24" y="72" width="220" height="264" rx="10" fill="#ffffff"/><rect x="268" y="72" width="508" height="120" rx="10" fill="#ffffff"/><rect x="268" y="212" width="508" height="124" rx="10" fill="#ffffff"/><text x="400" y="140" font-family="sans-serif" font-size="22" fill="#9aa3af" text-anchor="middle">Képernyőkép</text></svg>`;
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
}

function buildThemeSampleHtml(vars) {
  const v = normalizeThemeVars(vars);
  const files = {};
  const mk = (id, title, content) => ({ meta: { id, title }, content: content.replace('SAMPLE_IMG', sampleImageDataUrl(v)) });
  files['01.md'] = mk('bevezetes', 'Minta kézikönyv', THEME_SAMPLE.intro);
  files['02.md'] = mk('hasznalat', 'Használat', THEME_SAMPLE.usage);
  files['03.md'] = mk('gyik', 'Gyakori kérdések', THEME_SAMPLE.faq);
  const fake = {
    name: '__sample', config: { title: TV.projectName || 'Minta', subtitle: TV.projectName || 'Minta kézikönyv', description: 'Minta oldal a megjelenéshez',
      nav_groups: [{ name: 'Első lépések', sections: ['hasznalat', 'gyik'], subgroups: [] }] },
    fileOrder: ['01.md', '02.md', '03.md'], files, logo: TV.logo || ''
  };
  return buildPreviewHtml(fake, buildAllSectionsHtml(fake), true, composeThemeCss(v));
}

// ── Megnyitás / bezárás ──
async function openThemeView(projectId, returnTo) {
  if (!projectId) { toast('Ehhez a dokumentumhoz nem tartozik projekt.', 'err'); return; }
  if (state.uiView === 'editor' && hasUnsavedWork()) await saveAllDirty({ quiet: true });
  hideBootCover();
  TV.projectId = projectId;
  TV.returnTo = returnTo || state.uiView;
  const meta = (state.homeProjects || []).find(p => p.id === projectId) || state.currentTopProjectMeta || await cloudGetProjectMeta(projectId);
  TV.projectName = (meta && meta.id === projectId && meta.name) || (meta && meta.name) || projectId;

  let vars = await cloudGetProjectTheme(projectId);
  let migrated = false;
  if (!vars) {
    // Még nincs projekt téma: a projekt első olyan dokumentumából indulunk, aminek volt saját színe.
    for (const d of await cloudListDocuments(projectId)) {
      const css = await cloudDownloadText(projectId + '/' + d.id + '/style.css');
      const legacy = themeVarsFromLegacyCss(css);
      if (legacy) { vars = legacy; migrated = true; break; }
    }
  }
  TV.vars = normalizeThemeVars(vars || {});
  TV.saved = JSON.stringify(TV.vars);

  // Logó: a projekt logója; ha még nincs, az első olyan dokumentumé, amelyiknek van.
  let logo = await cloudGetProjectLogo(projectId);
  let logoMigrated = false;
  if (logo == null) {
    logo = '';
    for (const d of await cloudListDocuments(projectId)) {
      const l = ((await cloudDownloadText(projectId + '/' + d.id + '/logo.txt')) || '').trim();
      if (l) { logo = l; logoMigrated = true; break; }
    }
  }
  TV.logo = logo;
  TV.savedLogo = logoMigrated ? null : logo; // átvett logónál a Mentés véglegesíti

  state.uiView = 'theme';
  ['view-home'].forEach(id => document.getElementById(id).classList.remove('active'));
  document.getElementById('main').style.display = 'none';
  document.getElementById('view-theme').classList.add('active');
  updateTopbarToolsVisibility();
  document.getElementById('breadcrumb-row').classList.add('visible');
  document.getElementById('breadcrumb-bar').innerHTML = `<span class="crumb" onclick="closeThemeView()">${escapeHtml(TV.projectName)}</span><span class="crumb-sep">/</span><span class="crumb-current">Megjelenés</span>`;
  document.getElementById('theme-project-name').textContent = TV.projectName;
  renderThemeForm();
  renderThemePreview();
  updateThemeDirty();
  if (migrated || logoMigrated) toast('A projekt még nem kapott közös ' + [migrated && 'megjelenést', logoMigrated && 'logót'].filter(Boolean).join(' és ') + ' — egy meglévő dokumentuméból indultunk. Mentéssel ez lesz a projekté.', 'ok', 6000);
}

async function closeThemeView() {
  if (isThemeDirty()) {
    if (confirm('A megjelenésen nem mentett módosítások vannak. Elmented őket?\n\nOK = mentés, Mégse = elvetés')) {
      if (!await saveThemeView()) return;
    }
  }
  document.getElementById('view-theme').classList.remove('active');
  const back = TV.returnTo;
  TV.vars = null;
  if (back === 'editor' && currentProj()) {
    enterEditorView();
    renderPreview();
  } else if (back === 'home') {
    showHomeView();
  } else {
    showProjectView(TV.projectId);
  }
}

function isThemeDirty() { return !!TV.vars && (JSON.stringify(TV.vars) !== TV.saved || TV.logo !== TV.savedLogo); }
function updateThemeDirty() {
  const el = document.getElementById('theme-dirty');
  el.textContent = isThemeDirty() ? '● Nem mentett módosítás' : 'Minden mentve';
  el.classList.toggle('unsaved', isThemeDirty());
}

async function saveThemeView() {
  let ok = await cloudSaveProjectTheme(TV.projectId, TV.vars);
  if (ok && TV.logo !== TV.savedLogo) ok = await cloudSaveProjectLogo(TV.projectId, TV.logo);
  if (!ok) { toast('⚠ A mentés nem sikerült', 'err'); return false; }
  TV.saved = JSON.stringify(TV.vars);
  TV.savedLogo = TV.logo;
  updateThemeDirty();
  // A megnyitott dokumentum (ha ebbe a projektbe tartozik) azonnal megkapja az új témát és logót.
  const p = currentProj();
  if (p && p.topProjectId === TV.projectId) { p.themeVars = normalizeThemeVars(TV.vars); p.logo = TV.logo; }
  toast('✓ Megjelenés mentve — a projekt minden dokumentumára érvényes');
  return true;
}

function resetThemeView() {
  if (!confirm('Visszaállítod az alapértelmezett megjelenést? (A Mentés gombbal lesz végleges.)')) return;
  TV.vars = normalizeThemeVars({});
  renderThemeForm();
  onThemeChanged();
}

// ── Beállító űrlap ──
function renderThemeForm() {
  const host = document.getElementById('theme-form-fields');
  const v = TV.vars;
  let html = `<div class="tf-group"><div class="tf-title">Logó</div>
    <div class="tf-logo">
      <div class="tf-logo-box">${TV.logo ? `<img src="${escapeHtml(TV.logo)}" alt="logó"/>` : '<span>nincs logó</span>'}</div>
      <div class="tf-logo-actions">
        <button class="btn" onclick="document.getElementById('theme-logo-input').click()">📂 ${TV.logo ? 'Csere' : 'Feltöltés'}</button>
        ${TV.logo ? '<button class="btn tf-logo-del" onclick="removeThemeLogo()">🗑 Eltávolítás</button>' : ''}
      </div>
      <input id="theme-logo-input" type="file" accept="image/*" style="display:none" onchange="onThemeLogoPicked(this)"/>
    </div>
    <div class="tf-note-small">A bal oldali menü tetején jelenik meg, a projekt minden dokumentumában. PNG, SVG vagy JPG, ajánlott max. 200×60 px.</div>
  </div>`;
  html += `<div class="tf-group"><div class="tf-title">Színek</div>`;
  THEME_FIELDS.forEach(f => {
    html += `<div class="tf-row" data-key="${f.key}">
      <label>${escapeHtml(f.label)} <span class="tf-hint">${escapeHtml(f.hint)}</span></label>
      <input type="color" value="${v[f.key]}" oninput="onThemeColor('${f.key}', this.value)" title="${v[f.key]}"/>
      <input type="text" class="tf-hex" value="${v[f.key]}" oninput="onThemeHex('${f.key}', this.value)"/>
      <span class="tf-auto-spacer"></span>
    </div>`;
  });
  html += `</div>`;
  const F = THEME_FIXED;
  html += `<div class="tf-group tf-fixed"><div class="tf-title">Egységes (nem állítható)</div>
    <div class="tf-note">Szöveg: <span class="tf-sw" style="background:${F.text}"></span>${F.text} · Másodlagos szöveg: <span class="tf-sw" style="background:${F.muted}"></span>${F.muted}<br>
    Szegélyek: <span class="tf-sw" style="background:${F.border}"></span>${F.border}<br>
    Betűtípus: <b>Inter</b> (szöveg) + <b>Lexend</b> (címsorok)<br>
    Címsorméretek: Címsor 1–3 = ${F.headingSizes.join(' / ')} px<br>
    Sarkok lekerekítése: ${F.radius} · Bekezdés: ${THEME_TEXT_SIZE} px · Ikonok: ${THEME_ICON.size} px</div></div>`;
  host.innerHTML = html;
}

function onThemeColor(key, val) {
  TV.vars[key] = val;
  const row = document.querySelector(`.tf-row[data-key="${key}"]`);
  if (row && document.activeElement !== row.querySelector('.tf-hex')) row.querySelector('.tf-hex').value = val;
  onThemeChanged();
}
function onThemeHex(key, val) { val = (val || '').trim().toLowerCase(); if (isHexColor(val)) { const row = document.querySelector(`.tf-row[data-key="${key}"] input[type=color]`); if (row) row.value = val; onThemeColor(key, val); } }

function onThemeChanged() {
  updateThemeDirty();
  clearTimeout(TV.timer);
  TV.timer = setTimeout(renderThemePreview, 120);
}

function renderThemePreview() {
  const frame = document.getElementById('theme-preview-frame');
  let y = 0;
  try { y = frame.contentWindow.scrollY || 0; } catch(e) {}
  frame.onload = () => {
    try { const d = frame.contentDocument; d.documentElement.style.scrollBehavior = 'auto'; d.documentElement.scrollTop = y; } catch(e) {}
  };
  frame.srcdoc = buildThemeSampleHtml(TV.vars);
}

// A szerkesztőből: a megnyitott dokumentum projektjének témája.
function openThemeForCurrentDoc() {
  const p = currentProj();
  if (!p) return;
  openThemeView(p.topProjectId, 'editor');
}

// ── Logó ──
function onThemeLogoPicked(input) {
  const file = input.files[0];
  input.value = '';
  if (!file) return;
  if (!/^image\//.test(file.type)) { toast('Csak képfájl tölthető fel logónak.', 'err'); return; }
  if (file.size > 1024 * 1024) { toast('A logó túl nagy (max. 1 MB) — használj kisebb képet.', 'err', 5000); return; }
  const reader = new FileReader();
  reader.onload = e => {
    TV.logo = e.target.result;
    renderThemeForm();
    onThemeChanged();
  };
  reader.readAsDataURL(file);
}
function removeThemeLogo() {
  TV.logo = '';
  renderThemeForm();
  onThemeChanged();
}
