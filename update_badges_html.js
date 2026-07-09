const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replacements for the 4 headers
const replaceMap = {
    'Crescimento de Novos Clientes': `Crescimento de Novos Clientes</div>
                    <div class="growth-badge" id="badge-novos-container" style="display: none;">
                        <div class="growth-icon-circle green">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                        </div>
                        <div class="growth-info">
                            <div class="growth-value positive" id="badge-novos-val">...</div>
                            <div class="growth-text">vs mês anterior</div>
                        </div>
                    </div>`,

    'Crescimento de Clientes Fiéis': `Crescimento de Clientes Fiéis</div>
                    <div class="growth-badge" id="badge-fieis-container" style="display: none;">
                        <div class="growth-icon-circle purple">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <div class="growth-info">
                            <div class="growth-value positive" id="badge-fieis-val">...</div>
                            <div class="growth-text">vs mês anterior</div>
                        </div>
                    </div>`,

    'Crescimento da Base Total': `Crescimento da Base Total</div>
                    <div class="growth-badge" id="badge-base-container" style="display: none;">
                        <div class="growth-icon-circle blue">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        </div>
                        <div class="growth-info">
                            <div class="growth-value positive" id="badge-base-val">...</div>
                            <div class="growth-text">vs mês anterior</div>
                        </div>
                    </div>`,

    'Crescimento de Clientes Ativos (90 dias)': `Crescimento de Clientes Ativos (90 dias)</div>
                    <div class="growth-badge" id="badge-ativos-container" style="display: none;">
                        <div class="growth-icon-circle teal">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <div class="growth-info">
                            <div class="growth-value positive" id="badge-ativos-val">...</div>
                            <div class="growth-text">vs mês anterior</div>
                        </div>
                    </div>`
};

for (const [key, replacement] of Object.entries(replaceMap)) {
    // Only replace if it hasn't been replaced yet
    if (!html.includes('badge-novos-container') || key !== 'Crescimento de Novos Clientes') {
        const search = key + '</div>';
        html = html.replace(search, replacement);
    }
}

// Add CSS to styles.css
let css = fs.readFileSync('styles.css', 'utf8');
if (!css.includes('.growth-badge')) {
    css += `\n
/* Growth Badges */
.growth-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
}
.growth-icon-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}
.growth-icon-circle svg {
    width: 18px;
    height: 18px;
}
.growth-icon-circle.green {
    background-color: #ecfdf5;
    color: #10B981;
}
.growth-icon-circle.purple {
    background-color: #f3e8ff;
    color: #8B5CF6;
}
.growth-icon-circle.blue {
    background-color: #eff6ff;
    color: #3B82F6;
}
.growth-icon-circle.teal {
    background-color: #f0fdfa;
    color: #14B8A6;
}
.growth-info {
    display: flex;
    flex-direction: column;
}
.growth-value {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.1;
}
.growth-value.positive {
    color: #10B981;
}
.growth-value.negative {
    color: #EF4444;
}
.growth-text {
    font-size: 11px;
    color: #6B7280;
    font-weight: 500;
}
`;
    fs.writeFileSync('styles.css', css);
}

html = html.replace(/styles\.css\?v=\d+/, 'styles.css?v=' + Date.now());
html = html.replace(/app\.js\?v=\d+/, 'app.js?v=' + Date.now());
fs.writeFileSync('index.html', html);

console.log('HTML and CSS updated');
