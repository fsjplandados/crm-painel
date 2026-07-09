const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove info icons (the SVG spans with title="Clientes cadastrados a partir de 2026-01-01")
const infoIconRegex1 = /<span title="Clientes cadastrados a partir de 2026-01-01"[^>]*>\s*<svg[^>]*>.*?<\/svg>\s*<\/span>/gs;
html = html.replace(infoIconRegex1, '');

const infoIconRegex2 = /<span title="[^"]*" style="cursor: help; color: #64748B; display: flex; align-items: center;">\s*<svg[^>]*><circle cx="12" cy="12" r="10"><\/circle><line x1="12" y1="16" x2="12" y2="12"><\/line><line x1="12" y1="8" x2="12.01" y2="8"><\/line><\/svg>\s*<\/span>/gs;
html = html.replace(infoIconRegex2, '');

// 2. Remove "Período: Clientes criados a partir de jan/2026" texts
html = html.replace(/Período: Clientes criados a partir de jan\/2026/g, '');

// 3. Remove "- Período: 1S 2026" texts next to titles
html = html.replace(/<span[^>]*>- Período: 1S 2026<\/span>/g, '');

// Cache buster
html = html.replace(/styles\.css\?v=\d+/, 'styles.css?v=' + Date.now());
html = html.replace(/app\.js\?v=\d+/, 'app.js?v=' + Date.now());

fs.writeFileSync('index.html', html);
console.log('index.html cleaned up.');
