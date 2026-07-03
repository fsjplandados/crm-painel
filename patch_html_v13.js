const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Find the block in Tab 3 that we want to remove
// Start string:
const blockStart = '<div class="section-header fade-in delay-2" style="margin-top: 2rem;">\n            <div>\n                <h2 class="chart-title" style="font-size: 1.25rem; font-family: \'Montserrat\', sans-serif; font-weight: 700; color: #1E3A8A; text-transform: uppercase; display: flex; align-items: center; gap: 8px;">Frequência, Recompra e Comparação';

// Wait, I might get the indentation wrong. I'll search just the unique part.
const uniquePart = 'Frequência, Recompra e Comparação <span style="text-transform:none; font-weight:500; font-size:14px; color:#6B7280;">- Período: 1S 2026</span>';

const indexUnique = html.indexOf(uniquePart);

if (indexUnique !== -1) {
    // Find the opening <div class="section-header fade-in delay-2" style="margin-top: 2rem;"> before this index
    const beforeBlock = html.substring(0, indexUnique);
    const startIdx = beforeBlock.lastIndexOf('<div class="section-header fade-in delay-2" style="margin-top: 2rem;">');
    
    // Find the closing </div></div> after this index
    // Note: the block has a select and then two divs close it.
    const selectIdx = html.indexOf('</select>', indexUnique);
    const firstDivClose = html.indexOf('</div>', selectIdx);
    const secondDivClose = html.indexOf('</div>', firstDivClose + 6);
    const endIdx = secondDivClose + 6;
    
    if (startIdx !== -1 && secondDivClose !== -1) {
        const toRemove = html.substring(startIdx, endIdx);
        html = html.replace(toRemove, '');
        fs.writeFileSync('index.html', html);
        console.log('Successfully removed the targeted block in RFV');
    } else {
        console.log('Could not determine block bounds');
    }
} else {
    console.log('Could not find unique part in HTML');
}
