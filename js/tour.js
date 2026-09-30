// ── Interaktív bemutató (végigvezetés a felületen) ───────────────────────────
//
// Buborékok lépésről lépésre mutatják meg a felület részeit; a háttér elsötétül, csak
// az éppen magyarázott rész világít. Könyvtár: driver.js (MIT, vendor/driver.js.iife.js).
//
//  • Első alkalommal magától indul (nézetenként egyszer — a böngésző megjegyzi).
//  • Bármikor újraindítható: profil menü → ❓ Bemutató.
//  • Ha egy lépés eleme épp nem látszik (pl. még nincs dokumentum), a lépés kimarad.
//
// Új bemutató (pl. a szerkesztőhöz) = egy új bejegyzés a TOURS objektumban.
// Ha a felület változik, a lépések szövegét / választóit itt kell frissíteni.

const TOUR_SEEN_KEY = 'kk:tourSeen:';

const TOURS = {
  home: () => [
    { popover: { title: 'Üdv a DONE.bookban! 👋', description: 'Egy rövid, kb. egyperces kör a Kezdőlapon. A <b>Tovább</b> gombbal (vagy a → billentyűvel) léphetsz, az <b>Esc</b>-kel bármikor kiléphetsz.' } },
    { element: '#home-folders', popover: { title: 'Projektek', description: 'Bal oldalt a projektek, mint mappák, ábécérendben. Egy projekt egy ügyfél vagy termék — a hozzá tartozó kézikönyvek (dokumentumok) színei és logója közösek.', side: 'right', align: 'start' } },
    { element: '.hf-item.hf-all', popover: { title: 'Összes dokumentum', description: 'Minden projekt minden dokumentuma egy helyen. Egy projektre kattintva csak az ő dokumentumai látszanak.', side: 'right' } },
    { element: '.hs-head .btn-sm', popover: { title: 'Új projekt', description: 'Itt hozol létre új projektet: név, rövid leírás, ikon és szín.', side: 'bottom' } },
    { element: '#home-header', popover: { title: 'A projekt fejléce', description: 'Ha egy projekt ki van választva, itt látszik a leírása és a legfontosabb adatai — és a gombjai: <b>🎨 Megjelenés</b> (színek, logó), <b>✏</b> szerkesztés, <b>📤</b> importálás, <b>🗑</b> törlés és <b>+ Új dokumentum</b>.', side: 'bottom' } },
    { element: '.doc-table thead', popover: { title: 'A dokumentumok táblázata', description: 'A <b>Cím</b> vagy a <b>Dátum</b> fejlécére kattintva rendezhetsz; újabb kattintással megfordul a sorrend.', side: 'bottom' } },
    { element: '.doc-table tbody tr', popover: { title: 'Egy dokumentum', description: 'A címére vagy a <b>Megnyitás</b> gombra kattintva nyílik meg a szerkesztőben. <b>⬇ PDF</b> és <b>⬇ HTML</b>: a kész kézikönyv letöltése, <b>🔗</b>: megnyitás új lapon + a link a vágólapra kerül, <b>✏</b> átnevezés, <b>🗑</b> törlés.<br><br>💡 A sort megfogva és egy bal oldali projektre <b>húzva</b> áthelyezheted a dokumentumot.', side: 'top' } },
    { element: '#home-search', popover: { title: 'Keresés', description: 'Cím vagy projektnév szerint szűri a táblázatot.', side: 'bottom' } },
    { element: '.profile-menu-wrap', popover: { title: 'A fiókod', description: 'Itt módosíthatod a jelszavad, itt lépsz ki — és itt indíthatod újra ezt a bemutatót (<b>❓ Bemutató</b>).', side: 'left', align: 'start' } },
    { popover: { title: 'Kész is! 🎉', description: 'Nyiss meg egy dokumentumot, vagy hozz létre egy újat a projekt fejlécének <b>+ Új dokumentum</b> gombjával. Részletes leírás a <b>DONE.book felhasználói útmutatóban</b>.' } },
  ],
};

function tourAvailable(name) { return !!TOURS[name] && !!(window.driver && window.driver.js && window.driver.js.driver); }

function startTour(name) {
  if (!tourAvailable(name) || tourBlocked()) return false;
  if (state._tourActive) return true;
  // Csak azok a lépések, amelyeknek az eleme most látszik (vagy nincs eleme).
  const steps = TOURS[name]().filter(s => !s.element || isTourTargetVisible(s.element));
  if (!steps.length) return false;
  try { localStorage.setItem(TOUR_SEEN_KEY + name, '1'); } catch(e) {}
  state._tourActive = true;
  const d = window.driver.js.driver({
    steps,
    showProgress: true,
    progressText: '{{current}} / {{total}}',
    nextBtnText: 'Tovább →',
    prevBtnText: '← Vissza',
    doneBtnText: 'Kész',
    popoverClass: 'kk-tour',
    stagePadding: 6,
    stageRadius: 10,
    overlayOpacity: 0.6,
    smoothScroll: true,
    onDestroyed: () => { state._tourActive = false; },
  });
  d.drive();
  return true;
}

// Bejelentkezés előtt, betöltés közben és megosztott kézikönyvnél nincs bemutató.
function tourBlocked() {
  const gate = document.getElementById('auth-gate');
  const cover = document.getElementById('boot-cover');
  return !state.isAuthed
    || (gate && !gate.classList.contains('hidden'))
    || (cover && !cover.classList.contains('hidden'))
    || !!parseSharedViewHash();
}

function isTourTargetVisible(sel) {
  const el = document.querySelector(sel);
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

// Első alkalommal magától indul (ha még nem látta ebben a böngészőben).
function maybeAutoTour(name) {
  let seen = false;
  try { seen = localStorage.getItem(TOUR_SEEN_KEY + name) === '1'; } catch(e) {}
  if (seen || state._tourActive || !tourAvailable(name)) return;
  setTimeout(() => {
    if (tourBlocked()) return;
    if (state.uiView === name && !document.querySelector('.hp-modal-backdrop.open')) startTour(name);
  }, 700);
}

// Profil menü → ❓ Bemutató: az aktuális nézet bemutatója (ha ahhoz még nincs, a Kezdőlapé).
async function startTourForCurrentView() {
  if (typeof closeProfileMenu === 'function') closeProfileMenu();
  if (TOURS[state.uiView]) { startTour(state.uiView); return; }
  toast('Ehhez a nézethez még nincs bemutató — a Kezdőlap bemutatója indul.', 'ok', 3000);
  await showHomeView();
  setTimeout(() => startTour('home'), 400);
}
