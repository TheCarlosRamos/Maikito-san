// Sistema de Banco de Dados para Vercel KV
class ReposicaoDB {
    constructor() {
        this.useLocalStorage = true;
        this.kv = null;
    }

    async init() {
        // Detectar se está em produção (Vercel) ou local
        if (typeof window !== 'undefined') {
            // Ambiente local - usar localStorage
            this.useLocalStorage = true;
            console.log('🏠 Usando localStorage (ambiente local)');
        } else {
            // Ambiente Vercel - usar KV
            try {
                this.kv = require('@vercel/kv').kv;
                this.useLocalStorage = false;
                console.log('☁️ Usando Vercel KV (ambiente produção)');
            } catch (error) {
                console.warn('⚠️ KV não disponível, usando fallback localStorage');
                this.useLocalStorage = true;
            }
        }
    }

    async salvarAgendamentos(agendamentos) {
        try {
            if (this.useLocalStorage) {
                localStorage.setItem('agendamentos_reposicao', JSON.stringify(agendamentos));
                console.log('✅ Agendamentos salvos no localStorage');
            } else {
                await this.kv.set('agendamentos_reposicao', JSON.stringify(agendamentos));
                console.log('✅ Agendamentos salvos no Vercel KV');
            }
        } catch (error) {
            console.error('❌ Erro ao salvar agendamentos:', error);
            // Fallback para localStorage
            localStorage.setItem('agendamentos_reposicao', JSON.stringify(agendamentos));
        }
    }

    async carregarAgendamentos() {
        try {
            if (this.useLocalStorage) {
                const salvos = localStorage.getItem('agendamentos_reposicao');
                const agendamentos = salvos ? JSON.parse(salvos) : [];
                console.log('📂 Agendamentos carregados do localStorage:', agendamentos.length);
                return agendamentos;
            } else {
                const salvos = await this.kv.get('agendamentos_reposicao');
                const agendamentos = salvos ? JSON.parse(salvos) : [];
                console.log('☁️ Agendamentos carregados do Vercel KV:', agendamentos.length);
                return agendamentos;
            }
        } catch (error) {
            console.error('❌ Erro ao carregar agendamentos:', error);
            // Fallback para localStorage
            const salvos = localStorage.getItem('agendamentos_reposicao');
            return salvos ? JSON.parse(salvos) : [];
        }
    }

    async salvarAgendamentosCancelados(agendamentosCancelados) {
        try {
            if (this.useLocalStorage) {
                localStorage.setItem('agendamentos_cancelados', JSON.stringify(agendamentosCancelados));
                console.log('✅ Agendamentos cancelados salvos no localStorage');
            } else {
                await this.kv.set('agendamentos_cancelados', JSON.stringify(agendamentosCancelados));
                console.log('✅ Agendamentos cancelados salvos no Vercel KV');
            }
        } catch (error) {
            console.error('❌ Erro ao salvar agendamentos cancelados:', error);
            // Fallback para localStorage
            localStorage.setItem('agendamentos_cancelados', JSON.stringify(agendamentosCancelados));
        }
    }

    async carregarAgendamentosCancelados() {
        try {
            if (this.useLocalStorage) {
                const cancelados = localStorage.getItem('agendamentos_cancelados');
                const agendamentos = cancelados ? JSON.parse(cancelados) : [];
                console.log('📂 Agendamentos cancelados carregados do localStorage:', agendamentos.length);
                return agendamentos;
            } else {
                const cancelados = await this.kv.get('agendamentos_cancelados');
                const agendamentos = cancelados ? JSON.parse(cancelados) : [];
                console.log('☁️ Agendamentos cancelados carregados do Vercel KV:', agendamentos.length);
                return agendamentos;
            }
        } catch (error) {
            console.error('❌ Erro ao carregar agendamentos cancelados:', error);
            // Fallback para localStorage
            const cancelados = localStorage.getItem('agendamentos_cancelados');
            return cancelados ? JSON.parse(cancelados) : [];
        }
    }

    async limparDados() {
        try {
            if (this.useLocalStorage) {
                localStorage.removeItem('agendamentos_reposicao');
                localStorage.removeItem('agendamentos_cancelados');
                console.log('🗑️ Dados limpos do localStorage');
            } else {
                await this.kv.del('agendamentos_reposicao');
                await this.kv.del('agendamentos_cancelados');
                console.log('🗑️ Dados limpos do Vercel KV');
            }
        } catch (error) {
            console.error('❌ Erro ao limpar dados:', error);
        }
    }

    // Método para migração de dados
    async migrarDados() {
        try {
            console.log('🔄 Iniciando migração de dados...');
            
            // Migrar agendamentos ativos
            const agendamentosLocal = localStorage.getItem('agendamentos_reposicao');
            if (agendamentosLocal) {
                const agendamentos = JSON.parse(agendamentosLocal);
                await this.salvarAgendamentos(agendamentos);
                console.log(`✅ ${agendamentos.length} agendamentos migrados`);
            }
            
            // Migrar agendamentos cancelados
            const canceladosLocal = localStorage.getItem('agendamentos_cancelados');
            if (canceladosLocal) {
                const cancelados = JSON.parse(canceladosLocal);
                await this.salvarAgendamentosCancelados(cancelados);
                console.log(`✅ ${cancelados.length} agendamentos cancelados migrados`);
            }
            
            console.log('🎉 Migração concluída com sucesso!');
        } catch (error) {
            console.error('❌ Erro na migração:', error);
        }
    }

    // Estatísticas do banco de dados
    async getStats() {
        try {
            const agendamentos = await this.carregarAgendamentos();
            const cancelados = await this.carregarAgendamentosCancelados();
            
            const stats = {
                total: agendamentos.length,
                pendentes: agendamentos.filter(a => a.status === 'pendente').length,
                confirmados: agendamentos.filter(a => a.status === 'confirmado').length,
                realizados: agendamentos.filter(a => a.status === 'realizado').length,
                cancelados: cancelados.length,
                storage: this.useLocalStorage ? 'localStorage' : 'Vercel KV'
            };
            
            console.log('📊 Estatísticas:', stats);
            return stats;
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return null;
        }
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.ReposicaoDB = ReposicaoDB;
} else {
    module.exports = ReposicaoDB;
}

// Exemplo de uso:
/*
// Inicializar
const db = new ReposicaoDB();
await db.init();

// Salvar
await db.salvarAgendamentos(agendamentos);

// Carregar
const agendamentos = await db.carregarAgendamentos();

// Migrar dados locais para produção
await db.migrarDados();

// Estatísticas
const stats = await db.getStats();
*/
