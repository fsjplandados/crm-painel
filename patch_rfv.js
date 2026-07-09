const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Insert HTML before Comparação por Canal
const compCanalTarget = `<h2 class="chart-title" style="font-size: 1.1rem; font-family: 'Montserrat', sans-serif; font-weight: 700; color: #1E3A8A; text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">Comparação por Canal`;

const rfvHtml = `
        <!-- MATRIZ RFV VALOR -->
        <div class="kpi-card-simple fade-in delay-2" style="margin-bottom: 24px; padding: 24px;">
            <div class="chart-header" style="margin-bottom: 16px;">
                <h2 class="chart-title" style="font-size: 1.1rem; font-family: 'Montserrat', sans-serif; font-weight: 700; color: #1E3A8A; text-transform: uppercase; margin-bottom: 4px;">Frequência de Compra x Recência x Valor</h2>
            </div>
            <div style="overflow-x: auto;">
                <table class="rfv-matrix-table" id="rfv-valor-table">
                    <thead>
                        <tr>
                            <th>Frequência</th>
                            <th>R5: Até 30 dias</th>
                            <th>R4: Entre 31 e 60 dias</th>
                            <th>R3: Entre 61 e 90 dias</th>
                            <th>R2: Entre 91 e 180 dias</th>
                            <th>R1: Acima de 181 dias</th>
                            <th class="col-total">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Injected via JS -->
                    </tbody>
                </table>
            </div>
        </div>
`;

if (html.includes(compCanalTarget) && !html.includes('id="rfv-valor-table"')) {
    html = html.replace(compCanalTarget, rfvHtml + '\n                ' + compCanalTarget);
}

// Ensure styles for the table exist
const styleTarget = `    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">`;
const rfvStyles = `
    <style>
        .rfv-matrix-table { width: 100%; border-collapse: collapse; font-family: 'Open Sans', sans-serif; font-size: 13px; }
        .rfv-matrix-table th, .rfv-matrix-table td { padding: 12px 8px; text-align: center; border: 1px solid #E2E8F0; }
        .rfv-matrix-table th { background-color: #F8FAFC; color: #4B5563; font-weight: 600; white-space: nowrap; }
        .rfv-matrix-table th:first-child, .rfv-matrix-table td:first-child { text-align: left; font-weight: 600; color: #4B5563; background-color: #F8FAFC; }
        .rfv-matrix-table td { color: #111827; }
        .rfv-matrix-table .col-total { font-weight: 700; color: #00A650; }
        .rfv-matrix-table tr:last-child td { font-weight: 700; background-color: #F8FAFC; }
    </style>
`;
if (html.includes(styleTarget) && !html.includes('.rfv-matrix-table')) {
    html = html.replace(styleTarget, styleTarget + '\n' + rfvStyles);
}

// Add the load script
if (!html.includes('loadrfv.js')) {
    html = html.replace('</body>', '    <script src="loadrfv.js?v=' + Date.now() + '"></script>\n</body>');
}

fs.writeFileSync('index.html', html);
console.log('index.html updated successfully.');
