const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const badDiv = `<div style="font-size: 12px; color: #6B7280; font-weight: 500; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">`;

// We have duplicated badDivs in Tab 2 and Tab 3.
// Let's replace double occurrences of badDiv with a single one.
// We can use a regex or string replacement.

const doubleBadDivRegex = new RegExp(badDiv.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&') + '\\s*' + badDiv.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&'), 'g');

if (doubleBadDivRegex.test(html)) {
    html = html.replace(doubleBadDivRegex, badDiv);
    fs.writeFileSync('index.html', html);
    console.log('Fixed double divs!');
} else {
    console.log('Double divs not found directly. Let us use a more forgiving regex.');
    // In case there are newlines or spaces between them
    const forgivingRegex = /<div style="font-size: 12px; color: #6B7280; font-weight: 500; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">\s*<div style="font-size: 12px; color: #6B7280; font-weight: 500; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">/g;
    if (forgivingRegex.test(html)) {
        html = html.replace(forgivingRegex, badDiv);
        fs.writeFileSync('index.html', html);
        console.log('Fixed double divs with forgiving regex!');
    } else {
        console.log('STILL not found.');
    }
}
