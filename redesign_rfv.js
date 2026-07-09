const fs = require('fs');

// 1. UPDATE index.html
let html = fs.readFileSync('index.html', 'utf8');

// The old HTML structure to replace
const oldTableStr = `<table class="rfv-matrix-table" id="rfv-valor-table">
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
                </table>`;

// The new HTML structure matching the print's columns
const newTableStr = `<table class="rfv-matrix-table" id="rfv-valor-table">
                    <thead>
                        <tr>
                            <th>Frequência</th>
                            <th>R1: últimos 30 dias</th>
                            <th>R2: 31 a 60 dias</th>
                            <th>R3: 61 a 120 dias</th>
                            <th>R4: 121 a 180 dias</th>
                            <th>R5: 181 a 360 dias</th>
                            <th>R6: mais de 360 dias</th>
                            <th class="col-total">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Injected via JS -->
                    </tbody>
                </table>`;

html = html.replace(oldTableStr, newTableStr);

// The old styles
const oldStylesStr = `    <style>
        .rfv-matrix-table { width: 100%; border-collapse: collapse; font-family: 'Open Sans', sans-serif; font-size: 13px; }
        .rfv-matrix-table th, .rfv-matrix-table td { padding: 12px 8px; text-align: center; border: 1px solid #E2E8F0; }
        .rfv-matrix-table th { background-color: #F8FAFC; color: #4B5563; font-weight: 600; white-space: nowrap; }
        .rfv-matrix-table th:first-child, .rfv-matrix-table td:first-child { text-align: left; font-weight: 600; color: #4B5563; background-color: #F8FAFC; }
        .rfv-matrix-table td { color: #111827; }
        .rfv-matrix-table .col-total { font-weight: 700; color: #00A650; }
        .rfv-matrix-table tr:last-child td { font-weight: 700; background-color: #F8FAFC; }
    </style>`;

// The new styles to match the print's beautiful design
const newStylesStr = `    <style>
        .rfv-matrix-table { width: 100%; border-collapse: collapse; font-family: 'Montserrat', sans-serif; font-size: 12px; }
        .rfv-matrix-table th, .rfv-matrix-table td { padding: 12px 10px; text-align: center; border: 1px solid #E5E7EB; }
        .rfv-matrix-table th { background-color: #F3F4F6; color: #1F2937; font-weight: 600; white-space: nowrap; }
        .rfv-matrix-table th:first-child, .rfv-matrix-table td:first-child { text-align: center; font-weight: 500; color: #1F2937; background-color: #F9FAFB; }
        .rfv-matrix-table td { color: #374151; transition: background-color 0.2s; }
        .rfv-matrix-table .col-total { font-weight: 700; color: #00A650 !important; }
        .rfv-matrix-table tr:last-child td { font-weight: 700; background-color: #F9FAFB; }
        .rfv-matrix-table tr:last-child td:first-child { color: #00A650; }
    </style>`;

html = html.replace(oldStylesStr, newStylesStr);

fs.writeFileSync('index.html', html);

// 2. UPDATE loadrfv.js
const jsContent = `const loadRFV = async () => {
    try {
        const response = await fetch('Arquivos Jun-2026/Frequencia_Recencia_Valor.csv?v=' + Date.now());
        if (!response.ok) return; // Silent fail if file doesn't exist
        const csvText = await response.text();
        
        const lines = csvText.split('\\n').map(l => l.trim()).filter(l => l.length > 0);
        
        // Exact labels from the user's reference print
        const freqLabels = {
            'F1': 'F1: 12 ou mais compras',
            'F2': 'F2: 7 a 11 compras',
            'F3': 'F3: 4 a 6 compras',
            'F4': 'F4: 2 a 3 compras',
            'F5': 'F5: 1 compra'
        };
        
        const matrix = {
            'F1': { R1:0, R2:0, R3:0, R4:0, R5:0, R6:0, TOTAL:0 },
            'F2': { R1:0, R2:0, R3:0, R4:0, R5:0, R6:0, TOTAL:0 },
            'F3': { R1:0, R2:0, R3:0, R4:0, R5:0, R6:0, TOTAL:0 },
            'F4': { R1:0, R2:0, R3:0, R4:0, R5:0, R6:0, TOTAL:0 },
            'F5': { R1:0, R2:0, R3:0, R4:0, R5:0, R6:0, TOTAL:0 }
        };
        
        let globalTotal = { R1:0, R2:0, R3:0, R4:0, R5:0, R6:0, TOTAL:0 };

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length < 10) continue;
            
            const mesRaw = cols[0].trim();
            const canal = cols[1].trim();
            const freq = cols[2].trim();
            
            let rowMonth = '', rowYear = '';
            if (mesRaw.includes('/')) {
                const parts = mesRaw.split('/');
                if (parts.length === 3) {
                    rowMonth = parts[0].padStart(2, '0');
                    rowYear = '20' + parts[2];
                }
            }
            
            if (window.globalFilters && window.globalFilters.canal && window.globalFilters.canal !== 'TOTAL' && canal !== window.globalFilters.canal) continue;
            
            const hasYearFilter = window.selectedYears && window.selectedYears.size > 0;
            const hasMonthFilter = window.selectedMonths && window.selectedMonths.size > 0;
            
            const matchY = hasYearFilter ? window.selectedYears.has(rowYear) : true;
            const matchM = !hasMonthFilter || window.selectedMonths.has(rowMonth);
            
            if (!matchY || !matchM) continue;
            
            if (matrix[freq]) {
                const r1 = parseFloat(cols[3]) || 0;
                const r2 = parseFloat(cols[4]) || 0;
                const r3 = parseFloat(cols[5]) || 0;
                const r4 = parseFloat(cols[6]) || 0;
                const r5 = parseFloat(cols[7]) || 0;
                const r6 = parseFloat(cols[8]) || 0;
                
                matrix[freq].R1 += r1;
                matrix[freq].R2 += r2;
                matrix[freq].R3 += r3;
                matrix[freq].R4 += r4;
                matrix[freq].R5 += r5;
                matrix[freq].R6 += r6;
                
                const rowTotal = r1 + r2 + r3 + r4 + r5 + r6;
                matrix[freq].TOTAL += rowTotal;
                
                globalTotal.R1 += r1;
                globalTotal.R2 += r2;
                globalTotal.R3 += r3;
                globalTotal.R4 += r4;
                globalTotal.R5 += r5;
                globalTotal.R6 += r6;
                globalTotal.TOTAL += rowTotal;
            }
        }
        
        const formatBRL = (val) => {
            if (val === 0) return 'R$ 0,00';
            return 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };
        
        let maxVal = 0;
        ['F1','F2','F3','F4','F5'].forEach(f => {
            ['R1','R2','R3','R4','R5','R6'].forEach(r => {
                if (matrix[f][r] > maxVal) maxVal = matrix[f][r];
            });
        });
        
        const getBgStyle = (val) => {
            if (val === 0 || maxVal === 0) return '';
            const intensity = Math.max(0.05, val / maxVal);
            
            // If intensity is very high, make text white to ensure contrast
            const textColor = intensity > 0.6 ? 'color: #FFFFFF; font-weight: 600;' : '';
            // Brand green #00A650 (0, 166, 80)
            return 'background-color: rgba(0, 166, 80, ' + (intensity * 0.9) + '); ' + textColor;
        };
        
        const tbody = document.querySelector('#rfv-valor-table tbody');
        if (tbody) {
            let html = '';
            ['F1','F2','F3','F4','F5'].forEach(f => {
                html += '<tr>';
                html += '<td>' + freqLabels[f] + '</td>';
                ['R1','R2','R3','R4','R5','R6'].forEach(r => {
                    const val = matrix[f][r];
                    html += '<td style="' + getBgStyle(val) + '">' + formatBRL(val) + '</td>';
                });
                html += '<td class="col-total">' + formatBRL(matrix[f].TOTAL) + '</td>';
                html += '</tr>';
            });
            
            html += '<tr>';
            html += '<td>Total</td>';
            ['R1','R2','R3','R4','R5','R6'].forEach(r => {
                html += '<td>' + formatBRL(globalTotal[r]) + '</td>';
            });
            html += '<td class="col-total">' + formatBRL(globalTotal.TOTAL) + '</td>';
            html += '</tr>';
            
            tbody.innerHTML = html;
        }
        
    } catch (e) {
        console.error('Error loading RFV data:', e);
    }
};

window.loadRFV = loadRFV;
setTimeout(() => { if(typeof loadRFV === "function") loadRFV(); }, 500);

const originalUpdateDataRFV = window.updateData;
window.updateData = function() {
    if(originalUpdateDataRFV) originalUpdateDataRFV.apply(this, arguments);
    if(typeof loadRFV === "function") loadRFV();
};
`;

fs.writeFileSync('loadrfv.js', jsContent);
console.log('loadrfv.js updated successfully.');
