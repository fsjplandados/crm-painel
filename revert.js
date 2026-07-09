const fs = require('fs');

// Revert app.js
let appJs = fs.readFileSync('app.js', 'utf8');
appJs = appJs.replace(
    "if (l.includes('dormente')) return '#1E3A8A'; // Brand blue for dormente\n                    if (l.includes('risco') || l.includes('atenção')) return '#F97316'; // Orange for warning",
    "if (l.includes('dormente') || l.includes('risco') || l.includes('atenção')) return '#F97316'; // Orange for warning"
);
fs.writeFileSync('app.js', appJs);

// Revert index.html
let html = fs.readFileSync('index.html', 'utf8');
const oldStyle = `                <style>
                    /* Inline style to make heatmap smaller as requested */
                    .heatmap-card { padding: 12px; height: 100%; }
                    .heatmap-table { font-size: 8.5px !important; margin-bottom: 4px; width: 100%; }
                    .heatmap-table th, .heatmap-table td { padding: 2px 1px !important; white-space: nowrap; }
                    .heatmap-title { font-size: 11px !important; }
                    .heatmap-subtitle { font-size: 10px !important; margin-bottom: 8px !important; }
                    .heatmap-section-title { font-size: 10px !important; margin-bottom: 4px !important; }
                    .heatmap-grid { gap: 0.5rem !important; grid-template-columns: 1fr !important; }
                    .legend-bar { width: 100px !important; height: 6px !important; }
                    .heatmap-legend { font-size: 8px !important; margin-top: 4px; margin-bottom: 8px; }
                </style>`;

const newStyle = `                <style>
                    /* Inline style to make heatmap smaller as requested */
                    .heatmap-card { padding: 12px; height: 100%; }
                    .heatmap-table { font-size: 8.5px !important; margin-bottom: 4px; width: max-content; margin-left: auto; margin-right: auto; }
                    .heatmap-table th, .heatmap-table td { padding: 2px 6px !important; white-space: nowrap; text-align: center; }
                    .heatmap-table th:first-child, .heatmap-table td.row-label { text-align: right !important; padding-right: 16px !important; }
                    .heatmap-title { font-size: 11px !important; }
                    .heatmap-subtitle { font-size: 10px !important; margin-bottom: 8px !important; }
                    .heatmap-section-title { font-size: 10px !important; margin-bottom: 4px !important; }
                    .heatmap-grid { gap: 0.5rem !important; grid-template-columns: 1fr !important; }
                    .legend-bar { width: 100px !important; height: 6px !important; }
                    .heatmap-legend { font-size: 8px !important; margin-top: 4px; margin-bottom: 8px; }
                </style>`;

html = html.replace(newStyle, oldStyle);
html = html.replace('styles.css?v=17', 'styles.css?v=18');
html = html.replace('app.js?v=68', 'app.js?v=69');
fs.writeFileSync('index.html', html);
console.log("Revertido");
