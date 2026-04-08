// Script simplificado para corrigir o problema de navegação
class DashboardFixed {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 Inicializando dashboard versão corrigida...');
        
        // Aguardar o DOM carregar completamente
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEverything());
        } else {
            this.setupEverything();
        }
    }

    setupEverything() {
        console.log('📋 DOM carregado, configurando elementos...');
        
        // Configurar navegação primeiro
        this.setupNavigation();
        
        // Carregar dados
        this.loadData();
    }

    setupNavigation() {
        console.log('🔍 Configurando navegação...');
        
        // Encontrar o sidebar
        const sidebar = document.querySelector('.sidebar');
        console.log('📦 Sidebar encontrado:', !!sidebar);
        
        if (!sidebar) {
            console.error('❌ Sidebar não encontrado!');
            return;
        }
        
        // Procurar ou criar navItems
        let navItems = document.getElementById('navItems') || document.querySelector('.nav-items');
        
        if (!navItems) {
            console.log('🔧 Criando navItems...');
            navItems = document.createElement('div');
            navItems.className = 'nav-items';
            navItems.id = 'navItems';
            sidebar.appendChild(navItems);
            console.log('✅ navItems criado com sucesso');
        } else {
            console.log('✅ navItems encontrado');
        }
        
        // Limpar conteúdo existente
        navItems.innerHTML = '';
        
        // Adicionar itens de navegação
        this.addNavigationItem(navItems, '🤖 Assistente IA', 'fas fa-robot', 'chatbot.html');
        this.addNavigationItem(navItems, '📅 Agendamento de Reposição', 'fas fa-calendar-check', 'reposicao.html');
        this.addNavigationItem(navItems, '📊 Reposições', 'fas fa-file-csv', 'reposicoes-csv.html');
        this.addNavigationItem(navItems, '❌ Reposições Canceladas', 'fas fa-calendar-times', 'reposicao-canceladas.html');
        
        console.log('✅ Navegação configurada com sucesso');
    }

    addNavigationItem(container, text, iconClass, href) {
        const item = document.createElement('div');
        item.className = 'nav-item';
        item.innerHTML = `<i class="${iconClass}"></i>${text}`;
        item.onclick = () => {
            console.log(`🔗 Navegando para: ${href}`);
            window.location.href = href;
        };
        item.style.cursor = 'pointer';
        item.style.padding = '12px 20px';
        item.style.color = 'white';
        item.style.transition = 'background-color 0.3s';
        
        item.addEventListener('mouseenter', () => {
            item.style.backgroundColor = 'rgba(255,255,255,0.1)';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = 'transparent';
        });
        
        container.appendChild(item);
    }

    async loadData() {
        try {
            console.log('📡 Carregando dados...');
            const response = await fetch('dados_organizados.json');
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Dados carregados:', data);
                this.setupContent(data);
            } else {
                console.log('⚠️ Dados não encontrados, usando conteúdo padrão');
                this.setupDefaultContent();
            }
        } catch (error) {
            console.log('⚠️ Erro ao carregar dados:', error);
            this.setupDefaultContent();
        }
    }

    setupContent(data) {
        const container = document.getElementById('contentContainer');
        if (container) {
            container.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <h2>🎉 Dashboard Carregado!</h2>
                    <p>Use o menu lateral para navegar entre as funcionalidades.</p>
                    <div style="margin-top: 30px;">
                        <button onclick="window.location.href='chatbot.html'" style="
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 8px;
                            font-size: 16px;
                            cursor: pointer;
                            margin: 10px;
                        ">
                            🤖 Conversar com a IA
                        </button>
                        <button onclick="window.location.href='reposicao.html'" style="
                            background: #dc2626;
                            color: white;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 8px;
                            font-size: 16px;
                            cursor: pointer;
                            margin: 10px;
                        ">
                            📅 Agendar Reposição
                        </button>
                    </div>
                </div>
            `;
        }
    }

    setupDefaultContent() {
        const container = document.getElementById('contentContainer');
        if (container) {
            container.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <h2>🚀 Dashboard Maikito-san</h2>
                    <p>Bem-vindo ao sistema de gestão da escola!</p>
                    <div style="margin-top: 30px;">
                        <button onclick="window.location.href='chatbot.html'" style="
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 8px;
                            font-size: 16px;
                            cursor: pointer;
                            margin: 10px;
                        ">
                            🤖 Conversar com a IA
                        </button>
                        <button onclick="window.location.href='reposicao.html'" style="
                            background: #dc2626;
                            color: white;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 8px;
                            font-size: 16px;
                            cursor: pointer;
                            margin: 10px;
                        ">
                            📅 Agendar Reposição
                        </button>
                    </div>
                </div>
            `;
        }
    }
}

// Inicializar o dashboard
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM carregado, iniciando dashboard...');
    window.dashboardFixed = new DashboardFixed();
});
