const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const brokenPart = `                    <div id="gender-bar-masc" style="background: #0D6EFD; width: 50%; height: 100%; transition: width 0.3s;"></div>
                    .heatmap-legend { font-size: 8px !important; margin-top: 4px; margin-bottom: 8px; }
                </style>
                <div class="heatmap-card fade-in delay-2" style="margin-bottom: 0;">`;

const fixedPart = `                    <div id="gender-bar-masc" style="background: #0D6EFD; width: 50%; height: 100%; transition: width 0.3s;"></div>
                    <div id="gender-bar-fem" style="background: #ED1C24; width: 50%; height: 100%; transition: width 0.3s;"></div>
                </div>
            </div>
        </div>

        <!-- Heatmap Card (Full Width) -->
        <div style="margin-bottom: 2rem; width: 100%;">
                <style>
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
                </style>
                <div class="heatmap-card fade-in delay-2" style="margin-bottom: 0;">`;

html = html.replace(brokenPart, fixedPart);
html = html.replace('styles.css?v=16', 'styles.css?v=17');
html = html.replace('app.js?v=67', 'app.js?v=68');
fs.writeFileSync('index.html', html);
