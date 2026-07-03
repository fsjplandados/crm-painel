const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const rfvBlockRegex = /<div class="section-header fade-in delay-2" style="margin-top: 2rem;">[\s\S]*?<select id="channel-filter">[\s\S]*?<\/select>\s*<\/div>\s*<\/div>/i;

if (rfvBlockRegex.test(html)) {
    html = html.replace(rfvBlockRegex, '');
    fs.writeFileSync('index.html', html);
    console.log('Removed RFV block completely!');
} else {
    console.log('RFV block regex did not match.');
}
