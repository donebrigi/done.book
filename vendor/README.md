# vendor/

`codemirror.bundle.js` — a szerkesztőhöz szükséges külső könyvtárak egyetlen, előre összecsomagolt fájlban, hogy a szerkesztőnek ne kelljen build lépés. A `window.CM` objektumon keresztül érhetők el.

Tartalma: CodeMirror 6 (`@codemirror/view`, `state`, `commands`, `search`, `autocomplete`, `language`, `lang-markdown`, `@lezer/highlight`) és JSZip. A licencek a fájl végén vannak.

Újragenerálás (csak frissítéshez kell):

```bash
npm i codemirror @codemirror/lang-markdown @codemirror/autocomplete @codemirror/view \
      @codemirror/state @codemirror/language @codemirror/commands @codemirror/search jszip esbuild
cat > entry.js <<'JS'
export { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, dropCursor, Decoration, ViewPlugin, WidgetType, MatchDecorator, placeholder } from '@codemirror/view';
export { EditorState, EditorSelection, Compartment, StateEffect, Annotation } from '@codemirror/state';
export { history, defaultKeymap, historyKeymap, indentWithTab, undo, redo } from '@codemirror/commands';
export { searchKeymap, highlightSelectionMatches, openSearchPanel } from '@codemirror/search';
export { autocompletion, completionKeymap, closeBrackets, startCompletion, closeCompletion, acceptCompletion } from '@codemirror/autocomplete';
export { syntaxHighlighting, HighlightStyle, defaultHighlightStyle, indentOnInput, bracketMatching, foldGutter } from '@codemirror/language';
export { markdown, markdownLanguage } from '@codemirror/lang-markdown';
export { tags } from '@lezer/highlight';
import JSZip from 'jszip';
export { JSZip };
JS
npx esbuild entry.js --bundle --minify --format=iife --global-name=CM --outfile=codemirror.bundle.js --legal-comments=eof
```

---

`html2pdf.bundle.min.js` — a **📄 PDF letöltése** funkcióhoz (js/pdf.js). Csak akkor töltődik be, amikor valaki PDF-et kér. A html2pdf.js 0.14.0 (MIT), a html2canvas helyett a **html2canvas-pro** (MIT) motorral, hogy a modern CSS-színek (`oklch`, `color-mix`) is működjenek; tartalmazza a jsPDF-et (MIT) és a DOMPurify-t (MPL-2.0 / Apache-2.0).

Újragenerálás:

```bash
npm pack html2pdf.js@0.14.0 && tar xzf html2pdf.js-0.14.0.tgz
npm i html2canvas-pro jspdf@4 dompurify esbuild
cp -r package/src ./h2psrc
echo "import html2pdf from './h2psrc/index.js'; window.html2pdf = html2pdf;" > entry.js
npx esbuild entry.js --bundle --minify --format=iife --alias:html2canvas=html2canvas-pro --outfile=html2pdf.bundle.min.js
```

---

`driver.js.iife.js` + `driver.css` — a **❓ Bemutató** (interaktív végigvezetés, js/tour.js) könyvtára: driver.js 1.8.0 (MIT). Frissítés: `npm pack driver.js`, majd a `dist/driver.js.iife.js` és `dist/driver.css` bemásolása.
