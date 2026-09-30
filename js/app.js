// ── Panel resize ──────────────────────────────────────────────────────────────
(function() {
  const handle = document.getElementById('resize-handle');
  const editorPane = document.getElementById('editor-pane');
  const previewPane = document.getElementById('preview-pane');
  const mainEl = document.getElementById('main');
  let isResizing = false, startX = 0, startW = 0;

  handle.addEventListener('mousedown', e => {
    isResizing = true;
    startX = e.clientX;
    startW = editorPane.getBoundingClientRect().width;
    handle.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!isResizing) return;
    const dx = e.clientX - startX;
    const mainW = mainEl.getBoundingClientRect().width;
    const newW = Math.max(200, Math.min(mainW - 200, startW + dx));
    editorPane.style.width = newW + 'px';
    editorPane.style.minWidth = newW + 'px';
    editorPane.style.maxWidth = newW + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!isResizing) return;
    isResizing = false;
    handle.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });
})();

// ── Indítás ───────────────────────────────────────────────────────────────────
//  • megosztott #view/… link → a publikált kézikönyv
//  • az utoljára megnyitott Dokumentum → újra megnyílik (frissen a felhőből)
//  • egyébként a Kezdőlap
// Az állapotfeliratra kattintva ütközésnél újra megnyílik a döntési ablak.
document.getElementById('status').addEventListener('click', () => { reopenPendingConflicts(); });

async function initApp() {
  if (!window.CM) {
    document.body.innerHTML = '<p style="padding:40px;color:#fff;font-family:sans-serif">A szerkesztő komponens (vendor/codemirror.bundle.js) nem töltődött be — ellenőrizd, hogy a vendor mappa is fel van-e töltve.</p>';
    return;
  }
  initEditor();
  initImageEditorEvents();
  const session = await cloudCheckSession();
  state.booting = false;

  // Bejelentkezés nélkül: csak a belépő ablak látszik; a navigáció a belépés után
  // történik (lásd onLoggedIn) — addig nem töltünk és nem rajzolunk semmit.
  if (!session) {
    const lastDoc = readLastDoc();
    if (lastDoc && lastDoc.cloudFolder && !parseSharedViewHash()) state.pendingCloudResume = lastDoc;
    return;
  }

  const shared = parseSharedViewHash();
  if (shared) { openSharedView(shared.projectId, shared.docId); return; }

  const last = readLastDoc();
  if (last && last.cloudFolder) {
    try {
      // Ha közben törölték / áthelyezték, a Kezdőlapra megyünk.
      if (await cloudDownloadText(last.cloudFolder + '/config.json')) {
        await cloudLoadProject(last.cloudFolder, last.topProjectId, last.docId);
        return;
      }
    } catch(e) { console.error('Az utolsó dokumentum megnyitása nem sikerült:', e); }
    forgetLastDoc();
  }
  showHomeView();
}

initApp();
