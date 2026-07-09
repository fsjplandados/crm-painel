const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const headStart = '<head>';
if (!html.includes('favicon.png')) {
    html = html.replace(headStart, headStart + '\n    <link rel="icon" type="image/png" href="favicon.png">');
}

// Bump cache to force github pages to refresh
html = html.replace(/styles\.css\?v=\d+/, 'styles.css?v=' + Date.now());
html = html.replace(/app\.js\?v=\d+/, 'app.js?v=' + Date.now());

fs.writeFileSync('index.html', html);
console.log('index.html updated with favicon and new cache busters.');
