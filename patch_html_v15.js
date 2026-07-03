const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The original color for female might be #DB2777
html = html.replace(/#DB2777/g, '#ED1C24');

// The user also mentioned:
// "A fonte do título Masculino está em verde, quero que tenha o mesmo azul do gráfico."
// The blue of the graph is #0D6EFD.
html = html.replace(/color: #059669;([^>]*>Masculino<\/div>)/g, 'color: #0D6EFD;$1');
html = html.replace(/color: #10B981;([^>]*>Masculino<\/div>)/g, 'color: #0D6EFD;$1');
// KPI color for Masculino
html = html.replace(/color: #10B981;([^>]*id="kpiPctMascBig")/g, 'color: #0D6EFD;$1');
html = html.replace(/color: #059669;([^>]*id="kpiPctMascBig")/g, 'color: #0D6EFD;$1');

// Text of "% de clientes dentro de cada faixa de valor" to dark green: #00A650 or similar.
html = html.replace(/% de clientes dentro de cada faixa de valor/g, '<span style="color: #00A650;">% de clientes dentro de cada faixa de valor</span>');

fs.writeFileSync('index.html', html);
console.log('Fixed colors successfully');
