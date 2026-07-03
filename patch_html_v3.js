const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove Top Header
const headerRegex = /<header class="header">[\s\S]*?<\/header>/;
html = html.replace(headerRegex, '');

// 2. Titles changes
// Tab 1
html = html.replace('<h1 class="dashboard-title">Visão Geral</h1>', '<h1 class="dashboard-title">Visão Geral de Audiência</h1>');

// Tab 2
const tab2Start = `        <div class="fade-in" style="display: flex; justify-content: flex-end; align-items: flex-end; margin-bottom: 1.5rem;">`;
const tab2NewStart = `        <div class="fade-in" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem;">
            <div>
                <h1 class="dashboard-title">Perfil de Cliente</h1>
                <p class="dashboard-subtitle">Analise o perfil demográfico e comportamental da base.</p>
            </div>
            <div style="font-size: 12px; color: #6B7280; font-weight: 500; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">`;
html = html.replace(`                <!-- Tab 2: Perfil de Cliente -->
                <div id="tab-2" class="tab-pane">
` + tab2Start, `                <!-- Tab 2: Perfil de Cliente -->
                <div id="tab-2" class="tab-pane">
` + tab2NewStart);

// Tab 3
const tab3Start = `        <div class="fade-in" style="display: flex; justify-content: flex-end; align-items: flex-end; margin-bottom: 1.5rem;">`;
const tab3NewStart = `        <div class="fade-in" style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem;">
            <div>
                <h1 class="dashboard-title">RFV</h1>
                <p class="dashboard-subtitle">Recência, Frequência e Valor.</p>
            </div>
            <div style="font-size: 12px; color: #6B7280; font-weight: 500; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">`;
html = html.replace(`                <!-- Tab 3: RFV -->
                <div id="tab-3" class="tab-pane">
` + tab3Start, `                <!-- Tab 3: RFV -->
                <div id="tab-3" class="tab-pane">
` + tab3NewStart);

// For Tab 3, there's also a section header for Frequency that might be confusing if we have a top header.
// I'll leave it as is, but maybe change the title slightly.
// The request was "tire os títulos atuais para dar lugar a esses"
// Let's replace the tab-4,5,6 titles.
html = html.replace('Pacientes Crônicos\n                                <span title="Clientes cadastrados a partir de 2026-01-01"', 'Clientes por Categoria\n                                <span title="Clientes cadastrados a partir de 2026-01-01"');
html = html.replace('Pacientes Crônicos', 'Clientes por Categoria'); // For sidebar title or generic fallback
html = html.replace('Campanhas</h2>', 'Visão de Campanhas</h2>');
html = html.replace('Multicanais</h2>', 'Multicanal</h2>');

// Update Sidebar titles and text just in case
html = html.replace('title="Visão Geral"', 'title="Visão Geral de Audiência"');
html = html.replace('title="Pacientes Crônicos"', 'title="Clientes por Categoria"');
html = html.replace('title="Campanhas"', 'title="Visão de Campanhas"');
html = html.replace('title="Multicanais"', 'title="Multicanal"');

// 3. Pacientes Crônicos: Remove select filters right of title
const filtersToRemove = `<div style="display: flex; gap: 1rem;">
                            <select id="filter-genero" class="filter-select" onchange="applyCategoriasFilters()">
                                <option value="Todos">Todos Gêneros</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                            </select>
                            <select id="filter-idade" class="filter-select" onchange="applyCategoriasFilters()">
                                <option value="Todas">Todas Idades</option>
                                <option value="<18">&lt;18 anos</option>
                                <option value="18-24">18-24 anos</option>
                                <option value="25-34">25-34 anos</option>
                                <option value="35-44">35-44 anos</option>
                                <option value="45-54">45-54 anos</option>
                                <option value="55-64">55-64 anos</option>
                                <option value="65-74">65-74 anos</option>
                                <option value="75+">75+ anos</option>
                            </select>
                        </div>`;
html = html.replace(filtersToRemove, '');

// If exact match failed, let's use regex to remove the divs containing those selects
html = html.replace(/<div style="display: flex; gap: 1rem;">[\s\S]*?<\/select>\s*<\/div>/g, (match) => {
    if (match.includes('filter-genero') && match.includes('filter-idade')) return '';
    return match;
});

// Write HTML
fs.writeFileSync('index.html', html);
console.log('PATCH_V3_HTML applied');
