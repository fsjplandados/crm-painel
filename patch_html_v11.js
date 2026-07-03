const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const strStart = '<!-- NEW FREQUENCY SECTION -->';
const strEnd = '</select>\n            </div>\n        </div>';

const startIndex = html.indexOf(strStart);
const endIndex = html.indexOf(strEnd, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    const toRemove = html.substring(startIndex, endIndex + strEnd.length);
    html = html.replace(toRemove, '');
    fs.writeFileSync('index.html', html);
    console.log('Removed RFV block perfectly!');
} else {
    console.log('Could not find string exact indices');
}
