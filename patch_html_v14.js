const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove global header
const headerRegex = /<header class="header">[\s\S]*?<\/header>/;
if (headerRegex.test(html)) {
    html = html.replace(headerRegex, '');
    console.log('Header removed');
}

// 2. Rename titles
html = html.replace(/<h1 class="dashboard-title">Visão Geral<\/h1>/g, '<h1 class="dashboard-title">1. Visão Geral de Audiência</h1>');
html = html.replace(/<h1 class="dashboard-title">Perfil de Cliente<\/h1>/g, '<h1 class="dashboard-title">2. Perfil de Cliente</h1>');
html = html.replace(/<h1 class="dashboard-title">RFV<\/h1>/g, '<h1 class="dashboard-title">3. RFV</h1>');
html = html.replace(/<h1 class="dashboard-title">Pacientes Crônicos<\/h1>/g, '<h1 class="dashboard-title">4. Clientes por Categoria</h1>');

// Wait, the user also wants tabs 5 and 6 renamed:
// The code in index.html for tab 5 is: <h2 class="chart-title"...>Visão de Campanhas</h2>
html = html.replace(/>Visão de Campanhas<\/h2>/g, '>5. Visão de Campanhas</h2>');
html = html.replace(/>Multicanal<\/h2>/g, '>6. Multicanal</h2>');

// Update sidebar titles as well to match (optional but good)
html = html.replace(/title="Visão Geral"/g, 'title="1. Visão Geral de Audiência"');
html = html.replace(/title="Perfil de Cliente"/g, 'title="2. Perfil de Cliente"');
html = html.replace(/title="RFV"/g, 'title="3. RFV"');
html = html.replace(/title="Pacientes Crônicos"/g, 'title="4. Clientes por Categoria"');
html = html.replace(/title="Visão de Campanhas"/g, 'title="5. Visão de Campanhas"');
html = html.replace(/title="Multicanal"/g, 'title="6. Multicanal"');

// 3. Remove Categorias blocks from Tab 1, 2, 3
// We need to carefully remove them. They look like this:
const catGeral = /<div class="kpi-card-simple[^>]*>\s*<div[^>]*>Categorias de venda — geral<\/div>[\s\S]*?<\/div>\s*<\/div>/g;
const catMed = /<div class="kpi-card-simple[^>]*>\s*<div[^>]*>Categorias de venda — medicamentos<\/div>[\s\S]*?<\/div>\s*<\/div>/g;
// Wait, in patch_html_v7.js I said they were inside a grid container. 
// Let's just remove the exact blocks:
html = html.replace(catGeral, '');
html = html.replace(catMed, '');

// Also they were in Tab 1, Tab 2, Tab 3. Wait, in Tab 4 they are "segmentation-card". Let's verify we don't delete them from Tab 4.
// Tab 4 has `<div class="segmentation-title"[^>]*>Categorias de venda — geral</div>`. 
// So `kpi-card-simple` regex won't match Tab 4! That's perfect.

// Also we need to remove the empty grid container in Tab 1, 2, 3 if we removed the cards.
// <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 2rem; margin-bottom: 2rem;">\s*</div>
html = html.replace(/<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1\.5rem; margin-top: 2rem; margin-bottom: 2rem;">\s*<\/div>/g, '');

// 4. Update female KPI color to #ED1C24
// Find: <div style="font-size: 32px; font-weight: 800; color: #E83F5B; line-height: 1;" id="kpiPctFemBig">
html = html.replace(/color: #E83F5B;([^>]*id="kpiPctFemBig")/g, 'color: #ED1C24;$1');
html = html.replace(/color: #E83F5B;([^>]*>Feminino<\/div>)/g, 'color: #ED1C24;$1');
html = html.replace(/fill="#E83F5B"/g, 'fill="#ED1C24"');
html = html.replace(/background-color: #E83F5B;([^>]*id="gender-bar-fem")/g, 'background-color: #ED1C24;$1');

fs.writeFileSync('index.html', html);
console.log('Restored all user requests successfully!');
