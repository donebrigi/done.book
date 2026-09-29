// ── Build: a végleges, önálló HTML ───────────────────────────────────────────
//
// Nincs külön „legenerált” / publikált változat: a kész HTML-t mindig a felhőben lévő
// aktuális fejezetekből állítjuk össze, amikor kell (letöltés, PDF, megosztott link,
// ⬇ HTML a listákban). Így mindig naprakész, nem kell kézzel újragenerálni.

// Egy dokumentum betöltése exportáláshoz (a szerkesztő állapotát nem érinti).
// Ha éppen ez van megnyitva, a memóriában lévő (legfrissebb) változatot használjuk.
async function loadDocForExport(projectId, docId) {
  const folder = projectId + '/' + docId;
  const open = currentProj();
  if (open && open.cloudFolder === folder) {
    if (hasUnsavedWork()) await saveAllDirty({ quiet: true });
    return open;
  }
  const data = await cloudFetchDocument(folder);
  if (!data || (!data.configText && !Object.keys(data.files || {}).length)) return null;
  const proj = { name: folder, cloudFolder: folder, topProjectId: projectId, docId,
    config: data.config || {}, files: {}, fileOrder: [] };
  proj.themeVars = await resolveDocTheme(projectId, data.css);
  proj.logo = await resolveDocLogo(projectId, data.logo);
  for (const [fn, raw] of Object.entries(data.files)) {
    const f = makeFileEntry(raw);
    ensureChapterMeta(fn, f);
    proj.files[fn] = f;
  }
  normalizeStructure(proj);
  return proj;
}

// A kész, önálló HTML (képek beágyazva).
async function buildDocHtml(proj) {
  const html = buildPreviewHtml(proj, buildAllSectionsHtml(proj), true);
  return resolveImagesBuild(html, proj);
}

function docFileName(proj) {
  return proj.config.output || ((slugify(projectDisplayTitle(proj)) || proj.docId) + '.html');
}

// Szerkesztőből: a megnyitott dokumentum letöltése.
async function buildAndDownload() {
  const proj = currentProj();
  if (!proj) { toast('Nincs megnyitott dokumentum!', 'err'); return; }
  await saveAllDirty({ quiet: true });
  toast('⚙ HTML összeállítása...', 'ok', 3000);
  const html = await buildDocHtml(proj);
  downloadText(html, docFileName(proj), 'text/html');
  toast(`✓ HTML letöltve (${Math.round(html.length / 1024)} KB)`, 'ok', 3000);
}

// Listákból / kártyákról: bármelyik dokumentum letöltése, a szerkesztő megnyitása nélkül.
async function downloadDocHtml(projectId, docId) {
  toast('⚙ HTML összeállítása...', 'ok', 3000);
  const proj = await loadDocForExport(projectId, docId);
  if (!proj) { toast('⚠ A dokumentum nem tölthető be.', 'err'); return; }
  const html = await buildDocHtml(proj);
  downloadText(html, docFileName(proj), 'text/html');
  toast(`✓ HTML letöltve (${Math.round(html.length / 1024)} KB)`, 'ok', 3000);
}

// ── Nyomtatás / PDF ──────────────────────────────────────────────────────────
// A teljes kézikönyvet egy új lapon nyitja meg, és elindítja a nyomtatást — itt a
// "Mentés PDF-ként" célt választva PDF készíthető.
async function printDocument() {
  const proj = currentProj();
  if (!proj) return;
  await printDoc(proj.topProjectId, proj.docId);
}

async function printDoc(projectId, docId) {
  // Az új lapot azonnal (a kattintásra) nyitjuk meg, különben a böngésző blokkolná.
  const win = window.open('', '_blank');
  if (!win) { toast('A böngésző blokkolta az új lapot — engedélyezd a felugró ablakokat.', 'err', 5000); return; }
  win.document.write('<p style="font-family:sans-serif;padding:40px">Nyomtatási nézet előkészítése…</p>');
  const proj = await loadDocForExport(projectId, docId);
  if (!proj) { win.close(); toast('⚠ A dokumentum nem tölthető be.', 'err'); return; }
  const html = await buildDocHtml(proj);
  win.document.open(); win.document.write(html); win.document.close();
  // Megvárjuk a képeket, a betűtípusokat és az ikonokat, mielőtt a nyomtatás elindul.
  const imgs = [...win.document.images].filter(i => !i.complete).map(i => new Promise(r => { i.onload = i.onerror = r; }));
  await Promise.race([Promise.all(imgs), new Promise(r => setTimeout(r, 4000))]);
  try { await Promise.race([win.document.fonts.ready, new Promise(r => setTimeout(r, 3000))]); } catch(e) {}
  // Ebben a nyomtatási lapon a lenyíló elemek eleve nyitva vannak (a letöltött HTML-ben ezt
  // a beágyazott PRINT_JS intézi nyomtatáskor).
  win.document.querySelectorAll('details').forEach(d => { d.open = true; });
  win.document.title = projectDisplayTitle(proj);
  setTimeout(() => { win.focus(); win.print(); }, 700);
}

// ── Markdown + képek egy ZIP-ben (mentés / archiválás / visszaimportálás) ──────
// Szerkezete megegyezik a Dokumentum felhőbeli mappájával, így a kicsomagolt mappa
// a Projekt nézet "📤 Importálás" gombjával újra betölthető.
async function downloadMarkdownZip() {
  const proj = currentProj();
  if (!proj) return;
  await saveAllDirty({ quiet: true });
  toast('📦 ZIP összeállítása...', 'ok', 4000);
  const zip = new CM.JSZip();
  const root = zip.folder(slugify(projectDisplayTitle(proj)) || proj.docId);
  const imagePaths = new Set();
  for (const fn of proj.fileOrder) {
    const f = proj.files[fn];
    rebuildRaw(f);
    root.file('sections/' + fn, f.raw);
    (f.raw.match(IMAGE_REF_RE) || []).forEach(p => imagePaths.add(p));
  }
  for (const p of imagePaths) {
    const blob = await getImageBlob(proj, p);
    if (blob) root.file(p, blob);
  }
  root.file('config.json', serializeConfig(proj));
  root.file('style.css', getWorkingCss(proj)); // tájékoztató: a projekt témájából összeállított CSS
  if (proj.logo) root.file('logo.txt', proj.logo);
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = (slugify(projectDisplayTitle(proj)) || proj.docId) + '-markdown.zip';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
  toast(`✓ ZIP letöltve (${proj.fileOrder.length} fejezet, ${imagePaths.size} kép)`);
}

