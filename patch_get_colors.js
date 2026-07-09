const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

appJs = appJs.replace(
    'return dataArray.map(val => {',
    `return dataArray.map((val, index) => {
                if (index === dataArray.length - 1) {
                    return createHatchedPattern();
                }`
);

fs.writeFileSync('app.js', appJs);
console.log('getColors patched');
