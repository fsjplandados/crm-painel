const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf8');

// 1. Calculate incompleteLabel inside updateEvolutionCharts
const incompleteLabelLogic = `
        const allPeriods = Array.from(window.availablePeriods || []).sort();
        const maxPeriod = allPeriods.length > 0 ? allPeriods[allPeriods.length - 1] : '';
        const maxParts = maxPeriod.split('-');
        const incompleteLabel = maxParts.length >= 2 ? \`\${maxParts[1]}/\${maxParts[0]}\` : '';
`;

// Insert incompleteLabelLogic right after 'const updateEvolutionCharts = () => {'
appJs = appJs.replace(
    /const updateEvolutionCharts \= \(\) \=\> \{/,
    `const updateEvolutionCharts = () => {${incompleteLabelLogic}`
);

// 2. Modify getColors signature and internal check
appJs = appJs.replace(
    /const getColors \= \(dataArray, theme \= 'blue'\) \=\> \{/,
    `const getColors = (dataArray, labelsArray, theme = 'blue') => {`
);
appJs = appJs.replace(
    /if \(index \=\=\= dataArray\.length \- 1\) \{/,
    `if (labelsArray[index] === incompleteLabel) {`
);

// 3. Modify getBarOptions signature
appJs = appJs.replace(
    /const getBarOptions \= \(datasetData\) \=\> \{/,
    `const getBarOptions = (datasetData, labelsArray) => {`
);

// 4. Modify ticks color
appJs = appJs.replace(
    /if \(context\.index \=\=\= context\.chart\.data\.labels\.length \- 1\) return '\#F59E0B';/,
    `const label = context.chart.data.labels[context.index];
                                if (label === incompleteLabel || label === incompleteLabel + '*') return '#F59E0B';`
);

// 5. Modify ticks callback
appJs = appJs.replace(
    /if \(index \=\=\= ticks\.length \- 1 \&\& \!label\.endsWith\('\*'\)\) \{/,
    `if (label === incompleteLabel && !label.endsWith('*')) {`
);

// 6. Modify formatter to suppress % for incomplete label
const oldFormatterIf = `if (context.dataIndex > 0 && context.dataIndex < context.chart.data.labels.length - 1) {`;
const newFormatterIf = `
                            const currentLabel = context.chart.data.labels[context.dataIndex];
                            if (context.dataIndex > 0 && currentLabel !== incompleteLabel && currentLabel !== incompleteLabel + '*') {`;
appJs = appJs.replace(oldFormatterIf, newFormatterIf);

// 7. Modify renderBarChart signature and calls
appJs = appJs.replace(
    /const renderBarChart \= \(id, chartVar, labels, data, theme \= 'blue'\) \=\> \{/,
    `const renderBarChart = (id, chartVar, labels, data, theme = 'blue') => {`
);
appJs = appJs.replace(
    /backgroundColor\: getColors\(data, theme\)/,
    `backgroundColor: getColors(data, labels, theme)`
);
appJs = appJs.replace(
    /options\: getBarOptions\(data\)/,
    `options: getBarOptions(data, labels)`
);

// 8. Make sure badge hides completely if there's no data to compare (e.g., filtered to 1 month)
const oldUpdateBadge = `if (!valEl || !containerEl || dataArray.length < 3) return;`;
const newUpdateBadge = `if (!valEl || !containerEl) return;
            if (dataArray.length < 3) {
                containerEl.style.display = 'none';
                return;
            }`;
appJs = appJs.replace(oldUpdateBadge, newUpdateBadge);


fs.writeFileSync('app.js', appJs);
console.log('app.js successfully patched for filtered incomplete month logic.');
