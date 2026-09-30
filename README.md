# DONE.book

*(korábbi munkanév: Kézikönyv Szerkesztő)*

A DONE böngészőben futó szerkesztője kézikönyvek / belső dokumentációk összeállításához. Markdown fejezetekből épít fel egy stílusos, kereshető, navigálható HTML oldalt. Minden adat a felhőben (Supabase) van, így minden bejelentkezett kolléga ugyanazt látja és szerkeszti.

Nincs build lépés és nincs saját szerver: az `index.html` mellé a `css/`, `js/` és `vendor/` mappát kell feltölteni (pl. GitHub Pages-re), és böngészőben megnyitni.

## Tartalom

- [Mentés](#mentés)
- [Fejezetek szerkesztése](#fejezetek-szerkesztése)
- [Képek](#képek)
- [Képszerkesztő](#képszerkesztő)
- [Linkek](#linkek)
- [Előnézet](#előnézet)
- [Ütközések (ha ketten szerkesztik)](#ütközések-ha-ketten-szerkesztik)
- [Markdown szintaxis](#markdown-szintaxis)
- [Fejezetek, csoportok, menü (bal oldali fa)](#fejezetek-csoportok-menü-bal-oldali-fa)
- [Kezdőlap](#kezdőlap)
- [Dokumentum beállításai](#dokumentum-beállításai)
- [Fejezetek másolása](#fejezetek-másolása)
- [Interaktív bemutató](#interaktív-bemutató)
- [Megjelenés testreszabása](#megjelenés-testreszabása)
- [Letöltés](#letöltés)
- [Importálás](#importálás)
- [Felhőbeli szerkezet](#felhőbeli-szerkezet)
- [Ismert korlátok](#ismert-korlátok)
- [Kód szerkezete](#kód-szerkezete)
- [Változásnapló](#változásnapló)

---

## Mentés

Minden automatikusan a felhőbe mentődik:

- **Fejezetek:** gépelés után kb. 1,5 másodperccel. A még nem mentett fejezet mellett a bal oldali listában ● jel látszik. Ha a mentés nem sikerül (pl. megszakadt a net), a szerkesztő újrapróbálja.
- **Szerkezet** (sorrend, csoportok, menü): húzás után azonnal.
- **Képek:** beillesztéskor azonnal.
- **Megjelenés:** a projekt Megjelenés oldalának **✓ Mentés** gombjával (addig csak a minta oldalon látszik).

Külön Mentés gomb nincs: minden magától ment, a Ctrl+S pedig mindent azonnal elment. Ha még van mentetlen módosítás, a böngésző bezárás előtt figyelmeztet.

Induláskor az utoljára megnyitott dokumentum nyílik meg újra, mindig a felhőben lévő legfrissebb változattal.

## Ütközések (ha ketten szerkesztik)

Mentés előtt a szerkesztő megnézi, módosította-e valaki más a fejezetet, mióta megnyitottad. Ha igen, nem írja felül vakon, hanem megmutatja a két változatot egymás mellett:

- **Az övé legyen** — a te módosításaid elvesznek.
- **Mindkettő megmarad** — az övé marad a fejezetben, a tiéd egy új „(saját változat)” fejezetbe kerül közvetlenül alá; utána kézzel összefésülhetők.
- **Az enyém legyen** — az ő módosításai elvesznek.

Ha az ablak valamiért nem látszik, de a felső sávban „⚠ Ütközés” áll, kattints a feliratra (vagy nyomj Ctrl+S-t), és újra megjelenik.

A szerkezetnél (sorrend, csoportok, cím) egy egyszerű kérdés jön fel. Ha egy fejezetre váltasz, és nálad nincs mentetlen módosítás, a szerkesztő csendben betölti a felhőben lévő legfrissebb változatát.

## Fejezetek szerkesztése

Bal oldalt a fejezetek fája, középen a szerkesztő, jobbra az élő előnézet.

- **Cím mező** a szerkesztő fölött: a fejezet címe, egyben a menüpont neve. Ha a fejezet első sora `# <cím>`, azt is együtt frissíti.
- **#azonosító** a cím mellett: a fejezet horgonya (`#azonosito` linkekhez). Automatikusan készül, kattintással módosítható.
- **„/” menü:** a sor elején (vagy szóköz után) írj egy `/` jelet — megjelenik a beszúrható elemek listája (címsor, lista, kiemelt doboz, harmonika, kép, képsor, ikon, táblázat, link, kódblokk). Gépeléssel szűrhető (pl. `/harm`), Enterrel beszúrható.
- **Ikon-javaslat:** kettősponttal kezdve (pl. `:hou`) felajánlja a Lucide ikonokat.
- **Billentyűk:** Ctrl+B félkövér, Ctrl+I dőlt, Ctrl+K link, Ctrl+S mentés, Ctrl+Z / Ctrl+Y visszavonás (fejezetenként külön), Ctrl+F keresés.
- **Gyors dokumentumváltó:** a felső sávban, a 🏠 Kezdőlap gomb mellett egy lenyíló lista mutatja az összes dokumentumot projektenként csoportosítva — innen egy kattintással átválthatsz egy másikra (a mentetlen módosítások előtte felmennek a felhőbe).

## Képek

- Beillesztés **Ctrl+V**-vel, **húzással** a szerkesztőbe, a **🖼 Kép** gombbal vagy a `/kép` paranccsal. Egyszerre több kép is mehet.
- A képek külön fájlként kerülnek a felhőbe (a dokumentum `images/` mappájába), automatikusan tömörítve (WebP, max. 1440 px széles). A szövegben csak egy rövid hivatkozás áll: `![alt](images/3f9a….webp)`; a szerkesztőben ennek helyén egy kis bélyegkép látszik.
- A kép alatti `*dőlt sor*` a képaláírás.
- A **régi dokumentumokban** beágyazott (base64) képeket a szerkesztő az első megnyitáskor magától átalakítja külön fájllá. Ez egyszeri, és ha bármelyik kép feltöltése nem sikerül, az a kép változatlanul a szövegben marad.
- A letöltött HTML-be és az egyedi `.md` letöltésbe a képek beágyazva kerülnek, így azok önállóan is teljesek.
- A **⚙ Dokumentum beállításai → 🧹 Nem használt képek törlése** gomb eltávolítja a felhőből azokat a képfájlokat, amelyekre már egyik fejezet sem hivatkozik (a 10 percnél frissebbeket biztonságból kihagyja).

## Képszerkesztő

A szerkesztőben a kép-címkére (**✏ kép**) kattintva, vagy az előnézetben a képre duplán kattintva nyílik meg:

- **✂ Vágás**, **➚ Nyíl**, **▭ Keret**, **① Számozott jelölő** (1, 2, 3… a lépésekhez), **▦ Kitakarás** (pixelezés — nevek, e-mail címek, személyes adatok elrejtésére).
- 6 szín, 3 vonalvastagság, **↶** visszavonás (Ctrl+Z), **⟲ Eredeti** (minden jelölés törlése).
- **🔄 Kép cseréje…** (vagy Ctrl+V az ablakban): új képernyőkép ugyanoda — a képaláírás megmarad, és rögtön jelölhető.
- A jelölések **utólag is szerkeszthetők**: a szerkesztett kép mellé egy leíró fájl mentődik (`images/<név>.edit.json`), így újranyitáskor az eredeti képből és a meglévő nyilakból/keretekből indul.

## Linkek

- A **🔗 Link** gomb (Ctrl+K) után, vagy kézzel `](` beírásakor a szerkesztő felajánlja a dokumentum fejezeteit és címsorait — nem kell fejből tudni az azonosítókat. Webcím is beírható.
- A **nem létező belső hivatkozások** (pl. egy átnevezett fejezetre mutató `#régi-azonosító`) pirosan aláhúzva látszanak, a fában pedig ⚠ jelzi, melyik fejezetben van ilyen.

## Előnézet

- Minden fejezet tetején egy **„Made by DONE” sáv** látszik (dokumentum címe + DONE logó). Ez kódból jön, nem szerkeszthető.
- Az előnézet **mindig a teljes dokumentumot** mutatja (menüvel, keresővel), gépelés közben magától frissül.
- Az előnézet mindig **követi a szerkesztő görgetését**: az éppen szerkesztett fejezet / bekezdés látszik benne.
- Az előnézetben egy bekezdésre **kattintva** a szerkesztő oda ugrik (teljes dokumentum nézetben a másik fejezetet is megnyitja); egy képre **duplán kattintva** a képszerkesztő nyílik meg.

## Markdown szintaxis

A szerkesztő egy leegyszerűsített markdown-változatot ért. Az eszköztár gombjai a leggyakoribb elemeket be tudják szúrni, de kézzel is írhatod őket.

| Elem | Szintaxis | Megjegyzés |
|---|---|---|
| Félkövér | `**szöveg**` | |
| Dőlt | `*szöveg*` | |
| Kód (inline) | `` `kód` `` | |
| Címsor 1 | `# Cím` | a legnagyobb (32 px), elsődleges színű; automatikusan kap egy hivatkozható azonosítót |
| Címsor 2 | `## Cím` | 28 px, másodlagos színű |
| Címsor 3 | `### Cím` | 24 px, elsődleges színű — ez a legkisebb szint (a régi `####`, `#####` is ilyen lesz) |
| Felsorolás | `- elem` | |
| Számozott lista | `1. elem` | |
| Kiemelt doboz | `> szöveg` | az elsődleges színből képzett háttérrel |
| Link | `[szöveg](url)` | |
| Kép | `![alt szöveg](images/…)` | beillesztéssel jön létre, lásd [Képek](#képek) |
| Képek egymás alatt, közös keretben | `<!-- shot-stack -->` ... képek ... `<!-- /shot-stack -->` | |
| Kód blokk | ` ```kód``` ` | |
| Táblázat | markdown táblázat (`\|` és `---`) | |
| Lenyíló elem (harmonika) | lásd lent | |
| Ikon | `:ikon-nev:` | lásd lent |

### Hivatkozás egy címsorra

Minden címsor (Címsor 1–3) automatikusan kap egy azonosítót a szövegéből (kisbetűs, szóköz helyett kötőjel, ékezetek megmaradnak). Erre így hivatkozhatsz:

```
## Telepítés lépései
```

```
[ugrás a telepítéshez](#telepítés-lépései)
```

Az előnézetben és a kész oldalon is működik, másik fejezet címsorára is. Egy másik fejezet **tetejére** a fejezet saját azonosítójával (a cím melletti `#azonosito`) tudsz ugrani.

### Lenyíló elemek (harmonika / accordion)

Az eszköztár **⬇ Harmonika** gombja (vagy a `/harmonika` parancs) beszúr egy induló sablont:

```
<!-- accordion -->
+++ Első kérdés vagy cím
Ide jön az első elem szövege.

+++ Második kérdés vagy cím
Ide jön a második elem szövege.
<!-- /accordion -->
```

A `+++ ` sorok lesznek a kattintható, lenyíló fejlécek; az alattuk lévő szöveg a kinyíló tartalom. Tetszőleges számú `+++` blokk követheti egymást, a bennük lévő szöveg ugyanúgy támogatja a formázást (félkövér, lista, kép stb.), mint bárhol máshol.

### Ikonok beszúrása (Lucide)

Az eszköztár **🧩 Ikon** gombja egy kereshető ikonválasztót nyit meg (a [lucide.dev](https://lucide.dev/icons/) ikonkészletéből, kb. 1600 ikon). Gépelj a keresőbe (pl. `house`, `mail`, `check`), majd kattints a kívánt ikonra — ez egy

```
:ikon-nev:
```

jelölést szúr be a szövegbe (pl. `:house:`), ami egy valódi, az oldalba ágyazott SVG-vé alakul mind az előnézetben, mind a végleges buildelt oldalon (nem egy külső képfájl — ezért lehet a megjelenését CSS-ből, azaz a projekt Megjelenés oldaláról is szabályozni).

Az ikonok színe mindig a projekt **kiemelő színe** (Megjelenés oldal), méretük 20 px, vonalvastagságuk 2 px — ez nem állítható.

**Fontos:** az ikonok (és az ikonlista is) egy külső CDN-ről (unpkg.com) töltődnek be futásidőben — ehhez internetkapcsolat kell, ugyanúgy, mint a Google Fonts betűtípusokhoz. Ha valaki teljesen internet nélkül nyitja meg a végleges oldalt, az ikonok helyén üres hely marad.

---

## Dokumentum beállításai

A felső sáv **⚙ Dokumentum beállításai** gombja a Megjelenéshez hasonlóan egy **bal oldali panelt** nyit (nem felugró ablakot): közben a fejezetfa, a szerkesztő és az előnézet is látszik. Ugyanarra a gombra kattintva, a **✕** gombbal vagy **Esc**-kel bezárul.

- **Cím** — a dokumentumlistában, a böngészőfülön és a kész oldal tetején.
- **Alcím** — a kész oldal bal felső sarkában.
- **Rövid leírás** — az alcím alatt.
- **🧹 Nem használt képek törlése** — a felhőből törli azokat a képeket, amelyekre már egyik fejezet sem hivatkozik.

Mentés gomb nincs: gépelés után egy pillanattal **automatikusan ment**, az előnézetben azonnal látszik, a panelen „✓ Mentve” jelzi. Üres címet nem ment el. A logó és a színek a projekt **🎨 Megjelenés** oldalán vannak (a panelről egy gombbal oda lehet ugrani).

## Fejezetek másolása

Külön gomb a felső sávban: **📋 Fejezetek másolása** — szintén bal oldali panelt nyit.

1. Válaszd ki a **projektet**, majd a **dokumentumot**, amelyikből másolnál (bármelyik projektből lehet; az éppen nyitott dokumentum nem szerepel a listában).
2. Jelöld be a fejezeteket (vagy **Összes kijelölése**).
3. Kattints a panel alján a **📋 Kijelöltek másolása ide** gombra.

A másolatok a képeikkel együtt a fejezetlista **végére** kerülnek — a fa a panel mellett látszik, onnan húzással a helyükre tehetők. Az eredeti dokumentum nem változik. Ha ugyanolyan fájlnevű fejezet már van, rákérdez, felülírja-e; ha csak az azonosító ütközik, a másolat `-masolat` végződést kap.

## Megjelenés testreszabása

A megjelenés **projekt szinten** állítható: egy projekt minden dokumentuma ugyanazt a témát kapja. Megnyitás:

- a Kezdőlapon: bal oldalt kattints a projektre, majd a fejlécében a **🎨 Megjelenés** gombra,
- vagy a szerkesztőben a felső sáv **🎨 Megjelenés** gombjával (a megnyitott dokumentum projektjéé).

Az oldalon balra a beállítások, jobbra egy **minta oldal** látszik, amin minden formázás megtalálható (címsorok, bekezdés, link, kiemelt doboz, listák, kép, táblázat, harmonika, kód, ikonok, menü, kereső) — minden módosítás rögtön látszik rajta. A **✓ Mentés** után a projekt összes dokumentuma az új megjelenést kapja. Az **↺ Alapértelmezett** gomb visszaállítja az alapszíneket (Mentéssel lesz végleges).

**Logó:** a Megjelenés oldal tetején tölthető fel / cserélhető / távolítható el (PNG, SVG, JPG, max. 1 MB). A kész oldal bal felső sarkában, a dokumentum címe mellett jelenik meg, a projekt minden dokumentumában. Ha egy projektnek még nincs saját logója, az első olyan dokumentum logójából indul, amelyiknek volt; a Mentéssel lesz a projekté.

**Csak három színt kell megadni:**

| Szín | Mire hat | Alapértelmezés |
|---|---|---|
| **Elsődleges** | menü, ikonok, kiemelt doboz (`>`), **Címsor 1** és **Címsor 3**, a felsorolások jelei, a dokumentum címe a menüben | `#F63900` |
| **Másodlagos** | **Címsor 2** és a **linkek** | `#F63900` |
| **Harmadlagos** | az **oldal és a kártyák háttere** | `#FFFFFF` (fehér) |

Tipp: a harmadlagos szín legyen világos (fehér vagy nagyon halvány árnyalat) — a szöveg színe fixen sötét, sötét háttéren nem lenne olvasható.

**Egységes, nem állítható (kódból jön, minden projektben azonos):**

- Szöveg: `#1a1a1a`, másodlagos szöveg (képaláírás, leírás): `#6b7280`, szegélyek: `#e2e5ea`
- Betűtípus: Inter (szöveg) + Lexend (címsorok)
- Címsorméretek: Címsor 1–3 (`#`, `##`, `###`) = 32 / 28 / 24 px
- Bekezdés betűmérete: 16 px; ikonok: 20 px
- Sarkok lekerekítése: 14 px

A korábbi (4.7 előtti) beállításokat a szerkesztő automatikusan átveszi: a régi kiemelő szín lesz az elsődleges, a régi „Címsor 2” színe (ha nem volt külön megadva, a kiemelő szín) a másodlagos, a régi kártyaháttér a harmadlagos. Ha egy projektnek még nincs közös megjelenése, a Megjelenés oldal megnyitásakor az első dokumentum régi színeiből indul a beállítás.

## Interaktív bemutató

Rövid, lépésenkénti bemutatók: buborékok mutatják meg a felület részeit, a háttér elsötétül, csak a magyarázott rész látszik. A **Tovább** gombbal vagy a → billentyűvel lehet lépni, az **Esc**-kel bármikor kilépni.

| Bemutató | Mikor indul magától? | Mit mutat meg? |
|---|---|---|
| **Kezdőlap** | az első belépés után | projektek, Összes dokumentum, Új projekt, projekt fejléce, táblázat, egy dokumentum gombjai (húzással áthelyezés), keresés, fiók |
| **Szerkesztő** | az első dokumentum megnyitásakor | fejezetek fája = menü, + Fejezet / + Csoport, egy fejezet gombjai (átnevezés), fejezet címe, eszköztár, „/” menü és Ctrl+V, élő előnézet, mentés és ütközés, dokumentumváltó, Dokumentum beállításai, Fejezetek másolása, Megjelenés, Letöltés, külön lapos előnézet |
| **Dokumentum beállításai** | a panel első megnyitásakor | cím / alcím / leírás, automatikus mentés, képtakarítás |
| **Fejezetek másolása** | a panel első megnyitásakor | honnan (projekt, dokumentum), mit (fejezetek kijelölése), másolás gomb, hová kerülnek |
| **Megjelenés** | a Megjelenés oldal első megnyitásakor | logó, a három szín, minta oldal, Mentés |

Mindegyik csak egyszer indul el magától (a böngésző megjegyzi), de bármikor újraindítható: jobb felső sarok, profil menü → **❓ Bemutató** — mindig az éppen látott oldal (vagy a nyitott bal oldali panel) bemutatója indul. Bejelentkezés előtt, betöltés közben és megosztott kézikönyvnél nem jelenik meg.

**Gyakorló dokumentum:** egy importálható dokumentum (`donebook-gyakorlo` mappa) hat fejezetnyi feladattal (szöveg és formázás, fejezetek és csoportok, képek és képszerkesztő, harmonika / ikon / link / táblázat, megjelenés / letöltés / megosztás). Érdemes egy külön „Gyakorló” projektbe importálni, és mindenkinek a saját példányán dolgozni.

A bemutatók lépései a `js/tour.js`-ben vannak — ha a felület változik, itt kell frissíteni őket.

## Kezdőlap

A Kezdőlap felépítése a szerkesztőhöz hasonló:

- **Bal oldalt a projektek**, mint mappák, **ábécérendben**, mellettük a dokumentumaik száma. Legfelül a **📚 Összes dokumentum**. Itt van a **+ Új projekt** gomb is.
- **Középen a dokumentumok táblázata.** Egy projektre kattintva csak az ő dokumentumai látszanak; az **Összes dokumentum** minden projekt minden dokumentumát mutatja.

**Projekt fejléce** (ha egy projekt van kiválasztva) — a táblázat fölött:

- a projekt ikonja, neve és **leírása** (rövid összefoglaló a projektről — a ✏ gombbal szerkeszthető; több soros is lehet),
- a legfontosabb adatok: hány dokumentum, összesen hány fejezet, mikor frissült utoljára,
- gombok: **🎨 Megjelenés** (a projekt színei és logója), **✏** projekt szerkesztése (név, leírás, ikon, szín), **📤** importálás, **🗑** projekt törlése (minden dokumentumával együtt!), **+ Új dokumentum**.

**A táblázat oszlopai:** Cím · Projekt · Dátum (a dokumentum legutóbbi módosítása — bármelyik fejezeté vagy a beállításaié; az egeret fölé víve a pontos időpont látszik) · ⬇ PDF · ⬇ HTML · 🔗 Link · Megnyitás · ✏ átnevezés · 🗑 törlés.

- **Gyors betöltés:** a Kezdőlap azonnal a legutóbb látott listát mutatja, és a háttérben frissül a felhőből (közben a dokumentumszám mellett „· frissítés…” látszik). Így a kollégák új dokumentumai is pár másodpercen belül megjelennek. Kijelentkezéskor a helyi másolat törlődik.
- **Rendezés:** a **Cím** vagy a **Dátum** oszlop fejlécére kattintva; újabb kattintás megfordítja a sorrendet (▲ / ▼). A választást a böngésző megjegyzi.
- **Keresés:** a táblázat fölötti mezővel cím vagy projektnév szerint.
- **Áthelyezés másik projektbe:** fogd meg a dokumentum sorát, és **húzd rá** a bal oldali projektre (a célprojekt kiemelődik). Ha a célprojektben már van ugyanilyen azonosítójú dokumentum, az áthelyezés nem történik meg.
- **🔗 Link:** új lapon megnyitja a kész kézikönyvet, és a megosztható linket a vágólapra is másolja (csak bejelentkezett felhasználók nyithatják meg).
- A **PDF** és a **HTML** mindig a dokumentum aktuális állapotából készül, a dokumentum megnyitása nélkül.

## Fejezetek, csoportok, menü (bal oldali fa)

A bal oldali fa egyszerre a fejezetek listája, a sorrendjük és a kész oldal menüje — ami itt látszik, az lesz a menüben is, ugyanebben a sorrendben.

- **Húzd** a fejezeteket a sorrend változtatásához, vagy egy csoport fejlécére / csoporton belülre a csoportba tételhez.
- **+ Csoport:** új lenyíló menüpont. A csoport fejlécén: **＋** alcsoport, **✏** átnevezés (vagy dupla kattintás a nevén — a név helyben szerkeszthető, Enter = mentés, Esc = mégse), **🗑** törlés (a fejezetei nem törlődnek, a lista tetejére kerülnek). A csoportok és alcsoportok is húzhatók, a **▾** nyíllal összecsukhatók.
- A csoport nélküli fejezetek a menü tetején, sima linkként jelennek meg (pl. Bevezetés).
- **+ Fejezet:** új fejezet az aktív fejezet után, ugyanabba a csoportba.
- Az aktív fejezet alatt a **címsorai** látszanak — kattintásra oda ugrik a szerkesztő és az előnézet.
- Fejezeten: **✏** átnevezés (vagy dupla kattintás a címén — helyben szerkeszthető, Enter = mentés, Esc = mégse), **⬇** letöltés `.md` fájlként, **🗑** törlés. Átnevezéskor a fejezet elején lévő `# Cím` sor is vele változik (a szerkesztő fölötti cím mezőnél ugyanígy).

## Letöltés

A **⬇ Letöltés** menüben:

- **📄 PDF letöltése:** kész PDF fájl, nyomtatóablak nélkül — tartalomjegyzékkel, minden fejezet új oldalon, a „Made by DONE” sávval. Chrome-ban és Edge-ben előbb megkérdezi, hová mentse; más böngészőben sima letöltésként érkezik. Az oldalak képként kerülnek a PDF-be (a szöveg nem jelölhető ki benne); hosszabb dokumentumnál fél percig is tarthat.
- **🖨 Nyomtatás:** nyomtatási nézet egy új lapon — tartalomjegyzékkel, minden fejezet új oldalon, kinyitott lenyíló elemekkel, menü és kereső nélkül. Ha **kijelölhető / kereshető szövegű** PDF kell, itt a nyomtatóválasztóban a „Mentés PDF-ként” lehetőséget válaszd. (A letöltött HTML-ből nyomtatva is ugyanígy néz ki.)
- **⬇ HTML letöltése:** a végleges, önálló HTML fájl (képekkel együtt).
- **📦 Markdown + képek (ZIP):** a dokumentum összes forrásfájlja (fejezetek, képek, `config.json`, `style.css`) — archiváláshoz, vagy máshová importáláshoz.

**Nem kell semmit „legenerálni”:** a kész HTML-t (letöltés, PDF, megosztott 🔗 link, a listák HTML / PDF gombjai) mindig a dokumentum aktuális állapotából állítja össze a szerkesztő, abban a pillanatban, amikor kéred. A HTML és a PDF a Kezdőlap táblázatából is letölthető, a dokumentum megnyitása nélkül.

Egy-egy fejezet `.md` fájlja a bal oldali fában a fejezet **⬇** gombjával tölthető le (a képek beágyazva).

## Importálás

A Kezdőlapon egy projektet kiválasztva, a projekt fejlécének **📤** (Importálás) gombjával új dokumentum hozható létre ebben a projektben:

- **egy mappából** a gépről: régi projektmappa (`config.json`, `style.css`, `sections/*.md`) vagy a ZIP letöltés kicsomagolt mappája (`images/` mappával);
- **korábbi, böngészőben tárolt helyi projektből** (ha a régi szerkesztőben dolgoztál helyi mappával ebben a böngészőben).

A fejezetekbe ágyazott képek importáláskor automatikusan külön fájlba kerülnek.

## Felhőbeli szerkezet

```
kezikonyv (Supabase Storage bucket)
└── <projekt-azonosító>/
    ├── _project.json          # projekt neve, leírása, színe, ikonja
    ├── _theme.json            # a projekt megjelenése: { primary, secondary, tertiary } (elsődleges / másodlagos / harmadlagos szín)
    ├── _logo.txt              # a projekt logója (data URL; üres = nincs logó)
    └── <dokumentum-azonosító>/
        ├── config.json        # cím, leírás, menü (nav_groups), fejezetsorrend (fileOrder)
        ├── logo.txt           # régi, dokumentumonkénti logó — csak addig él, amíg a projektnek nincs _logo.txt-je
        ├── images/            # képek (tartalom-hash névvel)
        └── sections/
            ├── 01_bevezetes.md
            └── ...
```

Minden `.md` fájl elején egy frontmatter blokk adja meg a fejezet azonosítóját és címét (a szerkesztőben ez nem látszik, a cím mezőből jön):

```
---
id: telepites
title: Telepítés
---

# Telepítés
...
```

## Ismert korlátok

- Az ütközésjelzés mentéskor lép működésbe; azt nem mutatja élőben, ha valaki épp ugyanazt a fejezetet szerkeszti.
- Egy kolléga által közben létrehozott új fejezet a dokumentum újranyitásakor jelenik meg.
- Az ikonok és a betűtípusok külső CDN-ről töltődnek, ezekhez internet kell a kész oldalon is.

## Kód szerkezete

```
index.html              # a felület HTML váza
css/editor.css          # a szerkesztő stílusa
vendor/
  codemirror.bundle.js  # CodeMirror 6 + JSZip egy fájlban (lásd vendor/README.md)
js/
  runtime-scripts.js    # a kész kézikönyvbe ágyazott kereső- és ikon-szkript
  state.js              # globális állapot, dokumentum-modell segédek
  ui.js                 # toast, státusz, letöltés, topbar menük
  default-css.js        # alapértelmezett kézikönyv-CSS
  markdown.js           # frontmatter, markdown → HTML, címsorok
  cloud.js              # Supabase kliens és Storage műveletek (párhuzamos letöltés: mapLimit; Kezdőlap helyi másolata)
  structure.js          # fa = menü = sorrend (csoportok, áthelyezés)
  images.js             # képek feltöltése, gyorsítótár, beágyazás, régi képek átalakítása
  imageeditor.js        # képszerkesztő (vágás, nyíl, keret, számozás, kitakarás), csere, takarítás
  persistence.js        # mentések (automatikus és kézi)
  conflicts.js          # ütközésjelzés, ha ketten szerkesztik ugyanazt
  legacy-import.js      # régi, böngészőben tárolt helyi projektek olvasása (importhoz)
  theme.js              # projekt téma: rögzített tipográfia + színek → CSS, tárolás
  themeview.js          # Megjelenés oldal (beállítások + minta oldal)
  preview.js            # élő előnézet, HTML összeállítás, menü
  previewsync.js        # görgetés-szinkron, kattintás az előnézetben
  build.js              # kész HTML (mindig élőben), letöltés, nyomtatás, ZIP letöltés
  tour.js               # ❓ interaktív bemutató (driver.js), a lépések listája
  pdf.js                # 📄 PDF letöltés (html2pdf.js, vendor/)
  links.js              # link-javaslatok, hibás hivatkozások jelzése
  editor.js             # CodeMirror szerkesztő, "/" menü, kép-beillesztés
  toolbar.js            # formázó műveletek, ikonválasztó
  tree.js               # bal oldali fa, húzás, fejezet létrehozás/törlés/letöltés
  project-modal.js      # bal oldali panel: ⚙ Dokumentum beállításai + 📋 Fejezetek másolása
  loaders.js            # dokumentum betöltése, importálás
  views.js              # Kezdőlap (projektek mint mappák + dokumentumtáblázat, húzással áthelyezés), projekt/dokumentum kezelés
  auth.js               # bejelentkezés, megosztott link
  app.js                # indítás
```

A fájlok sima (nem ES-modul) szkriptek; a betöltési sorrend az `index.html` alján van.

## Változásnapló

### 4.13 — Dokumentum beállításai oldalsávban, külön Fejezetek másolása

- A **⚙ Beállítások** felugró ablak helyett **bal oldali panel** (a Megjelenéshez hasonlóan); a gomb neve **⚙ Dokumentum beállításai**. A cím / alcím / leírás **automatikusan ment**, és azonnal látszik az előnézetben (nincs külön Mentés gomb).
- A **📋 Fejezetek másolása** saját gombot kapott a felső sávban (eddig a Beállítások ablak második fülén volt). Szintén bal oldali panel; a fejezetfa közben látszik, így a másolatok azonnal megjelennek.
- A panelek ugyanarra a gombra kattintva, ✕-szel vagy Esc-kel zárulnak; nézet- vagy dokumentumváltáskor maguktól bezárulnak.
- **Bemutató:** a Szerkesztő bemutatója bemutatja mindkét új gombot (16 lépés), és mindkét panelnek saját rövid bemutatója van (első megnyitáskor magától, egyébként ❓ Bemutató nyitott panel mellett).
- A Gyakorló dokumentum és a felhasználói útmutató is frissült (fejezetmásolás és dokumentumbeállítás feladat).
- GitHub: nincs kézzel törlendő fájl.

### 4.12 — Bemutató a szerkesztőhöz és a Megjelenéshez

- Új bemutatók: **Szerkesztő** (14 lépés, 4.13 óta 16) és **Megjelenés** (7 lépés); első megnyitáskor magától indulnak, a ❓ Bemutató mindig az aktuális oldalét indítja.
- **Gyakorló dokumentum** (importálható, `donebook-gyakorlo`): feladatok minden fő funkcióhoz.

### 4.11 — Tisztább indulás

- Induláskor egy „Betöltés…” képernyő látszik, amíg el nem dől, mi jelenjen meg — a szerkesztő felülete és a belépő ablak nem villan fel feleslegesen.
- **Bejelentkezés nélkül** csak a belépő ablak látszik: a DONE.book semmit nem tölt be a háttérben, és a **bemutató sem indul el** (csak a belépés után, a Kezdőlapon).
- **Megosztott link** (🔗) megnyitásakor — bejelentkezve vagy belépés után — a „Kézikönyv betöltése…” képernyő után egyből a kész kézikönyv jelenik meg, a szerkesztő felülete nem villan fel közben.

### 4.10 — Bemutató, átnevezés, DONE.book

- **Interaktív bemutató** a Kezdőlapon (első belépéskor magától, utána a profil menü **❓ Bemutató** pontjából). Könyvtár: driver.js (ingyenes, MIT, `vendor/driver.js.iife.js` + `vendor/driver.css`).
- **Átnevezés mindig működik:** a csoportok, alcsoportok és most már a **fejezetek** is a fában, helyben nevezhetők át (✏ gomb vagy dupla kattintás; Enter / Esc). Korábban felugró ablak kérte be a nevet, amit a böngésző letilthat — ilyenkor „nem történt semmi”; és az automatikus mentés újrarajzolása sem szakítja meg többé a szerkesztést.
- A fejezet címének módosításakor a fejezet elején lévő `# Cím` sor akkor is vele változik, ha korábban eltért a címtől.
- A böngészőfülön és a belépő képernyőn: **DONE.book**.

### 4.9 — DONEbook

- Az eszköz új neve: **DONEbook** (böngészőfül, belépő képernyő). Elkészült hozzá a felhasználói útmutató is, a szerkesztőbe importálható formában (`donebook-felhasznaloi-utmutato` mappa).

### 4.8 — Gyorsabb betöltés

- A felhőből a fájlok **párhuzamosan** töltődnek (egyszerre legfeljebb 8 kérés), nem egymás után. Mérés 5 projekt × 4 dokumentum × 20 fejezet mellett, kérésenként ~120 ms hálózati késleltetéssel: **Kezdőlap 8,6 s → 0,7 s**, **dokumentum megnyitása 3,2 s → 0,5 s**. Ugyanez gyorsítja a PDF / HTML / megosztott link összeállítását is.
- A Kezdőlap és a dokumentumváltó a legutóbbi listát **azonnal** mutatja (helyi másolatból), és a háttérben frissül. A dokumentumváltó fél percen belül nem kérdezi le újra a listát.
- A dokumentum megnyitásakor a projekt témája és logója a fejezetekkel egy időben töltődik.
- A táblázat **Dátum** oszlopa mostantól a dokumentum tényleges utolsó módosítását mutatja (bármelyik fejezet szerkesztése is számít, nem csak a beállításoké).

### 4.7 — Három szín, új Kezdőlap

- **Megjelenés: csak három szín.** Elsődleges (menü, ikonok, kiemelt doboz, Címsor 1 és 3), másodlagos (Címsor 2, linkek), harmadlagos (oldal és kártyák háttere). A szöveg, a másodlagos szöveg és a szegélyek színe fix. A régi beállítások automatikusan átkerülnek.
- **Címsor 4 és 5 megszűnt** — a „/” menüből is kikerült; a régi `####`, `#####` címsorok Címsor 3-ként jelennek meg.
- **Új Kezdőlap:** bal oldalt a projektek mappaként (ábécérendben, „Összes dokumentum” fölül), középen a dokumentumok táblázata (Cím, Projekt, Dátum, PDF, HTML, Link, Megnyitás, átnevezés, törlés). Rendezés cím és dátum szerint. A kiválasztott projekt fejlécében a leírás, a fontosabb adatok és a projekt gombjai (Megjelenés, szerkesztés, importálás, törlés, új dokumentum).
- **Áthelyezés húzással:** a dokumentum sorát egy bal oldali projektre húzva. A külön Áthelyezés gomb és ablak megszűnt.
- A kártyás nézet (projekt- és dokumentumkártyák, nézetválasztó) megszűnt.

### 4.6 — Valódi PDF letöltés, link megnyitása

- A **PDF** gombok (dokumentumkártya, dokumentumlista, Letöltés menü) már nem a nyomtatót nyitják meg, hanem kész PDF fájlt készítenek; Chrome-ban / Edge-ben előbb a mentés helyét kérdezik. (`js/pdf.js`, `vendor/html2pdf.bundle.min.js` — ingyenes, helyben tárolt könyvtár.) A 🖨 Nyomtatás külön megmaradt a Letöltés menüben.
- A **🔗** gomb új lapon megnyitja a kész kézikönyvet, és a linket a vágólapra is másolja.

### 4.5 — Mindig naprakész HTML, PDF a listákban

- A kész HTML-t nem kell többé legenerálni: letöltéskor, PDF-nél, a megosztott linken és a listák gombjainál mindig az aktuális állapotból készül (a `published.html` már nem kell).
- **PDF** gomb a Projekt nézet dokumentumkártyáin és a Kezdőlap dokumentumlistájában.
- A dokumentumkártyák a projektkártyákhoz igazodnak: ikon + cím egy sorban, a fejezetek száma a jobb felső sarokban, ikonos gombok.
- A kész oldalon a logó és a dokumentum címe egy sorban van.
- Kikerült a 💾 Mentés gomb (minden magától ment, Ctrl+S továbbra is működik) és a képoptimalizálás opció a letöltésből.
- Az ikonválasztóban az ikonok világosak, jól látszanak a sötét háttéren.

### 4.4 — Egyszerűbb megjelenés

- Új alapértelmezett színek: kiemelő `#F63900`, szöveg `#1a1a1a` (a többi változatlan).
- Megszűnt beállítások: ikonok (mindig a kiemelő szín), bekezdés betűmérete (16 px), kiemelések (a kiemelt doboz a kiemelő színből, a szöveg színével). A Megjelenés oldalon csak az alapszínek, a címsorok színe és a logó maradt.
- Megszűnt formázások: **kiemelt szöveg** (`==…==` — a régi szövegekben a `==` jelek egyszerűen eltűnnek) és **szerkesztői jegyzet** (a régi jegyzetek sehol nem jelennek meg). Az eszköztárból és a „/” menüből is kikerültek.

### 4.3 — Logó a Megjelenésben

- A logó a ⚙ Beállításokból átkerült a projekt **🎨 Megjelenés** oldalára, és **projekt szintű** lett (`{projekt}/_logo.txt`): a projekt minden dokumentuma ugyanazt kapja. A minta oldalon is látszik; a színekkel együtt ment.
- Régi dokumentumoknál a saját `logo.txt` addig marad érvényben, amíg a projektnek nincs logója; a Megjelenés oldal megnyitásakor az első ilyen logóból indul.

### 4.2 — Made by DONE

- Minden fejezet tetején egy fejléc-sáv: bal oldalt a dokumentum címe, jobb oldalt „Made by” + DONE logó. Kódból jön (`js/theme.js`: `DONE_LOGO_SVG`, `madeByBarHtml`, `MADE_BY_CSS`), nem szerkeszthető; megjelenik az előnézetben, a Megjelenés minta oldalán, a letöltött HTML-ben és nyomtatásban / PDF-ben is. A kereső nem talál bele.

### 4.1 — Finomítások

- Visszakerült a **gyors dokumentumváltó** (lenyíló lista) a szerkesztő felső sávjába.
- Az előnézet fejléce megszűnt: az előnézet mindig a **teljes dokumentumot** mutatja, és mindig követi a szerkesztőt.
- Kisebb projektkártyák a Kezdőlapon: ikon + név egy sorban, a dokumentumok száma kiemelve a jobb felső sarokban.

### 4.0 — Projekt-szintű megjelenés, dokumentumlista

- A megjelenés **projekt szinten** állítható (`_theme.json`), a projekt minden dokumentuma ezt kapja. Új, teljes oldalas **Megjelenés** nézet: balra a beállítások, jobbra egy minta oldal az összes formázással.
- **Egységesítve, kódból:** betűtípus (Inter + Lexend), címsorméretek (32/28/24/20/18 px), sarkok (14 px). A haladó CSS-kód szerkesztő és a dokumentumonkénti `style.css` megszűnt.
- A címsorok, a kiemelt doboz és a kiemelt szöveg színe alapból a kiemelő színt követi (**auto**), amíg külön meg nem adod.
- Új **Címsor 5** szint (`#####`).
- Kezdőlap: **nézetválasztó** (projektek / dokumentumok táblázata).

### 3.2.1 — Ütközés-javítás

- **Hamis ütközés:** a Supabase egy fájl felülírása után még kb. egy percig a régi változatot is visszaadhatta (CDN-gyorsítótár), ezért a szerkesztő a saját, pár másodperccel korábbi szövegedet „kolléga változatának” nézte — akkor is, ha senki más nem szerkesztett. Javítva: a letöltések mindig a friss változatot kérik, és a saját korábbi változataidat a szerkesztő nem tekinti ütközésnek.

- Ha „Az enyém legyen” választása közben a kolléga újra mentett, a szerkesztő beragadt a „⚠ Ütközés — döntésre vár” állapotba, döntési ablak nélkül. Javítva: „Az enyém” most mindenképp felülír, és a felirat vagy a 💾 Mentés gomb újra előhozza az ablakot, ha függőben van egy döntés.

### 3.2 — Megjelenés oldalpanelben

- A Megjelenés a ⚙ Beállítások ablakból egy saját oldalpanelbe került (topbar: **🎨 Megjelenés**). A panel mellett a teljes kézikönyv előnézete látszik.

### 3.1 — AI funkciók eltávolítva

- A ✨ AI panel (fejezet képernyőképből) és a ✨ Szöveg menü kikerült, mert külön fizetős Claude API-t igényelnek. A `js/ai.js`, `js/aitext.js` és a `supabase/` mappa már nem része a szerkesztőnek.

### 3. verzió — együttműködés, képszerkesztő

- **Ütközésjelzés**, ha ketten szerkesztik ugyanazt a fejezetet (az övé / mindkettő / az enyém), és frissítés fejezetváltáskor.
- **Képszerkesztő:** vágás, nyíl, keret, számozott jelölő, kitakarás; utólag is szerkeszthető jelölések.
- **Kép cseréje** egy kattintással, a képaláírás megtartásával.
- **Nem használt képek takarítása.**
- **Link-javaslatok** és **hibás hivatkozások jelzése** (szerkesztőben és a fában).
- **Görgetés-szinkron** és kattintás az előnézetben → ugrás a szerkesztőben.
- **Nyomtatás / PDF** tartalomjegyzékkel, fejezetenként új oldallal.

### 2. verzió — kényelmesebb szerkesztés, csak felhő

- **Új szerkesztő (CodeMirror):** színezett szöveg, sorszámok, „/” beszúró menü, ikon-javaslatok, fejezetenkénti visszavonás, keresés.
- **Rejtett frontmatter:** a cím a szerkesztő fölötti mezőben, az azonosító automatikus.
- **Képek külön fájlban** a felhőben — a szöveg rövid és gyors marad; a régi beágyazott képek automatikusan átalakulnak.
- **Egyesített bal oldali fa:** fejezetek + csoportok + menü + sorrend egy helyen, húzással; címsorok az aktív fejezet alatt.
- **Letöltés:** egyedi fejezet `.md` (képekkel), vagy minden forrás ZIP-ben.
- **Csak felhő:** a helyi mappás mód megszűnt. A régi helyi projektek az **📤 Importálás** ablakban hozhatók át.
- A ⚙ Beállítások ablak egyszerűsödött: Dokumentum / Megjelenés / Fejezetek másolása.


### 1. verzió — refaktor + hibajavítások

**A CSS visszaállt alapértelmezettre — okai és javításuk:**

1. A Megjelenés fül **Egyszerű** nézetének *✓ Mentés* gombja csak a böngésző IndexedDB-jébe mentett, a felhőbe és a mappába nem. A felhőben így a dokumentum létrehozásakor feltöltött alapértelmezett `style.css` maradt, és újranyitáskor az töltődött be. → Most mindkét nézet ugyanazt a mentést hívja (böngésző + felhő / mappa).
2. Helyi mappás projektnél a `style.css` **soha nem íródott ki** a mappába. → Most kiíródik (és a logó is `logo.txt`-be).
3. A Supabase a fájlokat 1 órás böngésző-gyorsítótárazással szolgálta ki, így egy mentés után is a régi `style.css` jöhetett vissza. → A letöltések gyorsítótár nélkül mennek, a feltöltések `max-age=0`-val.
4. Az élő előnézet közben a módosított CSS azonnal a projektbe került, és a gépelés közbeni automentés kiírta a böngészőbe — így a böngészőben „megvolt", máshol nem. → A Megjelenés fül piszkozattal dolgozik; mentésig csak az előnézet látja.
5. A kiemelt doboz színe újranyitás után feketére (#000000) állt, mert a színválasztóba a teljes `linear-gradient(...)` szöveg került. → Az alapszín külön (`--callout-tint`) is mentődik, a régi blokkokból pedig a gradient első színét olvassuk ki.
6. Induláskor a legutóbb nyitott felhő Dokumentum a (esetleg elavult) böngészős másolatból töltődött vissza. → Most frissen a felhőből töltődik.

**Egyéb javítások:**

- Build közben a szerkesztő „átugrott" egy másik fejezetre, és a gépelés rossz fejezetbe mehetett.
- Felhő Dokumentumban törölt fejezet a következő megnyitáskor visszajött.
- Új helyi projekt létrehozásakor a *régi* aktív projekt mentődött, az új nem.
- Fejezet / projekt átnevezése helyi mappánál nem íródott ki a fájlba / `config.json`-ba.
- Dokumentum áthelyezésekor sikertelen feltöltés esetén is törlődött a forrás.
- Törölt / áthelyezett dokumentum a projekt-választóban maradt, ha nem az volt megnyitva.
- A `config.json` mentése eldobta a kézzel felvett, ismeretlen kulcsokat.
- A Tab billentyűvel beszúrt szóköz nem számított módosításnak.
- Az új fejezet ablakban egy kézi id-szerkesztés után az automatikus id-kitöltés örökre kikapcsolt.
- Induláskor az ábécében utolsó (nem a legutóbb használt) projekt töltődött vissza.
- A projekt-választó váltáskor a morzsamenü nem frissült.
- A kereső CSS-e kétszer került a legenerált HTML-be.
- Felhő dokumentumnál a kimeneti HTML neve perjelet tartalmazhatott (`projekt/dok.html`).

