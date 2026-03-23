// Versão do SistemaReposicao com IndexedDB
class SistemaReposicaoDB {
    constructor() {
        this.alunos = [];
        this.turmas = [];
        this.horarios = [];
        this.agendamentos = [];
        this.selectedAluno = null;
        this.selectedIndex = -1;
        this.db = null;
        this.init();
    }

    async init() {
        try {
            // Inicializar banco de dados
            this.db = new DatabaseService();
            await this.db.init();
            
            // Carregar dados
            await this.carregarDadosOrganizados();
            await this.carregarAgendamentosDB();
            
            // Verificar migração do localStorage
            await this.verificarMigracao();
            
            this.setupEventListeners();
            this.preencherSelects();
            this.renderizarAgendamentos();
            
            console.log('✅ Sistema inicializado com IndexedDB');
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema:', error);
        }
    }

    async carregarAgendamentosDB() {
        try {
            this.agendamentos = await this.db.carregarAgendamentos();
            console.log(`✅ ${this.agendamentos.length} agendamentos carregados do IndexedDB`);
        } catch (error) {
            console.error('❌ Erro ao carregar agendamentos:', error);
            this.agendamentos = [];
        }
    }

    async verificarMigracao() {
        // Verificar se há dados no localStorage para migrar
        const dadosLocalStorage = localStorage.getItem('agendamentos_reposicao');
        if (dadosLocalStorage && this.agendamentos.length === 0) {
            console.log('🔄 Detectados dados no localStorage, iniciando migração...');
            await this.db.migrarDoLocalStorage();
            await this.carregarAgendamentosDB(); // Recarregar após migração
        }
    }

    async salvarAgendamento(agendamento) {
        try {
            const salvo = await this.db.salvarAgendamento(agendamento);
            this.agendamentos.push(salvo);
            return salvo;
        } catch (error) {
            console.error('❌ Erro ao salvar agendamento:', error);
            throw error;
        }
    }

    async carregarDadosOrganizados() {
        try {
            console.log('🔄 Carregando dados organizados...');
            
            const response = await fetch('dados_organizados.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const dadosOrganizados = await response.json();
            console.log('✅ Dados carregados com sucesso');
            
            this.extrairDados(dadosOrganizados);
        } catch (error) {
            console.error('❌ Erro ao carregar dados organizados:', error);
            console.log('🔄 Tentando usar dados do excelData como fallback...');
            
            if (typeof excelData !== 'undefined') {
                this.extrairDadosExcel();
            } else {
                throw new Error('Nenhum dado disponível');
            }
        }
    }

    // ... (restante das funções são iguais às do reposicao.js original)
    
    async prepararAgendamento() {
        console.log('🔄 Preparando agendamento...');
        
        const form = document.getElementById('reposicaoForm');
        if (!form) {
            console.error('❌ Formulário não encontrado');
            return;
        }
        
        // Verificar campos obrigatórios
        const alunoValue = document.getElementById('alunoSelect').value;
        const dataValue = document.getElementById('dataReposicao').value;
        const horarioValue = document.getElementById('horarioSelect').value;
        const turmaValue = document.getElementById('turmaSelect').value;
        const motivoValue = document.getElementById('motivoReposicao').value;
        
        console.log('📋 Valores do formulário:');
        console.log('  Aluno:', alunoValue);
        console.log('  Data:', dataValue);
        console.log('  Horário:', horarioValue);
        console.log('  Turma:', turmaValue);
        console.log('  Motivo:', motivoValue);
        
        // Validação
        if (!alunoValue) {
            console.error('❌ Aluno não selecionado');
            this.showToast('Por favor, selecione um aluno');
            return;
        }
        
        if (!dataValue) {
            console.error('❌ Data não informada');
            this.showToast('Por favor, selecione uma data');
            return;
        }
        
        if (!horarioValue) {
            console.error('❌ Horário não selecionado');
            this.showToast('Por favor, selecione um horário');
            return;
        }
        
        if (!turmaValue) {
            console.error('❌ Turma não selecionada');
            this.showToast('Por favor, selecione uma turma');
            return;
        }
        
        if (!motivoValue) {
            console.error('❌ Motivo não informado');
            this.showToast('Por favor, informe o motivo');
            return;
        }
        
        const agendamento = {
            aluno: alunoValue,
            data: dataValue,
            horario: horarioValue,
            turma: turmaValue,
            motivo: motivoValue,
            status: 'pendente'
        };
        
        console.log('✅ Agendamento preparado:', agendamento);
        
        // Exibir modal de confirmação
        this.exibirModalConfirmacao(agendamento);
    }

    async confirmarAgendamento() {
        console.log('✅ Confirmando agendamento...');
        
        const modal = document.getElementById('confirmModal');
        if (!modal) {
            console.error('❌ Modal não encontrado para confirmar');
            return;
        }
        
        const agendamento = JSON.parse(modal.dataset.agendamento);
        console.log('📋 Agendamento a ser salvo:', agendamento);
        
        try {
            // Salvar no IndexedDB
            await this.salvarAgendamento(agendamento);
            
            this.showToast('Agendamento realizado com sucesso!');
            this.limparFormulario();
            
            // Fechar modal corretamente
            modal.classList.remove('active');
            modal.classList.add('hidden');
            
            this.renderizarAgendamentos();
            
            console.log('✅ Agendamento confirmado e salvo no IndexedDB');
        } catch (error) {
            console.error('❌ Erro ao salvar agendamento:', error);
            this.showToast('Erro ao salvar agendamento');
        }
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    limparFormulario() {
        const form = document.getElementById('reposicaoForm');
        if (form) {
            form.reset();
            
            // Limpar informações
            document.getElementById('alunoInfo').classList.add('hidden');
            document.getElementById('turmaInfo').classList.add('hidden');
            
            // Resetar autocomplete
            document.getElementById('alunoInput').value = '';
            document.getElementById('alunoSuggestions').classList.remove('active');
        }
    }

    // Funções de estatísticas
    async exibirEstatisticas() {
        try {
            const stats = await this.db.getEstatisticas();
            console.log('📊 Estatísticas:', stats);
            
            // Exibir no dashboard (se houver elemento)
            const statsElement = document.getElementById('estatisticasReposicao');
            if (statsElement) {
                statsElement.innerHTML = `
                    <div class="stat-card">
                        <h3>${stats.total}</h3>
                        <p>Total de Agendamentos</p>
                    </div>
                    <div class="stat-card">
                        <h3>${stats.porStatus.pendente || 0}</h3>
                        <p>Pendentes</p>
                    </div>
                    <div class="stat-card">
                        <h3>${stats.porStatus.confirmado || 0}</h3>
                        <p>Confirmados</p>
                    </div>
                    <div class="stat-card">
                        <h3>${stats.porStatus.realizado || 0}</h3>
                        <p>Realizados</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('❌ Erro ao exibir estatísticas:', error);
        }
    }
}

// Funções globais para acesso no HTML
let sistemaReposicaoDB;

function confirmarAgendamento() {
    sistemaReposicaoDB.confirmarAgendamento();
}

function limparFormulario() {
    sistemaReposicaoDB.limparFormulario();
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    sistemaReposicaoDB = new SistemaReposicaoDB();
});
