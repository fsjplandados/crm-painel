const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');
const t3 = lines.findIndex(l => l.includes('tab-3"'));
console.log(lines.slice(t3, t3 + 35).join('\n'));
