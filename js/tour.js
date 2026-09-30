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
    { popover: { title: 'Kész is! 🎉', description: 'Nyiss meg egy dokumentumot, vagy hozz létre egy újat a projekt fejlécének <b>+ Új dokumentum</b> gombjával — a szerkesztőben egy újabb rövid bemutató vár. Gyakorolni a <b>Gyakorló dokumentumban</b> tudsz, részletes leírás a <b>DONE.book felhasználói útmutatóban</b>.' } },
  ],

  editor: () => [
    { popover: { title: 'A szerkesztő ✍️', description: 'Itt írod a kézikönyvet. Egy rövid kör a legfontosabb részeken — a → billentyűvel léphetsz, az Esc-kel kiléphetsz.' } },
    { element: '#file-list', popover: { title: 'Fejezetek = menü', description: 'A bal oldali fa a fejezetek listája, a sorrendjük <b>és a kész kézikönyv menüje</b> egyszerre. <b>Húzással</b> rendezheted őket, és csoportokba teheted. A kiválasztott fejezet alatt a címsorai látszanak — rájuk kattintva oda ugrik a szerkesztő.', side: 'right', align: 'start' } },
    { element: '#sidebar-header', popover: { title: 'Új fejezet, új csoport', description: '<b>+ Fejezet</b>: új fejezet a kiválasztott után. <b>+ Csoport</b>: új lenyíló menüpont (pl. „Admin felület”), amibe fejezeteket húzhatsz.', side: 'bottom' } },
    { element: '.tree-ch.active', popover: { title: 'Egy fejezet', description: 'A fejezet sorában: <b>✏</b> átnevezés (vagy <b>dupla kattintás</b> a címen), <b>⬇</b> letöltés .md fájlként, <b>🗑</b> törlés. A csoportokat ugyanígy nevezheted át. A <b>●</b> jel azt jelenti, hogy a mentés még folyamatban van.', side: 'right' } },
    { element: '#chapter-title', popover: { title: 'A fejezet címe', description: 'Ez jelenik meg a menüben is; a fejezet elején lévő címsor vele együtt változik. Mellette a fejezet azonosítója (#…) — erre lehet linkelni.', side: 'bottom' } },
    { element: '#format-toolbar', popover: { title: 'Formázás', description: 'Félkövér, dőlt, címsorok (H1–H3), listák, kiemelt doboz, harmonika, ikon, kép, link, táblázat — egy kattintással.', side: 'bottom' } },
    { element: '#editor-host', popover: { title: 'Ide írsz', description: 'Tipp: egy üres sor elején írj egy <b>/</b> jelet — megjelenik minden beszúrható elem (gépeléssel szűrhetsz, Enterrel beszúrod). Képernyőképet egyszerűen <b>Ctrl+V</b>-vel illeszthetsz be.', side: 'right', align: 'start' } },
    { element: '#preview-pane', popover: { title: 'Élő előnézet', description: 'Így fog kinézni a kész kézikönyv — gépelés közben frissül, és követi, hol tartasz. Egy bekezdésre <b>kattintva</b> a szerkesztő oda ugrik; egy képre <b>duplán kattintva</b> megnyílik a képszerkesztő (vágás, nyilak, számozás, kitakarás).', side: 'left', align: 'start' } },
    { element: '#status', popover: { title: 'Mentés', description: 'Mentés gomb nincs: minden <b>automatikusan</b> a felhőbe kerül, itt látod az állapotát. Ha „⚠ Ütközés” áll itt, egy kolléga közben ugyanazt a fejezetet módosította — kattints rá, és válaszd ki, melyik maradjon.', side: 'bottom' } },
    { element: '#doc-switcher', popover: { title: 'Dokumentumváltó', description: 'Innen egy kattintással átválthatsz bármelyik másik dokumentumra.', side: 'bottom' } },
    { element: '#btn-doc-settings', popover: { title: 'Dokumentum beállításai', description: 'Bal oldalt nyíló panel: a dokumentum <b>címe, alcíme és rövid leírása</b> (automatikusan ment, az előnézetben azonnal látszik), valamint a <b>nem használt képek törlése</b>. Újabb kattintásra (vagy Esc-re) bezárul.', side: 'bottom' } },
    { element: '#btn-copy-chapters', popover: { title: 'Fejezetek másolása', description: 'Kész fejezeteket hozhatsz át <b>egy másik dokumentumból</b> — akár másik projektből is —, a képeikkel együtt. Válaszd ki a projektet és a dokumentumot, jelöld be a fejezeteket, és <b>📋 Kijelöltek másolása ide</b>. A másolatok a fejezetlista végére kerülnek, az eredeti nem változik.', side: 'bottom' } },
    { element: '#btn-design', popover: { title: 'Megjelenés', description: 'A projekt színei (elsődleges, másodlagos, harmadlagos) és logója — a projekt <b>minden</b> dokumentumára érvényes.', side: 'bottom' } },
    { element: '#btn-download', popover: { title: 'Letöltés', description: '<b>PDF</b>, <b>HTML</b>, nyomtatás és a forrásfájlok (ZIP) — mindig a dokumentum aktuális állapotából, nem kell semmit „legenerálni”.', side: 'bottom', align: 'end' } },
    { element: '#btn-preview-popout', popover: { title: 'Nagyobb hely', description: 'Az előnézet külön böngészőlapra (pl. második monitorra) tehető, így a szerkesztő kitölti a képernyőt.', side: 'bottom', align: 'end' } },
    { popover: { title: 'Jó munkát! 🚀', description: 'Ha gyakorolnál, nyisd meg a <b>Gyakorló dokumentumot</b> — feladatokkal vezet végig minden funkción. A bemutatót bármikor újraindíthatod: profil menü → <b>❓ Bemutató</b>.' } },
  ],

  // A bal oldali panelek saját, rövid bemutatója (első megnyitáskor magától indul).
  docsettings: () => [
    { element: '#dp-doc-fields', popover: { title: 'A dokumentum adatai', description: '<b>Cím</b>: a dokumentumlistában, a böngészőfülön és a kész oldal tetején. <b>Alcím</b> és <b>rövid leírás</b>: a kész oldal bal felső sarkában. Gépelés közben az előnézet azonnal frissül.', side: 'right', align: 'start' } },
    { element: '#doc-settings-status', popover: { title: 'Automatikus mentés', description: 'Mentés gomb nincs — egy pillanattal a gépelés után magától ment, itt látod az állapotát. Üres címet nem ment el.', side: 'right' } },
    { element: '#dp-cleanup', popover: { title: 'Takarítás', description: 'Törli a felhőből a már sehol nem használt képeket (pl. kicserélt képernyőképek). A logó és a színek a <b>🎨 Megjelenés</b> oldalon vannak.', side: 'right' } },
  ],

  copy: () => [
    { element: '#dp-copy-source', popover: { title: 'Honnan másolsz?', description: 'Válaszd ki a <b>projektet</b>, majd azon belül a <b>dokumentumot</b>, amelyikből fejezeteket hoznál át. Bármelyik projektből másolhatsz — az aktuális dokumentum nem szerepel a listában.', side: 'right', align: 'start' } },
    { element: '#copy-chapters-list', popover: { title: 'Mit másolsz?', description: 'Itt jelennek meg a kiválasztott dokumentum fejezetei — jelöld be, amelyekre szükséged van (vagy <b>Összes kijelölése</b>).', side: 'right', align: 'start' } },
    { element: '#dp-copy', popover: { title: 'Másolás', description: 'A <b>📋 Kijelöltek másolása ide</b> gomb (a panel alján) átmásolja őket a képeikkel együtt; a fejezetlista <b>végére</b> kerülnek, onnan húzással a helyükre teheted őket. Ha ugyanilyen fejezet már van, rákérdez, felülírja-e.', side: 'right', align: 'start' } },
    { element: '#file-list', popover: { title: 'Itt jelennek meg', description: 'A fejezetfa a panel mellett is látszik — a másolás után rögtön itt találod az új fejezeteket.', side: 'right', align: 'start' } },
  ],

  theme: () => [
    { popover: { title: 'Megjelenés 🎨', description: 'Itt állítod be a projekt kinézetét — a projekt <b>minden dokumentumára</b> érvényes.' } },
    { element: '.tf-logo', popover: { title: 'Logó', description: 'A kész kézikönyv bal felső sarkában, a dokumentum címe mellett jelenik meg (PNG, SVG vagy JPG).', side: 'right' } },
    { element: '.tf-row[data-key="primary"]', popover: { title: 'Elsődleges szín', description: 'Menü, ikonok, kiemelt doboz, Címsor 1 és Címsor 3.', side: 'right' } },
    { element: '.tf-row[data-key="secondary"]', popover: { title: 'Másodlagos szín', description: 'Címsor 2 és a linkek.', side: 'right' } },
    { element: '.tf-row[data-key="tertiary"]', popover: { title: 'Harmadlagos szín', description: 'Az oldal és a kártyák háttere. Legyen világos — a szöveg mindig sötét.', side: 'right' } },
    { element: '.theme-preview', popover: { title: 'Minta oldal', description: 'Minden formázás egy helyen — itt azonnal látod, mire hat egy-egy szín.', side: 'left', align: 'start' } },
    { element: '.theme-head-actions', popover: { title: 'Mentés', description: 'A változások csak a <b>✓ Mentés</b> után lesznek érvényesek. Az <b>↺ Alapértelmezett</b> visszaállítja az alapszíneket.', side: 'bottom', align: 'end' } },
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
    if (tourContextOk(name) && !document.querySelector('.hp-modal-backdrop.open')) startTour(name);
  }, 700);
}

// Mikor indulhat egy bemutató: a panelek bemutatója csak nyitott panelnél, a többi a saját nézetében.
function tourContextOk(name) {
  const panel = typeof docPanelOpen === 'function' ? docPanelOpen() : null;
  if (name === 'docsettings') return state.uiView === 'editor' && panel === 'settings';
  if (name === 'copy') return state.uiView === 'editor' && panel === 'copy';
  return state.uiView === name;
}

// Profil menü → ❓ Bemutató: az aktuális nézet (vagy a nyitott bal oldali panel) bemutatója; ha nincs, a Kezdőlapé.
async function startTourForCurrentView() {
  if (typeof closeProfileMenu === 'function') closeProfileMenu();
  const panel = typeof docPanelOpen === 'function' ? docPanelOpen() : null;
  if (state.uiView === 'editor' && panel) { startTour(panel === 'copy' ? 'copy' : 'docsettings'); return; }
  if (TOURS[state.uiView]) { startTour(state.uiView); return; }
  toast('Ehhez a nézethez még nincs bemutató — a Kezdőlap bemutatója indul.', 'ok', 3000);
  await showHomeView();
  setTimeout(() => startTour('home'), 400);
}
