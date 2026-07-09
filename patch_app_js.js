const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

// 1. Add createHatchedPattern at the top
if (!appJs.includes('function createHatchedPattern')) {
    const hatchedFn = `
function createHatchedPattern(baseColor = '#E2E8F0', stripeColor = 'rgba(255,255,255,0.8)') {
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 10, 10);
    ctx.strokeStyle = stripeColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(10, 0);
    ctx.moveTo(-5, 5);
    ctx.lineTo(5, -5);
    ctx.moveTo(5, 15);
    ctx.lineTo(15, 5);
    ctx.stroke();
    return ctx.createPattern(canvas, 'repeat');
}
`;
    appJs = hatchedFn + appJs;
}

// 2. Modify getColors to use hatched for the last bar
appJs = appJs.replace(
    /return dataArray\.map\(\(val\)( \=\> |=> )\{/,
    `return dataArray.map((val, index) => {
                if (index === dataArray.length - 1) {
                    return createHatchedPattern();
                }`
);

// 3. Modify getBarOptions to add x-axis formatting (color and *)
const oldXScale = `x: { grid: { display: false }, border: { display: false } }`;
const newXScale = `x: { 
                        grid: { display: false }, 
                        border: { display: false },
                        ticks: {
                            color: function(context) {
                                if (context.index === context.chart.data.labels.length - 1) return '#F59E0B';
                                return '#6B7280';
                            },
                            callback: function(value, index, ticks) {
                                let label = this.getLabelForValue(value);
                                if (index === ticks.length - 1 && !label.endsWith('*')) {
                                    return label + '*';
                                }
                                return label;
                            }
                        }
                    }`;
appJs = appJs.replace(oldXScale, newXScale);

// 4. Modify getBarOptions formatter to suppress % for the last bar
// We need to replace the `if (context.dataIndex > 0) {` inside `formatter:` 
appJs = appJs.replace(
    /if \(context\.dataIndex \> 0\) \{/g,
    `if (context.dataIndex > 0 && context.dataIndex < context.chart.data.labels.length - 1) {`
);

// 5. Update updateBadge logic before renderBarChart calls
const badgeLogic = `
        const updateBadge = (badgeId, dataArray) => {
            const valEl = document.getElementById(badgeId + '-val');
            const containerEl = document.getElementById(badgeId + '-container');
            if (!valEl || !containerEl || dataArray.length < 3) return;
            
            const m1 = dataArray[dataArray.length - 2]; // Last complete month
            const m2 = dataArray[dataArray.length - 3]; // Month before that
            
            if (m2 > 0) {
                const pct = ((m1 - m2) / m2) * 100;
                const sign = pct > 0 ? '+' : '';
                valEl.textContent = \`\${sign}\${pct.toFixed(1).replace('.', ',')}%\`;
                valEl.className = 'growth-value ' + (pct >= 0 ? 'positive' : 'negative');
                containerEl.style.display = 'flex';
            }
        };

        updateBadge('badge-novos', dataNovos);
        updateBadge('badge-fieis', dataFieis);
        updateBadge('badge-base', dataBase);
        updateBadge('badge-ativos', dataAtivos);
`;

const renderTarget = "evolucaoNovosChart = renderBarChart('evolucao-novos-chart', evolucaoNovosChart, labelsNovos, dataNovos, 'green');";
if (appJs.includes(renderTarget) && !appJs.includes("updateBadge('badge-novos', dataNovos);")) {
    appJs = appJs.replace(renderTarget, badgeLogic + '\n        ' + renderTarget);
}

fs.writeFileSync('app.js', appJs);
console.log('app.js patched successfully');
