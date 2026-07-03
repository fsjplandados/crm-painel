const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const rfvTitleParts = html.match(/<div[^>]*>[\s\S]*?FREQUÊNCIA, RECOMPRA E COMPARAÇÃO[\s\S]*?<\/select>\s*<\/div>/i);

if (rfvTitleParts) {
    console.log('Found it!');
    console.log(rfvTitleParts[0]);
    html = html.replace(rfvTitleParts[0], '');
    fs.writeFileSync('index.html', html);
} else {
    // try finding just the title div
    const rfvTitleDiv = html.match(/<div[^>]*>[\s\S]*?FREQUÊNCIA, RECOMPRA E COMPARAÇÃO[\s\S]*?Acompanhe o comportamento de recompra, ticket médio e compare o desempenho entre os canais\.?\s*<\/p>\s*<\/div>/i);
    if (rfvTitleDiv) {
        html = html.replace(rfvTitleDiv[0], '');
        fs.writeFileSync('index.html', html);
        console.log('Removed just the title div');
    }
    
    // try finding the filter
    const rfvFilter = html.match(/<select id="filter-canal" class="kpi-select">[\s\S]*?<\/select>/i);
    if (rfvFilter) {
        let html2 = fs.readFileSync('index.html', 'utf8');
        html2 = html2.replace(rfvFilter[0], '');
        fs.writeFileSync('index.html', html2);
        console.log('Removed filter');
    }
}
