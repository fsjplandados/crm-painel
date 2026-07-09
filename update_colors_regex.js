const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');

const regex = /if\s*\(l\.includes\('churn'\).*?if\s*\(l\.includes\('novo'\)\)[^\n]*\n/s;

const newColors = `if (l.includes('não ativado') || l === 'nao ativado') return '#9CA3AF'; // Cinza
                    if (l.includes('churn')) return '#DC2626'; // Vermelho
                    if (l.includes('inativo')) return '#F97316'; // Laranja
                    if (l.includes('dormente') || l.includes('risco') || l.includes('atenção')) return '#1E3A8A'; // Azul
                    if (l.includes('ativo') && !l.includes('inativo')) return '#00A650'; // Verde
                    if (l.includes('perdido')) return '#C81D25';
                    if (l.includes('novo')) return '#10B981';\n`;

appJs = appJs.replace(regex, newColors);
fs.writeFileSync('app.js', appJs);
console.log('app.js updated successfully with Regex.');
