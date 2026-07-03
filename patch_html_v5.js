const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const brokenHtml = `                        <div style="font-size: 11px; font-weight: 700; color: #1E3A8A; text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
                            Perfil de Clientes <span style="color: #9CA3AF; margin: 0 2px;">|</span> Faixa Etária × Sexo
                            <span title="Clientes cadastrados a partir de 2026-01-01" style="cursor: help; color: #64748B; display: flex; align-items: center;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            </span>
                        </div>
                        
                            <div style="color: #F68712;">% FEM: <span id="kpiPctFem">--</span></div>
                        </div>
                    </div>
                    <div style="overflow-x: auto;">`;

const fixedHtml = `                        <div style="font-size: 11px; font-weight: 700; color: #1E3A8A; text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
                            Perfil de Clientes <span style="color: #9CA3AF; margin: 0 2px;">|</span> Faixa Etária × Sexo
                            <span title="Clientes cadastrados a partir de 2026-01-01" style="cursor: help; color: #64748B; display: flex; align-items: center;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            </span>
                        </div>
                    </div>
                    <div style="overflow-x: auto;">`;

// Standardize line endings just in case
let normalizedHtml = html.replace(/\r\n/g, '\n');
let normalizedBroken = brokenHtml.replace(/\r\n/g, '\n');

if (normalizedHtml.includes(normalizedBroken)) {
    normalizedHtml = normalizedHtml.replace(normalizedBroken, fixedHtml);
    fs.writeFileSync('index.html', normalizedHtml);
    console.log('Fixed div structure!');
} else {
    console.log('Broken HTML not found exactly. Let us use regex.');
    const regex = /<div style="font-size: 11px; font-weight: 700; color: #1E3A8A; text-transform: uppercase; display: flex; align-items: center; gap: 6px;">[\s\S]*?<\/svg>\s*<\/span>\s*<\/div>\s*<div style="color: #F68712;">% FEM: <span id="kpiPctFem">--<\/span><\/div>\s*<\/div>\s*<\/div>/m;
    
    if(regex.test(normalizedHtml)) {
        normalizedHtml = normalizedHtml.replace(regex, `<div style="font-size: 11px; font-weight: 700; color: #1E3A8A; text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
                            Perfil de Clientes <span style="color: #9CA3AF; margin: 0 2px;">|</span> Faixa Etária × Sexo
                            <span title="Clientes cadastrados a partir de 2026-01-01" style="cursor: help; color: #64748B; display: flex; align-items: center;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            </span>
                        </div>
                    </div>`);
        fs.writeFileSync('index.html', normalizedHtml);
        console.log('Fixed via regex!');
    } else {
        console.log('Could not find the broken div to fix.');
    }
}
