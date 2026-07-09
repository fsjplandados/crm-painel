const fs = require('fs');
let appJs = fs.readFileSync('app.js', 'utf8');
appJs = appJs.replace(
    "if (l.includes('ativo') && !l.includes('inativo')) return '#00A650'; // Brand green for active",
    "if (l.includes('ativo') && !l.includes('inativo')) return '#243685'; // Brand dark blue for active"
);
fs.writeFileSync('app.js', appJs);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace('app.js?v=69', 'app.js?v=70');
fs.writeFileSync('index.html', html);
console.log("Revertido");
