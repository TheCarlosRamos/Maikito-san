// Serviço de Banco de Dados IndexedDB para Agendamentos
class DatabaseService {
    constructor() {
        this.dbName = 'MaikitoSanDashboard';
        this.dbVersion = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB inicializado com sucesso');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Criar object store para agendamentos
                if (!db.objectStoreNames.contains('agendamentos_reposicao')) {
                    const store = db.createObjectStore('agendamentos_reposicao', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    
                    // Criar índices para busca
                    store.createIndex('aluno', 'aluno', { unique: false });
                    store.createIndex('data', 'data', { unique: false });
                    store.createIndex('status', 'status', { unique: false });
                    store.createIndex('turma', 'turma', { unique: false });
                    store.createIndex('criadoEm', 'criadoEm', { unique: false });
                    
                    console.log('✅ Object store criada: agendamentos_reposicao');
                }
            };
        });
    }

    async salvarAgendamento(agendamento) {
        try {
            const transaction = this.db.transaction(['agendamentos_reposicao'], 'readwrite');
            const store = transaction.objectStore('agendamentos_reposicao');
            
            // Adicionar timestamp se não existir
            if (!agendamento.criadoEm) {
                agendamento.criadoEm = new Date().toISOString();
            }
            agendamento.atualizadoEm = new Date().toISOString();
            
            const request = store.put(agendamento);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    console.log('✅ Agendamento salvo:', agendamento.id);
                    resolve(agendamento);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('❌ Erro ao salvar agendamento:', error);
            throw error;
        }
    }

    async carregarAgendamentos() {
        try {
            const transaction = this.db.transaction(['agendamentos_reposicao'], 'readonly');
            const store = transaction.objectStore('agendamentos_reposicao');
            const request = store.getAll();
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    const agendamentos = request.result;
                    console.log(`✅ ${agendamentos.length} agendamentos carregados`);
                    resolve(agendamentos);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('❌ Erro ao carregar agendamentos:', error);
            throw error;
        }
    }

    async buscarAgendamentos(filtros = {}) {
        try {
            const transaction = this.db.transaction(['agendamentos_reposicao'], 'readonly');
            const store = transaction.objectStore('agendamentos_reposicao');
            const request = store.getAll();
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    let agendamentos = request.result;
                    
                    // Aplicar filtros
                    if (filtros.data) {
                        agendamentos = agendamentos.filter(a => a.data === filtros.data);
                    }
                    if (filtros.status) {
                        agendamentos = agendamentos.filter(a => a.status === filtros.status);
                    }
                    if (filtros.aluno) {
                        agendamentos = agendamentos.filter(a => 
                            a.aluno.toLowerCase().includes(filtros.aluno.toLowerCase())
                        );
                    }
                    if (filtros.turma) {
                        agendamentos = agendamentos.filter(a => a.turma === filtros.turma);
                    }
                    
                    // Ordenar por data (mais recentes primeiro)
                    agendamentos.sort((a, b) => new Date(b.data) - new Date(a.data));
                    
                    console.log(`✅ ${agendamentos.length} agendamentos encontrados com filtros:`, filtros);
                    resolve(agendamentos);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('❌ Erro ao buscar agendamentos:', error);
            throw error;
        }
    }

    async excluirAgendamento(id) {
        try {
            const transaction = this.db.transaction(['agendamentos_reposicao'], 'readwrite');
            const store = transaction.objectStore('agendamentos_reposicao');
            const request = store.delete(id);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    console.log('✅ Agendamento excluído:', id);
                    resolve(true);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('❌ Erro ao excluir agendamento:', error);
            throw error;
        }
    }

    async atualizarStatus(id, novoStatus) {
        try {
            const transaction = this.db.transaction(['agendamentos_reposicao'], 'readwrite');
            const store = transaction.objectStore('agendamentos_reposicao');
            
            // Primeiro buscar o agendamento
            const getRequest = store.get(id);
            
            return new Promise((resolve, reject) => {
                getRequest.onsuccess = () => {
                    const agendamento = getRequest.result;
                    if (!agendamento) {
                        reject(new Error('Agendamento não encontrado'));
                        return;
                    }
                    
                    // Atualizar status
                    agendamento.status = novoStatus;
                    agendamento.atualizadoEm = new Date().toISOString();
                    
                    // Salvar atualização
                    const putRequest = store.put(agendamento);
                    putRequest.onsuccess = () => {
                        console.log('✅ Status atualizado:', id, '→', novoStatus);
                        resolve(agendamento);
                    };
                    putRequest.onerror = () => reject(putRequest.error);
                };
                getRequest.onerror = () => reject(getRequest.error);
            });
        } catch (error) {
            console.error('❌ Erro ao atualizar status:', error);
            throw error;
        }
    }

    async getEstatisticas() {
        try {
            const agendamentos = await this.carregarAgendamentos();
            
            const stats = {
                total: agendamentos.length,
                porStatus: {},
                porMes: {},
                porTurma: {},
                recentes: agendamentos
                    .sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm))
                    .slice(0, 5)
            };
            
            // Contar por status
            agendamentos.forEach(a => {
                stats.porStatus[a.status] = (stats.porStatus[a.status] || 0) + 1;
            });
            
            // Contar por mês
            agendamentos.forEach(a => {
                const mes = a.data.substring(0, 7); // YYYY-MM
                stats.porMes[mes] = (stats.porMes[mes] || 0) + 1;
            });
            
            // Contar por turma
            agendamentos.forEach(a => {
                stats.porTurma[a.turma] = (stats.porTurma[a.turma] || 0) + 1;
            });
            
            console.log('✅ Estatísticas geradas:', stats);
            return stats;
        } catch (error) {
            console.error('❌ Erro ao gerar estatísticas:', error);
            throw error;
        }
    }

    // Migração do localStorage para IndexedDB
    async migrarDoLocalStorage() {
        try {
            const dadosAntigos = localStorage.getItem('agendamentos_reposicao');
            if (!dadosAntigos) {
                console.log('📋 Nenhum dado encontrado no localStorage para migrar');
                return;
            }
            
            const agendamentosAntigos = JSON.parse(dadosAntigos);
            console.log(`🔄 Migrando ${agendamentosAntigos.length} agendamentos do localStorage...`);
            
            for (const agendamento of agendamentosAntigos) {
                await this.salvarAgendamento(agendamento);
            }
            
            // Opcional: limpar localStorage após migração
            // localStorage.removeItem('agendamentos_reposicao');
            
            console.log('✅ Migração concluída com sucesso!');
        } catch (error) {
            console.error('❌ Erro na migração:', error);
            throw error;
        }
    }
}

// Exportar para uso global
window.DatabaseService = DatabaseService;
