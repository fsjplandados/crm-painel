document.addEventListener('DOMContentLoaded', async () => {
    // Global Filters State
    window.globalFilters = {
        agrupamentoPeriodo: 'historico',
        canal: 'TOTAL',
        genero: 'TODOS',
        idade: 'TODAS'
    };

    // Global Modal Functions
    window.openFiltersModal = function() {
        const modal = document.getElementById('filtersModal');
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
        document.getElementById('globalAgrupamento').value = window.globalFilters.agrupamentoPeriodo || 'mes';
        document.getElementById('globalCanal').value = window.globalFilters.canal;
        document.getElementById('globalGenero').value = window.globalFilters.genero;
        document.getElementById('globalIdade').value = window.globalFilters.idade;
    };

    window.closeFiltersModal = function() {
        const modal = document.getElementById('filtersModal');
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 200);
    };

    window.clearFilters = function() {
        document.getElementById('globalCanal').value = 'TOTAL';
        document.getElementById('globalGenero').value = 'TODOS';
        document.getElementById('globalIdade').value = 'TODAS';
    };

    window.applyGlobalFilters = function(skipRender = false) {
        window.globalFilters.agrupamentoPeriodo = document.getElementById('globalAgrupamento').value;
        window.globalFilters.canal = document.getElementById('globalCanal').value;
        window.globalFilters.genero = document.getElementById('globalGenero').value;
        window.globalFilters.idade = document.getElementById('globalIdade').value;

        window.closeFiltersModal();
        
        if (skipRender !== true) {
            loadBaseTotal();
            loadActiveClients();
            loadHeatmap();
            loadFrequenciaTicket();
            loadCategorias();
        }
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
        if (lower.includes('campeão') || lower.includes('campeao')) return '#00A650';
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
            
            const lines = csvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            window.baseTotalData = [];
            window.selectedSegments = new Set();
            window.selectedStatuses = new Set();
            window.selectedYears = new Set();
            window.selectedMonths = new Set();
            window.availablePeriods = new Set();
            
            const dataBySegment = {};
            const dataByStatus = {};

            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(',');
                if (parts.length < 4) continue;
                
                let segmentName = parts[2].trim();
                const qtdStr = parts[3].trim();
                const qtd = parseInt(qtdStr, 10);
                
                if (isNaN(qtd)) continue;
                
                if (segmentName === '' || segmentName === '0') {
                    segmentName = 'Sem segmentação';
                }

                if (!dataBySegment[segmentName]) {
                    dataBySegment[segmentName] = 0;
                }
                dataBySegment[segmentName] += qtd;
                
                let statusName = parts[1].trim();
                if (statusName === '') statusName = 'Sem Status';
                
                if (!dataByStatus[statusName]) {
                    dataByStatus[statusName] = 0;
                }
                dataByStatus[statusName] += qtd;
                
                const act30 = parseInt(parts[4] || '0', 10) || 0;
                const act60 = parseInt(parts[5] || '0', 10) || 0;
                const act90 = parseInt(parts[6] || '0', 10) || 0;
                
                const period = parts[0].trim();
                if (period) window.availablePeriods.add(period);
                
                window.baseTotalData.push({ 
                    segment: segmentName, 
                    status: statusName, 
                    period: period,
                    qtd: qtd, 
                    act30: act30, 
                    act60: act60, 
                    act90: act90 
                });
            }
            
            // Populate Custom Period Picker (Multi-select Years and Months)
            const periodPickerEl = document.getElementById('custom-period-picker');
            if (periodPickerEl) {
                periodPickerEl.innerHTML = '';
                
                // Extract unique years and months from availablePeriods
                const uniqueYears = new Set();
                Array.from(window.availablePeriods).forEach(p => {
                    uniqueYears.add(p.split('-')[0]);
                });
                
                const sortedYears = Array.from(uniqueYears).sort().reverse();
                const allMonths = ['01','02','03','04','05','06','07','08','09','10','11','12'];
                const monthNames = { '01':'Jan', '02':'Fev', '03':'Mar', '04':'Abr', '05':'Mai', '06':'Jun', '07':'Jul', '08':'Ago', '09':'Set', '10':'Out', '11':'Nov', '12':'Dez' };
                
                // Clear Filters button
                const topBar = document.createElement('div');
                topBar.style.display = 'flex';
                topBar.style.justifyContent = 'space-between';
                topBar.style.alignItems = 'center';
                topBar.style.marginBottom = '8px';
                
                const allBtn = document.createElement('button');
                allBtn.textContent = 'Limpar Período (Todo Histórico)';
                allBtn.className = 'period-chip';
                allBtn.style.background = '#F1F5F9';
                allBtn.style.color = '#475569';
                allBtn.style.borderColor = '#CBD5E1';
                allBtn.onclick = () => {
                    window.selectedYears.clear();
                    window.selectedMonths.clear();
                    updatePeriodUI();
                    window.updateBaseTotalKPI();
                };
                topBar.appendChild(allBtn);
                periodPickerEl.appendChild(topBar);
                
                // Years Section
                const yearsContainer = document.createElement('div');
                yearsContainer.style.marginBottom = '12px';
                const yearsTitle = document.createElement('div');
                yearsTitle.textContent = 'Anos';
                yearsTitle.style.fontSize = '11px';
                yearsTitle.style.fontWeight = 'bold';
                yearsTitle.style.color = '#475569';
                yearsTitle.style.marginBottom = '4px';
                yearsContainer.appendChild(yearsTitle);
                
                const yearsGrid = document.createElement('div');
                yearsGrid.style.display = 'flex';
                yearsGrid.style.flexWrap = 'wrap';
                yearsGrid.style.gap = '4px';
                
                sortedYears.forEach(year => {
                    const yBtn = document.createElement('button');
                    yBtn.textContent = year;
                    yBtn.className = 'period-chip year-chip';
                    yBtn.dataset.val = year;
                    yBtn.onclick = () => {
                        if (window.selectedYears.has(year)) {
                            window.selectedYears.delete(year);
                        } else {
                            window.selectedYears.add(year);
                        }
                        updatePeriodUI();
                        window.updateBaseTotalKPI();
                    };
                    yearsGrid.appendChild(yBtn);
                });
                yearsContainer.appendChild(yearsGrid);
                periodPickerEl.appendChild(yearsContainer);
                
                // Months Section
                const monthsContainer = document.createElement('div');
                const monthsTitle = document.createElement('div');
                monthsTitle.textContent = 'Meses';
                monthsTitle.style.fontSize = '11px';
                monthsTitle.style.fontWeight = 'bold';
                monthsTitle.style.color = '#475569';
                monthsTitle.style.marginBottom = '4px';
                monthsContainer.appendChild(monthsTitle);
                
                const monthsGrid = document.createElement('div');
                monthsGrid.style.display = 'flex';
                monthsGrid.style.flexWrap = 'wrap';
                monthsGrid.style.gap = '4px';
                
                allMonths.forEach(m => {
                    const mBtn = document.createElement('button');
                    mBtn.textContent = monthNames[m];
                    mBtn.className = 'period-chip month-chip';
                    mBtn.dataset.val = m;
                    mBtn.onclick = () => {
                        if (window.selectedMonths.has(m)) {
                            window.selectedMonths.delete(m);
                        } else {
                            window.selectedMonths.add(m);
                        }
                        updatePeriodUI();
                        window.updateBaseTotalKPI();
                    };
                    monthsGrid.appendChild(mBtn);
                });
                monthsContainer.appendChild(monthsGrid);
                periodPickerEl.appendChild(monthsContainer);
                
                function updatePeriodUI() {
                    periodPickerEl.querySelectorAll('.year-chip').forEach(c => {
                        if (window.selectedYears.has(c.dataset.val)) {
                            c.style.background = '#1E3A8A';
                            c.style.color = 'white';
                            c.style.borderColor = '#1E3A8A';
                        } else {
                            c.style.background = 'white';
                            c.style.color = '#475569';
                            c.style.borderColor = '#CBD5E1';
                        }
                    });
                    
                    periodPickerEl.querySelectorAll('.month-chip').forEach(c => {
                        if (window.selectedMonths.has(c.dataset.val)) {
                            c.style.background = '#1E3A8A';
                            c.style.color = 'white';
                            c.style.borderColor = '#1E3A8A';
                        } else {
                            c.style.background = 'white';
                            c.style.color = '#475569';
                            c.style.borderColor = '#CBD5E1';
                        }
                    });
                    
                    const mainPeriodTextEl = document.getElementById('main-period-text');
                    if (mainPeriodTextEl) {
                        if (window.selectedYears.size === 0 && window.selectedMonths.size === 0) {
                            mainPeriodTextEl.textContent = 'Todo Histórico';
                        } else {
                            let yText = window.selectedYears.size > 0 ? Array.from(window.selectedYears).join(', ') : 'Todos os Anos';
                            let mText = window.selectedMonths.size > 0 ? Array.from(window.selectedMonths).map(m => monthNames[m]).join(', ') : 'Todos os Meses';
                            // Make it compact if too many
                            if (window.selectedYears.size > 2) yText = window.selectedYears.size + ' Anos';
                            if (window.selectedMonths.size > 3) mText = window.selectedMonths.size + ' Meses';
                            mainPeriodTextEl.textContent = `${mText} - ${yText}`;
                        }
                    }
                }
                
                // Add CSS for period-chip if not exists
                if (!document.getElementById('period-chip-style')) {
                    const style = document.createElement('style');
                    style.id = 'period-chip-style';
                    style.textContent = `
                        .period-chip {
                            padding: 4px 8px;
                            font-size: 11px;
                            border: 1px solid #CBD5E1;
                            border-radius: 12px;
                            background: white;
                            color: #475569;
                            cursor: pointer;
                            transition: all 0.2s;
                            font-family: 'Inter', sans-serif;
                            font-weight: 500;
                        }
                        .period-chip:hover {
                            border-color: #94A3B8;
                            background: #F1F5F9;
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                updatePeriodUI();
            }
            
            window.updateBaseTotalKPI = () => {
                let total = 0;
                let t30 = 0, t60 = 0, t90 = 0;
                for (const row of window.baseTotalData) {
                    const matchSegment = window.selectedSegments.size === 0 || window.selectedSegments.has(row.segment);
                    const matchStatus = window.selectedStatuses.size === 0 || window.selectedStatuses.has(row.status);
                    
                    let matchPeriod = true;
                    if (window.selectedYears.size > 0 || window.selectedMonths.size > 0) {
                        const [rowYear, rowMonth] = row.period.split('-');
                        const matchY = window.selectedYears.size === 0 || window.selectedYears.has(rowYear);
                        const matchM = window.selectedMonths.size === 0 || window.selectedMonths.has(rowMonth);
                        matchPeriod = matchY && matchM;
                    }
                    
                    if (matchSegment && matchStatus && matchPeriod) {
                        total += row.qtd;
                        t30 += row.act30;
                        t60 += row.act60;
                        t90 += row.act90;
                    }
                }
                
                if (window.updateNovosRecorrentesCharts) {
                    window.updateNovosRecorrentesCharts();
                }
                if (window.updateEvolutionCharts) {
                    window.updateEvolutionCharts();
                }
                totalClientsEl.textContent = formatNumber(total);
                
                // Update Top KPIs
                if (kpi30dEl) kpi30dEl.textContent = formatNumber(t30);
                if (kpi60dEl) kpi60dEl.textContent = formatNumber(t60);
                if (kpi90dEl) kpi90dEl.textContent = formatNumber(t90);
                
                if (delta60dEl) {
                    if (t30 > 0) {
                        const pct = ((t60 - t30) / t30) * 100;
                        delta60dEl.innerHTML = `<span style="color: ${pct >= 0 ? '#10B981' : '#EF4444'}; font-weight: bold;">${pct > 0 ? '↑' : '↓'} +${Math.abs(pct).toFixed(0)}%</span> vs 30 dias`;
                    } else {
                        delta60dEl.innerHTML = `<span>-</span>`;
                    }
                }
                
                if (delta90dEl) {
                    if (t60 > 0) {
                        const pct = ((t90 - t60) / t60) * 100;
                        delta90dEl.innerHTML = `<span style="color: ${pct >= 0 ? '#10B981' : '#EF4444'}; font-weight: bold;">${pct > 0 ? '↑' : '↓'} +${Math.abs(pct).toFixed(0)}%</span> vs 60 dias`;
                    } else {
                        delta90dEl.innerHTML = `<span>-</span>`;
                    }
                }
                
                // Update Percentages over Base Total
                if (total > 0) {
                    const pct30 = ((t30 / total) * 100).toFixed(1);
                    const pct60 = ((t60 / total) * 100).toFixed(1);
                    const pct90 = ((t90 / total) * 100).toFixed(1);

                    if (deltaPct30dEl) deltaPct30dEl.textContent = `${pct30}% da base`;
                    if (deltaPct60dEl) deltaPct60dEl.textContent = `${pct60}% da base`;
                    if (deltaPct90dEl) deltaPct90dEl.textContent = `${pct90}% da base`;

                    // Update progress bars (might not exist in this version but good to keep)
                    if (progress30dEl) progress30dEl.style.width = `${pct30}%`;
                    if (progress60dEl) progress60dEl.style.width = `${pct60}%`;
                    if (progress90dEl) progress90dEl.style.width = `${pct90}%`;

                    // --- Progressão da Base Logic (Insight) ---
                    const inativos = total - t90;
                    const p_inativos = ((inativos / total) * 100).toFixed(1);
                    const flowFooterPctEl = document.getElementById('flow-footer-pct');
                    if (flowFooterPctEl) {
                        flowFooterPctEl.textContent = `${p_inativos}%`;
                    }
                }
            };
            
            let segmentsData = [];
            for (const [segment, value] of Object.entries(dataBySegment)) {
                segmentsData.push({ name: segment, value: value });
                globalTotalBase += value;
            }

            totalClientsEl.textContent = formatNumber(globalTotalBase);
            segmentsData.sort((a, b) => b.value - a.value);

            segmentsList.innerHTML = '';
            segmentsData.forEach(item => {
                const pct = ((item.value / globalTotalBase) * 100).toFixed(1);
                const color = getSegmentColor(item.name);
                
                const div = document.createElement('div');
                div.className = 'segment-row';
                div.style.cursor = 'pointer';
                div.style.transition = 'all 0.2s';
                div.innerHTML = `
                    <div class="segment-name" title="${item.name}">
                        ${item.name} 
                    </div>
                    <div class="progress-bar-bg" style="height: 12px; border-radius: 6px;">
                        <div class="progress-bar-fill" style="width: ${pct}%; background-color: ${color}; height: 100%; border-radius: 6px;"></div>
                    </div>
                    <div class="segment-value">${formatNumber(item.value)}</div>
                    <div class="segment-percent">${pct}%</div>
                `;
                
                div.onclick = () => {
                    if (window.selectedSegments.has(item.name)) {
                        window.selectedSegments.delete(item.name);
                    } else {
                        window.selectedSegments.add(item.name);
                    }
                    
                    const allRows = segmentsList.querySelectorAll('.segment-row');
                    if (window.selectedSegments.size > 0) {
                        allRows.forEach(r => {
                            const name = r.querySelector('.segment-name').getAttribute('title');
                            if (window.selectedSegments.has(name)) {
                                r.style.opacity = '1';
                                r.style.background = '#f8fafc';
                                r.style.borderRadius = '4px';
                            } else {
                                r.style.opacity = '0.4';
                                r.style.background = 'transparent';
                            }
                        });
                    } else {
                        allRows.forEach(r => {
                            r.style.opacity = '1';
                            r.style.background = 'transparent';
                        });
                    }
                    
                    window.updateBaseTotalKPI();
                };
                
                segmentsList.appendChild(div);
            });
            
            // Render Status Pie Chart
            const statusCanvas = document.getElementById('status-pie-chart');
            if (statusCanvas) {
                const ctx = statusCanvas.getContext('2d');
                const labels = Object.keys(dataByStatus);
                const data = Object.values(dataByStatus);
                
                // Brand-aligned colors, negative statuses as reddish/dark
                const baseColors = labels.map((label, index) => {
                    const l = label.toLowerCase();
                    if (l.includes('churn') || l.includes('inativo') || l.includes('perdido') || l.includes('não ativado')) return '#C81D25'; // Dark red for negative
                    if (l.includes('dormente') || l.includes('risco') || l.includes('atenção')) return '#F97316'; // Orange for warning
                    if (l.includes('ativo') && !l.includes('inativo')) return '#243685'; // Brand dark blue for active
                    if (l.includes('novo')) return '#10B981'; // Green
                    
                    const palette = ['#1E3A8A', '#DC2626', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#14B8A6'];
                    return palette[index % palette.length];
                });
                
                if (window.statusPieChartInstance) {
                    window.statusPieChartInstance.destroy();
                }

                window.statusPieChartInstance = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: data,
                            backgroundColor: [...baseColors],
                            borderWidth: 2,
                            borderColor: '#ffffff',
                            borderRadius: 8, // Rounded corners for pie slices
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        layout: {
                            padding: 20
                        },
                        onClick: (event, elements, chart) => {
                            if (elements.length > 0) {
                                const index = elements[0].index;
                                const statusName = chart.data.labels[index];
                                if (window.selectedStatuses.has(statusName)) {
                                    window.selectedStatuses.delete(statusName);
                                } else {
                                    window.selectedStatuses.add(statusName);
                                }
                                
                                chart.data.datasets[0].backgroundColor = chart.data.labels.map((lbl, i) => {
                                    if (window.selectedStatuses.size === 0 || window.selectedStatuses.has(lbl)) {
                                        return baseColors[i];
                                    }
                                    const hex = baseColors[i].replace('#', '');
                                    const r = parseInt(hex.substring(0, 2), 16);
                                    const g = parseInt(hex.substring(2, 4), 16);
                                    const b = parseInt(hex.substring(4, 6), 16);
                                    return `rgba(${r}, ${g}, ${b}, 0.25)`; // Reliable transparency
                                });
                                chart.update();
                                window.updateBaseTotalKPI();
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'right',
                                onClick: (e, legendItem, legend) => {
                                    const index = legendItem.index;
                                    const chart = legend.chart;
                                    const statusName = chart.data.labels[index];
                                    if (window.selectedStatuses.has(statusName)) {
                                        window.selectedStatuses.delete(statusName);
                                    } else {
                                        window.selectedStatuses.add(statusName);
                                    }
                                    
                                    chart.data.datasets[0].backgroundColor = chart.data.labels.map((lbl, i) => {
                                        if (window.selectedStatuses.size === 0 || window.selectedStatuses.has(lbl)) {
                                            return baseColors[i];
                                        }
                                        const hex = baseColors[i].replace('#', '');
                                        const r = parseInt(hex.substring(0, 2), 16);
                                        const g = parseInt(hex.substring(2, 4), 16);
                                        const b = parseInt(hex.substring(4, 6), 16);
                                        return `rgba(${r}, ${g}, ${b}, 0.25)`;
                                    });
                                    chart.update();
                                    window.updateBaseTotalKPI();
                                },
                                labels: {
                                    font: { size: 11, family: "'Montserrat', sans-serif" },
                                    color: '#64748B',
                                    usePointStyle: true,
                                    padding: 15
                                }
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const label = context.label || '';
                                        const value = context.raw;
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = ((value * 100) / total).toFixed(1) + '%';
                                        return `${label}: ${formatNumber(value)} (${percentage})`;
                                    }
                                }
                            },
                            datalabels: {
                                color: '#ffffff',
                                font: { weight: 'bold', size: 11 },
                                formatter: (value, context) => {
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = (value * 100 / total).toFixed(1);
                                    return percentage > 4 ? percentage + '%' : '';
                                }
                            }
                        }
                    },
                    plugins: [ChartDataLabels]
                });
            }
            
            // Initial render of KPIs
            window.updateBaseTotalKPI();

        } catch (error) {
            console.error('Error loading Base total:', error);
            totalClientsEl.textContent = 'Erro';
            if (segmentsList) segmentsList.innerHTML = `<div style="color: red; font-size: 11px;">Erro ao carregar 'Base total.csv'.</div>`;
        }
    };

    // ---- Novos Clientes x Recorrentes ----
    let novosRecorrentesQtdChart = null;
    let novosRecorrentesShareChart = null;
    window.novosRecorrentesData = [];

    const loadNovosRecorrentes = async () => {
        try {
            const response = await fetch(`Arquivos Jun-2026/Clientes_Novos_Recorrentes.csv?v=${Date.now()}`);
            if (!response.ok) throw new Error('File not found');
            const text = await response.text();
            
            const lines = text.split('\n');
            window.novosRecorrentesData = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const parts = line.split(';');
                let cols = parts;
                if (parts.length < 9) cols = line.split(',');
                if (cols.length >= 9) {
                    let rawMes = cols[0].trim();
                    let year = '', month = '';
                    
                    if (rawMes.includes('/')) {
                        const dParts = rawMes.split('/');
                        if (dParts.length === 3) {
                            year = dParts[2];
                            month = dParts[1];
                            rawMes = `${year}-${month}-${dParts[0]}`;
                        }
                    } else if (rawMes.includes('-')) {
                        const dParts = rawMes.split('-');
                        if (dParts.length >= 2) {
                            year = dParts[0];
                            month = dParts[1];
                        }
                    }
                    
                    window.novosRecorrentesData.push({
                        rawMes: rawMes,
                        year: year,
                        month: month,
                        mes: `${month}/${year}`,
                        novosQtd: parseFloat(cols[1]) || 0,
                        recQtd: parseFloat(cols[2]) || 0,
                        shareNovosRec: parseFloat(cols[7]) || 0,
                        shareRecRec: parseFloat(cols[8]) || 0
                    });
                }
            }
            console.log('Novos x Recorrentes loaded:', window.novosRecorrentesData.length, 'rows');
            updateNovosRecorrentesCharts();
            if (window.updateEvolutionCharts) {
                window.updateEvolutionCharts();
            }
        } catch (e) {
            console.error('Error loading Novos x Recorrentes:', e);
        }
    };

    const updateNovosRecorrentesCharts = () => {
        let filteredData = window.novosRecorrentesData;
        
        filteredData = window.novosRecorrentesData.filter(row => {
            const hasYearFilter = window.selectedYears && window.selectedYears.size > 0;
            const hasMonthFilter = window.selectedMonths && window.selectedMonths.size > 0;
            
            // If no year is selected, default to 2026 to prevent chart clutter
            const matchY = hasYearFilter ? window.selectedYears.has(row.year) : (row.year === '2026');
            const matchM = !hasMonthFilter || window.selectedMonths.has(row.month);
            
            return matchY && matchM;
        });
        
        filteredData.sort((a,b) => a.rawMes.localeCompare(b.rawMes));
        
        const labels = filteredData.map(d => d.mes);
        const novosQtd = filteredData.map(d => d.novosQtd);
        const recQtd = filteredData.map(d => d.recQtd);
        const shareNovosRec = filteredData.map(d => d.shareNovosRec);
        const shareRecRec = filteredData.map(d => d.shareRecRec);

        const colorNovos = '#00A650'; // Brand green
        const colorRec = '#1E3A8A'; // Brand dark blue

        const ctxQtd = document.getElementById('novos-recorrentes-qtd-chart');
        if (ctxQtd) {
            if (novosRecorrentesQtdChart) novosRecorrentesQtdChart.destroy();
            novosRecorrentesQtdChart = new Chart(ctxQtd, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        { label: 'Clientes recorrentes', data: recQtd, backgroundColor: colorRec, stack: 'Stack 0' },
                        { label: 'Novos clientes', data: novosQtd, backgroundColor: colorNovos, stack: 'Stack 0' }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, beginAtZero: true, ticks: { callback: function(value) { return formatNumber(value); } } } },
                    plugins: {
                        legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } },
                        datalabels: { display: false },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + formatNumber(context.parsed.y);
                                }
                            }
                        }
                    }
                }
            });
        }

        const ctxShare = document.getElementById('novos-recorrentes-share-chart');
        if (ctxShare) {
            if (novosRecorrentesShareChart) novosRecorrentesShareChart.destroy();
            novosRecorrentesShareChart = new Chart(ctxShare, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        { label: 'Clientes recorrentes', data: shareRecRec, backgroundColor: colorRec, stack: 'Stack 0' },
                        { label: 'Novos clientes', data: shareNovosRec, backgroundColor: colorNovos, stack: 'Stack 0' }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { 
                        x: { stacked: true, grid: { display: false } }, 
                        y: { stacked: true, beginAtZero: true, max: 100, ticks: { callback: function(value) { return value + '%'; } } } 
                    },
                    plugins: {
                        legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + context.parsed.y.toFixed(1).replace('.', ',') + '%';
                                }
                            }
                        },
                        datalabels: { display: false }
                    }
                }
            });
        }
    };
    window.updateNovosRecorrentesCharts = updateNovosRecorrentesCharts;

    // ---- Evolução Histórica ----
    let evolucaoNovosChart = null;
    let evolucaoFieisChart = null;
    let evolucaoBaseChart = null;
    let evolucaoAtivosChart = null;

    const updateEvolutionCharts = () => {
        // Data for Novos Clientes (from Novos x Recorrentes CSV)
        let filteredNovos = window.novosRecorrentesData || [];
        filteredNovos = filteredNovos.filter(row => {
            const hasYearFilter = window.selectedYears && window.selectedYears.size > 0;
            const hasMonthFilter = window.selectedMonths && window.selectedMonths.size > 0;
            const matchY = hasYearFilter ? window.selectedYears.has(row.year) : (row.year === '2026');
            const matchM = !hasMonthFilter || window.selectedMonths.has(row.month);
            return matchY && matchM;
        });
        filteredNovos.sort((a,b) => a.rawMes.localeCompare(b.rawMes));
        const labelsNovos = filteredNovos.map(d => d.mes);
        const dataNovos = filteredNovos.map(d => d.novosQtd);

        // Data for Fiéis, Base Total, and Ativos (from baseTotalData)
        let filteredBase = window.baseTotalData || [];
        filteredBase = filteredBase.filter(row => {
            const pParts = row.period.split('-');
            const rowYear = pParts[0];
            const rowMonth = pParts.length >= 2 ? pParts[1] : '';
            const hasYearFilter = window.selectedYears && window.selectedYears.size > 0;
            const hasMonthFilter = window.selectedMonths && window.selectedMonths.size > 0;
            const matchY = hasYearFilter ? window.selectedYears.has(rowYear) : (rowYear === '2026');
            const matchM = !hasMonthFilter || window.selectedMonths.has(rowMonth);
            return matchY && matchM;
        });
        
        const mapFieis = {};
        const mapBase = {};
        const mapAtivos = {};

        filteredBase.forEach(row => {
            const p = row.period; // YYYY-MM-DD
            const pParts = p.split('-');
            const label = pParts.length >= 2 ? `${pParts[1]}/${pParts[0]}` : p; // MM/YYYY
            if (!mapBase[p]) {
                mapBase[p] = { label: label, val: 0 };
                mapFieis[p] = { label: label, val: 0 };
                mapAtivos[p] = { label: label, val: 0 };
            }
            mapBase[p].val += row.qtd;
            mapAtivos[p].val += row.act90;
            if (row.segment === 'Clientes Fieis') {
                mapFieis[p].val += row.qtd;
            }
        });

        const sortedKeys = Object.keys(mapBase).sort();
        const labelsBase = sortedKeys.map(k => mapBase[k].label);
        const dataFieis = sortedKeys.map(k => mapFieis[k].val);
        const dataBase = sortedKeys.map(k => mapBase[k].val);
        const dataAtivos = sortedKeys.map(k => mapAtivos[k].val);

        const getColors = (dataArray, theme = 'blue') => {
            if (!dataArray || dataArray.length === 0) return [];
            const min = Math.min(...dataArray);
            const max = Math.max(...dataArray);
            
            return dataArray.map(val => {
                let r, g, b;
                if (theme === 'green') { r = 153; g = 212; b = 32; } // #99D420
                else { r = 30; g = 58; b = 138; } // #1E3A8A
                
                let ratio = max > min ? (val - min) / (max - min) : 1;
                let intensity = 0.2 + (0.8 * ratio); // 20% to 100% intensity
                
                let nr = Math.round(255 + (r - 255) * intensity);
                let ng = Math.round(255 + (g - 255) * intensity);
                let nb = Math.round(255 + (b - 255) * intensity);
                return `rgb(${nr}, ${ng}, ${nb})`;
            });
        };

        const getBarOptions = (datasetData) => {
            return {
                responsive: true,
                maintainAspectRatio: false,
                scales: { 
                    x: { grid: { display: false }, border: { display: false } }, 
                    y: { display: false, beginAtZero: true, suggestedMax: function(context) { return context.chart.data.datasets[0].data.reduce((a,b) => Math.max(a,b), 0) * 1.1; } } 
                },
                plugins: { 
                    legend: { display: false }, 
                    tooltip: { 
                        callbacks: { 
                            label: function(context) { 
                                const val = context.parsed.y;
                                let labelStr = formatNumber(val);
                                if (context.dataIndex > 0) {
                                    const prevVal = context.chart.data.datasets[0].data[context.dataIndex - 1];
                                    if (prevVal > 0) {
                                        const pct = ((val - prevVal) / prevVal) * 100;
                                        const sign = pct > 0 ? '+' : '';
                                        labelStr += ` (${sign}${pct.toFixed(1).replace('.', ',')}%)`;
                                    }
                                }
                                return labelStr;
                            } 
                        } 
                    },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'bottom',
                        offset: 8,
                        color: function(context) {
                            const data = context.dataset.data;
                            if (!data || data.length === 0) return '#1E293B';
                            const min = Math.min(...data);
                            const max = Math.max(...data);
                            const val = data[context.dataIndex];
                            const ratio = max > min ? (val - min) / (max - min) : 1;
                            return ratio > 0.45 ? '#FFFFFF' : '#1E293B';
                        },
                        font: { family: "'Inter', sans-serif", weight: 'bold', size: 10 },
                        formatter: function(value, context) {
                            let formattedVal = value;
                            if (value > 1000000) formattedVal = (value / 1000000).toFixed(1).replace('.', ',') + 'M';
                            else if (value > 1000) formattedVal = (value / 1000).toFixed(1).replace('.', ',') + 'k';
                            
                            if (context.dataIndex > 0) {
                                const prevVal = context.chart.data.datasets[0].data[context.dataIndex - 1];
                                if (prevVal > 0) {
                                    const pct = ((value - prevVal) / prevVal) * 100;
                                    const sign = pct > 0 ? '+' : '';
                                    return `${formattedVal}\n(${sign}${pct.toFixed(1).replace('.', ',')}%)`;
                                }
                            }
                            return formattedVal;
                        },
                        textAlign: 'center'
                    }
                }
            };
        };

        const renderBarChart = (id, chartVar, labels, data, theme = 'blue') => {
            const ctx = document.getElementById(id);
            if (!ctx) return chartVar;
            if (chartVar) chartVar.destroy();
            return new Chart(ctx, {
                type: 'bar',
                data: { 
                    labels: labels, 
                    datasets: [{ 
                        data: data, 
                        backgroundColor: getColors(data, theme),
                        borderRadius: 2
                    }] 
                },
                options: getBarOptions(data)
            });
        };

        if (window.ChartDataLabels && Chart.registry.plugins.get('datalabels') === undefined) {
            Chart.register(window.ChartDataLabels);
        }

        evolucaoNovosChart = renderBarChart('evolucao-novos-chart', evolucaoNovosChart, labelsNovos, dataNovos, 'green');
        evolucaoFieisChart = renderBarChart('evolucao-fieis-chart', evolucaoFieisChart, labelsBase, dataFieis, 'blue');
        evolucaoBaseChart = renderBarChart('evolucao-base-chart', evolucaoBaseChart, labelsBase, dataBase, 'blue');
        evolucaoAtivosChart = renderBarChart('evolucao-ativos-chart', evolucaoAtivosChart, labelsBase, dataAtivos, 'blue');
    };
    window.updateEvolutionCharts = updateEvolutionCharts;

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

            // KPI updates moved to loadBaseTotal dynamic update (window.updateBaseTotalKPI)

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
                                backgroundColor: '#99D420',
                                barPercentage: 0.85,
                                categoryPercentage: 0.8
                            },
                            {
                                label: '60 dias',
                                data: data.data60,
                                backgroundColor: '#00A650',
                                barPercentage: 0.85,
                                categoryPercentage: 0.8
                            },
                            {
                                label: '90 dias',
                                data: data.data90,
                                backgroundColor: '#F68712',
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
                                    <div style="background: #0D6EFD; width: ${barPctM}%; border-radius: 4px 0 0 4px;"></div>
                                </div>
                                <div style="flex: 1; display: flex; justify-content: flex-start; height: 100%; border-left: 1px solid #FFFFFF;">
                                    <div style="background: #ED1C24; width: ${barPctF}%; border-radius: 0 4px 4px 0;"></div>
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
                
                if (document.getElementById('kpiPctMasc')) document.getElementById('kpiPctMasc').textContent = overallPctM + '%';
                if (document.getElementById('kpiPctFem')) document.getElementById('kpiPctFem').textContent = overallPctF + '%';

                const overallPctM_oneDec = (totalM / totalGender * 100).toFixed(1).replace('.', ',');
                const overallPctF_oneDec = (totalF / totalGender * 100).toFixed(1).replace('.', ',');
                const numM = (totalM / totalGender * 100);
                const numF = (totalF / totalGender * 100);

                if (document.getElementById('gender-pct-masc-big')) document.getElementById('gender-pct-masc-big').textContent = overallPctM_oneDec + '%';
                if (document.getElementById('gender-pct-fem-big')) document.getElementById('gender-pct-fem-big').textContent = overallPctF_oneDec + '%';
                if (document.getElementById('gender-bar-masc')) document.getElementById('gender-bar-masc').style.width = numM + '%';
                if (document.getElementById('gender-bar-fem')) document.getElementById('gender-bar-fem').style.width = numF + '%';

                perfilTfoot.innerHTML = `<tr style="border-top: 1px solid #E2E8F0; background: #F8FAFC;">
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
            renderTable('heatmap-f', pctDataF, maxF, '237, 28, 36'); // Red

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
                
                try { createChart('chart-freq', chartData.map(d => d.freq), '#99D420', { formatter: v => v.toFixed(2).replace('.', ',') }); } catch (e) { console.error('Error freq chart', e); }
                try { createChart('chart-ticket', chartData.map(d => d.ticket), '#00A650', { formatter: v => (v||0).toFixed(2).replace('.', ',') }); } catch (e) { console.error('Error ticket chart', e); }
                try { createChart('chart-recompra', chartData.map(d => d.recompra * 100), '#00ADEF', { formatter: v => (v||0).toFixed(1).replace('.', ',') + '%' }); } catch (e) { console.error('Error recompra chart', e); }
                
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
                                backgroundColor: '#F68712',
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
            if (filterEl) {
                filterEl.addEventListener('change', (e) => {
                    renderFrequenciaDashboard(e.target.value);
                });
            }

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
                    'LOJA_F': '#99D420',
                    'CANAIS_VIRTUAIS': '#00ADEF',
                    'TELEVENDAS': '#F68712'
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
    loadNovosRecorrentes();
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
