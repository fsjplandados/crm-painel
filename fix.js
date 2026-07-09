const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
const before = lines.slice(0, 543).join('\n');
const after = lines.slice(551).join('\n');
const newContent = `
        <!-- MATRIZ RFV VALOR -->
        <div class="chart-card" style="padding: 1.5rem; margin-bottom: 2rem;">
            <div style="margin-bottom: 16px; text-transform: uppercase; color: #1E3A8A; font-weight: 700; font-size: 13px;">Frequência de Compra x Recência x Valor</div>
            <div style="overflow-x: auto;">
                <table id="rfv-valor-table" class="rfv-matrix-table">
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
                        <!-- Gerado via JS -->
                    </tbody>
                </table>
            </div>
        </div>

        <!-- MATRIZ RFV QTD CLIENTES -->
        <div class="chart-card" style="padding: 1.5rem; margin-bottom: 2rem;">
            <div style="margin-bottom: 16px; text-transform: uppercase; color: #1E3A8A; font-weight: 700; font-size: 13px;">Frequência de Compra x Recência x Qtd. de Clientes</div>
            <div style="overflow-x: auto;">
                <table id="rfv-qtd-table" class="rfv-matrix-table">
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
                        <!-- Gerado via JS -->
                        <tr><td colspan="7" style="text-align:center; padding: 20px; color: #64748B;">Dados em construção (Arquivo de Qtd. de Clientes não encontrado)</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
`;
html = before + newContent + after;
html = html.replace('styles.css?v=15', 'styles.css?v=16');
html = html.replace('app.js?v=65', 'app.js?v=66');
fs.writeFileSync('index.html', html);
