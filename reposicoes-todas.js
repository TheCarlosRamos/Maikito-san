class SistemaTodasReposicoes {
    constructor() {
        this.agendamentos = [];
        this.init();
    }

    async init() {
        try {
            // Carregar agendamentos
            this.agendamentos = this.carregarAgendamentos();
            this.setupEventListeners();
            this.renderizarReposicoes();
            this.atualizarEstatisticas();
            
            console.log('✅ Sistema de Todas as Reposições inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema:', error);
        }
    }

    setupEventListeners() {
        console.log('🔄 Configurando event listeners...');
        
        // Botões de filtro
        const filterData = document.getElementById('filterData');
        const filterProfessor = document.getElementById('filterProfessor');
        const filterAluno = document.getElementById('filterAluno');
        const filterStatus = document.getElementById('filterStatus');
        const filterTurma = document.getElementById('filterTurma');
        
        if (filterData) {
            filterData.addEventListener('change', () => this.renderizarReposicoes());
        }
        
        if (filterProfessor) {
            filterProfessor.addEventListener('input', () => this.renderizarReposicoes());
        }
        
        if (filterAluno) {
            filterAluno.addEventListener('input', () => this.renderizarReposicoes());
        }
        
        if (filterStatus) {
            filterStatus.addEventListener('change', () => this.renderizarReposicoes());
        }
        
        if (filterTurma) {
            filterTurma.addEventListener('input', () => this.renderizarReposicoes());
        }

        console.log('✅ Event listeners configurados');
    }

    carregarAgendamentos() {
        const salvos = localStorage.getItem('agendamentos_reposicao');
        return salvos ? JSON.parse(salvos) : [];
    }

    renderizarReposicoes() {
        console.log('🔄 Renderizando todas as reposições...');
        
        const container = document.getElementById('todasReposicoesList');
        const filtroData = document.getElementById('filterData');
        const filtroProfessor = document.getElementById('filterProfessor');
        const filtroAluno = document.getElementById('filterAluno');
        const filtroStatus = document.getElementById('filterStatus');
        const filtroTurma = document.getElementById('filterTurma');
        
        if (!container) {
            console.error('❌ Container todasReposicoesList não encontrado');
            return;
        }

        let reposicoesFiltradas = [...this.agendamentos];

        // Aplicar filtros
        if (filtroData && filtroData.value) {
            reposicoesFiltradas = reposicoesFiltradas.filter(a => a.data === filtroData.value);
        }

        if (filtroProfessor && filtroProfessor.value) {
            const termoProfessor = filtroProfessor.value.toLowerCase();
            reposicoesFiltradas = reposicoesFiltradas.filter(a => 
                a.professor.toLowerCase().includes(termoProfessor)
            );
        }

        if (filtroAluno && filtroAluno.value) {
            const termoAluno = filtroAluno.value.toLowerCase();
            reposicoesFiltradas = reposicoesFiltradas.filter(a => 
                a.aluno.toLowerCase().includes(termoAluno)
            );
        }

        if (filtroStatus && filtroStatus.value) {
            reposicoesFiltradas = reposicoesFiltradas.filter(a => a.status === filtroStatus.value);
        }

        if (filtroTurma && filtroTurma.value) {
            const termoTurma = filtroTurma.value.toLowerCase();
            reposicoesFiltradas = reposicoesFiltradas.filter(a => 
                a.turma.toLowerCase().includes(termoTurma)
            );
        }

        if (reposicoesFiltradas.length === 0) {
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
        reposicoesFiltradas.forEach(agendamento => {
            const card = this.criarCardReposicao(agendamento);
            container.appendChild(card);
        });

        this.atualizarEstatisticas();
        console.log(`✅ ${reposicoesFiltradas.length} reposições renderizadas`);
    }

    criarCardReposicao(agendamento) {
        const statusClass = this.getStatusClass(agendamento.status);
        const statusIcon = this.getStatusIcon(agendamento.status);
        
        return `
            <div class="data-card agendamento-card" data-id="${agendamento.id}">
                <div class="data-card-header">
                    <div class="data-card-title">
                        <h3>${agendamento.aluno}</h3>
                        <div class="data-card-subtitle">${agendamento.turma}</div>
                    </div>
                    <div class="data-card-badge ${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                        ${agendamento.status}
                    </div>
                </div>
                
                <div class="data-card-content">
                    <div class="info-grid">
                        <div class="info-item">
                            <i class="fas fa-calendar"></i>
                            <span><strong>Data:</strong> ${this.formatarData(agendamento.data)}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-clock"></i>
                            <span><strong>Horário:</strong> ${agendamento.horario}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-user"></i>
                            <span><strong>Professor:</strong> ${agendamento.professor}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-envelope"></i>
                            <span><strong>E-mail:</strong> ${agendamento.email}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-phone"></i>
                            <span><strong>Telefone:</strong> ${agendamento.telefone}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-comment"></i>
                            <span><strong>Motivo:</strong> ${agendamento.motivo || 'Não informado'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="data-card-footer">
                    <small>
                        <i class="fas fa-clock"></i>
                        Criado em ${this.formatarDataHora(agendamento.dataCriacao)}
                    </small>
                    <div class="card-actions">
                        ${this.criarBotoesAcao(agendamento)}
                        <button class="btn-action btn-pdf" onclick="sistemaTodas.exportarParaPDF(${agendamento.id})" title="Exportar PDF">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    criarBotoesAcao(agendamento) {
        if (agendamento.status === 'pendente') {
            return `
                <button class="btn-action btn-success" onclick="sistemaTodas.atualizarStatus(${agendamento.id}, 'confirmado')" title="Confirmar">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn-action btn-cancel" onclick="sistemaTodas.cancelarAgendamento(${agendamento.id})" title="Cancelar">
                    <i class="fas fa-times"></i>
                </button>
            `;
        } else if (agendamento.status === 'confirmado') {
            return `
                <button class="btn-action btn-success" onclick="sistemaTodas.atualizarStatus(${agendamento.id}, 'realizado')" title="Marcar como realizado">
                    <i class="fas fa-check-double"></i>
                </button>
                <button class="btn-action btn-cancel" onclick="sistemaTodas.cancelarAgendamento(${agendamento.id})" title="Cancelar">
                    <i class="fas fa-times"></i>
                </button>
            `;
        } else if (agendamento.status === 'realizado') {
            return `
                <button class="btn-action btn-info" disabled title="Já realizado">
                    <i class="fas fa-check-double"></i>
                </button>
            `;
        }
        return '';
    }

    atualizarStatus(id, novoStatus) {
        const agendamento = this.agendamentos.find(a => a.id === id);
        if (agendamento) {
            agendamento.status = novoStatus;
            this.salvarAgendamentos();
            this.renderizarReposicoes();
            this.atualizarEstatisticas();
            this.showToast(`Status atualizado para ${this.formatarStatus(novoStatus)}`);
        }
    }

    cancelarAgendamento(id) {
        const agendamento = this.agendamentos.find(a => a.id === id);
        if (!agendamento) {
            this.showToast('Agendamento não encontrado!', 'error');
            return;
        }

        // Perguntar motivo do cancelamento
        const motivo = prompt('Por favor, informe o motivo do cancelamento:');
        if (!motivo || motivo.trim() === '') {
            this.showToast('Motivo do cancelamento é obrigatório!', 'error');
            return;
        }

        // Mover para cancelados
        agendamento.status = 'cancelado';
        agendamento.motivoCancelamento = motivo.trim();
        agendamento.dataCancelamento = new Date().toISOString();

        // Salvar no localStorage de cancelados
        let cancelados = JSON.parse(localStorage.getItem('agendamentos_cancelados') || '[]');
        cancelados.push(agendamento);
        localStorage.setItem('agendamentos_cancelados', JSON.stringify(cancelados));

        // Remover dos ativos
        this.agendamentos = this.agendamentos.filter(a => a.id !== id);

        // Salvar agendamentos ativos
        this.salvarAgendamentos();

        this.showToast('Agendamento cancelado com sucesso!');
        this.renderizarReposicoes();
        this.atualizarEstatisticas();
    }

    salvarAgendamentos() {
        localStorage.setItem('agendamentos_reposicao', JSON.stringify(this.agendamentos));
    }

    atualizarEstatisticas() {
        const total = this.agendamentos.length;
        const pendentes = this.agendamentos.filter(a => a.status === 'pendente').length;
        const confirmados = this.agendamentos.filter(a => a.status === 'confirmado').length;
        const realizados = this.agendamentos.filter(a => a.status === 'realizado').length;

        document.getElementById('totalReposicoes').textContent = total;
        document.getElementById('pendentesCount').textContent = pendentes;
        document.getElementById('confirmadosCount').textContent = confirmados;
        document.getElementById('realizadosCount').textContent = realizados;
    }

    limparFiltros() {
        document.getElementById('filterData').value = '';
        document.getElementById('filterProfessor').value = '';
        document.getElementById('filterAluno').value = '';
        document.getElementById('filterStatus').value = '';
        document.getElementById('filterTurma').value = '';
        this.renderizarReposicoes();
        this.showToast('Filtros limpos com sucesso!');
    }

    formatarData(dataString) {
        if (!dataString) return 'N/A';
        
        // Se já estiver no formato DD/MM/YYYY, só precisa converter para Date
        if (dataString.includes('/')) {
            const [dia, mes, ano] = dataString.split('/');
            return `${dia}/${mes}/${ano}`;
        }
        
        // Se estiver no formato YYYY-MM-DD
        if (dataString.includes('-')) {
            const [ano, mes, dia] = dataString.split('-');
            return `${dia}/${mes}/${ano}`;
        }
        
        return dataString;
    }

    formatarDataHora(dataString) {
        if (!dataString) return 'N/A';
        
        const data = new Date(dataString);
        if (isNaN(data.getTime())) return 'Data inválida';
        
        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0');
        const ano = data.getFullYear();
        const horas = String(data.getHours()).padStart(2, '0');
        const minutos = String(data.getMinutes()).padStart(2, '0');
        
        return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
    }

    formatarStatus(status) {
        const statusMap = {
            'pendente': 'Pendente',
            'confirmado': 'Confirmado',
            'realizado': 'Realizado',
            'cancelado': 'Cancelado'
        };
        return statusMap[status] || status;
    }

    getStatusClass(status) {
        const classes = {
            'pendente': 'pending',
            'confirmado': 'confirmed',
            'realizado': 'completed',
            'cancelado': 'cancelled'
        };
        return classes[status] || 'pending';
    }

    getStatusIcon(status) {
        const icons = {
            'pendente': 'fa-clock',
            'confirmado': 'fa-check',
            'realizado': 'fa-check-double',
            'cancelado': 'fa-times'
        };
        return icons[status] || 'fa-clock';
    }

    exportarParaPDF(id) {
        const agendamento = this.agendamentos.find(a => a.id === id);
        if (!agendamento) {
            this.showToast('Agendamento não encontrado!', 'error');
            return;
        }

        // Implementar exportação PDF similar à da página principal
        this.showToast('Funcionalidade de PDF em desenvolvimento...');
    }

    exportarTodosParaPDF() {
        if (this.agendamentos.length === 0) {
            this.showToast('Nenhuma reposição para exportar!', 'error');
            return;
        }

        // Implementar exportação PDF em lote
        this.showToast('Funcionalidade de PDF em desenvolvimento...');
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
    window.sistemaTodas = new SistemaTodasReposicoes();
});
