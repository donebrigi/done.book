// ── Nézetváltás: Kezdőlap / Szerkesztő / Megjelenés ──
function updateTopbarToolsVisibility() {
  const isEditor = state.uiView === 'editor';
  const left = document.getElementById('topbar-editor-tools-left');
  const right = document.getElementById('topbar-editor-tools-right');
  if (left) left.style.display = isEditor ? 'contents' : 'none';
  if (right) right.style.display = isEditor ? 'contents' : 'none';
}

function updateBreadcrumb() {
  const bar = document.getElementById('breadcrumb-bar');
  const row = document.getElementById('breadcrumb-row');
  if (!bar) return;
  if (state.uiView === 'editor') {
    if (row) row.classList.add('visible');
    renderDocSwitcher();
    const proj = state.projects[state.currentProject];
    const docTitle = (proj && (proj.config?.title || proj.docId || proj.name)) || state.currentProject || '';
    if (proj && proj.topProjectId) {
      const projName = (state.currentTopProjectMeta && state.currentTopProjectMeta.id === proj.topProjectId) ? state.currentTopProjectMeta.name : proj.topProjectId;
      bar.innerHTML = `<span class="crumb" onclick="showHomeView()">Kezdőlap</span><span class="crumb-sep">/</span><span class="crumb" onclick="showProjectView('${proj.topProjectId}')">${escapeHtml(projName)}</span><span class="crumb-sep">/</span><span class="crumb-current">${escapeHtml(docTitle)}</span>`;
    } else {
      bar.innerHTML = `<span class="crumb-current">${escapeHtml(docTitle)} <span style="color:var(--text3)">(helyi)</span></span>`;
    }
  } else {
    if (row) row.classList.remove('visible');
    bar.innerHTML = '';
  }
}

// A Megjelenés oldal elhagyása (máshová navigáláskor): nem mentett módosításnál kérdez.
// false = maradjunk (a mentés nem sikerült).
async function leaveThemeView() {
  if (state.uiView !== 'theme') return true;
  if (typeof isThemeDirty === 'function' && isThemeDirty()) {
    if (confirm('A megjelenésen nem mentett módosítások vannak. Elmented őket?\n\nOK = mentés, Mégse = elvetés')) {
      if (!await saveThemeView()) return false;
    }
  }
  document.getElementById('view-theme').classList.remove('active');
  TV.vars = null;
  return true;
}

function enterEditorView() {
  document.getElementById('view-theme').classList.remove('active');
  state.uiView = 'editor';
  const home = document.getElementById('view-home'), main = document.getElementById('main');
  if (home) home.classList.remove('active');
  if (main) main.style.display = 'flex';
  updateTopbarToolsVisibility();
  updateBreadcrumb();
  refreshDocSwitcher();
}

async function showHomeView() {
  if (!await leaveThemeView()) return;
  if (state.uiView === 'editor' && hasUnsavedWork()) saveAllDirty({ quiet: true }); // kilépés előtt minden felmegy
  state.uiView = 'home';
  const home = document.getElementById('view-home'), main = document.getElementById('main');
  if (main) main.style.display = 'none';
  if (home) home.classList.add('active');
  updateTopbarToolsVisibility();
  updateBreadcrumb();
  // Azonnal a legutóbbi (helyben megjegyzett) lista látszik, a háttérben frissül a felhőből.
  const cached = readHomeCache();
  state.homeProjects = cached ? cached.projects : null;
  syncHomeFolderMeta();
  renderHomeGrid();
  setHomeRefreshing(true);
  try {
    state.homeProjects = await cloudListTopProjects();
  } finally { setHomeRefreshing(false); }
  syncHomeFolderMeta(true);
  if (state.uiView === 'home') { renderHomeGrid(); maybeAutoTour('home'); }
}

// Kis „frissítés…” jelzés a Kezdőlapon, amíg a háttérben töltődik a friss lista.
function setHomeRefreshing(on) {
  const el = document.getElementById('home-count');
  if (el) el.classList.toggle('refreshing', !!on);
}

// Egy projekt (mappa) megnyitása a Kezdőlapon: a táblázatban csak az ő dokumentumai.
async function showProjectView(projectId) {
  setHomeFolder(projectId);
  await showHomeView();
}

// ── Kezdőlap: bal oldalt a projektek (mappák), középen a dokumentumok táblázata ──
const HOME_FOLDER_KEY = 'kk:homeFolder';
const HOME_SORT_KEY = 'kk:homeSort';

function getHomeFolder() {
  if (state.homeFolder !== undefined) return state.homeFolder;
  try { state.homeFolder = localStorage.getItem(HOME_FOLDER_KEY) || null; } catch(e) { state.homeFolder = null; }
  return state.homeFolder;
}
function setHomeFolder(projectId) {
  state.homeFolder = projectId || null;
  try { if (projectId) localStorage.setItem(HOME_FOLDER_KEY, projectId); else localStorage.removeItem(HOME_FOLDER_KEY); } catch(e) {}
  syncHomeFolderMeta();
}
// Az új dokumentum / importálás / megjelenés a kiválasztott projektre vonatkozik.
// final: a friss (felhőből jött) lista alapján — ha a kiválasztott projekt már nem létezik, az „Összes” lesz.
function syncHomeFolderMeta(final) {
  const id = getHomeFolder();
  const meta = id && (state.homeProjects || []).find(p => p.id === id);
  if (final && id && state.homeProjects && !meta) { state.homeFolder = null; try { localStorage.removeItem(HOME_FOLDER_KEY); } catch(e) {} }
  state.currentTopProject = meta ? meta.id : null;
  state.currentTopProjectMeta = meta || null;
}
function selectHomeFolder(projectId) {
  setHomeFolder(projectId);
  const s = document.getElementById('home-search'); if (s) s.value = '';
  renderHomeGrid();
}

function getHomeSort() {
  try { const v = JSON.parse(localStorage.getItem(HOME_SORT_KEY) || 'null'); if (v && (v.key === 'title' || v.key === 'date')) return v; } catch(e) {}
  return { key: 'date', dir: 'desc' };
}
function setHomeSort(key) {
  const cur = getHomeSort();
  const next = cur.key === key ? { key, dir: cur.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'date' ? 'desc' : 'asc' };
  try { localStorage.setItem(HOME_SORT_KEY, JSON.stringify(next)); } catch(e) {}
  renderHomeList();
}

// Egy dokumentum-művelet (átnevezés, törlés, áthelyezés) után a látható nézet frissítése.
function refreshDocViews() {
  if (state.homeProjects) saveHomeCache(state.homeProjects); // a helyi másolat is frissüljön
  if (state.uiView === 'home') renderHomeGrid();
}

function renderHomeGrid() {
  renderHomeFolders();
  renderHomeHeader();
  renderHomeList();
}

function sortedHomeProjects() {
  return (state.homeProjects || []).slice().sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id, 'hu', { sensitivity: 'base' }));
}

function renderHomeFolders() {
  const host = document.getElementById('home-folders');
  if (!host) return;
  if (!state.homeProjects) { host.innerHTML = '<div class="hf-empty">Betöltés...</div>'; return; }
  const cur = getHomeFolder();
  const total = state.homeProjects.reduce((n, p) => n + (p.docs || []).length, 0);
  let html = `<div class="hf-item hf-all${!cur ? ' active' : ''}" data-id="">
      <span class="hf-icon">📚</span><span class="hf-name">Összes dokumentum</span><span class="hf-count">${total}</span></div>
    <div class="hf-sep"></div>`;
  sortedHomeProjects().forEach(p => {
    html += `<div class="hf-item${cur === p.id ? ' active' : ''}" data-id="${escapeHtml(p.id)}" title="${escapeHtml(p.name)}">
      <span class="hf-icon" style="background:${p.color}22;color:${p.color}">${escapeHtml(p.icon)}</span>
      <span class="hf-name">${escapeHtml(p.name)}</span><span class="hf-count">${(p.docs || []).length}</span></div>`;
  });
  if (!state.homeProjects.length) html += '<div class="hf-empty">Még nincs projekt.</div>';
  host.innerHTML = html;
  host.querySelectorAll('.hf-item').forEach(el => {
    const id = el.dataset.id || null;
    el.onclick = () => selectHomeFolder(id);
    if (!id) return;
    // Dokumentum ráhúzása egy mappára = áthelyezés abba a projektbe
    el.addEventListener('dragover', e => {
      if (!state._dragDoc || state._dragDoc.projectId === id) return;
      e.preventDefault(); e.dataTransfer.dropEffect = 'move'; el.classList.add('drop-target');
    });
    el.addEventListener('dragleave', () => el.classList.remove('drop-target'));
    el.addEventListener('drop', e => {
      e.preventDefault(); el.classList.remove('drop-target');
      const src = state._dragDoc; state._dragDoc = null;
      if (src && src.projectId !== id) moveDocToProject(src.projectId, src.docId, src.title, id);
    });
  });
}

function renderHomeHeader() {
  const host = document.getElementById('home-header');
  if (!host) return;
  const cur = getHomeFolder();
  const meta = cur && (state.homeProjects || []).find(p => p.id === cur);
  const lastUpdate = docs => docs.map(d => d.updatedAt).filter(Boolean).sort().pop();
  if (!meta) {
    const all = (state.homeProjects || []).flatMap(p => p.docs || []);
    const lu = lastUpdate(all);
    host.innerHTML = `<div class="hh-card">
      <div class="hh-top">
        <div class="hh-icon">📚</div>
        <div class="hh-titles"><h1>Összes dokumentum</h1>
          <div class="hh-desc">Minden projekt minden dokumentuma egy helyen. Bal oldalt egy projektre kattintva csak az ő dokumentumai látszanak. Egy dokumentumot a bal oldali projektre húzva áthelyezheted.</div></div>
      </div>
      <div class="hh-stats">${state.homeProjects ? `<span><b>${state.homeProjects.length}</b> projekt</span><span><b>${all.length}</b> dokumentum</span>${lu ? `<span>utoljára frissítve: <b>${escapeHtml(formatRelativeDate(lu))}</b></span>` : ''}` : 'Betöltés...'}</div>
    </div>`;
    return;
  }
  const docs = meta.docs || [];
  const chapters = docs.reduce((n, d) => n + (d.chapterCount || 0), 0);
  const lu = lastUpdate(docs);
  host.innerHTML = `<div class="hh-card" style="--pc:${meta.color}">
    <div class="hh-top">
      <div class="hh-icon" style="background:${meta.color}22;color:${meta.color}">${escapeHtml(meta.icon)}</div>
      <div class="hh-titles"><h1>${escapeHtml(meta.name)}</h1>
        <div class="hh-desc">${meta.description ? escapeHtml(meta.description) : '<span class="hh-muted">Nincs leírás — a ✏ gombbal adhatsz meg egy rövid összefoglalót a projektről.</span>'}</div></div>
      <div class="hh-actions">
        <button class="btn" data-act="theme" title="A projekt összes dokumentumának megjelenése (színek, logó)">🎨 Megjelenés</button>
        <button class="btn-sm" data-act="edit" title="Projekt szerkesztése (név, leírás, ikon, szín)">✏</button>
        <button class="btn-sm" data-act="import" title="Importálás: egy projektmappa vagy egy letöltött ZIP kicsomagolt mappája felvétele ide, dokumentumként">📤</button>
        <button class="btn-sm del" data-act="del" title="Projekt törlése (minden dokumentumával együtt)">🗑</button>
        <button class="btn primary" data-act="new" title="Új dokumentum ebben a projektben">+ Új dokumentum</button>
      </div>
    </div>
    <div class="hh-stats"><span><b>${docs.length}</b> dokumentum</span><span><b>${chapters}</b> fejezet</span>${lu ? `<span>utoljára frissítve: <b>${escapeHtml(formatRelativeDate(lu))}</b></span>` : ''}</div>
  </div>`;
  host.querySelectorAll('[data-act]').forEach(b => b.onclick = () => {
    const act = b.dataset.act;
    if (act === 'theme') openThemeView(meta.id, 'project');
    else if (act === 'edit') openEditTopProjectModal(meta);
    else if (act === 'import') openImportModal();
    else if (act === 'del') deleteTopProjectFromHome(meta.id, meta.name);
    else if (act === 'new') openNewDocModal();
  });
}

function renderHomeList() {
  const host = document.getElementById('home-list');
  if (!host) return;
  if (!state.homeProjects) { host.innerHTML = '<div class="hp-empty">Betöltés...</div>'; return; }
  const cur = getHomeFolder();
  const q = (document.getElementById('home-search').value || '').trim().toLowerCase();
  const rows = [];
  state.homeProjects.forEach(p => { if (!cur || p.id === cur) (p.docs || []).forEach(d => rows.push({ p, d })); });
  const filtered = rows.filter(({ p, d }) => !q || (d.title || '').toLowerCase().includes(q) || (p.name || '').toLowerCase().includes(q));
  const sort = getHomeSort();
  const mul = sort.dir === 'asc' ? 1 : -1;
  filtered.sort((a, b) => sort.key === 'title'
    ? mul * (a.d.title || a.d.id).localeCompare(b.d.title || b.d.id, 'hu', { sensitivity: 'base' })
    : mul * String(a.d.updatedAt || '').localeCompare(String(b.d.updatedAt || '')));
  const countEl = document.getElementById('home-count');
  if (countEl) countEl.textContent = filtered.length + ' dokumentum';
  if (!filtered.length) {
    host.innerHTML = `<div class="hp-empty">${q ? 'Nincs találat "' + escapeHtml(q) + '" keresésre.' : (cur ? 'Ebben a projektben még nincs dokumentum — hozz létre egyet a „+ Új dokumentum” gombbal.' : 'Még nincs dokumentum.')}</div>`;
    return;
  }
  const arrow = key => sort.key === key ? (sort.dir === 'asc' ? ' ▲' : ' ▼') : '';
  const fmtDate = iso => { try { return new Date(iso).toLocaleString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch(e) { return iso; } };
  host.innerHTML = `<table class="doc-table">
    <thead><tr>
      <th class="dt-sort" data-sort="title" title="Rendezés cím szerint">Cím${arrow('title')}</th>
      <th>Projekt</th>
      <th class="dt-sort" data-sort="date" title="Rendezés az utolsó módosítás dátuma szerint">Dátum${arrow('date')}</th>
      <th class="dt-c">PDF</th><th class="dt-c">HTML</th><th class="dt-c">Link</th><th></th><th></th><th></th>
    </tr></thead>
    <tbody>${filtered.map(({ p, d }, i) => `
      <tr data-i="${i}" draggable="true" title="Húzd egy bal oldali projektre az áthelyezéshez">
        <td class="dt-title"><span class="dt-grip" aria-hidden="true">⋮⋮</span><a href="#" data-act="open">${escapeHtml(d.title)}</a>
          <div class="dt-meta">${d.chapterCount} fejezet</div></td>
        <td class="dt-project"><span class="dt-dot" style="background:${p.color}"></span><a href="#" data-act="project">${escapeHtml(p.icon)} ${escapeHtml(p.name)}</a></td>
        <td class="dt-date" title="${d.updatedAt ? escapeHtml(fmtDate(d.updatedAt)) : ''}">${d.updatedAt ? escapeHtml(formatRelativeDate(d.updatedAt)) : '—'}</td>
        <td class="dt-c"><button class="btn-sm" data-act="pdf" title="PDF letöltése (mindig az aktuális állapot)">⬇ PDF</button></td>
        <td class="dt-c"><button class="btn-sm" data-act="html" title="A kész kézikönyv letöltése HTML-ben (mindig az aktuális állapot)">⬇ HTML</button></td>
        <td class="dt-c"><button class="btn-sm" data-act="link" title="Megnyitás új lapon — a megosztható link a vágólapra is kerül">🔗</button></td>
        <td class="dt-c"><button class="btn primary btn-xs" data-act="open">Megnyitás</button></td>
        <td class="dt-c"><button class="btn-sm" data-act="rename" title="Átnevezés">✏</button></td>
        <td class="dt-c"><button class="btn-sm del" data-act="del" title="Törlés">🗑</button></td>
      </tr>`).join('')}</tbody></table>`;
  host.querySelectorAll('th[data-sort]').forEach(th => th.onclick = () => setHomeSort(th.dataset.sort));
  host.querySelectorAll('tr[data-i]').forEach(tr => {
    const { p, d } = filtered[+tr.dataset.i];
    tr.addEventListener('dragstart', e => {
      state._dragDoc = { projectId: p.id, docId: d.id, title: d.title };
      e.dataTransfer.effectAllowed = 'move';
      try { e.dataTransfer.setData('text/plain', d.title); } catch(err) {}
      tr.classList.add('dragging');
      document.getElementById('home-folders').classList.add('drag-active');
    });
    tr.addEventListener('dragend', () => {
      tr.classList.remove('dragging');
      document.getElementById('home-folders').classList.remove('drag-active');
      setTimeout(() => { state._dragDoc = null; }, 0);
    });
    tr.querySelectorAll('[data-act]').forEach(el => el.onclick = e => {
      e.preventDefault();
      const act = el.dataset.act;
      if (act === 'open') cloudLoadProject(p.id + '/' + d.id, p.id, d.id);
      else if (act === 'project') selectHomeFolder(p.id);
      else if (act === 'rename') renameDocInProject(p.id, d.id, d.title);
      else if (act === 'html') downloadDocHtml(p.id, d.id);
      else if (act === 'pdf') downloadDocPdf(p.id, d.id, d.title);
      else if (act === 'link') copyDocShareLink(p.id, d.id);
      else if (act === 'del') deleteDocInProject(p.id, d.id, d.title);
    });
  });
}

// Dokumentum áthelyezése másik projektbe (a táblázat sorának ráhúzásával egy mappára).
async function moveDocToProject(fromProjectId, docId, title, toProjectId) {
  const to = (state.homeProjects || []).find(p => p.id === toProjectId);
  toast(`➡️ „${title || docId}” áthelyezése ide: ${to ? to.name : toProjectId}...`, 'ok', 4000);
  const result = await cloudMoveDocument(fromProjectId, docId, toProjectId);
  if (!result.ok) {
    toast(result.reason === 'exists' ? 'A célprojektben már van ilyen azonosítójú dokumentum!' : '⚠ Áthelyezés sikertelen', 'err', 4000);
    return;
  }
  await forgetLocalCopy(fromProjectId + '/' + docId); // ha a régi helyéről meg volt nyitva
  toast('✓ Dokumentum áthelyezve');
  state.homeProjects = await cloudListTopProjects();
  syncHomeFolderMeta(true);
  renderHomeGrid();
}

// ── Új Projekt modal (szín/ikon választóval) ──
function renderSwatches() {
  const row = document.getElementById('ntp-color-row');
  if (!row) return;
  row.innerHTML = '';
  PROJECT_COLORS.forEach(c => {
    const sw = document.createElement('div');
    sw.className = 'swatch' + (c === state.ntpColor ? ' selected' : '');
    sw.style.background = c;
    sw.title = c;
    sw.onclick = () => { state.ntpColor = c; renderSwatches(); };
    row.appendChild(sw);
  });
}
function renderIconOptions() {
  const row = document.getElementById('ntp-icon-row');
  if (!row) return;
  row.innerHTML = '';
  PROJECT_ICONS.forEach(ic => {
    const opt = document.createElement('div');
    opt.className = 'icon-opt' + (ic === state.ntpIcon ? ' selected' : '');
    opt.textContent = ic;
    opt.onclick = () => { state.ntpIcon = ic; renderIconOptions(); };
    row.appendChild(opt);
  });
}
function openNewTopProjectModal() {
  state.editingProjectId = null;
  document.getElementById('ntp-modal-title').textContent = '➕ Új projekt';
  document.getElementById('ntp-submit-btn').textContent = 'Létrehozás';
  document.getElementById('ntp-name').value = '';
  document.getElementById('ntp-desc').value = '';
  state.ntpColor = PROJECT_COLORS[0];
  state.ntpIcon = PROJECT_ICONS[0];
  renderSwatches();
  renderIconOptions();
  document.getElementById('new-topproject-modal-backdrop').classList.add('open');
}
function openEditTopProjectModal(p) {
  state.editingProjectId = p.id;
  document.getElementById('ntp-modal-title').textContent = '✏ Projekt szerkesztése';
  document.getElementById('ntp-submit-btn').textContent = 'Mentés';
  document.getElementById('ntp-name').value = p.name || '';
  document.getElementById('ntp-desc').value = p.description || '';
  state.ntpColor = p.color || PROJECT_COLORS[0];
  state.ntpIcon = p.icon || PROJECT_ICONS[0];
  renderSwatches();
  renderIconOptions();
  document.getElementById('new-topproject-modal-backdrop').classList.add('open');
}
function closeNewTopProjectModal() {
  document.getElementById('new-topproject-modal-backdrop').classList.remove('open');
  state.editingProjectId = null;
}
async function saveTopProject() {
  const name = document.getElementById('ntp-name').value.trim();
  if (!name) { toast('Add meg a projekt nevét!', 'err'); return; }
  const desc = document.getElementById('ntp-desc').value.trim();

  if (state.editingProjectId) {
    const id = state.editingProjectId;
    const meta = { name, description: desc, color: state.ntpColor, icon: state.ntpIcon };
    toast('☁️ Mentés...', 'ok', 2000);
    const ok = await cloudUpload(id + '/_project.json', JSON.stringify(meta, null, 2), 'application/json');
    if (!ok) { toast('⚠ Mentés sikertelen', 'err'); return; }
    closeNewTopProjectModal();

    const entry = (state.homeProjects || []).find(p => p.id === id);
    if (entry) { entry.name = name; entry.description = desc; entry.color = state.ntpColor; entry.icon = state.ntpIcon; }
    if (state.currentTopProject === id) {
      state.currentTopProjectMeta = { ...(state.currentTopProjectMeta || {}), id, name, description: desc, color: state.ntpColor, icon: state.ntpIcon };
      updateBreadcrumb();
    }
    if (state.uiView === 'home') renderHomeGrid();
    toast('✓ Projekt frissítve');
    return;
  }

  // Új Projekt létrehozása
  const existing = state.homeProjects || (await cloudListTopProjects());
  let id = slugify(name) || ('projekt-' + Math.floor(Math.random() * 100000));
  if (existing.find(p => p.id === id)) id = id + '-' + Math.floor(Math.random() * 1000);

  const meta = { name, description: desc, color: state.ntpColor, icon: state.ntpIcon };
  toast('☁️ Projekt létrehozása...', 'ok', 2000);
  await cloudUpload(id + '/_project.json', JSON.stringify(meta, null, 2), 'application/json');

  closeNewTopProjectModal();
  toast('✓ Projekt létrehozva');
  state.homeProjects = null;
  await showProjectView(id);
}

// Egy (felhőben törölt / áthelyezett) Dokumentum eltávolítása a memóriából.
async function forgetLocalCopy(folderId) {
  unregisterProject(folderId);
}

async function deleteTopProjectFromHome(projectId, name) {
  if (!confirm('Törlöd a(z) "' + (name || projectId) + '" projektet?\nEz véglegesen törli az ÖSSZES benne lévő dokumentumot, fejezetet, CSS-t és beállítást a felhőből — ez nem vonható vissza.')) return;
  toast('🗑 Projekt törlése...', 'ok', 3000);
  await cloudDeleteAllUnder(projectId);

  // Minden, ebből a Projektből esetleg már betöltött Dokumentum eltávolítása a memóriából/IndexedDB-ből.
  for (const folderId of Object.keys(state.projects)) {
    if (state.projects[folderId].topProjectId === projectId) await forgetLocalCopy(folderId);
  }

  state.homeProjects = (state.homeProjects || []).filter(p => p.id !== projectId);
  if (getHomeFolder() === projectId) setHomeFolder(null);
  saveHomeCache(state.homeProjects);
  renderHomeGrid();
  toast('✓ Projekt törölve');
}

// ── Új Dokumentum modal (egy Projekten belül) ──
function openNewDocModal() {
  document.getElementById('nd-id').value = '';
  document.getElementById('nd-title').value = '';
  document.getElementById('new-doc-modal-backdrop').classList.add('open');
}
function closeNewDocModal() {
  document.getElementById('new-doc-modal-backdrop').classList.remove('open');
}
async function createDocInProject() {
  const projectId = state.currentTopProject;
  if (!projectId) return;
  const id = document.getElementById('nd-id').value.trim().replace(/\s+/g, '-');
  const title = document.getElementById('nd-title').value.trim();
  if (!id) { toast('Add meg a dokumentum azonosítóját!', 'err'); return; }
  const hp0 = (state.homeProjects || []).find(p => p.id === projectId);
  if (((hp0 && hp0.docs) || []).find(d => d.id === id)) { toast('Már létezik ilyen azonosítójú dokumentum ebben a projektben!', 'err'); return; }

  const config = { title: title || id, subtitle: title || id, description: '', lang: 'hu', output: id + '.html' };
  const starterRaw = '---\nid: bevezetes\ntitle: Bevezetés\n---\n\n# Bevezetés\n\n';

  toast('☁️ Létrehozás...', 'ok', 2000);
  await cloudUpload(projectId + '/' + id + '/config.json', JSON.stringify(config, null, 2), 'application/json');
  await cloudUpload(projectId + '/' + id + '/sections/01_bevezetes.md', starterRaw, 'text/markdown');

  closeNewDocModal();
  await cloudLoadProject(projectId + '/' + id, projectId, id);
}

// ── Dokumentum átnevezése / törlése egy Projekten belül ──
// Fontos: ezek a Projekt nézet dokumentum-kártyáiról hívódnak, ahol a dokumentum
// esetleg MÉG NINCS betöltve a szerkesztőbe (state.projects-ben) — ezért közvetlenül
// a Storage-ban lévő config.json-t olvassuk/írjuk, nem a memóriában lévő objektumot.
async function renameDocInProject(projectId, docId, currentTitle) {
  const newTitle = prompt('Új cím a dokumentumnak:', currentTitle || docId);
  if (!newTitle || !newTitle.trim() || newTitle.trim() === currentTitle) return;
  const trimmed = newTitle.trim();
  const folder = projectId + '/' + docId;

  const configText = await cloudDownloadText(folder + '/config.json');
  let config = {};
  if (configText) { try { config = JSON.parse(configText); } catch(e) {} }
  config.title = trimmed;
  const ok = await cloudUpload(folder + '/config.json', JSON.stringify(config, null, 2), 'application/json');
  if (!ok) { toast('⚠ Átnevezés sikertelen', 'err'); return; }

  // Ha ez a dokumentum épp meg van nyitva a szerkesztőben, ott is frissítjük.
  const openProj = state.projects[folder];
  if (openProj) {
    openProj.config.title = trimmed;
    if (state.currentProject === folder) updateBreadcrumb();
  }

  const hp = (state.homeProjects || []).find(p => p.id === projectId);
  const hd = hp && (hp.docs || []).find(x => x.id === docId);
  if (hd) hd.title = trimmed;
  refreshDocViews();
  toast('✓ Átnevezve');
}

async function deleteDocInProject(projectId, docId, title) {
  if (!confirm('Törlöd a(z) "' + (title || docId) + '" dokumentumot?\nEz véglegesen törli az összes fejezetét, a CSS-ét és a beállításait a felhőből — ez nem vonható vissza.')) return;
  toast('🗑 Törlés...', 'ok', 2500);
  const ok = await cloudDeleteDocument(projectId, docId);
  if (!ok) { toast('⚠ Törlés sikertelen', 'err'); return; }

  await forgetLocalCopy(projectId + '/' + docId);

  const hp2 = (state.homeProjects || []).find(p => p.id === projectId);
  if (hp2 && hp2.docs) { hp2.docs = hp2.docs.filter(d => d.id !== docId); hp2.docCount = hp2.docs.length; }
  refreshDocViews();
  toast('✓ Dokumentum törölve');
}

// ── Importálás: mappából vagy a böngészőben tárolt régi helyi projektből ──────
let _importFolderSource = null;
let _legacyProjects = [];

async function openImportModal() {
  _importFolderSource = null;
  document.getElementById('import-folder-input').value = '';
  document.getElementById('import-folder-info').textContent = 'Nincs kiválasztva mappa';
  document.getElementById('import-doc-id').value = '';
  document.getElementById('import-doc-title').value = '';
  setImportSource('folder');
  document.getElementById('import-modal-backdrop').classList.add('open');

  _legacyProjects = await listLegacyLocalProjects();
  const row = document.getElementById('import-legacy-option');
  const sel = document.getElementById('import-legacy-select');
  row.style.display = _legacyProjects.length ? '' : 'none';
  sel.innerHTML = '';
  _legacyProjects.forEach((p, i) => {
    const o = document.createElement('option');
    o.value = i; o.textContent = p.title + ' (' + Object.keys(p.files).length + ' fejezet)';
    sel.appendChild(o);
  });
}
function closeImportModal() {
  document.getElementById('import-modal-backdrop').classList.remove('open');
}
function setImportSource(kind) {
  document.querySelectorAll('input[name=import-source]').forEach(r => { r.checked = r.value === kind; });
  document.getElementById('import-folder-box').style.display = kind === 'folder' ? '' : 'none';
  document.getElementById('import-legacy-box').style.display = kind === 'legacy' ? '' : 'none';
  if (kind === 'legacy') onLegacySelected();
}
function onLegacySelected() {
  const p = _legacyProjects[document.getElementById('import-legacy-select').value];
  if (!p) return;
  if (!document.getElementById('import-doc-title').value) document.getElementById('import-doc-title').value = p.title;
  if (!document.getElementById('import-doc-id').value) document.getElementById('import-doc-id').value = slugify(p.name);
}
async function onImportFolderPicked(input) {
  if (!input.files.length) return;
  _importFolderSource = await readFolderSource(input.files);
  const n = Object.keys(_importFolderSource.files).length;
  const imgs = Object.keys(_importFolderSource.images).length;
  const root = input.files[0].webkitRelativePath.split('/')[0];
  document.getElementById('import-folder-info').textContent = n
    ? `${root}: ${n} fejezet${imgs ? ', ' + imgs + ' kép' : ''}`
    : `${root}: nem találtam fejezetet (sections/*.md)`;
  if (!document.getElementById('import-doc-title').value) document.getElementById('import-doc-title').value = _importFolderSource.config.title || root;
  if (!document.getElementById('import-doc-id').value) document.getElementById('import-doc-id').value = slugify(root);
}

async function runImport() {
  const projectId = state.currentTopProject;
  if (!projectId) return;
  const kind = (document.querySelector('input[name=import-source]:checked') || {}).value;
  let source = null;
  if (kind === 'legacy') source = _legacyProjects[document.getElementById('import-legacy-select').value];
  else source = _importFolderSource;
  if (!source || !Object.keys(source.files || {}).length) { toast('Válassz egy mappát (vagy régi projektet), amiben vannak fejezetek!', 'err'); return; }

  const docId = slugify(document.getElementById('import-doc-id').value.trim());
  const title = document.getElementById('import-doc-title').value.trim();
  if (!docId) { toast('Add meg a dokumentum azonosítóját!', 'err'); return; }
  if ((await cloudListDocuments(projectId)).find(d => d.id === docId)) { toast('Már létezik ilyen azonosítójú dokumentum ebben a projektben!', 'err'); return; }

  toast('☁️ Importálás folyamatban, ez eltarthat pár másodpercig...', 'ok', 8000);
  const ok = await importAsCloudDocument(projectId, docId, title, source);
  if (!ok) { toast('⚠ Az importálás nem sikerült teljesen', 'err', 5000); return; }
  closeImportModal();
  toast('✓ Importálva — megnyitás...', 'ok', 2500);
  await cloudLoadProject(projectId + '/' + docId, projectId, docId);
}

// ── Gyors dokumentumváltó (szerkesztő felső sávja) ──
// Egy lenyíló lista az összes projekt összes dokumentumával (projektenként csoportosítva).
// A listát a szerkesztőbe lépéskor a háttérben frissítjük a felhőből.
let _switcherLoading = null;
function renderDocSwitcher() {
  const sel = document.getElementById('doc-switcher');
  if (!sel) return;
  const proj = currentProj();
  const current = proj ? proj.cloudFolder : '';
  const projects = state.homeProjects || [];
  let html = '';
  let found = false;
  projects.forEach(p => {
    const docs = (p.docs || []).slice().sort((a, b) => (a.title || a.id).localeCompare(b.title || b.id, 'hu'));
    if (!docs.length) return;
    html += `<optgroup label="${escapeHtml((p.icon ? p.icon + ' ' : '') + p.name)}">`;
    docs.forEach(d => {
      const val = p.id + '/' + d.id;
      const isCur = val === current;
      if (isCur) found = true;
      const title = isCur && proj ? projectDisplayTitle(proj) : (d.title || d.id);
      html += `<option value="${escapeHtml(val)}"${isCur ? ' selected' : ''}>${escapeHtml(title)}</option>`;
    });
    html += '</optgroup>';
  });
  if (proj && !found) html = `<option value="${escapeHtml(current)}" selected>${escapeHtml(projectDisplayTitle(proj))}</option>` + html;
  if (!html) html = '<option value="">Betöltés...</option>';
  sel.innerHTML = html;
  sel.title = 'Váltás másik dokumentumra' + (proj ? ' — most: ' + projectDisplayTitle(proj) : '');
}

async function refreshDocSwitcher() {
  if (!state.homeProjects) { const c = readHomeCache(); if (c) state.homeProjects = c.projects; }
  renderDocSwitcher();
  if (_switcherLoading) return _switcherLoading;
  // Ha a lista friss (fél percen belül töltöttük), nem kérdezzük le újra.
  const c = readHomeCache();
  if (state.homeProjects && c && Date.now() - c.at < 30000) return;
  _switcherLoading = (async () => {
    try {
      const list = await cloudListTopProjects();
      if (list) state.homeProjects = list;
    } catch(e) {}
    _switcherLoading = null;
    renderDocSwitcher();
  })();
  return _switcherLoading;
}

async function onDocSwitcherChange(sel) {
  const val = sel.value;
  const proj = currentProj();
  if (!val || (proj && proj.cloudFolder === val)) return;
  const [projectId, docId] = val.split('/');
  sel.blur();
  await cloudLoadProject(val, projectId, docId);
}
