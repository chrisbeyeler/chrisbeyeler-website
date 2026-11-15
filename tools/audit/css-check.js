// Prüft css/style.css mit einem CSS-Parser auf Syntaxfehler (überzählige Klammern, abgeschnittene Zeilen).
// Browser verschlucken solche Fehler still und lassen dann einzelne Regeln weg.
// Aufruf: node css-check.js <pfad>/css/style.css
const postcss = require('postcss');
const fs = require('fs');
const file = process.argv[2];
if (!file) { console.error('Aufruf: node css-check.js <style.css>'); process.exit(1); }
try {
    const root = postcss.parse(fs.readFileSync(file, 'utf8'));
    let rules = 0, empty = 0;
    root.walkRules(() => rules++);
    root.walkAtRules(at => { if (at.nodes && at.nodes.length === 0) empty++; });
    console.log('CSS fehlerfrei geparst | Regeln:', rules, '| leere @-Blöcke:', empty);
} catch (e) {
    console.error('CSS-FEHLER:', e.message);
    process.exit(1);
}
