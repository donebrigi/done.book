// ── PDF letöltés (valódi PDF fájl, nyomtatóablak nélkül) ─────────────────────
//
// A kész HTML-t (buildDocHtml) egy láthatatlan keretben A4 szélességben megjelenítjük,
// majd a html2pdf.js (vendor/html2pdf.bundle.min.js — ingyenes, MIT licenc, helyben tárolva)
// fejezetenként képpé alakítja és PDF oldalakra tördeli. Minden fejezet új oldalon kezdődik.
//
// Mentés: ahol a böngésző tudja (Chrome, Edge), előbb megkérdezzük, HOVA mentse a fájlt,
// és utána készül el a PDF. Máshol (pl. Firefox, Safari) sima letöltésként érkezik.
//
// Korlát: a PDF oldalai képek — a szöveg nem jelölhető ki / nem kereshető benne. Kereshető
// PDF-hez a Letöltés menü 🖨 Nyomtatás lehetősége való („Mentés PDF-ként”).

const PDF_LIB_URL = 'vendor/html2pdf.bundle.min.js';
const PDF_PAGE_WIDTH_PX = 703; // A4 (210 mm) − 2 × 12 mm margó, 96 dpi-n

// A PDF nézet saját CSS-e: menü és kereső nélkül, fehér háttéren, kártyakeretek nélkül.
const PDF_CSS = `
html,body{background:#fff!important;scroll-behavior:auto!important}
aside,.doc-searchbar{display:none!important}
.wrap{display:block!important;max-width:none!important;padding:0!important;margin:0!important}
main{width:${PDF_PAGE_WIDTH_PX}px;display:block}
.hero,.section{box-shadow:none!important;border:none!important;border-radius:0!important;padding:0!important;margin:0!important}
.made-by-bar{margin:0 0 5mm!important;padding:0 0 2.5mm!important;background:none!important;border-radius:0!important}
.print-toc{display:block!important}
.print-toc h1{font-family:var(--font-head);font-size:22px;margin:0 0 14px;color:var(--text)}
.print-toc ol{padding-left:18px;margin:0}
.print-toc li{margin:4px 0;font-size:13px}
.print-toc .toc-group{font-weight:700;margin-top:10px;list-style:none;margin-left:-18px}
.acc-item>summary::after{display:none}
`;

let _pdfLibPromise = null;

function pdfFileName(title, docId) {
  return (slugify(title || '') || docId || 'kezikonyv') + '.pdf';
}

// Mentési hely bekérése (ha a böngésző támogatja). null = sima letöltés; false = megszakítva.
async function askPdfSaveTarget(suggestedName) {
  if (!window.showSaveFilePicker) return null;
  try {
    return await window.showSaveFilePicker({
      suggestedName,
      types: [{ description: 'PDF dokumentum', accept: { 'application/pdf': ['.pdf'] } }],
    });
  } catch (e) {
    if (e && e.name === 'AbortError') return false; // a felhasználó a Mégse gombot választotta
    return null;
  }
}

// Egy dokumentum PDF-je. A címet a hívó adja (a mentési ablak javasolt fájlnevéhez).
async function downloadDocPdf(projectId, docId, title) {
  if (state._pdfBusy) { toast('Már készül egy PDF — várd meg, amíg elkészül.', 'err'); return; }
  const suggested = pdfFileName(title, docId);
  const target = await askPdfSaveTarget(suggested); // a kattintás után azonnal kell kérdezni
  if (target === false) return;
  state._pdfBusy = true;
  toast('📄 PDF készítése… (hosszabb dokumentumnál ez akár fél percig is tarthat)', 'ok', 60000);
  try {
    const proj = await loadDocForExport(projectId, docId);
    if (!proj) { toast('⚠ A dokumentum nem tölthető be.', 'err'); return; }
    const html = await buildDocHtml(proj);
    const blob = await renderHtmlToPdf(html);
    if (target) {
      const w = await target.createWritable();
      await w.write(blob);
      await w.close();
      toast(`✓ PDF mentve: ${target.name} (${Math.round(blob.size / 1024)} KB)`, 'ok', 4000);
    } else {
      downloadBlob(blob, pdfFileName(projectDisplayTitle(proj), docId));
      toast(`✓ PDF letöltve (${Math.round(blob.size / 1024)} KB)`, 'ok', 4000);
    }
  } catch (e) {
    console.error('PDF hiba:', e);
    toast('⚠ A PDF elkészítése nem sikerült. A Letöltés menü 🖨 Nyomtatás lehetőségével („Mentés PDF-ként”) is készíthetsz PDF-et.', 'err', 8000);
  } finally {
    state._pdfBusy = false;
  }
}

// A szerkesztőben megnyitott dokumentum PDF-je.
async function downloadCurrentPdf() {
  const proj = currentProj();
  if (!proj) return;
  await downloadDocPdf(proj.topProjectId, proj.docId, projectDisplayTitle(proj));
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// HTML → PDF Blob egy láthatatlan, A4 széles keretben.
async function renderHtmlToPdf(html) {
  const libUrl = new URL(PDF_LIB_URL, location.href).href;
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = `position:fixed;left:-10000px;top:0;width:${PDF_PAGE_WIDTH_PX + 40}px;height:1200px;border:0;visibility:hidden`;
  const doc = html
    .replace('</head>', `<style>${PDF_CSS}</style></head>`)
    .replace('</body>', `<script src="${libUrl}"><\/script></body>`);
  document.body.appendChild(frame);
  try {
    await new Promise((res, rej) => {
      frame.onload = res;
      frame.onerror = rej;
      frame.srcdoc = doc;
    });
    const win = frame.contentWindow, d = win.document;
    // a könyvtár betöltése (egyszer tölt le, utána a böngésző gyorsítótárából jön)
    await waitFor(() => win.html2pdf, 20000, 'A PDF-készítő nem töltődött be.');
    // lenyíló elemek nyitva, képek, betűk és ikonok betöltve
    d.querySelectorAll('details').forEach(x => { x.open = true; });
    const imgs = [...d.images].filter(i => !i.complete).map(i => new Promise(r => { i.onload = i.onerror = r; }));
    await Promise.race([Promise.all(imgs), sleep(8000)]);
    try { await Promise.race([d.fonts.ready, sleep(4000)]); } catch (e) { /* nem baj */ }
    await waitFor(() => ![...d.querySelectorAll('.mdi[data-icon]')].some(s => !s.childNodes.length), 4000).catch(() => {});

    // A html2pdf a kiválasztott elemet egy saját tárolóba másolja — a „main h2” stílusú
    // szabályok miatt minden részt egy saját <main> elembe csomagolunk, és azt adjuk át.
    const parts = [...d.querySelectorAll('main > .print-toc, main > .hero, main > .section')].map(el => {
      const m = d.createElement('main');
      el.parentNode.insertBefore(m, el);
      m.appendChild(el);
      return m;
    });
    if (!parts.length) throw new Error('Üres dokumentum');
    const opt = {
      margin: [12, 12, 12, 12],
      image: { type: 'jpeg', quality: 0.92 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: PDF_PAGE_WIDTH_PX, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], avoid: ['img', 'figure', '.callout', 'tr', 'pre', '.acc-item', '.made-by-bar'] },
    };
    // Fejezetenként külön kép (így hosszú dokumentumnál sem lesz túl nagy a vászon),
    // mindegyik új oldalon kezdődik.
    // A beállításokat a keret saját „világában” hozzuk létre (a könyvtár Array-ellenőrzése
    // a szülőoldal tömbjeit nem ismeri fel).
    const frameOpt = win.JSON.parse(JSON.stringify(opt));
    let worker = win.html2pdf().set(frameOpt).from(parts[0]).toPdf();
    parts.slice(1).forEach(el => {
      worker = worker.get('pdf').then(pdf => { pdf.addPage(); }).from(el).toContainer().toCanvas().toPdf();
    });
    return await worker.outputPdf('blob');
  } finally {
    frame.remove();
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
async function waitFor(fn, timeoutMs, errMsg) {
  const t0 = Date.now();
  while (!fn()) {
    if (Date.now() - t0 > timeoutMs) throw new Error(errMsg || 'Időtúllépés');
    await sleep(100);
  }
}
