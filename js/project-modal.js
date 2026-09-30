// ── Bal oldali dokumentum-panel: ⚙ Dokumentum beállításai / 📋 Fejezetek másolása ──────────
//
// A Megjelenéshez hasonló oldalsáv a szerkesztő bal szélén (nem felugró ablak): közben a
// fejezetfa, a szerkesztő és az előnézet is látszik. A két funkció külön gombbal nyílik a
// felső sávban; ugyanarra a gombra kattintva (vagy Esc-re / ✕-re) bezárul.
// (A fájlnév történeti: korábban itt volt a ⚙ Beállítások felugró ablak.)

// A szerkesztőn kívülre ejtett fájl ne nyissa meg a böngészőben (elhagyva az oldalt).
document.addEventListener('dragover', e => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) e.preventDefault(); });
document.addEventListener('drop', e => { if (e.dataTransfer && e.dataTransfer.files.length) e.preventDefault(); });

const DOC_PANELS = {
  settings: { title: '⚙ Dokumentum beállításai', body: 'dp-settings', btn: 'btn-doc-settings', load: () => loadDocTab() },
  copy:     { title: '📋 Fejezetek másolása',    body: 'dp-copy',     btn: 'btn-copy-chapters', load: () => loadCopyTab() },
};

function docPanelOpen() {
  const el = document.getElementById('doc-panel');
  return el && el.classList.contains('open') ? state._docPanel : null;
}

function toggleDocPanel(which) {
  if (docPanelOpen() === which) closeDocPanel(); else openDocPanel(which);
}

function openDocPanel(which) {
  const def = DOC_PANELS[which];
  if (!def) return;
  if (!currentProj()) { toast('Előbb nyiss meg egy dokumentumot!', 'err'); return; }
  if (docPanelOpen() === 'settings') flushDocSettings();
  state._docPanel = which;
  const el = document.getElementById('doc-panel');
  el.classList.add('open');
  el.setAttribute('aria-hidden', 'false');
  document.getElementById('dp-title').textContent = def.title;
  Object.entries(DOC_PANELS).forEach(([k, d]) => {
    document.getElementById(d.body).classList.toggle('active', k === which);
    const b = document.getElementById(d.btn);
    if (b) b.classList.toggle('panel-on', k === which);
  });
  document.getElementById('copy-dest-row').classList.remove('show');
  def.load();
  maybeAutoTour(which === 'copy' ? 'copy' : 'docsettings');
}

function closeDocPanel() {
  const el = document.getElementById('doc-panel');
  if (!el || !el.classList.contains('open')) return;
  if (state._docPanel === 'settings') flushDocSettings();
  el.classList.remove('open');
  el.setAttribute('aria-hidden', 'true');
  state._docPanel = null;
  Object.values(DOC_PANELS).forEach(d => { const b = document.getElementById(d.btn); if (b) b.classList.remove('panel-on'); });
}

// Régi hívások (pl. régi linkek / bővítmények) kedvéért.
function openProjModal(tab) { openDocPanel(tab === 'copy' ? 'copy' : 'settings'); }
function closeProjModal() { closeDocPanel(); }

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || !docPanelOpen() || state._tourActive) return;
  if (document.querySelector('.hp-modal-backdrop.open')) return;
  closeDocPanel();
});

// ── Dokumentum beállításai: cím, alcím, leírás — automatikus mentéssel ─────────────────────
let _docSettingsTimer = null;

function loadDocTab() {
  const proj = currentProj();
  if (!proj) return;
  document.getElementById('doc-title').value = proj.config.title || '';
  document.getElementById('doc-subtitle').value = proj.config.subtitle || '';
  document.getElementById('doc-description').value = proj.config.description || '';
  setDocSettingsStatus('', '');
}

function setDocSettingsStatus(text, cls) {
  const el = document.getElementById('doc-settings-status');
  if (!el) return;
  el.textContent = text;
  el.className = 'dp-status' + (cls ? ' ' + cls : '');
}

// Gépelés közben: az előnézet azonnal frissül, a mentés kis szünet után történik.
function onDocSettingInput() {
  const proj = currentProj();
  if (!proj) return;
  const title = document.getElementById('doc-title').value.trim();
  if (!title) { setDocSettingsStatus('⚠ A cím nem lehet üres — amíg üres, nem mentünk.', 'err'); clearTimeout(_docSettingsTimer); return; }
  applyDocSettings(proj);
  schedulePreview();
  setDocSettingsStatus('● Mentés…', 'busy');
  clearTimeout(_docSettingsTimer);
  _docSettingsTimer = setTimeout(() => saveDocSettings({ quiet: true }), 900);
}

function applyDocSettings(proj) {
  const title = document.getElementById('doc-title').value.trim();
  proj.config.title = title;
  proj.config.subtitle = document.getElementById('doc-subtitle').value.trim() || title;
  proj.config.description = document.getElementById('doc-description').value.trim();
}

// Bezáráskor / panelváltáskor a még függő mentés azonnal lefut.
function flushDocSettings() {
  if (!_docSettingsTimer) return;
  clearTimeout(_docSettingsTimer);
  _docSettingsTimer = null;
  saveDocSettings({ quiet: true });
}

async function saveDocSettings(opts = {}) {
  _docSettingsTimer = null;
  const proj = currentProj();
  if (!proj) return;
  const title = document.getElementById('doc-title').value.trim();
  if (!title) { toast('A cím nem lehet üres!', 'err'); return; }
  applyDocSettings(proj);
  const ok = await saveProjectConfig(proj);
  updateBreadcrumb();
  schedulePreview();
  const hp = (state.homeProjects || []).find(x => x.id === proj.topProjectId);
  const hd = hp && (hp.docs || []).find(x => x.id === proj.docId);
  if (hd) hd.title = title;
  if (typeof renderDocSwitcher === 'function') renderDocSwitcher();
  setDocSettingsStatus(ok ? '✓ Mentve' : '⚠ A mentés nem sikerült — próbáld újra.', ok ? 'ok' : 'err');
  if (!opts.quiet || !ok) toast(ok ? '✓ Dokumentum adatai mentve' : '⚠ Mentés sikertelen', ok ? 'ok' : 'err');
}

// ── Fejezetek másolása egy másik Dokumentumból ────────────────────────────────
let _copySource = null; // { folder, data }
const COPY_EMPTY_HINT = '<div class="hint" style="padding:8px 2px">Előbb válassz dokumentumot.</div>';

async function loadCopyTab() {
  const projSel = document.getElementById('copy-project-select');
  document.getElementById('copy-doc-select').innerHTML = '';
  document.getElementById('copy-chapters-list').innerHTML = COPY_EMPTY_HINT;
  document.getElementById('copy-dest-row').classList.remove('show');
  _copySource = null;
  projSel.innerHTML = '<option value="">Betöltés...</option>';
  const ids = await cloudListProjectIds();
  projSel.innerHTML = '<option value="">— válassz projektet —</option>';
  for (const id of ids) {
    const m = (state.homeProjects || []).find(p => p.id === id) || await cloudGetProjectMeta(id) || { id, name: id };
    const o = document.createElement('option');
    o.value = id; o.textContent = m.name;
    projSel.appendChild(o);
  }
  if (state.currentTopProject && ids.includes(state.currentTopProject)) { projSel.value = state.currentTopProject; loadCopyDocs(); }
}

async function loadCopyDocs() {
  const projectId = document.getElementById('copy-project-select').value;
  const docSel = document.getElementById('copy-doc-select');
  document.getElementById('copy-chapters-list').innerHTML = '';
  document.getElementById('copy-dest-row').classList.remove('show');
  document.getElementById('copy-chapters-list').innerHTML = COPY_EMPTY_HINT;
  if (!projectId) { docSel.innerHTML = ''; return; }
  docSel.innerHTML = '<option value="">Betöltés...</option>';
  const docs = await cloudListDocuments(projectId);
  const current = currentProj();
  docSel.innerHTML = '<option value="">— válassz dokumentumot —</option>';
  docs.forEach(d => {
    if (current && current.cloudFolder === projectId + '/' + d.id) return;
    const o = document.createElement('option');
    o.value = projectId + '/' + d.id; o.textContent = d.title;
    docSel.appendChild(o);
  });
}

async function loadCopyChapters() {
  const folder = document.getElementById('copy-doc-select').value;
  const list = document.getElementById('copy-chapters-list');
  list.innerHTML = '';
  document.getElementById('copy-dest-row').classList.remove('show');
  if (!folder) { list.innerHTML = COPY_EMPTY_HINT; return; }
  list.innerHTML = '<div class="hint" style="padding:8px">Betöltés...</div>';
  const data = await cloudFetchDocument(folder);
  _copySource = { folder, data };
  const tmp = { files: {}, config: data.config, fileOrder: [] };
  Object.entries(data.files).forEach(([fn, raw]) => { tmp.files[fn] = makeFileEntry(raw); ensureChapterMeta(fn, tmp.files[fn]); });
  normalizeStructure(tmp);
  list.innerHTML = '';
  if (!tmp.fileOrder.length) { list.innerHTML = '<div class="hint" style="padding:8px">Ennek a dokumentumnak nincs fejezete.</div>'; return; }

  const selAll = document.createElement('div');
  selAll.style.cssText = 'display:flex;align-items:center;gap:10px;padding:4px 10px;margin-bottom:6px';
  selAll.innerHTML = `<input type="checkbox" id="copy-select-all" onchange="toggleSelectAll(this)" style="accent-color:var(--accent);width:15px;height:15px" />
    <label for="copy-select-all" style="font-size:12px;color:var(--text3);cursor:pointer">Összes kijelölése</label>`;
  list.appendChild(selAll);
  tmp.fileOrder.forEach(fn => {
    const row = document.createElement('div');
    row.className = 'copy-chapter-row';
    row.innerHTML = `<input type="checkbox" class="copy-cb" data-fn="${escapeHtml(fn)}" style="accent-color:var(--accent);width:15px;height:15px" />
      <div><div class="ch-name">${escapeHtml(tmp.files[fn].meta.title)}</div><div class="ch-file">${escapeHtml(fn)}</div></div>`;
    row.addEventListener('click', e => {
      const cb = row.querySelector('.copy-cb');
      if (e.target !== cb) cb.checked = !cb.checked;
      row.classList.toggle('selected', cb.checked);
    });
    list.appendChild(row);
  });
  document.getElementById('copy-dest-row').classList.add('show');
}

function toggleSelectAll(cb) {
  document.querySelectorAll('.copy-cb').forEach(c => {
    c.checked = cb.checked;
    c.closest('.copy-chapter-row').classList.toggle('selected', cb.checked);
  });
}

// A kijelölt fejezetek átmásolása az aktuális dokumentumba (a képeikkel együtt).
async function copySelectedChapters() {
  const proj = currentProj();
  if (!proj || !_copySource) return;
  const selected = [...document.querySelectorAll('.copy-cb:checked')].map(c => c.dataset.fn);
  if (!selected.length) { toast('Jelölj be legalább egy fejezetet!', 'err'); return; }
  toast('📋 Másolás...', 'ok', 3000);
  let copied = 0, skipped = 0;
  for (const fn of selected) {
    const f = makeFileEntry(_copySource.data.files[fn]);
    ensureChapterMeta(fn, f);
    let targetFn = fn;
    if (proj.files[fn]) {
      if (!confirm(`"${f.meta.title}" (${fn}) már létezik ebben a dokumentumban. Felülírod?`)) { skipped++; continue; }
    } else if (proj.fileOrder.some(x => chapterId(proj, x) === f.meta.id)) {
      f.meta.id = f.meta.id + '-masolat';
      targetFn = fn.replace(/\.md$/, '-masolat.md');
    }
    await copyImagesBetweenDocs(f.content, _copySource.folder, proj);
    const existed = !!proj.files[targetFn];
    f.dirty = true;
    proj.files[targetFn] = f;
    _editorStates.delete(targetFn);
    if (!existed) insertChapterAfter(proj, targetFn, null);
    await saveChapter(proj, targetFn);
    copied++;
  }
  await saveProjectConfig(proj);
  renderTree();
  schedulePreview();
  if (state.currentFile && selected.includes(state.currentFile)) {
    const fn = state.currentFile; state.currentFile = null; openFile(fn);
  }
  document.querySelectorAll('.copy-cb, #copy-select-all').forEach(c => { c.checked = false; });
  document.querySelectorAll('.copy-chapter-row.selected').forEach(r => r.classList.remove('selected'));
  toast(`✓ ${copied} fejezet másolva${skipped ? ', ' + skipped + ' kihagyva' : ''} — a fejezetlista végén találod`);
}
