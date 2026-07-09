const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const constructionCard = `
            <!-- Dado em construção -->
            <div class="segmentation-card fade-in delay-1" style="grid-column: 1 / -1; display: flex; flex-direction: column; padding: 2.5rem; align-items: center; justify-content: center; text-align: center; background-color: #F8FAFC; border: 1px dashed #CBD5E1;">
                <div style="display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 50%; background-color: #FEF3C7; margin-bottom: 16px;">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#F59E0B" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
                <h3 style="color: #0F172A; margin-bottom: 12px; font-weight: 700; font-size: 1.125rem;">Dado em construção</h3>
                <p style="color: #334155; margin-bottom: 12px; font-weight: 500; font-size: 0.95rem;">
                    Os indicadores de Crescimento de Clientes Fiéis e Crescimento de Clientes Ativos (90 dias) ainda não estão disponíveis.
                </p>
                <p style="color: #64748B; font-size: 0.85rem; line-height: 1.6; max-width: 800px; margin: 0 auto 12px;">
                    A classificação de clientes é baseada na metodologia RFV (Recência, Frequência e Valor), porém o segmento é atualizado sempre que o cliente realiza uma nova compra. Dessa forma, o banco de dados mantém apenas a classificação atual de cada cliente, sem armazenar o histórico mensal da segmentação.
                </p>
                <p style="color: #64748B; font-size: 0.85rem; line-height: 1.6; max-width: 800px; margin: 0 auto;">
                    Por esse motivo, não é possível calcular com precisão a evolução mês a mês desses indicadores com a estrutura de dados atual.
                </p>
            </div>
`;

// Insert the card right after the evolucao-base-chart's card ends
html = html.replace(
    /(<canvas id="evolucao-base-chart"><\/canvas>\s*<\/div>\s*<\/div>)/,
    '$1\n' + constructionCard
);

html = html.replace(/styles\.css\?v=\d+/, 'styles.css?v=' + Date.now());

fs.writeFileSync('index.html', html);
console.log('Dado em construção inserted!');
