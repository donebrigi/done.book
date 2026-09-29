// ── Projekt-szintű megjelenés (téma) ─────────────────────────────────────────
//
// A megjelenést nem dokumentumonként, hanem PROJEKTENKÉNT állítjuk: egy projekt minden
// dokumentuma ugyanazt a témát kapja. Tárolás: {projektId}/_theme.json  →  { version, vars }
//
// Állítható (4.7 óta) CSAK három szín (+ a logó, lásd themeview.js):
//   • elsődleges:  menü, ikonok, kiemelt doboz, Címsor 1 és Címsor 3, felsorolásjelek
//   • másodlagos:  Címsor 2 és a linkek
//   • harmadlagos: az oldal és a kártyák háttere
// Kódból rögzített (minden projektben egységes):
//   • betűtípus: Inter (szöveg) + Lexend (címsorok)
//   • címsorok: Címsor 1–3 (# ## ###) = 32 / 28 / 24 px (a régi ####, ##### Címsor 3 lesz)
//   • sarkok 14 px, bekezdés 16 px, ikonok 20 px
//   • szöveg #1a1a1a, másodlagos szöveg #6b7280, szegélyek #e2e5ea

const THEME_FIXED = {
  font: `'Inter',ui-sans-serif,system-ui,sans-serif`,
  head: `'Lexend',ui-sans-serif,system-ui,sans-serif`,
  google: 'family=Inter:wght@400;500;600;700&family=Lexend:wght@500;600;700',
  radius: '14px',
  // Címsor 1–3 = a szerkesztőben #, ##, ### → HTML h2, h3, h4
  headingSizes: [32, 28, 24],
  text: '#1a1a1a',
  muted: '#6b7280',
  border: '#e2e5ea',
};
const THEME_TEXT_SIZE = 16;
const THEME_ICON = { size: 20, stroke: 2 };

// Alapértelmezett színek (ha a projektben nincs beállítva semmi).
const THEME_DEFAULTS = { primary: '#f63900', secondary: '#f63900', tertiary: '#ffffff' };

// A beállító felület mezői.
const THEME_FIELDS = [
  { key: 'primary', label: 'Elsődleges szín', hint: 'menü, ikonok, kiemelt doboz, Címsor 1 és 3' },
  { key: 'secondary', label: 'Másodlagos szín', hint: 'Címsor 2, linkek' },
  { key: 'tertiary', label: 'Harmadlagos szín', hint: 'az oldal és a kártyák háttere' },
];

const isHexColor = v => /^#[0-9a-fA-F]{6}$/.test(v || '');

// A tárolt értékek egységesítése. A régi (4.6 előtti) témákat is átveszi:
// kiemelő szín → elsődleges; a régi „Címsor 2” színe (vagy a kiemelő) → másodlagos;
// a régi kártyaháttér → harmadlagos.
function normalizeThemeVars(v) {
  v = v || {};
  const pick = (...xs) => xs.find(isHexColor);
  const primary = pick(v.primary, v.accent) || THEME_DEFAULTS.primary;
  return {
    primary,
    secondary: pick(v.secondary, v.h2Color, v.accent) || (v.primary || v.accent ? primary : THEME_DEFAULTS.secondary),
    tertiary: pick(v.tertiary, v.card) || THEME_DEFAULTS.tertiary,
  };
}

// A téma CSS-e: alap CSS + rögzített tipográfia + a projekt színei.
function composeThemeCss(varsIn) {
  const v = normalizeThemeVars(varsIn);
  const P = v.primary, S = v.secondary, T = v.tertiary, F = THEME_FIXED;
  const hs = F.headingSizes;
  const calloutGrad = `linear-gradient(135deg,color-mix(in srgb, ${P} 35%, ${T}) 0%,color-mix(in srgb, ${P} 12%, ${T}) 55%,${T} 100%)`;
  const ic = THEME_ICON;
  return getDefaultCSS() + `
/* ── Rögzített tipográfia (kódból, minden projektben azonos) ── */
:root{--font:${F.font};--font-head:${F.head};--radius:${F.radius}}
main h2,main h3,main h4{font-family:var(--font-head);line-height:1.25;letter-spacing:-0.01em}
main h2{font-size:${hs[0]}px;margin:0 0 14px}
main h3{font-size:${hs[1]}px}
main h4{font-size:${hs[2]}px}
main p,main ul,main ol{font-size:${THEME_TEXT_SIZE}px}
/* ── Projekt téma: elsődleges ${P}, másodlagos ${S}, harmadlagos ${T} ── */
:root{
  --bg:${T};--bg-elev:${T};--bg-card:${T};--text:${F.text};--muted:${F.muted};--border:${F.border};
  --accent:${P};--brand-pink-deep:${P};--brand-pink:color-mix(in srgb, ${P} 75%, white);
  --accent-soft:color-mix(in srgb, ${P} 12%, ${T});
  --callout-bg:${calloutGrad};--callout-text:${F.text};--callout-border:${P};
  --icon-color:${P};--icon-stroke-width:${ic.stroke};--icon-width:${ic.size}px;--icon-height:${ic.size}px;
}
.callout{background:${calloutGrad};color:${F.text};border-left-color:${P}}
main h2{color:${P}}
main h3{color:${S}}
main h4{color:${P}}
a{color:${S}}
a:hover{color:color-mix(in srgb, ${S} 75%, black)}
nav a,nav a:hover{color:var(--text)}
.brand h1{color:${P}}
.brand-logo{display:flex;align-items:center;gap:12px}
.brand-logo h1{margin:0;min-width:0;overflow-wrap:anywhere}
.brand-img{max-height:40px;max-width:40%;width:auto;display:block;flex-shrink:0}
.mdi svg{width:${ic.size}px;height:${ic.size}px;stroke:${P};stroke-width:${ic.stroke};color:${P}}
` + MADE_BY_CSS;
}

function themeFontLinkTag() {
  return `<link href="https://fonts.googleapis.com/css2?${THEME_FIXED.google}&display=swap" rel="stylesheet"/>`;
}

// ── „Made by DONE” sáv minden fejezet tetején (kódból, nem szerkeszthető) ─────
// A logó betűi a szöveg színét veszik fel (currentColor), a narancs négyzet fix.
const DONE_LOGO_SVG = '<svg class="made-by-logo" viewBox="0 0 660 154" role="img" aria-label="DONE" xmlns="http://www.w3.org/2000/svg">'
  + '<path fill="currentColor" d="M0 2.77422H57.1357C109.978 2.77422 140.626 33.1585 140.626 75.7626V76.2249C140.626 118.829 109.582 150.534 56.277 150.534H0V2.77422ZM57.6641 114.205C82.2357 114.205 98.4847 100.73 98.4847 76.9515V76.4891C98.4847 52.8422 82.1697 39.2353 57.6641 39.2353H41.0188V114.337H57.6641V114.205Z"/>'
  + '<path fill="currentColor" d="M153.176 77.0836V76.7533C153.176 34.4135 187.392 0 233.1 0C278.809 0 312.562 33.8851 312.562 76.2249V76.5552C312.562 118.895 278.346 153.309 232.638 153.309C187.061 153.441 153.176 119.423 153.176 77.0836ZM270.684 77.0836V76.7533C270.684 55.4843 255.36 36.9235 232.638 36.9235C210.312 36.9235 195.318 55.022 195.318 76.357V76.6873C195.318 97.9563 210.774 116.517 233.1 116.517C255.69 116.517 270.684 98.4187 270.684 77.0836Z"/>'
  + '<path fill="currentColor" d="M328.348 2.77422H366.593L427.428 80.9147V2.77422H468.05V150.402H432.117L368.971 69.5536V150.6H328.348V2.77422Z"/>'
  + '<path fill="currentColor" d="M487.139 2.77422H606.166V37.6501H527.63V59.9099H598.57V92.2097H527.63V115.592H606.034V150.402H487.139V2.77422Z"/>'
  + '<path fill="#E63E18" d="M659.999 115.592H625.124V150.402H659.999V115.592Z"/>'
  + '</svg>';

function madeByBarHtml(proj) {
  const docName = escapeHtml((proj && proj.config && proj.config.title) || '');
  return `<div class="made-by-bar"><span class="made-by-doc">${docName}</span><span class="made-by">Made by ${DONE_LOGO_SVG}</span></div>`;
}

const MADE_BY_CSS = `
/* ── Made by DONE sáv ── */
.made-by-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:-18px -18px 16px;padding:9px 18px;border-bottom:1px solid var(--border);background:color-mix(in srgb,var(--muted) 5%,var(--bg-card));border-radius:var(--radius) var(--radius) 0 0;font-family:var(--font);user-select:none}
.made-by-doc{font-size:12px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.made-by{display:inline-flex;align-items:center;gap:7px;font-size:12px;color:var(--muted);white-space:nowrap;flex-shrink:0}
.made-by-logo{height:13px;width:auto;display:block;color:var(--text)}
@media print{
  .made-by-bar{margin:0 0 5mm!important;padding:0 0 2.5mm!important;background:none!important;border-radius:0!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
`;

// ── Régi, dokumentumonkénti megjelenés átvétele ──────────────────────────────
// A korábbi verziók a színeket a dokumentum style.css-ébe írták (@kezikonyv-design blokk).
// Ha a projektnek még nincs témája, ebből indulunk, hogy a meglévő kinézet ne vesszen el.
function themeVarsFromLegacyCss(cssText) {
  const m = (cssText || '').match(/\/\*\s*@kezikonyv-design-start[^*]*\*\/[\s\S]*?\/\*\s*@kezikonyv-design-end\s*\*\//);
  if (!m) return null;
  const grab = name => { const mm = m[0].match(new RegExp('--' + name + '\\s*:\\s*([^;]+);')); return mm ? mm[1].trim() : null; };
  const out = { accent: grab('accent'), card: grab('bg-card'), h2Color: grab('h3-color') };
  return normalizeThemeVars(out);
}

// ── Felhő ──
async function cloudGetProjectTheme(projectId) {
  if (!projectId) return null;
  const txt = await cloudDownloadText(projectId + '/_theme.json');
  if (!txt) return null;
  try { return normalizeThemeVars(JSON.parse(txt).vars); } catch(e) { return null; }
}
async function cloudSaveProjectTheme(projectId, vars) {
  return cloudUpload(projectId + '/_theme.json', JSON.stringify({ version: 1, vars: normalizeThemeVars(vars) }, null, 2), 'application/json');
}

// ── Projekt logó ── {projektId}/_logo.txt (data URL; üres fájl = szándékosan nincs logó)
// null = a projektnek még nincs saját logója (ilyenkor a dokumentum régi logo.txt-je él tovább).
async function cloudGetProjectLogo(projectId) {
  if (!projectId) return null;
  const txt = await cloudDownloadText(projectId + '/_logo.txt');
  return txt == null ? null : txt.trim();
}
async function cloudSaveProjectLogo(projectId, logo) {
  return cloudUpload(projectId + '/_logo.txt', logo || '', 'text/plain');
}
async function resolveDocLogo(topProjectId, docLogo) {
  const p = await cloudGetProjectLogo(topProjectId);
  return p != null ? p : (docLogo || '');
}

// Egy dokumentum tényleges témája: projekt téma → (ha nincs) a dokumentum régi színei → alap.
async function resolveDocTheme(topProjectId, legacyCss) {
  return (await cloudGetProjectTheme(topProjectId)) || themeVarsFromLegacyCss(legacyCss) || normalizeThemeVars({});
}

// Az előnézet és a build ezt használja.
function getWorkingCss(proj) {
  return composeThemeCss(proj && proj.themeVars);
}
