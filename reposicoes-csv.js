// Sistema para carregar e gerenciar reposições do CSV
class ReposicoesCSV {
    constructor() {
        this.reposicoesCSV = [];
        this.init();
    }

    async init() {
        try {
            await this.carregarCSV();
            await this.carregarAgendamentos(); // Carregar novos agendamentos
            this.setupEventListeners();
            this.setupAutoUpdate(); // Configurar atualização automática
            this.renderizarReposicoes();
            console.log('✅ Sistema de Reposições CSV inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema:', error);
        }
    }

    setupAutoUpdate() {
        // Monitorar mudanças no localStorage (agendamentos da página de reposição)
        window.addEventListener('storage', (event) => {
            if (event.key === 'agendamentos_reposicao') {
                console.log('🔄 Mudança detectada nos agendamentos da página de reposição');
                this.carregarAgendamentos().then(() => {
                    this.renderizarReposicoes();
                    this.preencherSelectsDinamicos(); // Atualizar selects dinâmicos
                });
            }
        });

        // Verificação periódica (fallback)
        setInterval(() => {
            const agendamentosAtuais = localStorage.getItem('agendamentos_reposicao');
            if (agendamentosAtuais !== this.ultimoAgendamentos) {
                console.log('🔄 Mudança detectada nos agendamentos (verificação periódica)');
                this.ultimoAgendamentos = agendamentosAtuais;
                this.carregarAgendamentos().then(() => {
                    this.renderizarReposicoes();
                    this.preencherSelectsDinamicos(); // Atualizar selects dinâmicos
                });
            }
        }, 2000); // Verificar a cada 2 segundos
    }

    async carregarAgendamentos() {
        try {
            // Carregar agendamentos da página de reposição (localStorage)
            const agendamentosSalvos = localStorage.getItem('agendamentos_reposicao');
            const agendamentosReposicao = agendamentosSalvos ? JSON.parse(agendamentosSalvos) : [];
            
            console.log(`📋 ${agendamentosReposicao.length} agendamentos da página de reposição carregados`);
            
            // Converter para o formato unificado
            this.agendamentosNovos = agendamentosReposicao.map((agendamento, index) => {
                // Extrair data e hora do agendamento
                const dataCompleta = agendamento.data || '';
                const hora = agendamento.hora || '';
                
                // Extrair dia da semana da data
                const diaSemana = this.extrairDiaSemana(dataCompleta);
                
                // Criar origem baseada na data
                const dataObj = new Date(dataCompleta);
                const mes = this.extrairMes(dataCompleta);
                const ano = this.extrairAno(dataCompleta);
                const origem = `${mes.toUpperCase()} ${ano}`;
                
                return {
                    id: `reposicao_${index + 1}`,
                    nome: agendamento.aluno || agendamento.nome || '',
                    turma: agendamento.turma || '',
                    data: dataCompleta,
                    hora: hora,
                    diaSemana: diaSemana,
                    origem: origem,
                    tipo: 'AGENDAMENTO',
                    status: agendamento.status || 'confirmado',
                    motivo: agendamento.motivo || 'Reposição',
                    mes: mes,
                    ano: ano
                };
            });
            
            console.log(`✅ ${this.agendamentosNovos.length} agendamentos convertidos para formato unificado`);
            
            // Armazenar estado atual para comparação
            this.ultimoAgendamentos = JSON.stringify(agendamentosReposicao);
            
        } catch (error) {
            console.error('❌ Erro ao carregar agendamentos:', error);
            this.agendamentosNovos = [];
        }
    }

    async carregarCSV() {
        try {
            // Carregar arquivo CSV normalizado
            const response = await fetch('agenda_normalizada.csv');
            const csvText = await response.text();
            
            console.log('📄 CSV bruto:', csvText.substring(0, 500)); // Debug: mostrar primeiros 500 caracteres
            
            // Processar CSV
            const linhas = csvText.split('\n').filter(linha => linha.trim());
            const cabecalho = linhas[0].split(',').map(col => col.trim());
            
            console.log('📋 Cabeçalho:', cabecalho); // Debug: mostrar cabeçalho
            
            this.reposicoesCSV = [];
            
            for (let i = 1; i < linhas.length; i++) {
                const valores = linhas[i].split(',').map(val => val.trim());
                
                console.log(`📝 Linha ${i}:`, valores); // Debug: mostrar cada linha
                
                if (valores.length >= 6 && valores[0]) { // Verificar se tem dados válidos
                    const nome = valores[0] || '';
                    const turma = valores[1] || '';
                    const data = valores[2] || '';
                    const dia = valores[3] || '';
                    const hora = valores[4] || '';
                    const mes = valores[5] || '';
                    const ano = valores[6] || '';
                    
                    // Combinar data completa
                    const dataCompleta = data || `${mes} ${ano}`;
                    const origem = `${mes.toUpperCase()} ${ano}`;
                    
                    // FILTRAR APENAS DADOS DE 2026
                    if (ano === '2026' || origem.includes('26') || origem.includes('2026')) {
                        const reposicao = {
                            id: i,
                            nome: nome,
                            turma: turma,
                            data: dataCompleta,
                            hora: hora,
                            diaSemana: this.normalizarDiaSemana(dia),
                            origem: origem,
                            tipo: 'CSV',
                            mes: mes,
                            ano: ano
                        };
                        
                        this.reposicoesCSV.push(reposicao);
                        
                        console.log(`✅ Reposição ${i} (2026):`, {
                            nome: nome,
                            turma: turma,
                            data: dataCompleta,
                            hora: hora,
                            dia: dia,
                            mes: mes,
                            ano: ano
                        }); // Debug: mostrar dados extraídos
                    } else {
                        console.log(`⏭️ Linha ${i} ignorada (não é 2026):`, origem);
                    }
                }
            }
            
            console.log(`📊 ${this.reposicoesCSV.length} reposições de 2026 carregadas do CSV normalizado`);
        } catch (error) {
            console.error('❌ Erro ao carregar CSV:', error);
            // Fallback: carregar dados de exemplo
            this.carregarDadosExemplo();
        }
    }

    normalizarDiaSemana(dia) {
        if (!dia) return '';
        
        const normalizacoes = {
            'segunda': 'Segunda-feira',
            'terça': 'Terça-feira', 
            'quarta': 'Quarta-feira',
            'quinta': 'Quinta-feira',
            'sexta': 'Sexta-feira',
            'sábado': 'Sábado',
            'domingo': 'Domingo'
        };
        
        const diaLower = dia.toLowerCase().trim();
        return normalizacoes[diaLower] || dia;
    }

    carregarDadosExemplo() {
        this.reposicoesCSV = [
            {
                id: 1,
                nome: 'Julia Faria Cruz',
                turma: 'KIDS 01',
                data: '',
                hora: '',
                diaSemana: 'Segunda-feira',
                origem: 'MAR 2026',
                tipo: 'CSV'
            },
            {
                id: 2,
                nome: 'Sophia Faria de Sousa',
                turma: 'INT 2',
                data: '',
                hora: '',
                diaSemana: 'Segunda-feira',
                origem: 'MAR 2026',
                tipo: 'CSV'
            }
        ];
    }

    setupEventListeners() {
        // Filtro por data específica
        const filtroData = document.getElementById('filtroData');
        if (filtroData) {
            filtroData.addEventListener('change', () => this.renderizarReposicoes());
        }

        // Filtro por mês
        const filtroMes = document.getElementById('filtroMes');
        if (filtroMes) {
            filtroMes.addEventListener('change', () => this.renderizarReposicoes());
        }

        // Filtro por ano
        const filtroAno = document.getElementById('filtroAno');
        if (filtroAno) {
            filtroAno.addEventListener('change', () => this.renderizarReposicoes());
        }

        // Filtro por origem
        const filtroOrigem = document.getElementById('filtroOrigem');
        if (filtroOrigem) {
            filtroOrigem.addEventListener('input', () => this.renderizarReposicoes());
        }

        // Filtro por dia da semana
        const filtroDia = document.getElementById('filtroDiaSemana');
        if (filtroDia) {
            filtroDia.addEventListener('change', () => this.renderizarReposicoes());
        }

        // Filtro por professor
        const filtroProfessor = document.getElementById('filtroProfessor');
        if (filtroProfessor) {
            filtroProfessor.addEventListener('input', () => this.renderizarReposicoes());
        }

        // Filtro por turma
        const filtroTurma = document.getElementById('filtroTurma');
        if (filtroTurma) {
            filtroTurma.addEventListener('input', () => this.renderizarReposicoes());
        }

        // Botão limpar filtros
        const btnLimpar = document.getElementById('limparFiltros');
        if (btnLimpar) {
            btnLimpar.addEventListener('click', () => this.limparFiltros());
        }

        // Botão exportar
        const btnExportar = document.getElementById('exportarCSV');
        if (btnExportar) {
            btnExportar.addEventListener('click', () => this.exportarParaCSV());
        }

        // Preencher selects dinâmicos
        this.preencherSelectsDinamicos();
    }

    renderizarReposicoes() {
        console.log('🔄 Renderizando reposições do CSV...');
        
        const container = document.getElementById('reposicoesCSVList');
        const filtroData = document.getElementById('filtroData');
        const filtroMes = document.getElementById('filtroMes');
        const filtroAno = document.getElementById('filtroAno');
        const filtroOrigem = document.getElementById('filtroOrigem');
        const filtroDia = document.getElementById('filtroDiaSemana');
        const filtroProfessor = document.getElementById('filtroProfessor');
        const filtroTurma = document.getElementById('filtroTurma');
        
        if (!container) {
            console.error('❌ Container reposicoesCSVList não encontrado');
            return;
        }

        // Combinar dados do CSV com novos agendamentos
        let todasReposicoes = [
            ...this.reposicoesCSV,
            ...(this.agendamentosNovos || [])
        ];

        // Aplicar filtros
        if (filtroData && filtroData.value) {
            const dataFiltro = filtroData.value; // Formato: YYYY-MM-DD
            console.log('🔍 Filtrando por data específica:', dataFiltro);
            
            todasReposicoes = todasReposicoes.filter(r => {
                if (!r.data) return false;
                
                // Converter a data do filtro para o formato DD/MM/YYYY
                const [ano, mes, dia] = dataFiltro.split('-');
                const dataFormatada = `${dia}/${mes}/${ano}`;
                
                // Verificar se a data da reposição corresponde
                return r.data === dataFormatada || r.data.includes(dataFormatada);
            });
        }
        if (filtroMes && filtroMes.value) {
            todasReposicoes = todasReposicoes.filter(r => 
                (r.mes && r.mes.toLowerCase() === filtroMes.value.toLowerCase()) ||
                (this.extrairMes(r.data).toLowerCase() === filtroMes.value.toLowerCase())
            );
        }

        if (filtroAno && filtroAno.value) {
            todasReposicoes = todasReposicoes.filter(r => 
                (r.ano && r.ano.toString() === filtroAno.value) ||
                (this.extrairAno(r.data) && this.extrairAno(r.data).toString() === filtroAno.value)
            );
        }

        if (filtroOrigem && filtroOrigem.value) {
            const termoOrigem = filtroOrigem.value.toLowerCase();
            todasReposicoes = todasReposicoes.filter(r => 
                r.origem.toLowerCase().includes(termoOrigem)
            );
        }

        if (filtroDia && filtroDia.value) {
            todasReposicoes = todasReposicoes.filter(r => 
                r.diaSemana.toLowerCase().includes(filtroDia.value.toLowerCase())
            );
        }

        if (filtroProfessor && filtroProfessor.value) {
            const termoProfessor = filtroProfessor.value.toLowerCase();
            todasReposicoes = todasReposicoes.filter(r => 
                r.nome.toLowerCase().includes(termoProfessor)
            );
        }

        if (filtroTurma && filtroTurma.value) {
            const termoTurma = filtroTurma.value.toLowerCase();
            todasReposicoes = todasReposicoes.filter(r => 
                r.turma.toLowerCase().includes(termoTurma)
            );
        }

        // Agrupar por dia da semana
        const reposicoesPorDia = this.agruparPorDia(todasReposicoes);

        if (Object.keys(reposicoesPorDia).length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>Nenhuma reposição encontrada</h3>
                    <p>Não há reposições que correspondam aos filtros selecionados.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        
        // Renderizar por dia da semana
        Object.entries(reposicoesPorDia).forEach(([dia, reposicoes]) => {
            const diaSection = this.criarSecaoDia(dia, reposicoes);
            container.appendChild(diaSection);
        });

        this.atualizarEstatisticas(todasReposicoes);
        console.log(`✅ ${todasReposicoes.length} reposições renderizadas (CSV: ${this.reposicoesCSV.length}, Novos: ${this.agendamentosNovos?.length || 0})`);
    }

    preencherSelectsDinamicos() {
        // Extrair meses, anos e origens únicos do CSV
        const meses = new Set();
        const anos = new Set();
        const origens = new Set();

        this.reposicoesCSV.forEach(reposicao => {
            if (reposicao.data) {
                const mes = this.extrairMes(reposicao.data);
                const ano = this.extrairAno(reposicao.data);
                if (mes) meses.add(mes.toLowerCase());
                if (ano) anos.add(ano.toString());
            }
            
            if (reposicao.origem) {
                origens.add(reposicao.origem);
            }
        });

        // Preencher select de meses
        const filtroMes = document.getElementById('filtroMes');
        if (filtroMes) {
            const valorAtual = filtroMes.value;
            filtroMes.innerHTML = '<option value="">Todos os meses</option>';
            
            const mesesOrdenados = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
            mesesOrdenados.forEach(mes => {
                if (meses.has(mes)) {
                    const option = document.createElement('option');
                    option.value = mes;
                    option.textContent = mes.charAt(0).toUpperCase() + mes.slice(1);
                    if (mes === valorAtual) {
                        option.selected = true;
                    }
                    filtroMes.appendChild(option);
                }
            });
        }

        // Preencher select de anos
        const filtroAno = document.getElementById('filtroAno');
        if (filtroAno) {
            const valorAtual = filtroAno.value;
            filtroAno.innerHTML = '<option value="">Todos os anos</option>';
            
            const anosArray = Array.from(anos).sort((a, b) => b - a);
            anosArray.forEach(ano => {
                const option = document.createElement('option');
                option.value = ano;
                option.textContent = ano;
                if (ano === valorAtual) {
                    option.selected = true;
                }
                filtroAno.appendChild(option);
            });
        }

        // Criar datalist para origens (sugestões)
        const filtroOrigem = document.getElementById('filtroOrigem');
        if (filtroOrigem) {
            // Remover datalist existente se houver
            const datalistExistente = document.getElementById('origensList');
            if (datalistExistente) {
                datalistExistente.remove();
            }

            // Criar novo datalist
            const datalist = document.createElement('datalist');
            datalist.id = 'origensList';
            
            Array.from(origens).sort().forEach(origem => {
                const option = document.createElement('option');
                option.value = origem;
                datalist.appendChild(option);
            });
            
            filtroOrigem.setAttribute('list', 'origensList');
            document.body.appendChild(datalist);
        }
    }

    extrairMes(data) {
        if (!data) return '';
        
        // Formato do CSV: "MES ANO" (ex: "MAR 2026")
        const formatoCSV = /^([A-Z]{3})\s+(\d{4})$/;
        const match = data.match(formatoCSV);
        
        if (match) {
            const mesAbrev = match[1].toLowerCase();
            const ano = match[2];
            
            const meses = {
                'jan': 'janeiro', 'feb': 'fevereiro', 'mar': 'março', 'apr': 'abril',
                'may': 'maio', 'jun': 'junho', 'jul': 'julho', 'aug': 'agosto',
                'sep': 'setembro', 'oct': 'outubro', 'nov': 'novembro', 'dec': 'dezembro'
            };
            
            return meses[mesAbrev] || '';
        }
        
        // Tentar outros formatos como fallback
        const formatos = [
            /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
            /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
            /(\d{2})-(\w{3})-(\d{4})/  // MM-YYYY (formato antigo)
        ];

        for (const formato of formatos) {
            const match = data.match(formato);
            if (match) {
                if (match[1] && match[2]) {
                    // Formato DD/MM/YYYY ou YYYY-MM-DD
                    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
                    return meses[parseInt(match[2]) - 1] || '';
                }
            }
        }

        return '';
    }

    extrairAno(data) {
        if (!data) return null;
        
        // Formato do CSV: "MES ANO" (ex: "MAR 2026")
        const formatoCSV = /^([A-Z]{3})\s+(\d{4})$/;
        const match = data.match(formatoCSV);
        
        if (match) {
            return parseInt(match[2]);
        }
        
        // Tentar outros formatos como fallback
        const formatos = [
            /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
            /(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
            /(\d{2})-(\w{3})-(\d{4})/  // MM-YYYY (formato antigo)
        ];

        for (const formato of formatos) {
            const match = data.match(formato);
            if (match) {
                if (match[3]) {
                    return parseInt(match[3]);
                }
            }
        }

        return null;
    }

    agruparPorDia(reposicoes) {
        const agrupado = {};
        
        reposicoes.forEach(reposicao => {
            if (!agrupado[reposicao.diaSemana]) {
                agrupado[reposicao.diaSemana] = [];
            }
            agrupado[reposicao.diaSemana].push(reposicao);
        });
        
        // Ordenar dias da semana
        const ordemDias = [
            'Segunda-feira', 'Terça-feira', 'Quarta-feira', 
            'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'
        ];
        
        const ordenado = {};
        ordemDias.forEach(dia => {
            if (agrupado[dia]) {
                ordenado[dia] = agrupado[dia];
            }
        });
        
        return ordenado;
    }

    criarSecaoDia(dia, reposicoes) {
        const section = document.createElement('div');
        section.className = 'dia-section';
        
        section.innerHTML = `
            <div class="dia-header">
                <h3><i class="fas fa-calendar-day"></i> ${dia}</h3>
                <span class="count">${reposicoes.length} reposição(ões)</span>
            </div>
            <div class="reposicoes-grid">
                ${reposicoes.map(reposicao => this.criarCardReposicao(reposicao)).join('')}
            </div>
        `;
        
        return section;
    }

    criarCardReposicao(reposicao) {
        const temHorario = reposicao.hora && reposicao.hora.trim() !== '';
        
        // Adicionar badge de tipo
        let tipoBadge = '';
        if (reposicao.tipo === 'CSV') {
            tipoBadge = '<span class="badge csv-badge">CSV</span>';
        } else if (reposicao.tipo === 'AGENDAMENTO') {
            tipoBadge = '<span class="badge agendamento-badge">Agendamento</span>';
        }
        
        const cardClass = reposicao.tipo === 'CSV' ? 'csv-card' : 'agendamento-card';
        
        return `
            <div class="reposicao-card ${cardClass}">
                <div class="card-header">
                    <div class="card-title">
                        <h3>${reposicao.nome}</h3>
                        <div class="card-badges">
                            ${tipoBadge}
                            ${temHorario ? `
                                <span class="badge time-badge">
                                    <i class="fas fa-clock"></i> ${reposicao.hora}
                                </span>
                            ` : `
                                <span class="badge no-time-badge">
                                    <i class="fas fa-clock"></i> Sem horário
                                </span>
                            `}
                            ${reposicao.status ? `
                                <span class="badge status-badge status-${reposicao.status}">
                                    <i class="fas fa-info-circle"></i> ${this.formatarStatus(reposicao.status)}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="card-content">
                    <div class="info-row">
                        <span class="label">
                            <i class="fas fa-calendar-week"></i> Dia:
                        </span>
                        <span class="value">${reposicao.diaSemana}</span>
                    </div>
                    ${reposicao.data ? `
                        <div class="info-row">
                            <span class="label">
                                <i class="fas fa-calendar"></i> Data:
                            </span>
                            <span class="value">${reposicao.data}</span>
                        </div>
                    ` : ''}
                    <div class="info-row">
                        <span class="label">
                            <i class="fas fa-users"></i> Turma:
                        </span>
                        <span class="value">${reposicao.turma}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">
                            <i class="fas fa-source"></i> Origem:
                        </span>
                        <span class="value">${reposicao.origem}</span>
                    </div>
                    ${reposicao.motivo ? `
                        <div class="info-row">
                            <span class="label">
                                <i class="fas fa-comment"></i> Motivo:
                            </span>
                            <span class="value">${reposicao.motivo}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    formatarStatus(status) {
        const statusMap = {
            'pendente': 'Pendente',
            'confirmado': 'Confirmado',
            'cancelado': 'Cancelado',
            'concluido': 'Concluído'
        };
        return statusMap[status] || status;
    }

    agendarReposicao(id) {
        const reposicao = this.reposicoesCSV.find(r => r.id === id);
        if (!reposicao) return;

        // Preencher formulário com dados da reposição
        const alunoInput = document.getElementById('alunoNome');
        const turmaSelect = document.getElementById('turmaSelect');
        const motivoInput = document.getElementById('motivo');

        if (alunoInput) alunoInput.value = reposicao.nome;
        if (motivoInput) motivoInput.value = `Reposição agendada - Origem: ${reposicao.origem}`;
        
        // Tentar selecionar a turma
        if (turmaSelect) {
            const options = Array.from(turmaSelect.options);
            const turmaMatch = options.find(opt => opt.text.includes(reposicao.turma));
            if (turmaMatch) {
                turmaSelect.value = turmaMatch.value;
            }
        }

        // Rolar para o formulário
        const formSection = document.querySelector('.form-section');
        if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth' });
        }

        // Destacar o card
        document.querySelectorAll('.reposicao-card').forEach(card => {
            card.classList.remove('highlighted');
        });
        document.querySelector(`[data-id="${id}"]`).classList.add('highlighted');

        this.showToast('Dados preenchidos no formulário! Complete com o horário desejado.');
    }

    verDetalhes(id) {
        const reposicao = this.reposicoesCSV.find(r => r.id === id);
        if (!reposicao) return;

        const modal = document.getElementById('detailModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        if (modal && modalTitle && modalBody) {
            modalTitle.textContent = `Detalhes da Reposição - ${reposicao.nome}`;
            modalBody.innerHTML = `
                <div class="detalhes-content">
                    <div class="detalhe-row">
                        <strong>Aluno:</strong> ${reposicao.nome}
                    </div>
                    <div class="detalhe-row">
                        <strong>Turma:</strong> ${reposicao.turma}
                    </div>
                    <div class="detalhe-row">
                        <strong>Dia da Semana:</strong> ${reposicao.diaSemana}
                    </div>
                    ${reposicao.data ? `
                        <div class="detalhe-row">
                            <strong>Data:</strong> ${reposicao.data}
                        </div>
                    ` : ''}
                    ${reposicao.hora ? `
                        <div class="detalhe-row">
                            <strong>Horário:</strong> ${reposicao.hora}
                        </div>
                    ` : `
                        <div class="detalhe-row">
                            <strong>Horário:</strong> <span class="no-data">Não definido no CSV</span>
                        </div>
                    `}
                    <div class="detalhe-row">
                        <strong>Origem:</strong> ${reposicao.origem}
                    </div>
                    <div class="detalhe-row">
                        <strong>Tipo:</strong> <span class="csv-type">Dados do CSV</span>
                    </div>
                </div>
            `;
            modal.classList.remove('hidden');
        }
    }

    preencherSelectsDinamicos() {
        // Extrair meses, anos e origens únicas do CSV normalizado
        const meses = new Set();
        const anos = new Set();
        const origens = new Set();

        this.reposicoesCSV.forEach(reposicao => {
            if (reposicao.mes) {
                meses.add(reposicao.mes.toLowerCase());
            }
            if (reposicao.ano) {
                anos.add(reposicao.ano.toString());
            }
            if (reposicao.origem) {
                origens.add(reposicao.origem);
            }
        });

        // Adicionar também origens dos novos agendamentos
        if (this.agendamentosNovos) {
            this.agendamentosNovos.forEach(agendamento => {
                if (agendamento.origem) {
                    origens.add(agendamento.origem);
                }
            });
        }

        // Preencher select de meses
        const filtroMes = document.getElementById('filtroMes');
        if (filtroMes) {
            const valorAtual = filtroMes.value;
            filtroMes.innerHTML = '<option value="">Todos os meses</option>';
            
            const mesesOrdenados = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
            mesesOrdenados.forEach(mes => {
                if (meses.has(mes)) {
                    const option = document.createElement('option');
                    option.value = mes;
                    option.textContent = mes.charAt(0).toUpperCase() + mes.slice(1);
                    if (mes === valorAtual) {
                        option.selected = true;
                    }
                    filtroMes.appendChild(option);
                }
            });
        }

        // Preencher select de anos
        const filtroAno = document.getElementById('filtroAno');
        if (filtroAno) {
            const valorAtual = filtroAno.value;
            filtroAno.innerHTML = '<option value="">Todos os anos</option>';
            
            const anosArray = Array.from(anos).sort((a, b) => b - a);
            anosArray.forEach(ano => {
                const option = document.createElement('option');
                option.value = ano;
                option.textContent = ano;
                if (ano === valorAtual) {
                    option.selected = true;
                }
                filtroAno.appendChild(option);
            });
        }

        // Criar datalist para origens (sugestões)
        const filtroOrigem = document.getElementById('filtroOrigem');
        if (filtroOrigem) {
            // Remover datalist existente se houver
            const datalistExistente = document.getElementById('origensList');
            if (datalistExistente) {
                datalistExistente.remove();
            }

            // Criar novo datalist
            const datalist = document.createElement('datalist');
            datalist.id = 'origensList';
            
            Array.from(origens).sort().forEach(origem => {
                const option = document.createElement('option');
                option.value = origem;
                datalist.appendChild(option);
            });
            
            filtroOrigem.setAttribute('list', 'origensList');
            document.body.appendChild(datalist);
        }
    }

    limparFiltros() {
        const filtroData = document.getElementById('filtroData');
        const filtroMes = document.getElementById('filtroMes');
        const filtroAno = document.getElementById('filtroAno');
        const filtroOrigem = document.getElementById('filtroOrigem');
        const filtroDia = document.getElementById('filtroDiaSemana');
        const filtroProfessor = document.getElementById('filtroProfessor');
        const filtroTurma = document.getElementById('filtroTurma');

        if (filtroData) filtroData.value = '';
        if (filtroMes) filtroMes.value = '';
        if (filtroAno) filtroAno.value = '';
        if (filtroOrigem) filtroOrigem.value = '';
        if (filtroDia) filtroDia.value = '';
        if (filtroProfessor) filtroProfessor.value = '';
        if (filtroTurma) filtroTurma.value = '';

        this.renderizarReposicoes();
        this.showToast('Filtros limpos com sucesso!');
    }

    atualizarEstatisticas(reposicoes) {
        const totalElement = document.getElementById('totalCSV');
        const semHorarioElement = document.getElementById('semHorarioCSV');
        const comHorarioElement = document.getElementById('comHorarioCSV');

        if (totalElement) {
            totalElement.textContent = reposicoes.length;
        }

        const semHorario = reposicoes.filter(r => !r.hora || r.hora.trim() === '').length;
        const comHorario = reposicoes.filter(r => r.hora && r.hora.trim() !== '').length;

        if (semHorarioElement) semHorarioElement.textContent = semHorario.length;
        if (comHorarioElement) comHorarioElement.textContent = comHorario.length;
    }

    exportarParaCSV() {
        const csvContent = this.gerarCSV(this.reposicoesCSV);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', 'reposicoes_exportadas.csv');
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('CSV exportado com sucesso!');
    }

    gerarCSV(reposicoes) {
        const cabecalho = 'Nome,Turma,Dia da Semana,Data,Hora,Origem,Tipo\n';
        const linhas = reposicoes.map(r => 
            `"${r.nome}","${r.turma}","${r.diaSemana}","${r.data || ''}","${r.hora || ''}","${r.origem}","CSV"`
        ).join('\n');
        
        return cabecalho + linhas;
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        if (!toast || !toastMessage) return;
        
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
}

// Inicializar o sistema quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.reposicoesCSV = new ReposicoesCSV();
});
