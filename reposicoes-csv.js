// Sistema para carregar e gerenciar reposições do CSV
class ReposicoesCSV {
    constructor() {
        this.reposicoesCSV = [];
        this.init();
    }

    async init() {
        try {
            await this.carregarCSV();
            this.setupEventListeners();
            this.renderizarReposicoes();
            console.log('✅ Sistema de Reposições CSV inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema:', error);
        }
    }

    async carregarCSV() {
        try {
            // Carregar arquivo CSV
            const response = await fetch('reposicoes_completas.csv');
            const csvText = await response.text();
            
            // Processar CSV
            const linhas = csvText.split('\n').filter(linha => linha.trim());
            const cabecalho = linhas[0].split(',').map(col => col.trim());
            
            this.reposicoesCSV = [];
            
            for (let i = 1; i < linhas.length; i++) {
                const valores = linhas[i].split(',').map(val => val.trim());
                
                if (valores.length >= 4 && valores[0]) { // Verificar se tem dados válidos
                    const reposicao = {
                        id: i,
                        nome: valores[0] || '',
                        turma: valores[1] || '',
                        data: valores[2] || '',
                        hora: valores[3] || '', // CSV não tem hora, fica vazio
                        diaSemana: this.normalizarDiaSemana(valores[4] || ''),
                        origem: valores[5] || '',
                        tipo: 'CSV' // Marcar como vindo do CSV
                    };
                    
                    this.reposicoesCSV.push(reposicao);
                }
            }
            
            console.log(`📊 ${this.reposicoesCSV.length} reposições carregadas do CSV`);
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
    }

    renderizarReposicoes() {
        console.log('🔄 Renderizando reposições do CSV...');
        
        const container = document.getElementById('reposicoesCSVList');
        const filtroDia = document.getElementById('filtroDiaSemana');
        const filtroProfessor = document.getElementById('filtroProfessor');
        const filtroTurma = document.getElementById('filtroTurma');
        
        if (!container) {
            console.error('❌ Container reposicoesCSVList não encontrado');
            return;
        }

        let reposicoesFiltradas = [...this.reposicoesCSV];

        // Aplicar filtros
        if (filtroDia && filtroDia.value) {
            reposicoesFiltradas = reposicoesFiltradas.filter(r => 
                r.diaSemana.toLowerCase().includes(filtroDia.value.toLowerCase())
            );
        }

        if (filtroProfessor && filtroProfessor.value) {
            const termoProfessor = filtroProfessor.value.toLowerCase();
            reposicoesFiltradas = reposicoesFiltradas.filter(r => 
                r.nome.toLowerCase().includes(termoProfessor)
            );
        }

        if (filtroTurma && filtroTurma.value) {
            const termoTurma = filtroTurma.value.toLowerCase();
            reposicoesFiltradas = reposicoesFiltradas.filter(r => 
                r.turma.toLowerCase().includes(termoTurma)
            );
        }

        // Agrupar por dia da semana
        const reposicoesPorDia = this.agruparPorDia(reposicoesFiltradas);

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

        this.atualizarEstatisticas(reposicoesFiltradas);
        console.log(`✅ ${reposicoesFiltradas.length} reposições renderizadas`);
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
        
        return `
            <div class="reposicao-card csv-card" data-id="${reposicao.id}">
                <div class="card-header">
                    <div class="aluno-info">
                        <h4>${reposicao.nome}</h4>
                        <span class="turma">${reposicao.turma}</span>
                    </div>
                    <div class="card-badges">
                        <span class="badge csv-badge">
                            <i class="fas fa-file-csv"></i> CSV
                        </span>
                        ${temHorario ? `
                            <span class="badge time-badge">
                                <i class="fas fa-clock"></i> ${reposicao.hora}
                            </span>
                        ` : `
                            <span class="badge no-time-badge">
                                <i class="fas fa-clock"></i> Sem horário
                            </span>
                        `}
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
                            <i class="fas fa-source"></i> Origem:
                        </span>
                        <span class="value">${reposicao.origem}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-action btn-primary" onclick="reposicoesCSV.agendarReposicao(${reposicao.id})" title="Agendar horário">
                        <i class="fas fa-calendar-plus"></i> Agendar
                    </button>
                    <button class="btn-action btn-secondary" onclick="reposicoesCSV.verDetalhes(${reposicao.id})" title="Ver detalhes">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            </div>
        `;
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

    limparFiltros() {
        const filtroDia = document.getElementById('filtroDiaSemana');
        const filtroProfessor = document.getElementById('filtroProfessor');
        const filtroTurma = document.getElementById('filtroTurma');

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
