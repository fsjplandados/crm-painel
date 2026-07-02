document.addEventListener('DOMContentLoaded', async () => {
    // Global Filters State
    window.globalFilters = {
        canal: 'TOTAL',
        genero: 'TODOS',
        idade: 'TODAS'
    };

    // Global Modal Functions
    window.openFiltersModal = function() {
        document.getElementById('filtersModal').style.display = 'flex';
        document.getElementById('globalCanal').value = window.globalFilters.canal;
        document.getElementById('globalGenero').value = window.globalFilters.genero;
        document.getElementById('globalIdade').value = window.globalFilters.idade;
    };

    window.closeFiltersModal = function() {
        document.getElementById('filtersModal').style.display = 'none';
    };

    window.clearFilters = function() {
        document.getElementById('globalCanal').value = 'TOTAL';
        document.getElementById('globalGenero').value = 'TODOS';
        document.getElementById('globalIdade').value = 'TODAS';
    };

    window.applyGlobalFilters = function() {
        window.globalFilters.canal = document.getElementById('globalCanal').value;
        window.globalFilters.genero = document.getElementById('globalGenero').value;
        window.globalFilters.idade = document.getElementById('globalIdade').value;
        window.closeFiltersModal();
        
        // Re-render everything that depends on these filters
        loadBaseTotal();
        loadActiveClients();
        loadHeatmap();
        loadFrequenciaTicket();
        loadCategorias();
    };

    // Elements for First KPI (Base Total)
    const totalClientsEl = document.getElementById('total-clients');
    const segmentsList = document.getElementById('kpi-segments-list');

    // Elements for Active Clients
    const kpi30dEl = document.getElementById('kpi-30d');
    const kpi60dEl = document.getElementById('kpi-60d');
    const kpi90dEl = document.getElementById('kpi-90d');
    const delta30dEl = document.getElementById('delta-30d');
    const delta60dEl = document.getElementById('delta-60d');
    const delta90dEl = document.getElementById('delta-90d');
    
    // Elements for Progress & Pct
    const deltaPct30dEl = document.getElementById('delta-pct-30d');
    const deltaPct60dEl = document.getElementById('delta-pct-60d');
    const deltaPct90dEl = document.getElementById('delta-pct-90d');
    const progress30dEl = document.getElementById('progress-30d');
    const progress60dEl = document.getElementById('progress-60d');
    const progress90dEl = document.getElementById('progress-90d');

    const formatNumber = (num) => {
        return new Intl.NumberFormat('pt-BR').format(num);
    };

    const getSegmentColor = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('sem segmentação')) return '#9CA3AF';
        if (lower.includes('clientes fiéis') || lower.includes('clientes fieis')) return '#2563EB';
        if (lower.includes('potencial fiel')) return '#93C5FD';
        if (lower.includes('campeão') || lower.includes('campeao')) return '#10B981';
        if (lower.includes('em risco')) return '#FBBF24';
        if (lower.includes('hibernando')) return '#F97316';
        if (lower.includes('quase dormindo')) return '#EF4444';
        if (lower.includes('novos clientes')) return '#A855F7';
        if (lower.includes('precisa de atenção') || lower.includes('atencao')) return '#F472B6';
        if (lower.includes('clientes promissores')) return '#FBCFE8';
        if (lower.includes('não perder') || lower.includes('nao perder')) return '#60A5FA';
        return '#CBD5E1'; // default
    };

    let globalTotalBase = 0;

    const loadBaseTotal = async () => {
        try {
            const response = await fetch(`Arquivos Jun-2026/Base total.csv?v=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const csvText = await response.text();
            
            const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0 && !line.includes('2026-06-01') && !line.includes('Jun/26'));
            let segmentsData = [];

            for (let i = 1; i < lines.length; i++) {
                const [segment, qtdStr] = lines[i].split(',');
                if (!qtdStr) continue;
                const qtd = parseInt(qtdStr, 10);
                
                let segmentName = segment.trim();
                if (segmentName === '' || segmentName === '0') {
                    segmentName = 'Sem segmentação';
                }

                segmentsData.push({ name: segmentName, value: qtd });
                globalTotalBase += qtd;
            }

            totalClientsEl.textContent = formatNumber(globalTotalBase);
            segmentsData.sort((a, b) => b.value - a.value);

            segmentsList.innerHTML = '';
            segmentsData.forEach(item => {
                const pct = ((item.value / globalTotalBase) * 100).toFixed(1);
                const color = getSegmentColor(item.name);
                
                const div = document.createElement('div');
                div.className = 'segment-row';
                div.innerHTML = `
                    <div class="segment-name" title="${item.name}">${item.name}</div>
                    <div class="progress-bar-bg" style="height: 12px; border-radius: 6px;">
                        <div class="progress-bar-fill" style="width: ${pct}%; background-color: ${color}; height: 100%; border-radius: 6px;"></div>
                    </div>
                    <div class="segment-value">${formatNumber(item.value)}</div>
                    <div class="segment-percent">${pct}%</div>
                `;
                segmentsList.appendChild(div);
            });
        } catch (error) {
            console.error('Error loading Base total:', error);
            totalClientsEl.textContent = 'Erro';
            if (segmentsList) segmentsList.innerHTML = `<div style="color: red; font-size: 11px;">Erro ao carregar 'Base total.csv'.</div>`;
        }
    };

    const loadActiveClients = async () => {
        try {
            const response = await fetch(`Arquivos Jun-2026/Base-clientes-30d--60d-90d.csv?v=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const csvText = await response.text();
            
            const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0 && !line.includes('2026-06-01') && !line.includes('Jun/26'));
            
            let total30d = 0;
            let total60d = 0;
            let total90d = 0;

            const mainChartData = { labels: [], data30: [], data60: [], data90: [] };
            const secChartData = { labels: [], data30: [], data60: [], data90: [] };

            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',');
                if (cols.length < 4) continue;

                const canal = cols[0].trim();
                const v30 = parseInt(cols[1], 10);
                const v60 = parseInt(cols[2], 10);
                const v90 = parseInt(cols[3], 10);

                total30d += v30;
                total60d += v60;
                total90d += v90;

                let formattedCanal = canal;
                if (canal === 'GERAL') formattedCanal = 'Geral';
                if (canal === 'LOJA_F') formattedCanal = 'Loja física';
                if (canal === 'MARKETPLACE') formattedCanal = 'Marketplace';
                if (canal === 'VIRTUAL') formattedCanal = 'Virtual';

                if (canal === 'GERAL' || canal === 'LOJA_F') {
                    mainChartData.labels.push(formattedCanal);
                    mainChartData.data30.push(v30);
                    mainChartData.data60.push(v60);
                    mainChartData.data90.push(v90);
                } else if (canal === 'MARKETPLACE' || canal === 'VIRTUAL') {
                    secChartData.labels.push(formattedCanal);
                    secChartData.data30.push(v30);
                    secChartData.data60.push(v60);
                    secChartData.data90.push(v90);
                }
            }

            const delta60 = ((total60d - total30d) / total30d) * 100;
            const delta90 = ((total90d - total60d) / total60d) * 100;

            // Populate KPIs
            kpi30dEl.textContent = formatNumber(total30d);
            kpi60dEl.textContent = formatNumber(total60d);
            kpi90dEl.textContent = formatNumber(total90d);

            // Populate text deltas
            if (delta30dEl) delta30dEl.style.display = 'none'; // Not used in new layout for 30d
            delta60dEl.innerHTML = `&#8593;+${Math.round(delta60)}% <span style="color:#6B7280; font-weight:500;">vs 30 dias</span>`;
            delta90dEl.innerHTML = `&#8593;+${Math.round(delta90)}% <span style="color:#6B7280; font-weight:500;">vs 60 dias</span>`;

            // Setup % of base and progress bars (Wait for Base Total to be calculated)
            setTimeout(() => {
                if (globalTotalBase > 0) {
                    const pct30 = ((total30d / globalTotalBase) * 100).toFixed(1);
                    const pct60 = ((total60d / globalTotalBase) * 100).toFixed(1);
                    const pct90 = ((total90d / globalTotalBase) * 100).toFixed(1);

                    if (deltaPct30dEl) deltaPct30dEl.textContent = `${pct30}% da base`;
                    if (deltaPct60dEl) deltaPct60dEl.textContent = `${pct60}% da base`;
                    if (deltaPct90dEl) deltaPct90dEl.textContent = `${pct90}% da base`;

                    setTimeout(() => {
                        if (progress30dEl) progress30dEl.style.width = `${pct30}%`;
                        if (progress60dEl) progress60dEl.style.width = `${pct60}%`;
                        if (progress90dEl) progress90dEl.style.width = `${pct90}%`;
                    }, 100);

                    // --- Progressão da Base Logic (Insight Only) ---
                    const inativos = globalTotalBase - total90d;
                    const p_inativos = ((inativos / globalTotalBase) * 100).toFixed(1);

                    const flowFooterPctEl = document.getElementById('flow-footer-pct');
                    if (flowFooterPctEl) {
                        flowFooterPctEl.textContent = `${p_inativos}%`;
                    }
                }
            }, 500);

            // Register ChartDataLabels plugin
            if (typeof ChartDataLabels !== 'undefined') {
                Chart.register(ChartDataLabels);
            }

            const getChartConfig = (data, isMillions) => {
                return {
                    type: 'bar',
                    data: {
                        labels: data.labels,
                        datasets: [
                            {
                                label: '30 dias',
                                data: data.data30,
                                backgroundColor: '#0D6EFD',
                                barPercentage: 0.85,
                                categoryPercentage: 0.8
                            },
                            {
                                label: '60 dias',
                                data: data.data60,
                                backgroundColor: '#10B981',
                                barPercentage: 0.85,
                                categoryPercentage: 0.8
                            },
                            {
                                label: '90 dias',
                                data: data.data90,
                                backgroundColor: '#F59E0B',
                                barPercentage: 0.85,
                                categoryPercentage: 0.8
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: {
                            padding: { top: 20 }
                        },
                        plugins: {
                            legend: {
                                display: isMillions,
                                position: 'top',
                                align: 'start',
                                labels: {
                                    usePointStyle: true,
                                    boxWidth: 10,
                                    font: { family: "'Inter', sans-serif", size: 11 },
                                    color: '#4B5563'
                                }
                            },
                            datalabels: {
                                anchor: 'end',
                                align: 'top',
                                color: '#6B7280',
                                font: {
                                    family: "'Inter', sans-serif",
                                    size: 9,
                                    weight: 600
                                },
                                formatter: function(value) {
                                    if (isMillions) {
                                        return (value / 1000000).toFixed(1) + 'M';
                                    } else {
                                        return (value / 1000).toFixed(0) + 'K';
                                    }
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return context.dataset.label + ': ' + formatNumber(context.parsed.y);
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { display: false },
                                grid: { display: false, drawBorder: false }
                            },
                            x: {
                                ticks: {
                                    color: '#6B7280',
                                    font: { family: "'Inter', sans-serif", size: 11, weight: 500 }
                                },
                                grid: { display: false, drawBorder: false }
                            }
                        }
                    }
                };
            };

            const mainCtx = document.getElementById('active-clients-chart-main').getContext('2d');
            const secCtx = document.getElementById('active-clients-chart-secondary').getContext('2d');
            
            if (window.mainChart) window.mainChart.destroy();
            if (window.secChart) window.secChart.destroy();
            
            window.mainChart = new Chart(mainCtx, getChartConfig(mainChartData, true));
            window.secChart = new Chart(secCtx, getChartConfig(secChartData, false));

        } catch (error) {
            console.error('Error loading Active Clients:', error);
            if (kpi30dEl) kpi30dEl.textContent = 'Erro';
            if (kpi60dEl) kpi60dEl.textContent = 'Erro';
            if (kpi90dEl) kpi90dEl.textContent = 'Erro';
        }
    };

    const loadHeatmap = async () => {
        try {
            const response = await fetch(`Arquivos Jun-2026/Faixa etaria e ticket.csv?v=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const csvText = await response.text();
            
            const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0 && !line.includes('2026-06-01') && !line.includes('Jun/26'));
            
            // Dynamically extract ages and rows (Faixa de ticket) in order of appearance
            const agesSet = new Set();
            const rowsSet = new Set();
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',');
                if (cols.length < 4) continue;
                const ageStr = cols[0].trim();
                const ticketStr = cols[1].trim();
                
                if (ageStr !== 'TOTAL') agesSet.add(ageStr);
                if (ticketStr !== 'TOTAL') rowsSet.add(ticketStr);
            }
            const ages = Array.from(agesSet);
            const rows = Array.from(rowsSet);
            
            // Data structure: data[gender][row][age] = count
            const data = {
                MASCULINO: {},
                FEMININO: {}
            };
            
            rows.forEach(r => {
                data.MASCULINO[r] = {};
                data.FEMININO[r] = {};
                ages.forEach(a => {
                    data.MASCULINO[r][a] = 0;
                    data.FEMININO[r][a] = 0;
                });
            });

            let totalM = 0;
            let totalF = 0;

            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',');
                if (cols.length < 4) continue;
                
                let ageStr = cols[0].trim();
                let ticketStr = cols[1].trim();
                let mCount = parseInt(cols[2], 10) || 0;
                let fCount = parseInt(cols[3], 10) || 0;

                if (ageStr === 'TOTAL' || ticketStr === 'TOTAL') {
                    if (ageStr === 'TOTAL' && ticketStr === 'TOTAL') {
                        totalM = mCount;
                        totalF = fCount;
                    }
                    continue;
                }

                if (data.MASCULINO[ticketStr] !== undefined && data.MASCULINO[ticketStr][ageStr] !== undefined) {
                    data.MASCULINO[ticketStr][ageStr] += mCount;
                    data.FEMININO[ticketStr][ageStr] += fCount;
                }
            }

            // Populate Perfil de Clientes Table
            const perfilTbody = document.getElementById('perfil-table-body');
            const perfilTfoot = document.getElementById('perfil-table-foot');
            const totalGender = totalM + totalF;

            if (perfilTbody && perfilTfoot && totalGender > 0) {
                const ageTotals = {};
                ages.forEach(a => {
                    ageTotals[a] = { m: 0, f: 0 };
                    rows.forEach(r => {
                        ageTotals[a].m += data.MASCULINO[r][a] || 0;
                        ageTotals[a].f += data.FEMININO[r][a] || 0;
                    });
                });

                let maxAgeVal = 0;
                ages.forEach(a => {
                    if (ageTotals[a].m > maxAgeVal) maxAgeVal = ageTotals[a].m;
                    if (ageTotals[a].f > maxAgeVal) maxAgeVal = ageTotals[a].f;
                });

                let htmlBody = '';
                // Sort ages if needed, assuming ages array is roughly correct or we can hardcode order if needed, but ages is already ordered by Set extraction if data is ordered.
                ages.forEach(a => {
                    const m = ageTotals[a].m;
                    const f = ageTotals[a].f;
                    const t = m + f;
                    const pctM = t > 0 ? (m / t * 100) : 0;
                    const pctF = t > 0 ? (f / t * 100) : 0;
                    const barPctM = maxAgeVal > 0 ? (m / maxAgeVal * 100) : 0;
                    const barPctF = maxAgeVal > 0 ? (f / maxAgeVal * 100) : 0;
                    
                    htmlBody += `<tr style="border-bottom: 1px solid #F1F5F9;">
                        <td style="text-align: left; padding: 6px 2px; font-weight: 600; color: #475569;">${a}</td>
                        <td style="padding: 6px 2px; color: #1E293B;">${formatNumber(m)}</td>
                        <td style="padding: 6px 2px;">
                            <div style="display: flex; align-items: center; justify-content: center; height: 16px; width: 100%;">
                                <div style="flex: 1; display: flex; justify-content: flex-end; height: 100%; border-right: 1px solid #FFFFFF;">
                                    <div style="background: #3B82F6; width: ${barPctM}%; border-radius: 4px 0 0 4px;"></div>
                                </div>
                                <div style="flex: 1; display: flex; justify-content: flex-start; height: 100%; border-left: 1px solid #FFFFFF;">
                                    <div style="background: #F472B6; width: ${barPctF}%; border-radius: 0 4px 4px 0;"></div>
                                </div>
                            </div>
                        </td>
                        <td style="padding: 6px 2px; text-align: left; color: #1E293B;">${formatNumber(f)}</td>
                        <td style="padding: 6px 2px; font-weight: 600; color: #1E293B;">${formatNumber(t)}</td>
                        <td style="padding: 6px 2px; color: #1E3A8A; font-weight: 600;">${pctM.toFixed(2).replace('.', ',')}%</td>
                        <td style="padding: 6px 2px; color: #1E3A8A; font-weight: 600;">${pctF.toFixed(2).replace('.', ',')}%</td>
                    </tr>`;
                });
                perfilTbody.innerHTML = htmlBody;

                const overallPctM = (totalM / totalGender * 100).toFixed(2).replace('.', ',');
                const overallPctF = (totalF / totalGender * 100).toFixed(2).replace('.', ',');
                
                perfilTfoot.innerHTML = `<tr>
                    <td style="text-align: left; padding: 6px 2px;">TOTAL</td>
                    <td style="padding: 6px 2px;">${formatNumber(totalM)}</td>
                    <td style="padding: 6px 2px;"></td>
                    <td style="padding: 6px 2px; text-align: left;">${formatNumber(totalF)}</td>
                    <td style="padding: 6px 2px;">${formatNumber(totalGender)}</td>
                    <td style="padding: 6px 2px; color: #1E3A8A;">${overallPctM}%</td>
                    <td style="padding: 6px 2px; color: #1E3A8A;">${overallPctF}%</td>
                </tr>`;

                // Update summary text
                const summaryText = document.getElementById('perfil-summary-text');
                if (summaryText) {
                    // Find biggest age group
                    let biggestAge = '';
                    let biggestVal = 0;
                    ages.forEach(a => {
                        const t = ageTotals[a].m + ageTotals[a].f;
                        if (t > biggestVal) { biggestVal = t; biggestAge = a; }
                    });
                    const pctBiggest = ((biggestVal / totalGender) * 100).toFixed(1).replace('.', ',');
                    
                    summaryText.innerHTML = `Maior concentração de clientes na faixa de ${biggestAge} anos (${pctBiggest}% da base analisada).<br>
                    Homens representam ${overallPctM.split(',')[0]}% do total em todas as faixas etárias.`;
                }
            }

            // Find Max % for color scaling
            let maxM = 0;
            let maxF = 0;
            const pctDataM = {};
            const pctDataF = {};

            rows.forEach(r => {
                pctDataM[r] = {};
                pctDataF[r] = {};
                ages.forEach(a => {
                    const pM = totalM > 0 ? (data.MASCULINO[r][a] / totalM) * 100 : 0;
                    const pF = totalF > 0 ? (data.FEMININO[r][a] / totalF) * 100 : 0;
                    pctDataM[r][a] = pM;
                    pctDataF[r][a] = pF;
                    if (pM > maxM) maxM = pM;
                    if (pF > maxF) maxF = pF;
                });
            });

            const renderTable = (tableId, pctData, maxVal, rgbColor) => {
                const table = document.getElementById(tableId);
                if (!table) return;
                
                let html = `<tr><th>Faixa de valor</th>`;
                ages.forEach(a => html += `<th>${a}</th>`);
                html += `</tr>`;

                rows.forEach(r => {
                    html += `<tr><td class="row-label">${r}</td>`;
                    ages.forEach(a => {
                        const val = pctData[r][a];
                        // Normalize opacity between 0 and 0.8
                        const opacity = maxVal > 0 ? (val / maxVal) * 0.8 : 0;
                        const bg = `rgba(${rgbColor}, ${opacity})`;
                        const displayVal = val > 0 ? val.toFixed(1).replace('.', ',') + '%' : '';
                        
                        html += `<td class="heatmap-cell" style="background-color: ${bg};" title="${val.toFixed(2)}%">${displayVal}</td>`;
                    });
                    html += `</tr>`;
                });
                
                table.innerHTML = html;
            };

            renderTable('heatmap-m', pctDataM, maxM, '59, 130, 246'); // Blue
            renderTable('heatmap-f', pctDataF, maxF, '236, 72, 153'); // Pink

        } catch (error) {
            console.error('Error loading Heatmap:', error);
        }
    };

    const loadFrequenciaTicket = async () => {
        try {
            const response = await fetch(`Arquivos Jun-2026/frequencia_com_ticket_medio.csv?v=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const csvText = await response.text();
            
            const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0 && !line.includes('2026-06-01') && !line.includes('Jun/26'));
            
            // Expected columns: MES, CANAL, FREQUENCIA_MEDIA, TICKET_MEDIO, PCT_RECOMPRA_MES, MEDIA_DIAS_RECOMPRA
            let rawData = [];
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(',');
                if (cols.length < 6) continue;
                
                rawData.push({
                    mes: cols[0].trim(),
                    canal: cols[1].trim(),
                    freq: parseFloat(cols[2]) || 0,
                    ticket: parseFloat(cols[3]) || 0,
                    recompra: parseFloat(cols[4]) || 0,
                    dias: parseFloat(cols[5]) || 0
                });
            }

            // Extract unique sorted months
            let uniqueMonths = [...new Set(rawData.map(d => d.mes))].sort();
            const formatMonth = (dateStr) => {
                const parts = dateStr.split('-');
                if (parts.length < 3) return dateStr;
                const date = new Date(parts[0], parseInt(parts[1]) - 1, parts[2]);
                return date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('. de ', '/').replace(' de ', '/').toLowerCase().replace(/(?:^|\s)\S/g, a => a.toUpperCase());
            };
            const labels = uniqueMonths.map(formatMonth);

            const getChannelName = (c) => {
                if (c === 'LOJA_F') return 'Loja Física';
                if (c === 'CANAIS_VIRTUAIS') return 'Canais Virtuais';
                if (c === 'TELEVENDAS') return 'Televendas';
                if (c === 'TOTAL') return 'Todos os Canais';
                return c;
            };

            const renderFrequenciaDashboard = (selectedCanal) => {
                const channelData = rawData.filter(d => d.canal === selectedCanal).sort((a, b) => a.mes.localeCompare(b.mes));
                
                if (channelData.length >= 2) {
                    const current = channelData[channelData.length - 1];
                    const prev = channelData[channelData.length - 2];

                    const renderKpi = (idVal, idDelta, curr, prevVal, isPct, isInverse, decimals, prefix) => {
                        document.getElementById(idVal).innerHTML = (prefix ? prefix + ' ' : '') + curr.toFixed(decimals).replace('.', ',') + (isPct ? '%' : '');
                        const delta = curr - prevVal;
                        let deltaPct = prevVal !== 0 ? (delta / prevVal) * 100 : 0;
                        
                        let deltaStr = '';
                        let colorClass = '';
                        let arrow = '';

                        if (isPct) {
                            // Points percentuais
                            deltaStr = (delta > 0 ? '+' : '') + delta.toFixed(1).replace('.', ',') + ' p.p.';
                        } else {
                            // Percentual change
                            deltaStr = (deltaPct > 0 ? '+' : '') + deltaPct.toFixed(1).replace('.', ',') + '%';
                        }

                        if (delta > 0) {
                            arrow = '&#9650;';
                            colorClass = isInverse ? 'negative' : 'positive';
                        } else if (delta < 0) {
                            arrow = '&#9660;';
                            colorClass = isInverse ? 'positive' : 'negative';
                        } else {
                            arrow = '-';
                            colorClass = 'subtext';
                        }

                        const el = document.getElementById(idDelta);
                        el.className = `freq-kpi-delta ${colorClass}`;
                        el.innerHTML = `${arrow} ${deltaStr} <span style="color:#6B7280; font-weight:500;">vs mês anterior</span>`;
                    };

                    renderKpi('kpi-freq', 'delta-freq', current.freq, prev.freq, false, false, 2, '');
                    renderKpi('kpi-ticket', 'delta-ticket', current.ticket, prev.ticket, false, false, 2, 'R$');
                    renderKpi('kpi-recompra', 'delta-recompra', current.recompra * 100, prev.recompra * 100, true, false, 1, '');
                    
                    document.getElementById('kpi-dias').innerHTML = current.dias.toFixed(0) + ' <span style="font-size:16px; font-weight:600;">dias</span>';
                    const deltaDias = current.dias - prev.dias;
                    const deltaDiasEl = document.getElementById('delta-dias');
                    if (deltaDias > 0) {
                        deltaDiasEl.className = 'freq-kpi-delta negative';
                        deltaDiasEl.innerHTML = `&#9650; +${deltaDias.toFixed(1).replace('.', ',')} dias <span style="color:#6B7280; font-weight:500;">vs mês anterior</span>`;
                    } else if (deltaDias < 0) {
                        deltaDiasEl.className = 'freq-kpi-delta positive';
                        deltaDiasEl.innerHTML = `&#9660; ${deltaDias.toFixed(1).replace('.', ',')} dias <span style="color:#6B7280; font-weight:500;">vs mês anterior</span>`;
                    } else {
                        deltaDiasEl.className = 'freq-kpi-delta subtext';
                        deltaDiasEl.innerHTML = `- 0 dias <span style="color:#6B7280; font-weight:500;">vs mês anterior</span>`;
                    }
                }

                // Render Charts
                const commonOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: { padding: { top: 24, left: 10, right: 10 } },
                    plugins: { legend: { display: false }, datalabels: { display: false } },
                    scales: {
                        x: { grid: { display: false, drawBorder: false }, ticks: { color: '#6B7280', font: { family: "'Inter', sans-serif", size: 10 } } },
                        y: { grace: '20%', grid: { color: '#F3F4F6', drawBorder: false }, ticks: { color: '#9CA3AF', font: { family: "'Inter', sans-serif", size: 10 } } }
                    },
                    elements: { line: { tension: 0.3, borderWidth: 2 }, point: { radius: 4, hitRadius: 10, hoverRadius: 6 } }
                };

                const createChart = (id, dataArr, color, yOptions) => {
                    if (window[`chart_${id}`]) window[`chart_${id}`].destroy();
                    const ctx = document.getElementById(id).getContext('2d');
                    
                    const opts = JSON.parse(JSON.stringify(commonOptions));
                    opts.scales.y = { ...opts.scales.y, ...yOptions };
                    
                    opts.plugins.datalabels = {
                        display: true,
                        align: 'top',
                        anchor: 'end',
                        color: '#111827',
                        font: { family: "'Inter', sans-serif", size: 10, weight: 600 },
                        formatter: yOptions.formatter || (v => v)
                    };

                    window[`chart_${id}`] = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [{
                                data: dataArr,
                                borderColor: color,
                                backgroundColor: color,
                            }]
                        },
                        options: opts
                    });
                };

                const chartData = uniqueMonths.map(m => channelData.find(d => d.mes === m) || { freq: 0, ticket: 0, recompra: 0, dias: 0 });
                
                try { createChart('chart-freq', chartData.map(d => d.freq), '#0D6EFD', { formatter: v => v.toFixed(2).replace('.', ',') }); } catch (e) { console.error('Error freq chart', e); }
                try { createChart('chart-ticket', chartData.map(d => d.ticket), '#10B981', { formatter: v => (v||0).toFixed(2).replace('.', ',') }); } catch (e) { console.error('Error ticket chart', e); }
                try { createChart('chart-recompra', chartData.map(d => d.recompra * 100), '#8B5CF6', { formatter: v => (v||0).toFixed(1).replace('.', ',') + '%' }); } catch (e) { console.error('Error recompra chart', e); }
                
                // Média dias is bar chart
                try {
                    if (window.chart_dias) window.chart_dias.destroy();
                    const ctxDias = document.getElementById('chart-dias').getContext('2d');
                    window.chart_dias = new Chart(ctxDias, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                data: chartData.map(d => d.dias),
                                backgroundColor: '#F59E0B',
                                barPercentage: 0.4
                            }]
                        },
                        options: {
                            ...commonOptions,
                            plugins: {
                                legend: { display: false },
                                datalabels: {
                                    display: true, anchor: 'end', align: 'top', color: '#111827', font: { family: "'Inter', sans-serif", size: 10, weight: 600 }, formatter: v => (v||0).toFixed(1).replace('.', ',')
                                }
                            },
                            scales: {
                                y: { grace: '20%', beginAtZero: true, grid: { color: '#F3F4F6' }, ticks: { color: '#9CA3AF' } },
                                x: { grid: { display: false } }
                            }
                        }
                    });
                } catch (e) { console.error('Error dias chart', e); }
            };

            // Calculate Comparison Table
            const channelsToCompare = ['LOJA_F', 'CANAIS_VIRTUAIS', 'TELEVENDAS'];
            const averages = {};

            channelsToCompare.forEach(c => {
                const cData = rawData.filter(d => d.canal === c);
                if (cData.length > 0) {
                    averages[c] = {
                        freq: cData.reduce((s, d) => s + d.freq, 0) / cData.length,
                        ticket: cData.reduce((s, d) => s + d.ticket, 0) / cData.length,
                        recompra: cData.reduce((s, d) => s + d.recompra, 0) / cData.length,
                        dias: cData.reduce((s, d) => s + d.dias, 0) / cData.length
                    };
                }
            });

            const tbody = document.getElementById('comp-table-body');
            let html = '';
            
            const ref = averages['LOJA_F'];
            
            channelsToCompare.forEach((c, idx) => {
                if (!averages[c]) return;
                const avg = averages[c];
                
                const getBadge = (val, refVal, isInverse) => {
                    if (c === 'LOJA_F') return `<div style="height:18px;"></div>`;
                    if (refVal === 0) return '';
                    
                    let ratio = val / refVal;
                    let text = '';
                    let badgeClass = '';
                    
                    if (ratio > 1) {
                        text = `${ratio.toFixed(2).replace('.', ',')}x maior que Loja Física`;
                        badgeClass = isInverse ? 'red' : 'green';
                    } else if (ratio < 1) {
                        text = `${ratio.toFixed(2).replace('.', ',')}x da Loja Física`;
                        badgeClass = isInverse ? 'green' : 'red';
                    } else {
                        return `<div style="height:18px;"></div>`;
                    }
                    return `<div class="comp-badge ${badgeClass}">${text}</div>`;
                };

                let icon = '';
                if (c === 'LOJA_F') icon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
                if (c === 'CANAIS_VIRTUAIS') icon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`;
                if (c === 'TELEVENDAS') icon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;

                html += `<tr>
                    <td>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="width:40px; height:40px; background:#EFF6FF; border-radius:8px; display:flex; align-items:center; justify-content:center;">${icon}</div>
                            <div>
                                <div class="comp-channel-name">${getChannelName(c)}</div>
                                <div class="comp-channel-sub">${c === 'LOJA_F' ? '(referência)' : (c === 'CANAIS_VIRTUAIS' ? '(APP, SITE, iFood)' : '')}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="comp-value">${avg.freq.toFixed(2).replace('.', ',')}</div>
                        ${getBadge(avg.freq, ref.freq, false)}
                        <div style="width: 100%; height: 4px; background: #E2E8F0; border-radius: 2px; margin-top: 8px;"><div style="width: ${(avg.freq / 2.5)*100}%; height: 100%; background: #3B82F6; border-radius: 2px;"></div></div>
                    </td>
                    <td>
                        <div class="comp-value">R$ ${avg.ticket.toFixed(2).replace('.', ',')}</div>
                        ${getBadge(avg.ticket, ref.ticket, false)}
                        <div style="width: 100%; height: 4px; background: #E2E8F0; border-radius: 2px; margin-top: 8px;"><div style="width: ${(avg.ticket / 150)*100}%; height: 100%; background: #10B981; border-radius: 2px;"></div></div>
                    </td>
                    <td>
                        <div class="comp-value">${(avg.recompra * 100).toFixed(1).replace('.', ',')}%</div>
                        ${getBadge(avg.recompra, ref.recompra, false)}
                        <div style="width: 100%; height: 4px; background: #E2E8F0; border-radius: 2px; margin-top: 8px;"><div style="width: ${(avg.recompra * 100)}%; height: 100%; background: #8B5CF6; border-radius: 2px;"></div></div>
                    </td>
                    <td>
                        <div class="comp-value">${avg.dias.toFixed(1).replace('.', ',')}</div>
                        ${getBadge(avg.dias, ref.dias, true)}
                        <div style="width: 100%; height: 4px; background: #E2E8F0; border-radius: 2px; margin-top: 8px;"><div style="width: ${(avg.dias / 15)*100}%; height: 100%; background: #F59E0B; border-radius: 2px;"></div></div>
                    </td>
                </tr>`;
            });
            tbody.innerHTML = html;

            const filterEl = document.getElementById('channel-filter');
            filterEl.addEventListener('change', (e) => {
                renderFrequenciaDashboard(e.target.value);
            });

            // Initial render
            window.renderFrequenciaTicket = () => {
                renderFrequenciaDashboard(window.globalFilters.canal);
            };
            window.renderFrequenciaTicket();

            // Render Multi-line Comparativo Charts
            const createMultiChart = (id, propertyKey, isPercentage) => {
                const ctx = document.getElementById(id).getContext('2d');
                const channels = ['LOJA_F', 'CANAIS_VIRTUAIS', 'TELEVENDAS'];
                const channelColors = {
                    'LOJA_F': '#0D6EFD',
                    'CANAIS_VIRTUAIS': '#8B5CF6',
                    'TELEVENDAS': '#F59E0B'
                };
                
                const datasets = channels.map(c => {
                    const chData = uniqueMonths.map(m => {
                        const row = rawData.find(d => d.mes === m && d.canal === c);
                        return row ? row[propertyKey] * (isPercentage ? 100 : 1) : null;
                    });
                    
                    return {
                        label: getChannelName(c),
                        data: chData,
                        borderColor: channelColors[c],
                        backgroundColor: channelColors[c],
                        borderWidth: 2,
                        tension: 0.3,
                        pointRadius: 4,
                        pointHoverRadius: 6
                    };
                });

                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: { padding: { top: 24, left: 10, right: 10 } },
                        plugins: {
                            legend: { display: true, position: 'bottom', labels: { usePointStyle: true, font: { family: "'Inter', sans-serif", size: 11 } } },
                            datalabels: { 
                                display: true, 
                                align: 'top', 
                                anchor: 'end',
                                color: function(context) { return context.dataset.borderColor; },
                                font: { family: "'Inter', sans-serif", size: 10, weight: 600 },
                                formatter: function(value) { 
                                    if (value === null || value === undefined) return '';
                                    return isPercentage ? value.toFixed(1).replace('.', ',') + '%' : value.toFixed(2).replace('.', ','); 
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        let label = context.dataset.label || '';
                                        if (label) { label += ': '; }
                                        if (context.parsed.y !== null) {
                                            label += isPercentage 
                                                ? context.parsed.y.toFixed(1).replace('.', ',') + '%' 
                                                : 'R$ ' + context.parsed.y.toFixed(2).replace('.', ',');
                                        }
                                        return label;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: { grid: { display: false, drawBorder: false }, ticks: { color: '#6B7280', font: { family: "'Inter', sans-serif", size: 10 } } },
                            y: { grace: '10%', grid: { color: '#F3F4F6', drawBorder: false }, ticks: { color: '#9CA3AF', font: { family: "'Inter', sans-serif", size: 10 }, callback: function(value) { return isPercentage ? value + '%' : 'R$ ' + value; } } }
                        }
                    }
                });
            };

            try { createMultiChart('chart-ticket-multi', 'ticket', false); } catch(e) { console.error('Error ticket multi', e); }
            try { createMultiChart('chart-recompra-multi', 'recompra', true); } catch(e) { console.error('Error recompra multi', e); }

        } catch (error) {
            console.error('Error loading Frequencia:', error);
        }
    };

    // Load Categorias
    let categoriasData = [];

    const loadCategorias = async () => {
        try {
            const response = await fetch('Arquivos Jun-2026/categorias_resumo.csv');
            if (!response.ok) throw new Error('Network response was not ok');
            const csvText = await response.text();
            
            // Simple CSV parser
            const lines = csvText.trim().split('\n').filter(line => !line.includes('2026-06-01') && !line.includes('Jun/26'));
            const headers = lines[0].split(',');
            
            for (let i = 1; i < lines.length; i++) {
                if (!lines[i]) continue;
                const cols = lines[i].split(',');
                categoriasData.push({
                    grupo: cols[0],
                    sexo: cols[1],
                    idade: cols[2],
                    faturamento: parseFloat(cols[3]),
                    clientes: parseFloat(cols[4])
                });
            }

            // Populate filters
            const generos = [...new Set(categoriasData.map(d => d.sexo).filter(s => s && s !== 'Não Informado'))].sort();
            const idades = [...new Set(categoriasData.map(d => d.idade).filter(i => i))].sort();

            const selGenero = document.getElementById('filter-genero');
            generos.forEach(g => {
                const opt = document.createElement('option');
                opt.value = g;
                opt.textContent = g;
                selGenero.appendChild(opt);
            });

            const selIdade = document.getElementById('filter-idade');
            idades.forEach(i => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = i;
                selIdade.appendChild(opt);
            });

            applyCategoriasFilters(); // initial render
        } catch (error) {
            console.error('Error loading Categorias:', error);
        }
    };

    window.applyCategoriasFilters = function() {
        if (categoriasData.length === 0) return;

        const gen = window.globalFilters.genero;
        const ida = window.globalFilters.idade;

        // Filter data
        let filtered = categoriasData.filter(d => {
            let pass = true;
            if (gen !== 'TODOS' && d.sexo !== gen) pass = false;
            if (ida !== 'TODAS' && d.idade !== ida) pass = false;
            return pass;
        });

        // Aggregate by group
        const groupMap = {};
        let totalFat = 0;
        let totalCli = 0;

        filtered.forEach(d => {
            if (!groupMap[d.grupo]) {
                groupMap[d.grupo] = { fat: 0, cli: 0 };
            }
            groupMap[d.grupo].fat += d.faturamento;
            groupMap[d.grupo].cli += d.clientes;
            totalFat += d.faturamento;
            totalCli += d.clientes;
        });

        // Convert to array and calculate percentages
        const results = Object.keys(groupMap).map(k => {
            return {
                grupo: k,
                pctFat: totalFat > 0 ? (groupMap[k].fat / totalFat) * 100 : 0,
                pctCli: totalCli > 0 ? (groupMap[k].cli / totalCli) * 100 : 0
            };
        });

        // Sort by pctFat descending
        results.sort((a, b) => b.pctFat - a.pctFat);

        // Render table
        const tbody = document.getElementById('cronicos-table-body');
        tbody.innerHTML = '';
        
        results.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${r.grupo}</td>
                <td>
                    <div class="progress-container">
                        <div class="progress-bar-bg purple-bg">
                            <div class="progress-fill purple" style="width: ${r.pctFat.toFixed(1)}%;"></div>
                        </div>
                        <div class="progress-label">${r.pctFat.toFixed(1).replace('.', ',')}%</div>
                    </div>
                </td>
                <td>
                    <div class="progress-container">
                        <div class="progress-bar-bg green-bg">
                            <div class="progress-fill green" style="width: ${r.pctCli.toFixed(1)}%;"></div>
                        </div>
                        <div class="progress-label">${r.pctCli.toFixed(1).replace('.', ',')}%</div>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    // Initialize all
    loadBaseTotal();
    loadActiveClients();
    loadHeatmap();
    loadFrequenciaTicket();
    loadCategorias();

    // Show construction popup after 5 seconds
    setTimeout(() => {
        const popup = document.getElementById('construction-popup');
        if (popup) {
            popup.style.display = 'flex';
        }
    }, 5000);
});
