const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// We want to remove the Fiéis and Ativos cards.
// To be safe with regex across multiple lines, let's just find the start and end of these sections.

// Fiéis card block
const startFieis = '<!-- Evolução Clientes Fiéis -->';
const endFieis = '<!-- Evolução Base -->';

// Ativos card block
const startAtivos = '<!-- Evolução Clientes Ativos -->';
// Ativos card ends before the closing </div> of the grid
const endAtivosRegex = /<!-- Evolução Clientes Ativos -->[\s\S]*?<\/canvas>\s*<\/div>\s*<\/div>/;

if (html.includes(startFieis) && html.includes(endFieis)) {
    // We will extract the exact block to remove
    const fieisBlockRegex = /<!-- Evolução Clientes Fiéis -->[\s\S]*?<!-- Evolução Base -->/;
    html = html.replace(fieisBlockRegex, '<!-- Evolução Base -->');
}

if (endAtivosRegex.test(html)) {
    html = html.replace(endAtivosRegex, '');
}

// Now insert the new "Dado em construção" card at the end of that grid, before the closing </div>
const constructionCard = `
            <!-- Dado em construção -->
            <div class="segmentation-card fade-in delay-1" style="grid-column: 1 / -1; display: flex; flex-direction: column; padding: 2rem; align-items: center; justify-content: center; text-align: center; background-color: #F8FAFC; border: 1px dashed #CBD5E1;">
                <h3 style="color: #F59E0B; margin-bottom: 1rem; font-weight: 700; font-size: 1.25rem; display: flex; align-items: center; gap: 8px;">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    Dado em construção
                </h3>
                <p style="color: #334155; margin-bottom: 1rem; font-weight: 600; font-size: 1rem;">
                    Os indicadores de Crescimento de Clientes Fiéis e Crescimento de Clientes Ativos (90 dias) ainda não estão disponíveis.
                </p>
                <p style="color: #64748B; font-size: 0.9rem; line-height: 1.5; max-width: 800px; margin: 0 auto 1rem;">
                    A classificação de clientes é baseada na metodologia RFV (Recência, Frequência e Valor), porém o segmento é atualizado sempre que o cliente realiza uma nova compra. Dessa forma, o banco de dados mantém apenas a classificação atual de cada cliente, sem armazenar o histórico mensal da segmentação.
                </p>
                <p style="color: #64748B; font-size: 0.9rem; line-height: 1.5; max-width: 800px; margin: 0 auto;">
                    Por esse motivo, não é possível calcular com precisão a evolução mês a mês desses indicadores com a estrutura de dados atual.
                </p>
            </div>`;

// Insert the card before the closing </div> of the grid.
// The grid starts with `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">`
// We will locate the end of the `<!-- Evolução Base -->` card to insert this right after it.
const baseCardRegex = /(<!-- Evolução Base -->[\s\S]*?<\/canvas>\s*<\/div>\s*<\/div>)/;
if (baseCardRegex.test(html) && !html.includes('Dado em construção')) {
    html = html.replace(baseCardRegex, '$1\n' + constructionCard);
}

// Ensure cache bust
html = html.replace(/styles\.css\?v=\d+/, 'styles.css?v=' + Date.now());

fs.writeFileSync('index.html', html);
console.log('index.html updated successfully');
