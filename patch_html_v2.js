const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
const skeletonBlock = (title) => `
                <div class="segmentation-card" style="height: 100%; display: flex; flex-direction: column;">
                    <div class="segmentation-header" style="margin-bottom: 12px;">
                        <div class="segmentation-title" style="text-transform: uppercase; color: #1E3A8A;">${title}</div>
                    </div>
                    <div style="flex: 1; display: flex; align-items: center; justify-content: center; background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 8px;">
                        <div style="text-align: center; color: #64748B;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px; opacity: 0.5;"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                            <div style="font-size: 12px; font-weight: 500;">Dado em constru&ccedil;&atilde;o</div>
                        </div>
                    </div>
                </div>`;

const getSkeletonBlock = skeletonBlock;

// 1. Add sidebar buttons
let buttonTarget = `            <button class="sidebar-item" onclick="switchTab('tab-4', this)" title="Pacientes Crônicos">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            </button>
        </div>`;
        
const newButtons = `            <button class="sidebar-item" onclick="switchTab('tab-4', this)" title="Pacientes Crônicos">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            </button>
            <button class="sidebar-item" onclick="switchTab('tab-5', this)" title="Campanhas">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </button>
            <button class="sidebar-item" onclick="switchTab('tab-6', this)" title="Multicanais">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </button>
        </div>`;

// Use replace but robust to \r\n
buttonTarget = buttonTarget.replace(/\r\n/g, '\n');
let htmlNorm = html.replace(/\r\n/g, '\n');

if (!htmlNorm.includes("switchTab('tab-5'")) {
    htmlNorm = htmlNorm.replace(buttonTarget, newButtons);
    if (!htmlNorm.includes("switchTab('tab-5'")) {
        console.error("Failed to patch sidebar");
    }
}

// 2. Visão Geral blocks
const visaoTarget = `        <!-- Progressão removida -->
                </div> <!-- Fechando tab-1 -->`;

const visaoNew = `        <!-- Progressão removida -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 2rem; margin-bottom: 2rem;">
                    ${getSkeletonBlock('Clientes reativados no período')}
                    ${getSkeletonBlock('Clientes ativos: Físico, Virtual e Geral')}
                </div>
                </div> <!-- Fechando tab-1 -->`;

if (!htmlNorm.includes('Clientes reativados no período')) {
    htmlNorm = htmlNorm.replace(visaoTarget, visaoNew);
    if (!htmlNorm.includes('Clientes reativados no período')) {
        console.error("Failed to patch tab-1");
    }
}

// 3. Frequência blocks
const freqTarget = `        <!-- Fidelização Inteligente Placeholder -->`;
const freqNew = `        <!-- Progressão removida -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 2rem; margin-bottom: 2rem;">
                    ${getSkeletonBlock('Distribuição por faixa de frequência')}
                    ${getSkeletonBlock('Distribuição por faixa de gasto acum.')}
                </div>
        <!-- Fidelização Inteligente Placeholder -->`;

if (!htmlNorm.includes('Distribuição por faixa de frequência')) {
    htmlNorm = htmlNorm.replace(freqTarget, freqNew);
    if (!htmlNorm.includes('Distribuição por faixa de frequência')) {
        console.error("Failed to patch tab-3");
    }
}

// 4. Pacientes Crônicos blocks
const cronicosTarget = `                        </div>
                    </div>
                </div>
            </div>

                </main>`;

const cronicosNew = `                        </div>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 2rem; margin-bottom: 2rem;">
                ${getSkeletonBlock('Categorias de venda — geral')}
                ${getSkeletonBlock('Categorias de venda — medicamentos')}
            </div>
            
            </div> <!-- End Tab 4 -->

            <!-- Tab 5: Campanhas -->
            <div id="tab-5" class="tab-pane fade-in">
                <div class="fade-in" style="display: flex; justify-content: flex-end; align-items: flex-end; margin-bottom: 1.5rem;">
                    <div style="font-size: 12px; color: #6B7280; font-weight: 500; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            Período: 1S 2026
                        </div>
                    </div>
                </div>
                <div class="section-header" style="margin-bottom: 2rem;">
                    <div>
                        <h2 class="chart-title" style="font-size: 1.5rem; font-family: 'Montserrat', sans-serif; font-weight: 400; color: #1E3A8A; display: flex; align-items: center; gap: 8px;">Campanhas</h2>
                        <p class="dashboard-subtitle">Acompanhe a efetividade das campanhas e contatabilidade.</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 2rem; margin-bottom: 2rem;">
                    ${getSkeletonBlock('Clientes Contatáveis')}
                    ${getSkeletonBlock('% opt-out por canal')}
                </div>
            </div>

            <!-- Tab 6: Multicanais -->
            <div id="tab-6" class="tab-pane fade-in">
                <div class="fade-in" style="display: flex; justify-content: flex-end; align-items: flex-end; margin-bottom: 1.5rem;">
                    <div style="font-size: 12px; color: #6B7280; font-weight: 500; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            Período: 1S 2026
                        </div>
                    </div>
                </div>
                <div class="section-header" style="margin-bottom: 2rem;">
                    <div>
                        <h2 class="chart-title" style="font-size: 1.5rem; font-family: 'Montserrat', sans-serif; font-weight: 400; color: #1E3A8A; display: flex; align-items: center; gap: 8px;">Multicanais</h2>
                        <p class="dashboard-subtitle">Acompanhe os clientes multicanais.</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr; gap: 1.5rem; margin-top: 2rem; margin-bottom: 2rem;">
                    ${getSkeletonBlock('Clientes novos: Geral, Física e virtual')}
                </div>
            </div>

                </main>`;

if (!htmlNorm.includes('Categorias de venda — geral')) {
    htmlNorm = htmlNorm.replace(cronicosTarget, cronicosNew);
    if (!htmlNorm.includes('Categorias de venda — geral')) {
        console.error("Failed to patch tab-4/5/6");
    }
}

fs.writeFileSync('index.html', htmlNorm);
console.log('PATCH V2 APPLIED');
