
class Dashboard {
    constructor() {
        this.currentSheet = null;
        this.currentView = 'cards';
        this.searchTerm = '';
        this.excelData = null;
        this.currentDay = null;
        this.currentProfessor = null;
        this.diasOrdenados = ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO', 'DOMINGO'];
        this.init();
    }

    init() {
        console.log('🚀 Inicializando dashboard...');
        this.loadData().then(() => {
            console.log('✅ Dados carregados, configurando interface...');
            this.setupNavigation();
            this.setupSearch();
            this.setupViewControls();
            this.setupModal();
            this.loadInitialData();
            this.loadStats();
            console.log('🎉 Dashboard inicializado com sucesso!');
        }).catch(error => {
            console.error('❌ Erro na inicialização:', error);
        });
    }

    async loadData() {
        try {
            console.log('📡 Carregando dados_organizados.json...');
            const response = await fetch('dados_organizados.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            this.dadosOrganizados = await response.json();
            console.log('✅ Dados organizados carregados:', this.dadosOrganizados.metadata);
            console.log('📊 Horários:', this.dadosOrganizados.horarios?.length || 0);
            console.log('📈 Estatísticas:', this.dadosOrganizados.estatisticas?.length || 0);
            return this.dadosOrganizados;
        } catch (error) {
            console.error('❌ Erro ao carregar dados organizados:', error);
            // Fallback para dados originais se houver problema
            try {
                console.log('🔄 Tentando fallback para dados.json...');
                const response = await fetch('dados.json');
                const dadosOriginais = await response.json();
                this.excelData = dadosOriginais;
                console.log('✅ Fallback carregado');
                return dadosOriginais;
            } catch (fallbackError) {
                console.error('❌ Erro no fallback:', fallbackError);
                this.dadosOrganizados = { horarios: [], estatisticas: [], metadata: {} };
                return this.dadosOrganizados;
            }
        }
    }

    setupNavigation() {
        const navItems = document.getElementById('navItems');
        navItems.innerHTML = '';

        // Adicionar item de Reposição com link direto
        const reposicaoItem = document.createElement('div');
        reposicaoItem.className = 'nav-item';
        reposicaoItem.innerHTML = '<i class="fas fa-calendar-check"></i>Agendamento de Reposição';
        reposicaoItem.onclick = () => {
            window.location.href = 'reposicao.html';
        };
        navItems.appendChild(reposicaoItem);
        
        // Adicionar sub-itens de Reposição
        const todasReposicoesItem = document.createElement('div');
        todasReposicoesItem.className = 'nav-item nav-subitem';
        todasReposicoesItem.innerHTML = '<i class="fas fa-list"></i>Todas as Reposições';
        todasReposicoesItem.onclick = () => {
            window.location.href = 'reposicoes-todas.html';
        };
        navItems.appendChild(todasReposicoesItem);
        
        const canceladasItem = document.createElement('div');
        canceladasItem.className = 'nav-item nav-subitem';
        canceladasItem.innerHTML = '<i class="fas fa-calendar-times"></i>Reposições Canceladas';
        canceladasItem.onclick = () => {
            window.location.href = 'reposicao-canceladas.html';
        };
        navItems.appendChild(canceladasItem);
        
        // Adicionar separador
        const separator = document.createElement('div');
        separator.style.cssText = 'height: 1px; background: rgba(255,255,255,0.1); margin: 0.5rem 0;';
        navItems.appendChild(separator);

        // Mostrar todos os dias da semana (mesmo que não tenham aulas)
        const diasSemana = ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
        
        diasSemana.forEach(dia => {
            const navItem = document.createElement('div');
            navItem.className = 'nav-item';
            
            // Contar turmas neste dia
            const quantidadeTurmas = this.getQuantidadeTurmasPorDia(dia);
            const icone = this.getIconeDia(dia);
            const temAulas = quantidadeTurmas > 0;
            
            // Adicionar classe especial para dias sem aulas
            if (!temAulas) {
                navItem.classList.add('nav-item-empty');
            }
            
            navItem.innerHTML = `
                <i class="fas ${icone}"></i> 
                ${dia}
                <span class="nav-badge ${!temAulas ? 'nav-badge-empty' : ''}">${quantidadeTurmas}</span>
            `;
            navItem.onclick = () => this.selectDay(dia);
            navItems.appendChild(navItem);
        });

        // Adicionar aba de Estatísticas
        const navPef = document.createElement('div');
        navPef.className = 'nav-item';
        navPef.innerHTML = '<i class="fas fa-chart-bar"></i> Pef';
        navPef.onclick = () => this.loadSheet('Pef');
        navItems.appendChild(navPef);
    }

    getDiasUnicos() {
        const horarios = this.dadosOrganizados?.horarios || [];
        const diasSet = new Set(horarios.map(h => h.dia));
        // Filtrar apenas dias válidos e ordenar
        return this.diasOrdenados.filter(dia => diasSet.has(dia) && dia !== 'DIA');
    }

    getQuantidadeTurmasPorDia(dia) {
        const horarios = this.dadosOrganizados?.horarios || [];
        const turmasDia = horarios.filter(h => h.dia === dia);
        return turmasDia.length;
    }

    getIconeDia(dia) {
        const icones = {
            'SEGUNDA': 'fa-calendar-day',
            'TERÇA': 'fa-calendar-check',
            'QUARTA': 'fa-calendar-alt',
            'QUINTA': 'fa-calendar-week',
            'SEXTA': 'fa-calendar-day', // Corrigido para um ícone válido
            'SÁBADO': 'fa-calendar-plus'
        };
        return icones[dia] || 'fa-calendar';
    }

    getProfessoresPorDia(dia) {
        const horarios = this.dadosOrganizados?.horarios || [];
        const professoresSet = new Set(
            horarios
                .filter(h => h.dia === dia)
                .map(h => h.professor)
        );
        return Array.from(professoresSet).sort();
    }

    selectDay(dia) {
        console.log('📅 Dia selecionado:', dia);
        this.currentDay = dia;
        this.currentProfessor = null;
        this.currentSheet = 'Horários';
        this.updateActiveNav(dia);
        this.setupSecondaryNavigation(dia);
        this.updateSectionTitle(`Horários - ${dia}`);
        this.renderContent();
    }

    setupSecondaryNavigation(dia) {
        // Usar container secundário de navegação para professores
        const secondaryNav = document.getElementById('secondaryNav');
        const mainContent = document.querySelector('.main-content');
        if (!secondaryNav) return;

        const professores = this.getProfessoresPorDia(dia);
        
        // Mostrar/esconder a barra de secundária
        secondaryNav.style.display = professores.length > 0 ? 'flex' : 'none';
        
        // Adicionar ou remover classe do main content
        if (professores.length > 0) {
            mainContent.classList.add('secondary-nav-visible');
        } else {
            mainContent.classList.remove('secondary-nav-visible');
        }
        
        secondaryNav.innerHTML = '<strong style="width: 100%; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;"> Selecione um professor:</strong>';

        professores.forEach(prof => {
            const btn = document.createElement('button');
            btn.textContent = prof;
            btn.className = this.currentProfessor === prof ? 'professor-btn active' : 'professor-btn';
            btn.style.cssText = `
                padding: 0.5rem 1rem;
                border: 2px solid var(--border-color);
                background: ${this.currentProfessor === prof ? 'var(--primary-color)' : 'white'};
                color: ${this.currentProfessor === prof ? 'white' : 'var(--text-primary)'};
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.3s ease;
            `;
            btn.onmouseover = () => {
                if (this.currentProfessor !== prof) {
                    btn.style.background = 'rgba(102, 126, 234, 0.1)';
                }
            };
            btn.onmouseout = () => {
                if (this.currentProfessor !== prof) {
                    btn.style.background = 'white';
                }
            };
            btn.onclick = () => this.selectProfessor(prof);
            secondaryNav.appendChild(btn);
        });
    }

    selectProfessor(professor) {
        console.log('Professor selecionado:', professor);
        this.currentProfessor = professor;
        this.setupSecondaryNavigation(this.currentDay);
        this.renderContent();
    }

    getNavIcon(sheetName) {
        const icons = {
            'Horários': '<i class="fas fa-calendar-alt"></i>',
            'Pef': '<i class="fas fa-chart-bar"></i>',
            'Reposição': '<i class="fas fa-calendar-check"></i>'
        };
        return icons[sheetName] || '<i class="fas fa-file-alt"></i>';
    }

    setupSearch() {
        const searchBox = document.getElementById('searchBox');
        searchBox.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterAndRender();
        });
    }

    setupViewControls() {
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentView = btn.dataset.view;
                this.renderContent();
            });
        });
    }

    setupModal() {
        const modal = document.getElementById('detailModal');
        const modalClose = document.getElementById('modalClose');
        
        if (!modal || !modalClose) {
            console.warn('Modal elements not found');
            return;
        }
        
        modalClose.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.closeModal();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    openModal(title, content) {
        const modal = document.getElementById('detailModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = title;
        modalBody.innerHTML = content;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        const modal = document.getElementById('detailModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            console.log('Modal fechado');
        } else {
            console.warn('Modal element not found');
        }
    }

    loadInitialData() {
        // Carregar o primeiro dia disponível
        const dias = this.getDiasUnicos();
        if (dias.length > 0) {
            this.selectDay(dias[0]);
        } else {
            this.loadSheet('Horários');
        }
    }

    loadSheet(sheetName) {
        console.log('📄 Carregando aba:', sheetName);
        this.currentSheet = sheetName;
        this.updateActiveNav(sheetName);
        this.updateSectionTitle(sheetName);
        this.renderContent();
    }

    updateActiveNav(sheetName) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            
            // Verificar se é um dia da semana
            const diasSemana = ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
            if (diasSemana.includes(sheetName)) {
                if (item.textContent.includes(sheetName)) {
                    item.classList.add('active');
                }
            } else if (item.textContent.includes(sheetName)) {
                // Para outras abas como "Pef"
                item.classList.add('active');
            }
        });
    }

    updateSectionTitle(sheetName) {
        const defaultTitles = {
            'Horários': 'Grade de Horários',
            'Pef': 'Estatísticas da Unidade'
        };
        
        // Se o título contém "Horários -", é um dia específico
        if (sheetName && sheetName.startsWith('Horários -')) {
            const dia = sheetName.split(' - ')[1];
            const emoji = this.getEmojiDia(dia);
            document.getElementById('sectionTitle').textContent = `${emoji} Horários - ${dia}`;
        } else {
            document.getElementById('sectionTitle').textContent = defaultTitles[sheetName] || sheetName;
        }
    }

    getEmojiDia(dia) {
        const emojis = {
            'SEGUNDA': '📅',
            'TERÇA': '📅',
            'QUARTA': '📅',
            'QUINTA': '📅',
            'SEXTA': '📅',
            'SABADO': '🎓',
            'DOMINGO': '😴'
        };
        return emojis[dia] || '📅';
    }

    filterAndRender() {
        this.renderContent();
    }

    renderContent() {
        console.log('🎨 Renderizando conteúdo para aba:', this.currentSheet);
        if (!this.currentSheet) {
            console.warn('⚠️ Nenhuma aba selecionada');
            return;
        }

        if (this.currentView === 'cards') {
            console.log('🃏 Renderizando em modo cards');
            this.renderCards();
        } else {
            console.log('📊 Renderizando em modo tabela');
            this.renderTable();
        }
    }

    renderTable() {
        const container = document.getElementById('contentContainer');
        container.innerHTML = '<div class="table-container"></div>';
        const tableContainer = container.querySelector('.table-container');

        let data = [];
        if (this.currentSheet === 'Horários') {
            data = this.filtrarHorarios(this.dadosOrganizados?.horarios || []);
        } else if (this.currentSheet === 'Pef') {
            data = this.dadosOrganizados?.estatisticas || [];
        }

        if (data.length === 0) {
            tableContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">Nenhum dado encontrado</p>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'modern-table';

        // Definir colunas baseado no tipo de dados
        let headers = [];
        if (this.currentSheet === 'Horários') {
            headers = ['Professor', 'Horário', 'Dia', 'Turma', 'Quantidade de Alunos'];
        } else {
            headers = ['Métrica', 'Valor', 'Tipo'];
        }

        const thead = document.createElement('thead');
        thead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        data.forEach(item => {
            const tr = document.createElement('tr');
            if (this.currentSheet === 'Horários') {
                tr.innerHTML = `
                    <td>${item.professor}</td>
                    <td>${item.horario}</td>
                    <td>${item.dia}</td>
                    <td>${item.turma}</td>
                    <td>${item.quantidade_alunos}</td>
                `;
            } else {
                const valorFormatado = typeof item.valor === 'number' ? item.valor.toLocaleString('pt-BR') : item.valor;
                tr.innerHTML = `
                    <td>${item.metrica}</td>
                    <td>${valorFormatado}</td>
                    <td>${item.tipo}</td>
                `;
            }
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        tableContainer.appendChild(table);
    }

    getFilteredData(data) {
        if (!this.searchTerm) return data;
        
        return data.filter(row => {
            return Object.values(row).some(value => 
                String(value).toLowerCase().includes(this.searchTerm)
            );
        });
    }

    renderCards() {
        const container = document.getElementById('contentContainer');
        container.innerHTML = '<div class="cards-grid" id="cardsGrid"></div>';
        const grid = document.getElementById('cardsGrid');

        if (this.currentSheet === 'Horários') {
            this.renderHorariosCards(grid);
        } else if (this.currentSheet === 'Pef') {
            this.renderEstatisticasCards(grid);
        }
    }

    renderHorariosCards(grid) {
        try {
            console.log('🎯 Renderizando cards de horários...');
            let horarios = this.dadosOrganizados?.horarios || [];
            console.log('📊 Total de horários:', horarios.length);

            // Filtrar por dia selecionado
            if (this.currentDay) {
                horarios = horarios.filter(h => h.dia === this.currentDay);
                console.log('📅 Horários no dia', this.currentDay + ':', horarios.length);
            }

            // Filtrar por professor selecionado
            if (this.currentProfessor) {
                horarios = horarios.filter(h => h.professor === this.currentProfessor);
                console.log('👨‍🏫 Horários do professor', this.currentProfessor + ':', horarios.length);
            }

            if (horarios.length === 0) {
                const msg = this.currentProfessor 
                    ? `Nenhum horário encontrado para ${this.currentProfessor} em ${this.currentDay}`
                    : `Nenhuma aula encontrada em ${this.currentDay}`;
                grid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                        <div style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;">
                            <i class="fas fa-calendar-times"></i>
                        </div>
                        <h3 style="margin-bottom: 0.5rem; color: var(--text-primary);">${msg}</h3>
                        <p style="font-size: 0.9rem;">Não há aulas agendadas para este dia da semana.</p>
                    </div>
                `;
                return;
            }

            let delay = 0;

            // Filtrar por busca se houver
            const horariosFiltrados = this.filtrarHorarios(horarios);
            console.log('🔍 Horários filtrados:', horariosFiltrados.length);

            horariosFiltrados.forEach(horario => {
                try {
                    const card = this.createHorarioCard(horario);
                    card.style.animationDelay = `${delay}ms`;
                    grid.appendChild(card);
                    delay += 50;
                } catch (cardError) {
                    console.error('Erro ao criar card:', cardError, horario);
                }
            });

            console.log('✅ Cards de horários renderizados');
        } catch (error) {
            console.error('❌ Erro em renderHorariosCards:', error);
            grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: red;">Erro ao renderizar horários: ${error.message}</div>`;
        }
    }

    filtrarHorarios(horarios) {
        try {
            if (!this.searchTerm) return horarios;

            return horarios.filter(h => {
                try {
                    const termo = this.searchTerm.toLowerCase();
                    return (
                        (h.professor || '').toLowerCase().includes(termo) ||
                        (h.turma || '').toLowerCase().includes(termo) ||
                        (h.dia || '').toLowerCase().includes(termo) ||
                        (h.alunos || []).some(aluno => (aluno || '').toLowerCase().includes(termo))
                    );
                } catch (filterError) {
                    console.error('Erro ao filtrar horário:', filterError, h);
                    return false;
                }
            });
        } catch (error) {
            console.error('Erro em filtrarHorarios:', error);
            return horarios;
        }
    }

    createHorarioCard(horario) {
        try {
            const card = document.createElement('div');
            card.className = 'data-card';

            const badgeClass = this.getBadgeClass(horario.dia);

            card.innerHTML = `
                <div class="data-card-header">
                    <div class="data-card-title">${horario.turma || 'N/A'}</div>
                    <div class="data-card-subtitle">${horario.dia || 'N/A'} - ${horario.horario || 'N/A'}</div>
                    <div class="data-card-badge badge-${badgeClass}">${(horario.dia || 'N/A').slice(0, 3)}</div>
                </div>
                <div class="data-card-content">
                    <strong>Professor:</strong> ${horario.professor || 'N/A'}<br>
                    <strong>Alunos:</strong><br>
                    ${((horario.alunos || []).slice(0, 3)).map(a => `• ${a}`).join('<br>')}
                    ${(horario.alunos || []).length > 3 ? `<br><em>+ ${(horario.alunos || []).length - 3} mais...</em>` : ''}
                </div>
                <div class="data-card-footer">
                    <span><i class="fas fa-users"></i> ${horario.quantidade_alunos || 0} alunos</span>
                    <span><i class="fas fa-clock"></i> ${horario.horario || 'N/A'}</span>
                </div>
            `;

            card.addEventListener('click', () => {
                try {
                    const modalContent = `
                        <div style="margin-bottom: 1.5rem;">
                            <h4 style="color: var(--primary-color); margin-bottom: 1rem; font-size: 1.1rem;">
                                <i class="fas fa-calendar-day"></i> ${horario.dia || 'N/A'} - ${horario.horario || 'N/A'}
                            </h4>
                            <div style="background: rgba(102, 126, 234, 0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                                <strong style="color: var(--text-primary);">Turma:</strong>
                                <span style="color: var(--primary-color); font-weight: 600; margin-left: 0.5rem;">${horario.turma || 'N/A'}</span>
                            </div>
                            <div style="background: rgba(72, 187, 120, 0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                                <strong style="color: var(--text-primary);">Professor:</strong>
                                <span style="color: var(--success-color); font-weight: 600; margin-left: 0.5rem;">${horario.professor || 'N/A'}</span>
                            </div>
                            <div style="background: rgba(237, 137, 54, 0.1); padding: 1rem; border-radius: 8px;">
                                <strong style="color: var(--text-primary);">Alunos (${horario.quantidade_alunos || 0}):</strong>
                                <div style="margin-top: 0.5rem; max-height: 200px; overflow-y: auto;">
                                    ${((horario.alunos || []).map(aluno => `
                                        <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0;">
                                            <i class="fas fa-user-graduate" style="color: var(--warning-color);"></i>
                                            ${aluno}
                                        </div>
                                    `)).join('')}
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                            <button onclick="dashboard.closeModal()" style="padding: 0.5rem 1rem; background: var(--border-color); border: none; border-radius: 6px; cursor: pointer;">Fechar</button>
                        </div>
                    `;
                    this.openModal(`Detalhes da Aula - ${horario.turma || 'N/A'}`, modalContent);
                } catch (modalError) {
                    console.error('Erro ao abrir modal:', modalError);
                }
            });

            return card;
        } catch (error) {
            console.error('Erro em createHorarioCard:', error, horario);
            // Retornar um card de erro
            const errorCard = document.createElement('div');
            errorCard.className = 'data-card';
            errorCard.innerHTML = '<div class="data-card-content">Erro ao criar card</div>';
            return errorCard;
        }
    }

    getBadgeClass(day) {
        const classes = {
            'SEGUNDA': 'primary',
            'TERÇA': 'success', 
            'QUARTA': 'warning',
            'QUINTA': 'primary',
            'SEXTA': 'success',
            'SABADO': 'warning'
        };
        return classes[day] || 'primary';
    }

    renderEstatisticasCards(grid) {
        const estatisticas = this.dadosOrganizados?.estatisticas || [];
        let delay = 0;

        estatisticas.forEach(estat => {
            const card = this.createEstatisticaCard(estat);
            card.style.animationDelay = `${delay}ms`;
            grid.appendChild(card);
            delay += 50;
        });
    }

    createEstatisticaCard(estat) {
        const card = document.createElement('div');
        card.className = 'data-card';

        const icon = this.getStatIcon(estat.metrica);
        const valorFormatado = typeof estat.valor === 'number' ? estat.valor.toLocaleString('pt-BR') : estat.valor;

        card.innerHTML = `
            <div class="data-card-header">
                <div class="data-card-title">${estat.metrica}</div>
                <div class="data-card-badge badge-primary">${icon}</div>
            </div>
            <div class="data-card-content">
                <div style="font-size: 2rem; font-weight: bold; color: var(--primary-color); margin-bottom: 0.5rem;">
                    ${valorFormatado}
                </div>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">
                    Estatística educacional atualizada
                </div>
            </div>
            <div class="data-card-footer">
                <span><i class="fas fa-info-circle"></i> Clique para detalhes</span>
                <span><i class="fas fa-chart-bar"></i> ${estat.tipo}</span>
            </div>
        `;

        card.addEventListener('click', () => {
            const modalContent = `
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem;">
                        ${icon}
                    </div>
                    <h4 style="color: var(--text-primary); margin-bottom: 0.5rem; font-size: 1.2rem;">
                        ${estat.metrica}
                    </h4>
                    <div style="font-size: 2.5rem; font-weight: bold; color: var(--primary-color); margin-bottom: 1rem;">
                        ${valorFormatado}
                    </div>
                </div>
                <div style="background: rgba(102, 126, 234, 0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <strong style="color: var(--text-primary);">Descrição:</strong><br>
                    <span style="color: var(--text-secondary);">
                        ${this.getStatDescription(estat.metrica)}
                    </span>
                </div>
                <div style="background: rgba(72, 187, 120, 0.1); padding: 1rem; border-radius: 8px;">
                    <strong style="color: var(--text-primary);">Última atualização:</strong><br>
                    <span style="color: var(--text-secondary);">
                        Dados atualizados em tempo real do sistema educacional
                    </span>
                </div>
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1.5rem;">
                    <button onclick="dashboard.closeModal()" style="padding: 0.5rem 1rem; background: var(--border-color); border: none; border-radius: 6px; cursor: pointer;">Fechar</button>
                </div>
            `;
            this.openModal(`Estatística: ${estat.metrica}`, modalContent);
        });

        return card;
    }

    getStatIcon(label) {
        if (label.includes('alunos')) return '<i class="fas fa-user-graduate"></i>';
        if (label.includes('turmas')) return '<i class="fas fa-chalkboard"></i>';
        if (label.includes('média')) return '<i class="fas fa-chart-line"></i>';
        return '<i class="fas fa-chart-bar"></i>';
    }

    getStatDescription(label) {
        const descriptions = {
            'alunos matriculados': 'Número total de alunos matriculados na instituição educacional.',
            'ativos': 'Alunos atualmente ativos no sistema, incluindo modalidades presencial e online.',
            'turmas': 'Total de turmas ativas, incluindo Connection e Interactive.',
            'média interactive': 'Média de alunos por turma na modalidade Interactive.',
            'média connection': 'Média de alunos por turma na modalidade Connection.'
        };
        
        for (const [key, desc] of Object.entries(descriptions)) {
            if (label.toLowerCase().includes(key)) {
                return desc;
            }
        }
        
        return 'Estatística educacional relevante para o acompanhamento do desempenho institucional.';
    }

    renderTable(data) {
        const container = document.getElementById('contentContainer');
        container.innerHTML = '<div class="table-container"></div>';
        const tableContainer = container.querySelector('.table-container');
        
        if (data.length === 0) {
            tableContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">Nenhum dado encontrado</p>';
            return;
        }
        
        const table = document.createElement('table');
        table.className = 'modern-table';
        
        const headers = Object.keys(data[0]).filter(key => key && key !== 'Z');
        const thead = document.createElement('thead');
        thead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        data.forEach(row => {
            const tr = document.createElement('tr');
            headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = row[header] || '';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        
        tableContainer.appendChild(table);
    }

    loadStats() {
        const statsContainer = document.getElementById('statsOverview');

        if (this.dadosOrganizados?.estatisticas) {
            const stats = this.dadosOrganizados.estatisticas;
            const totalStudents = stats.find(s => s.metrica?.toLowerCase().includes('alunos matriculados'));
            const activeStudents = stats; // Passar todas as estatísticas
            const totalClasses = stats; // Passar todas as estatísticas
            
            const statsHTML = `
                <div class="stat-card">
                    <div class="stat-card-header">
                        <div class="stat-card-title">Total de Alunos</div>
                        <div class="stat-card-icon" style="background: rgba(102, 126, 234, 0.1); color: var(--primary-color);">
                            <i class="fas fa-user-graduate"></i>
                        </div>
                    </div>
                    <div class="stat-card-value">${totalStudents?.valor?.toLocaleString('pt-BR') || '0'}</div>
                    <div class="stat-card-change positive">
                        <i class="fas fa-arrow-up"></i> Matrículas ativas
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-header">
                        <div class="stat-card-title">Alunos Ativos</div>
                        <div class="stat-card-icon" style="background: rgba(72, 187, 120, 0.1); color: var(--success-color);">
                            <i class="fas fa-users"></i>
                        </div>
                    </div>
                    <div class="stat-card-value">${this.calculateActiveStudents(activeStudents)?.toLocaleString('pt-BR') || '0'}</div>
                    <div class="stat-card-change positive">
                        <i class="fas fa-check-circle"></i> Presencial + Online
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-header">
                        <div class="stat-card-title">Total de Turmas</div>
                        <div class="stat-card-icon" style="background: rgba(237, 137, 54, 0.1); color: var(--warning-color);">
                            <i class="fas fa-chalkboard"></i>
                        </div>
                    </div>
                    <div class="stat-card-value">${this.calculateTotalClasses(totalClasses)?.toLocaleString('pt-BR') || '0'}</div>
                    <div class="stat-card-change positive">
                        <i class="fas fa-layer-group"></i> Connection + Interactive
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-card-header">
                        <div class="stat-card-title">Média por Turma</div>
                        <div class="stat-card-icon" style="background: rgba(245, 101, 101, 0.1); color: var(--danger-color);">
                            <i class="fas fa-chart-line"></i>
                        </div>
                    </div>
                    <div class="stat-card-value">${this.calculateAverageStudents(stats)?.toFixed(1) || '0'}</div>
                    <div class="stat-card-change positive">
                        <i class="fas fa-calculator"></i> Alunos/turma
                    </div>
                </div>
            `;
            
            statsContainer.innerHTML = statsHTML;
        }
    }

    calculateActiveStudents(stats) {
        // Procurar estatísticas relacionadas a alunos ativos
        const activeStats = stats.filter(s =>
            s.metrica.toLowerCase().includes('ativo') ||
            s.metrica.toLowerCase().includes('matriculado')
        );
        return activeStats.reduce((sum, stat) => sum + (typeof stat.valor === 'number' ? stat.valor : 0), 0);
    }

    calculateTotalClasses(stats) {
        // Procurar estatísticas relacionadas a turmas
        const classStats = stats.filter(s => s.metrica.toLowerCase().includes('turma'));
        return classStats.reduce((sum, stat) => sum + (typeof stat.valor === 'number' ? stat.valor : 0), 0);
    }

    calculateAverageStudents(stats) {
        const avgInteractive = stats.find(s => s.metrica.toLowerCase().includes('média interactive'));
        const avgConnection = stats.find(s => s.metrica.toLowerCase().includes('média connection'));

        if (avgInteractive && avgConnection) {
            return ((avgInteractive.valor || 0) + (avgConnection.valor || 0)) / 2;
        }
        return (avgInteractive?.valor || 0) + (avgConnection?.valor || 0) || 0;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
    
    // Função global para fechar modal (usada nos botões dentro do modal)
    window.closeModal = () => {
        if (window.dashboard) {
            window.dashboard.closeModal();
        }
    };
});
