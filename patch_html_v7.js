const fs = require('fs');

// 1. Fix HTML
let html = fs.readFileSync('index.html', 'utf8');

// The block I injected in patch_html_v2.js
const categoriasStr = `            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 2rem; margin-bottom: 2rem;">
                <!-- Categorias de venda - Geral -->
                <div class="kpi-card-simple fade-in delay-1">
                    <div style="font-size: 11px; font-weight: 700; color: #1E3A8A; text-transform: uppercase; margin-bottom: 1rem;">Categorias de venda &mdash; geral</div>
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100px; background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 8px; color: #64748B;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px;"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        <span style="font-size: 12px;">Dado em constru&ccedil;&atilde;o</span>
                    </div>
                </div>
                <!-- Categorias de venda - Medicamentos -->
                <div class="kpi-card-simple fade-in delay-2">
                    <div style="font-size: 11px; font-weight: 700; color: #1E3A8A; text-transform: uppercase; margin-bottom: 1rem;">Categorias de venda &mdash; medicamentos</div>
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100px; background: #F8FAFC; border: 1px dashed #CBD5E1; border-radius: 8px; color: #64748B;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 8px;"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        <span style="font-size: 12px;">Dado em constru&ccedil;&atilde;o</span>
                    </div>
                </div>
            </div>`;

// Replace it exactly 3 times (for Tab 1, 2, 3)
// Since we might have whitespace variations, let's use a regex that matches the structure.
const categoriasRegex = /<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1\.5rem; margin-top: 2rem; margin-bottom: 2rem;">\s*<!-- Categorias de venda - Geral -->[\s\S]*?<!-- Categorias de venda - Medicamentos -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;

// Wait, the block is exactly what I wrote above. Let's try string replace all.
let htmlUpdated = html.split(categoriasStr).join('');

// RFV Subtitle block removal
const rfvSubtitleRegex = /<div style="margin-bottom: 1\.5rem; padding-bottom: 1rem; border-bottom: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: flex-end;">[\s\S]*?<h2 style="font-size: 16px; font-weight: 700; color: #1E3A8A; text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">\s*FREQUÊNCIA, RECOMPRA E COMPARAÇÃO[\s\S]*?<\/h2>\s*<p style="font-size: 13px; color: #64748B; margin: 0;">\s*Acompanhe o comportamento de recompra, ticket médio e compare o desempenho entre os canais\.\s*<\/p>\s*<\/div>\s*<select id="filter-canal" class="kpi-select">\s*<option value="TOTAL">Todos os Canais<\/option>\s*<option value="FISICA">Loja Física<\/option>\s*<option value="VIRTUAL">Virtual<\/option>\s*<\/select>\s*<\/div>/;

if (rfvSubtitleRegex.test(htmlUpdated)) {
    htmlUpdated = htmlUpdated.replace(rfvSubtitleRegex, '');
    console.log('Removed RFV subtitle and filter');
} else {
    console.log('Could not find RFV subtitle exactly');
    // Fallback regex
    const rfvFallbackRegex = /<div[^>]*>[\s\S]*?FREQUÊNCIA, RECOMPRA E COMPARAÇÃO[\s\S]*?Acompanhe o comportamento de recompra[\s\S]*?<\/p>\s*<\/div>\s*<select[^>]*>[\s\S]*?<\/select>\s*<\/div>/;
    if(rfvFallbackRegex.test(htmlUpdated)) {
        htmlUpdated = htmlUpdated.replace(rfvFallbackRegex, '');
        console.log('Removed RFV subtitle with fallback');
    } else {
        console.log('Could not remove RFV subtitle at all');
    }
}

// Write HTML
fs.writeFileSync('index.html', htmlUpdated);


// 2. Fix CSS
let css = fs.readFileSync('styles.css', 'utf8');
// Fix truncation in segmentation list
css = css.replace('white-space: nowrap;', 'white-space: normal;');
// In case it's in a specific class:
css = css.replace('.segmentation-list li {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  font-size: 11px;\n  color: #334155;\n  font-weight: 500;\n  white-space: nowrap;', '.segmentation-list li {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  font-size: 11px;\n  color: #334155;\n  font-weight: 500;\n  white-space: normal;');
fs.writeFileSync('styles.css', css);
console.log('CSS updated for truncation');


// 3. Fix App.js
let appjs = fs.readFileSync('app.js', 'utf8');

// Fix Clientes por Categoria breaking due to missing filters
appjs = appjs.replace(/const genero = document\.getElementById\('filter-genero'\)\.value;/g, "const genero = 'TODOS';");
appjs = appjs.replace(/const idade = document\.getElementById\('filter-idade'\)\.value;/g, "const idade = 'TODAS';");
// Fallback if they were using optional chaining
appjs = appjs.replace(/document\.getElementById\('filter-genero'\)\?.value/g, "'TODOS'");
appjs = appjs.replace(/document\.getElementById\('filter-idade'\)\?.value/g, "'TODAS'");
// Update the actual logic block in renderCronicosTab
appjs = appjs.replace(/const genero = document\.getElementById\('filter-genero'\) \? document\.getElementById\('filter-genero'\)\.value : 'TODOS';/g, "const genero = 'TODOS';");
appjs = appjs.replace(/const idade = document\.getElementById\('filter-idade'\) \? document\.getElementById\('filter-idade'\)\.value : 'TODAS';/g, "const idade = 'TODAS';");

// Make sure female heatmap color is Red instead of Pink
// Old: const colorFem = `rgba(219, 39, 119, ${alpha})`;
appjs = appjs.replace(/rgba\(219, 39, 119/g, "rgba(237, 28, 36");

fs.writeFileSync('app.js', appjs);
console.log('App.js updated for red heatmap and missing filters');
