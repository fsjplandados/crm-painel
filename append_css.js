const fs = require('fs');

const cssToAppend = `
/* RFV MATRIX TABLE DESIGN */
.rfv-matrix-table { width: max-content; margin: 0 auto; border-collapse: collapse; font-family: 'Montserrat', sans-serif; font-size: 12px; margin-bottom: 24px; }
.rfv-matrix-table th, .rfv-matrix-table td { padding: 12px 16px; text-align: center; border: 1px solid #E5E7EB; white-space: nowrap; }
.rfv-matrix-table th { background-color: #F3F4F6; color: #1F2937; font-weight: 600; }
.rfv-matrix-table th:first-child, .rfv-matrix-table td:first-child { text-align: center; font-weight: 500; color: #1F2937; background-color: #F9FAFB; }
.rfv-matrix-table td { color: #374151; transition: background-color 0.2s; }
.rfv-matrix-table .col-total { font-weight: 700; color: #00A650 !important; }
.rfv-matrix-table tr:last-child td { font-weight: 700; background-color: #F9FAFB; }
.rfv-matrix-table tr:last-child td:first-child { color: #00A650; }
`;

fs.appendFileSync('styles.css', cssToAppend);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/styles\.css\?v=\d+/, 'styles.css?v=' + Date.now());
fs.writeFileSync('index.html', html);
console.log('Appended to styles.css and updated index.html cache buster.');
