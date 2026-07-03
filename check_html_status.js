const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
console.log('Lines:', html.split('\n').length);
console.log('Has Sidebar:', html.includes('class="sidebar"'));
console.log('Has Header:', html.includes('class="header"'));
console.log('Has Tab 1:', html.includes('tab-1'));
console.log('Categorias geral:', html.match(/Categorias de venda — geral/gi)?.length || 0);
