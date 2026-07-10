const loadRFV = async () => {
    try {
        const response = await fetch('Arquivos Jun-2026/Frequencia_Recencia_Valor.csv?v=' + Date.now());
        if (!response.ok) return; // Silent fail if file doesn't exist
        const csvText = await response.text();
        
        const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        // Exact labels based on user's real data schema
        const freqLabels = {
            'F1': 'F1: Até 1 transação',
            'F2': 'F2: Entre 2 e 3 transações',
            'F3': 'F3: Entre 4 e 6 transações',
            'F4': 'F4: Entre 7 e 13 transações',
            'F5': 'F5: Acima de 14 transações'
        };
        
        const matrix = {
            'F1': { R1:0, R2:0, R3:0, R4:0, R5:0, TOTAL:0 },
            'F2': { R1:0, R2:0, R3:0, R4:0, R5:0, TOTAL:0 },
            'F3': { R1:0, R2:0, R3:0, R4:0, R5:0, TOTAL:0 },
            'F4': { R1:0, R2:0, R3:0, R4:0, R5:0, TOTAL:0 },
            'F5': { R1:0, R2:0, R3:0, R4:0, R5:0, TOTAL:0 }
        };
        
        let globalTotal = { R1:0, R2:0, R3:0, R4:0, R5:0, TOTAL:0 };

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
                // Ignoring R6 as instructed
                
                matrix[freq].R1 += r1;
                matrix[freq].R2 += r2;
                matrix[freq].R3 += r3;
                matrix[freq].R4 += r4;
                matrix[freq].R5 += r5;
                
                const rowTotal = r1 + r2 + r3 + r4 + r5;
                matrix[freq].TOTAL += rowTotal;
                
                globalTotal.R1 += r1;
                globalTotal.R2 += r2;
                globalTotal.R3 += r3;
                globalTotal.R4 += r4;
                globalTotal.R5 += r5;
                globalTotal.TOTAL += rowTotal;
            }
        }
        
        const formatBRL = (val) => {
            if (val === 0) return 'R$ 0,00';
            return 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };
        
        let maxVal = 0;
        ['F1','F2','F3','F4','F5'].forEach(f => {
            ['R1','R2','R3','R4','R5'].forEach(r => {
                if (matrix[f][r] > maxVal) maxVal = matrix[f][r];
            });
        });
        
        const getBgStyle = (val) => {
            if (val === 0 || maxVal === 0) return '';
            const intensity = Math.max(0.05, val / maxVal);
            
            const textColor = intensity > 0.6 ? 'color: #FFFFFF; font-weight: 600;' : '';
            return 'background-color: rgba(0, 166, 80, ' + (intensity * 0.9) + '); ' + textColor;
        };
        
        const tbody = document.querySelector('#rfv-valor-table tbody');
        if (tbody) {
            let html = '';
            ['F1','F2','F3','F4','F5'].forEach(f => {
                html += '<tr>';
                html += '<td>' + freqLabels[f] + '</td>';
                // REVERSE ORDER: R5 down to R1
                ['R5','R4','R3','R2','R1'].forEach(r => {
                    const val = matrix[f][r];
                    html += '<td style="' + getBgStyle(val) + '">' + formatBRL(val) + '</td>';
                });
                html += '<td class="col-total">' + formatBRL(matrix[f].TOTAL) + '</td>';
                html += '</tr>';
            });
            
            html += '<tr>';
            html += '<td>Total</td>';
            ['R5','R4','R3','R2','R1'].forEach(r => {
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

const loadRFVTicket = async () => {
    try {
        const response = await fetch('Arquivos Jun-2026/Compra_Recencia_Ticket_Medio.csv?v=' + Date.now());
        if (!response.ok) return; // Silent fail if file doesn't exist
        const csvText = await response.text();
        
        const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        // Exact labels based on user's real data schema
        const freqLabels = {
            'F1': 'F1: Até 1 transação',
            'F2': 'F2: Entre 2 e 3 transações',
            'F3': 'F3: Entre 4 e 6 transações',
            'F4': 'F4: Entre 7 e 13 transações',
            'F5': 'F5: Acima de 14 transações'
        };
        
        const matrix = {
            'F1': { R1:0, R2:0, R3:0, R4:0, R5:0, sumValor:0, sumPedidos:0 },
            'F2': { R1:0, R2:0, R3:0, R4:0, R5:0, sumValor:0, sumPedidos:0 },
            'F3': { R1:0, R2:0, R3:0, R4:0, R5:0, sumValor:0, sumPedidos:0 },
            'F4': { R1:0, R2:0, R3:0, R4:0, R5:0, sumValor:0, sumPedidos:0 },
            'F5': { R1:0, R2:0, R3:0, R4:0, R5:0, sumValor:0, sumPedidos:0 }
        };
        
        let globalTotal = { 
            R1:{sumValor:0, sumPedidos:0}, 
            R2:{sumValor:0, sumPedidos:0}, 
            R3:{sumValor:0, sumPedidos:0}, 
            R4:{sumValor:0, sumPedidos:0}, 
            R5:{sumValor:0, sumPedidos:0}, 
            sumValor:0, 
            sumPedidos:0 
        };

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length < 6) continue;
            
            const faixaRec = cols[0].trim();
            const faixaFreq = cols[1].trim();
            
            if (!faixaFreq || !faixaRec || faixaFreq === 'nan' || faixaRec === 'nan') continue;
            
            const freq = 'F' + faixaFreq.charAt(0);
            const rec = 'R' + faixaRec.charAt(0);
            
            if (matrix[freq] && globalTotal[rec]) {
                const pedidos = parseFloat(cols[3]) || 0;
                const valor = parseFloat(cols[4]) || 0;
                const ticket = parseFloat(cols[5]) || 0;
                
                matrix[freq][rec] = ticket;
                
                matrix[freq].sumValor += valor;
                matrix[freq].sumPedidos += pedidos;
                
                globalTotal[rec].sumValor += valor;
                globalTotal[rec].sumPedidos += pedidos;
                
                globalTotal.sumValor += valor;
                globalTotal.sumPedidos += pedidos;
            }
        }
        
        const formatBRL = (val) => {
            if (val === 0) return 'R$ 0,00';
            return 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };

        let maxVal = 0;
        ['F1','F2','F3','F4','F5'].forEach(f => {
            ['R1','R2','R3','R4','R5'].forEach(r => {
                const val = matrix[f][r];
                if (val > maxVal) maxVal = val;
            });
        });
        
        const getBgStyle = (val) => {
            if (val === 0 || maxVal === 0) return '';
            const intensity = Math.max(0.05, val / maxVal);
            
            const textColor = intensity > 0.6 ? 'color: #FFFFFF; font-weight: 600;' : '';
            return 'background-color: rgba(0, 166, 80, ' + (intensity * 0.9) + '); ' + textColor;
        };
        
        const tbody = document.querySelector('#rfv-ticket-table tbody');
        if (tbody) {
            let html = '';
            ['F1','F2','F3','F4','F5'].forEach(f => {
                html += '<tr>';
                html += '<td>' + freqLabels[f] + '</td>';
                // REVERSE ORDER: R5 down to R1
                ['R5','R4','R3','R2','R1'].forEach(r => {
                    const val = matrix[f][r];
                    html += '<td style="' + getBgStyle(val) + '">' + formatBRL(val) + '</td>';
                });
                const totalRow = matrix[f].sumPedidos > 0 ? matrix[f].sumValor / matrix[f].sumPedidos : 0;
                html += '<td class="col-total">' + formatBRL(totalRow) + '</td>';
                html += '</tr>';
            });
            
            html += '<tr>';
            html += '<td>Total</td>';
            ['R5','R4','R3','R2','R1'].forEach(r => {
                const gt = globalTotal[r];
                const totalCol = gt.sumPedidos > 0 ? gt.sumValor / gt.sumPedidos : 0;
                html += '<td>' + formatBRL(totalCol) + '</td>';
            });
            const totalGlobal = globalTotal.sumPedidos > 0 ? globalTotal.sumValor / globalTotal.sumPedidos : 0;
            html += '<td class="col-total">' + formatBRL(totalGlobal) + '</td>';
            html += '</tr>';
            
            tbody.innerHTML = html;
        }
        
    } catch (e) {
        console.error('Error loading RFV Ticket data:', e);
    }
};

window.loadRFVTicket = loadRFVTicket;
setTimeout(() => { 
    if(typeof loadRFV === "function") loadRFV(); 
    if(typeof loadRFVTicket === "function") loadRFVTicket(); 
}, 500);

const originalUpdateDataRFV = window.updateData;
window.updateData = function() {
    if(originalUpdateDataRFV) originalUpdateDataRFV.apply(this, arguments);
    if(typeof loadRFV === "function") loadRFV();
    if(typeof loadRFVTicket === "function") loadRFVTicket();
};
