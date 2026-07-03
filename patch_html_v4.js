const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Heatmap Side by Side & Text Color
// The inline style has: .heatmap-grid { gap: 0.5rem !important; grid-template-columns: 1fr !important; }
html = html.replace('grid-template-columns: 1fr !important;', 'grid-template-columns: 1fr 1fr !important;');
// Subtitle color: % de clientes dentro de cada faixa de valor
html = html.replace('<p class="heatmap-subtitle">% de clientes dentro de cada faixa de valor</p>', '<p class="heatmap-subtitle" style="color: #00A650;">% de clientes dentro de cada faixa de valor</p>');

// 2. MASCULINO Title Color
// Ensure masculine title is blue
html = html.replace('<div class="heatmap-section-title blue">', '<div class="heatmap-section-title blue" style="color: #0D6EFD;">');

// 3. Add DISTRIBUIÇÃO DE GÊNERO DA BASE Card next to the Table
// Currently:
// <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; align-items: flex-start; margin-bottom: 2rem;">
//    <div style="min-width: 0;">
//       <div class="kpi-card-simple fade-in delay-2" style="margin-bottom: 0; padding: 12px; height: 100%;">
html = html.replace(
    '<div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; align-items: flex-start; margin-bottom: 2rem;">',
    '<div style="display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; align-items: stretch; margin-bottom: 2rem;">'
);

const tableCardRegex = /<div class="kpi-card-simple fade-in delay-2" style="margin-bottom: 0; padding: 12px; height: 100%;">([\s\S]*?)<\/div>\s*<\/div>\s*<!-- Heatmap Card -->/m;
const match = html.match(tableCardRegex);
if (match) {
    // Remove the old mini-KPI from the table header as we are moving it to a large card
    let innerTableHtml = match[1];
    innerTableHtml = innerTableHtml.replace(/<div style="display: flex; gap: 16px; font-size: 11px; font-weight: 700;">[\s\S]*?<\/div>/, '');

    const genderCardHtml = `
            </div>
            <!-- Gender KPI Card -->
            <div style="min-width: 0;">
                <div class="kpi-card-simple fade-in delay-2" style="margin-bottom: 0; padding: 24px; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                    <div style="font-size: 13px; font-weight: 800; color: #1E3A8A; text-transform: uppercase; margin-bottom: 2rem; width: 100%; text-align: center;">Distribuição de Gênero da Base</div>
                    
                    <div style="display: flex; justify-content: space-around; width: 100%; margin-bottom: 1.5rem;">
                        <!-- Masculino -->
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="#0D6EFD"><path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/></svg>
                            <div style="font-size: 32px; font-weight: 800; color: #0D6EFD; line-height: 1;" id="kpiPctMascBig">--</div>
                            <div style="font-size: 12px; font-weight: 700; color: #0D6EFD; text-transform: uppercase;">Masculino</div>
                        </div>
                        
                        <!-- Feminino -->
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="#ED1C24"><path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/></svg>
                            <div style="font-size: 32px; font-weight: 800; color: #ED1C24; line-height: 1;" id="kpiPctFemBig">--</div>
                            <div style="font-size: 12px; font-weight: 700; color: #ED1C24; text-transform: uppercase;">Feminino</div>
                        </div>
                    </div>
                    
                    <!-- Progress Bar -->
                    <div style="width: 100%; height: 16px; border-radius: 8px; display: flex; overflow: hidden; margin-top: auto;">
                        <div id="gender-bar-masc" style="height: 100%; background-color: #0D6EFD; width: 50%;"></div>
                        <div id="gender-bar-fem" style="height: 100%; background-color: #ED1C24; width: 50%;"></div>
                    </div>
                </div>`;
    
    html = html.replace(tableCardRegex, '<div class="kpi-card-simple fade-in delay-2" style="margin-bottom: 0; padding: 12px; height: 100%;">' + innerTableHtml + '</div>\n' + genderCardHtml + '\n            </div>\n            <!-- Heatmap Card -->');
}

// 4. Update the locked filters in script logic (bottom of index.html)
// "travar" os filtros de canais, genero e faixa etária para as páginas de visão geral e frequencia
// Visão Geral = tab-1, Frequencia (RFV) = tab-3, Pacientes Crônicos = tab-4
const scriptFilterOld = `if (tabId === 'tab-1' || tabId === 'tab-4') {`;
const scriptFilterNew = `if (tabId === 'tab-1' || tabId === 'tab-3' || tabId === 'tab-4') {`;
html = html.replace(scriptFilterOld, scriptFilterNew);

fs.writeFileSync('index.html', html);
console.log('PATCH_V4_HTML applied');
