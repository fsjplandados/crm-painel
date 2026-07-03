const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const sectionHeaderRegex = /<div class="section-header fade-in delay-2" style="margin-top: 2rem;">[\s\S]*?<\/select>\s*<\/div>\s*<\/div>/;

if (sectionHeaderRegex.test(html)) {
    html = html.replace(sectionHeaderRegex, '');
    fs.writeFileSync('index.html', html);
    console.log('Removed section header successfully!');
} else {
    console.log('Could not find section header!');
}
