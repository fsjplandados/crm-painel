const fs = require('fs');

// 1. Update pie chart colors in app.js
let appJs = fs.readFileSync('app.js', 'utf8');

const oldColors = `                    if (l.includes('churn') || l.includes('inativo') || l.includes('perdido') || l.includes('não ativado')) return '#C81D25'; // Dark red for negative
                    if (l.includes('dormente') || l.includes('risco') || l.includes('atenção')) return '#F97316'; // Orange for warning
                    if (l.includes('ativo') && !l.includes('inativo')) return '#243685'; // Brand dark blue for active
                    if (l.includes('novo')) return '#10B981'; // Green`;

const newColors = `                    if (l.includes('não ativado') || l === 'nao ativado') return '#9CA3AF'; // Gray
                    if (l.includes('churn')) return '#DC2626'; // Red
                    if (l.includes('inativo')) return '#F97316'; // Orange
                    if (l.includes('dormente') || l.includes('risco') || l.includes('atenção')) return '#1E3A8A'; // Blue
                    if (l.includes('ativo') && !l.includes('inativo')) return '#00A650'; // Green
                    if (l.includes('perdido')) return '#C81D25'; // Dark red
                    if (l.includes('novo')) return '#10B981'; // Light green`;

if (appJs.includes(oldColors)) {
    appJs = appJs.replace(oldColors, newColors);
    fs.writeFileSync('app.js', appJs);
    console.log('app.js updated');
} else {
    console.log('Colors string not found in app.js');
}

// 2. Add favicon and bump cache busters in index.html
let html = fs.readFileSync('index.html', 'utf8');

const headTag = '<head>';
if (html.includes(headTag) && !html.includes('favicon.png')) {
    html = html.replace(headTag, headTag + '\\n    <link rel="icon" type="image/png" href="favicon.png">');
}

html = html.replace(/styles\\.css\\?v=\\d+/, 'styles.css?v=' + Date.now());
html = html.replace(/app\\.js\\?v=\\d+/, 'app.js?v=' + Date.now());
fs.writeFileSync('index.html', html);
console.log('index.html updated');
