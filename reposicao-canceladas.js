class SistemaCancelados {
    constructor() {
        this.agendamentosCancelados = [];
        this.init();
    }

    async init() {
        try {
            // Carregar agendamentos cancelados
            this.agendamentosCancelados = this.carregarAgendamentosCancelados();
            this.setupEventListeners();
            this.renderizarCancelados();
            
            console.log('✅ Sistema de Cancelados inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema:', error);
        }
    }

    setupEventListeners() {
        console.log('🔄 Configurando event listeners...');
        
        // Botões de filtro
        const filterData = document.getElementById('filterData');
        const filterProfessor = document.getElementById('filterProfessor');
        const filterMotivo = document.getElementById('filterMotivo');
        
        if (filterData) {
            filterData.addEventListener('change', () => this.renderizarCancelados());
        }
        
        if (filterProfessor) {
            filterProfessor.addEventListener('input', () => this.renderizarCancelados());
        }
        
        if (filterMotivo) {
            filterMotivo.addEventListener('input', () => this.renderizarCancelados());
        }

        console.log('✅ Event listeners configurados');
    }

    carregarAgendamentosCancelados() {
        const cancelados = localStorage.getItem('agendamentos_cancelados');
        return cancelados ? JSON.parse(cancelados) : [];
    }

    renderizarCancelados() {
        console.log('🔄 Renderizando agendamentos cancelados...');
        
        const container = document.getElementById('canceladosList');
        const filtroData = document.getElementById('filterData');
        const filtroProfessor = document.getElementById('filterProfessor');
        const filtroMotivo = document.getElementById('filterMotivo');
        
        if (!container) {
            console.error('❌ Container canceladosList não encontrado');
            return;
        }

        let canceladosFiltrados = [...this.agendamentosCancelados];

        // Aplicar filtros
        if (filtroData && filtroData.value) {
            canceladosFiltrados = canceladosFiltrados.filter(a => a.data === filtroData.value);
        }

        if (filtroProfessor && filtroProfessor.value) {
            const termoProfessor = filtroProfessor.value.toLowerCase();
            canceladosFiltrados = canceladosFiltrados.filter(a => 
                a.professor.toLowerCase().includes(termoProfessor)
            );
        }

        if (filtroMotivo && filtroMotivo.value) {
            const termoMotivo = filtroMotivo.value.toLowerCase();
            canceladosFiltrados = canceladosFiltrados.filter(a => 
                a.motivoCancelamento && a.motivoCancelamento.toLowerCase().includes(termoMotivo)
            );
        }

        if (canceladosFiltrados.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>Nenhuma reposição cancelada encontrada</h3>
                    <p>Não há reposições canceladas que correspondam aos filtros selecionados.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        canceladosFiltrados.forEach(agendamento => {
            const card = this.criarCardCancelado(agendamento);
            container.appendChild(card);
        });

        console.log(`✅ ${canceladosFiltrados.length} agendamentos cancelados renderizados`);
    }

    criarCardCancelado(agendamento) {
        const dataCancelamento = new Date(agendamento.dataCancelamento);
        
        return `
            <div class="data-card agendamento-card cancelado">
                <div class="data-card-header">
                    <div class="data-card-title">
                        <h3>${agendamento.aluno}</h3>
                        <div class="data-card-subtitle">${agendamento.turma}</div>
                    </div>
                    <div class="data-card-badge cancelled">
                        <i class="fas fa-times"></i>
                        Cancelado
                    </div>
                </div>
                
                <div class="data-card-content">
                    <div class="info-grid">
                        <div class="info-item">
                            <i class="fas fa-calendar"></i>
                            <span><strong>Data da Reposição:</strong> ${this.formatarData(agendamento.data)}</span>
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
                            <i class="fas fa-comment"></i>
                            <span><strong>Motivo da Reposição:</strong> ${agendamento.motivo || 'Não informado'}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-exclamation-triangle"></i>
                            <span><strong>Motivo do Cancelamento:</strong> ${agendamento.motivoCancelamento}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-calendar-times"></i>
                            <span><strong>Data do Cancelamento:</strong> ${this.formatarDataHora(agendamento.dataCancelamento)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="data-card-footer">
                    <small>
                        <i class="fas fa-clock"></i>
                        Agendamento criado em ${this.formatarDataHora(agendamento.dataCriacao)}
                    </small>
                    <div class="card-actions">
                        <button class="btn-action btn-pdf" onclick="sistemaCancelados.exportarParaPDF(${agendamento.id})" title="Exportar PDF">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
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

    exportarParaPDF(id) {
        const agendamento = this.agendamentosCancelados.find(a => a.id === id);
        if (!agendamento) {
            this.showToast('Agendamento não encontrado!', 'error');
            return;
        }

        // Implementar exportação PDF similar à da página principal
        this.showToast('Funcionalidade de PDF em desenvolvimento...');
    }

    exportarTodosParaPDF() {
        if (this.agendamentosCancelados.length === 0) {
            this.showToast('Nenhum agendamento cancelado para exportar!', 'error');
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
    window.sistemaCancelados = new SistemaCancelados();
});
