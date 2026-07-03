const fs = require('fs');

let appjs = fs.readFileSync('app.js', 'utf8');

const regexGenero = /const selGenero = document\.getElementById\('filter-genero'\);\s*generos\.forEach\(g => {[\s\S]*?selGenero\.appendChild\(opt\);\s*}\);/g;

const regexIdade = /const selIdade = document\.getElementById\('filter-idade'\);\s*idades\.forEach\(i => {[\s\S]*?selIdade\.appendChild\(opt\);\s*}\);/g;

if (regexGenero.test(appjs) || regexIdade.test(appjs)) {
    appjs = appjs.replace(regexGenero, `const selGenero = document.getElementById('filter-genero');
            if (selGenero) {
                generos.forEach(g => {
                    const opt = document.createElement('option');
                    opt.value = g;
                    opt.textContent = g;
                    selGenero.appendChild(opt);
                });
            }`);
    
    appjs = appjs.replace(regexIdade, `const selIdade = document.getElementById('filter-idade');
            if (selIdade) {
                idades.forEach(i => {
                    const opt = document.createElement('option');
                    opt.value = i;
                    opt.textContent = i;
                    selIdade.appendChild(opt);
                });
            }`);

    fs.writeFileSync('app.js', appjs);
    console.log('Fixed TypeError in renderCronicosTab');
} else {
    console.log('Could not find regex patterns');
}
