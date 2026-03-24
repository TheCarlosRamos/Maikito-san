class SistemaReposicao {
    constructor() {
        this.alunos = [];
        this.turmas = [];
        this.horarios = [];
        this.agendamentos = [];
        this.selectedAluno = null;
        this.selectedIndex = -1;
        this.googleCalendar = null;
        this.init();
    }

    async init() {
        try {
            // Inicializar Google Calendar (modo simplificado)
            this.googleCalendar = new GoogleCalendarService();
            console.log('✅ Google Calendar Service inicializado (modo link)');
            
            // Carregar dados
            await this.carregarDadosOrganizados();
            this.carregarAgendamentos();
            this.adicionarAgendamentosTeste();
            this.setupEventListeners();
            this.preencherSelects();
            this.renderizarAgendamentos();
            
            console.log('✅ Sistema inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema:', error);
        }
    }

    async carregarDadosOrganizados() {
        try {
            console.log('🔄 Carregando dados organizados...');
            
            const response = await fetch('dados_organizados.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const dados = await response.json();
            console.log('📊 Dados carregados:', dados);
            
            // Extrair dados simples
            this.alunos = this.extrairAlunosSimples(dados);
            this.horarios = this.extrairHorariosSimples(dados);
            
            console.log(`✅ ${this.alunos.length} alunos carregados`);
            console.log(`✅ ${this.horarios.length} horários carregados`);
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            // Inicializar com arrays vazios
            this.alunos = [];
            this.horarios = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
        }
    }

    extrairAlunosSimples(dados) {
        const alunos = [];
        // Dados simples para agendamento livre
        return alunos;
    }

    extrairHorariosSimples(dados) {
        return ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
    }

    adicionarAgendamentosTeste() {
        console.log('🧪 Verificando necessidade de agendamentos de teste...');
        
        // Não adiciona mais agendamentos de teste
        // Apenas verifica se existem agendamentos reais
        if (this.agendamentos.length === 0) {
            console.log('📋 Nenhum agendamento encontrado. Sistema pronto para uso.');
        } else {
            console.log(`✅ ${this.agendamentos.length} agendamentos encontrados no sistema.`);
        }
    }

    setupEventListeners() {
        console.log('🔧 Configurando event listeners...');
        
        // Autocomplete de alunos
        const alunoInput = document.getElementById('alunoInput');
        const suggestionsDropdown = document.getElementById('alunoSuggestions');
        
        if (alunoInput) {
            alunoInput.addEventListener('input', (e) => {
                this.handleAlunoSearch(e.target.value);
            });
            
            alunoInput.addEventListener('keydown', (e) => {
                this.handleKeyNavigation(e);
            });
            
            alunoInput.addEventListener('blur', () => {
                setTimeout(() => {
                    suggestionsDropdown.classList.remove('active');
                }, 200);
            });
            
            alunoInput.addEventListener('focus', () => {
                if (alunoInput.value.length >= 1) {
                    this.handleAlunoSearch(alunoInput.value);
                }
            });
        }

        // Seleção de turma
        const turmaSelect = document.getElementById('turmaSelect');
        if (turmaSelect) {
            turmaSelect.addEventListener('change', (e) => {
                this.exibirInformacoesTurma(e.target.value);
            });
        }

        // Filtro dinâmico de turmas baseado em horário
        const horarioSelect = document.getElementById('horarioSelect');
        if (horarioSelect) {
            horarioSelect.addEventListener('change', (e) => {
                console.log('🔄 Horário alterado para:', e.target.value);
                this.filtrarTurmasPorHorario(e.target.value);
            });
        }

        // Formulário
        const form = document.getElementById('reposicaoForm');
        if (form) {
            console.log('✅ Formulário encontrado, adicionando listener');
            form.addEventListener('submit', (e) => {
                console.log('🔄 Formulário submetido!');
                e.preventDefault();
                this.prepararAgendamento();
            });
        } else {
            console.error('❌ Formulário não encontrado');
        }

        // Filtros - Adicionar verificação e logs
        const filterData = document.getElementById('filterData');
        const filterStatus = document.getElementById('filterStatus');
        
        if (filterData) {
            console.log('✅ Elemento filterData encontrado');
            filterData.addEventListener('change', (e) => {
                console.log('🔄 Filtro de data alterado para:', e.target.value);
                this.renderizarAgendamentos();
            });
        } else {
            console.error('❌ Elemento filterData não encontrado');
        }
        
        if (filterStatus) {
            console.log('✅ Elemento filterStatus encontrado');
            filterStatus.addEventListener('change', (e) => {
                console.log('🔄 Filtro de status alterado para:', e.target.value);
                this.renderizarAgendamentos();
            });
        } else {
            console.error('❌ Elemento filterStatus não encontrado');
        }

        // Definir data mínima como hoje
        const dataInput = document.getElementById('dataReposicao');
        if (dataInput) {
            const hoje = new Date().toISOString().split('T')[0];
            dataInput.min = hoje;
            
            // Adicionar listener para data também filtrar turmas
            dataInput.addEventListener('change', (e) => {
                console.log('🔄 Data alterada para:', e.target.value);
                const horarioSelecionado = horarioSelect.value;
                if (horarioSelecionado) {
                    this.filtrarTurmasPorHorario(horarioSelecionado);
                }
            });
        }
        
        console.log('✅ Event listeners configurados');
    }

    handleAlunoSearch(termo) {
        const suggestionsDropdown = document.getElementById('alunoSuggestions');
        
        console.log('🔍 Buscando alunos por:', termo);
        console.log('📊 Total de alunos disponíveis:', this.alunos.length);
        
        if (termo.length < 1) {
            suggestionsDropdown.classList.remove('active');
            return;
        }
        
        const termoLower = termo.toLowerCase();
        const alunosFiltrados = this.alunos.filter(aluno => 
            aluno.nome.toLowerCase().includes(termoLower) ||
            aluno.turma.toLowerCase().includes(termoLower)
        );
        
        console.log('✅ Alunos encontrados:', alunosFiltrados.length);
        
        if (alunosFiltrados.length > 0) {
            console.log('📋 Primeiros 3 encontrados:', alunosFiltrados.slice(0, 3).map(a => a.nome));
        }
        
        this.exibirSugestoes(alunosFiltrados, termoLower);
        this.selectedIndex = -1;
    }

    exibirSugestoes(alunos, termoBusca) {
        const suggestionsDropdown = document.getElementById('alunoSuggestions');
        
        if (alunos.length === 0) {
            suggestionsDropdown.innerHTML = '<div class="no-suggestions">Nenhum aluno encontrado</div>';
            suggestionsDropdown.classList.add('active');
            return;
        }
        
        // Limitar a 10 sugestões para não sobrecarregar
        const alunosLimitados = alunos.slice(0, 10);
        
        suggestionsDropdown.innerHTML = alunosLimitados.map((aluno, index) => {
            const nomeDestacado = this.destacarTermo(aluno.nome, termoBusca);
            const turmaDestacada = this.destacarTermo(aluno.turma, termoBusca);
            
            return `
                <div class="suggestion-item" data-index="${index}" data-aluno='${JSON.stringify(aluno)}'>
                    <div class="aluno-info">
                        <div class="aluno-nome">${nomeDestacado}</div>
                        <div class="aluno-detalhes">
                            ${aluno.dia} • ${aluno.horario} • Professor: ${this.getProfessorDaTurma(aluno.turma)}
                        </div>
                    </div>
                    <div class="aluno-turma">${turmaDestacada}</div>
                </div>
            `;
        }).join('');
        
        // Adicionar event listeners às sugestões
        suggestionsDropdown.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selecionarAluno(JSON.parse(item.dataset.aluno));
            });
            
            item.addEventListener('mouseenter', () => {
                this.selectedIndex = parseInt(item.dataset.index);
                this.updateSelection();
            });
        });
        
        suggestionsDropdown.classList.add('active');
    }

    destacarTermo(texto, termo) {
        if (!termo) return texto;
        
        const regex = new RegExp(`(${termo})`, 'gi');
        return texto.replace(regex, '<strong>$1</strong>');
    }

    handleKeyNavigation(e) {
        const suggestionsDropdown = document.getElementById('alunoSuggestions');
        const items = suggestionsDropdown.querySelectorAll('.suggestion-item');
        
        if (items.length === 0) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
                this.updateSelection();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.updateSelection();
                break;
                
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
                    const aluno = JSON.parse(items[this.selectedIndex].dataset.aluno);
                    this.selecionarAluno(aluno);
                }
                break;
                
            case 'Escape':
                suggestionsDropdown.classList.remove('active');
                this.selectedIndex = -1;
                break;
        }
    }

    updateSelection() {
        const items = document.querySelectorAll('.suggestion-item');
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
                // Scroll para o item selecionado se necessário
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
            }
        });
    }

    selecionarAluno(aluno) {
        const alunoInput = document.getElementById('alunoInput');
        const alunoSelect = document.getElementById('alunoSelect');
        const suggestionsDropdown = document.getElementById('alunoSuggestions');
        
        // Preencher os campos
        alunoInput.value = aluno.nome;
        alunoSelect.value = aluno.nome;
        this.selectedAluno = aluno;
        
        // Fechar sugestões
        suggestionsDropdown.classList.remove('active');
        this.selectedIndex = -1;
        
        // Exibir informações do aluno
        this.exibirInformacoesAluno(aluno.nome);
        
        console.log('✅ Aluno selecionado:', aluno.nome, '- Turma:', aluno.turma);
    }

    extrairDados(dadosOrganizados) {
        console.log('🔍 Extraindo dados dos horários organizados...');
        
        // Usar dados organizados do JSON
        if (dadosOrganizados && dadosOrganizados.horarios) {
            const horarios = dadosOrganizados.horarios;
            console.log('📊 Total de horários:', horarios.length);
            
            horarios.forEach((horario, index) => {
                // Extrair informações do horário
                if (!this.horarios.includes(horario.horario)) {
                    this.horarios.push(horario.horario);
                }
                
                // Adicionar turma
                if (!this.turmas.find(t => t.codigo === horario.turma && t.dia === horario.dia)) {
                    this.turmas.push({
                        codigo: horario.turma,
                        professor: horario.professor,
                        dia: horario.dia,
                        horario: horario.horario,
                        nivel: this.extrairNivel(horario.turma),
                        alunos: []
                    });
                }
                
                // Extrair alunos
                if (horario.alunos && Array.isArray(horario.alunos)) {
                    horario.alunos.forEach(alunoStr => {
                        // Formato: "Nome Completo - DATA"
                        let nomeAluno, dataAluno;
                        
                        if (alunoStr.includes(' - ')) {
                            [nomeAluno, dataAluno] = alunoStr.split(' - ');
                        } else {
                            nomeAluno = alunoStr;
                            dataAluno = '';
                        }
                        
                        nomeAluno = nomeAluno.trim();
                        
                        // Verificar se já não foi adicionado
                        if (!this.alunos.find(a => a.nome === nomeAluno)) {
                            const novoAluno = {
                                nome: nomeAluno,
                                data: dataAluno ? dataAluno.trim() : '',
                                turma: horario.turma,
                                dia: horario.dia,
                                horario: horario.horario,
                                professor: horario.professor
                            };
                            
                            this.alunos.push(novoAluno);
                            
                            if (this.alunos.length <= 10) {
                                console.log(`👤 Aluno ${this.alunos.length}: ${novoAluno.nome} - ${novoAluno.turma}`);
                            }
                        }
                        
                        // Adicionar aluno à turma
                        const turma = this.turmas.find(t => t.codigo === horario.turma && t.dia === horario.dia);
                        if (turma && !turma.alunos.includes(nomeAluno)) {
                            turma.alunos.push(nomeAluno);
                        }
                    });
                }
            });
        } else {
            console.warn('⚠️ Nenhum dado organizado encontrado');
            console.log('📋 dadosOrganizados existe?', !!dadosOrganizados);
            if (dadosOrganizados) {
                console.log('📋 Chaves disponíveis:', Object.keys(dadosOrganizados));
            }
        }

        // Ordenar dados
        this.horarios.sort();
        this.alunos.sort((a, b) => a.nome.localeCompare(b.nome));
        
        console.log(`✅ Dados extraídos: ${this.alunos.length} alunos, ${this.turmas.length} turmas, ${this.horarios.length} horários`);
        
        if (this.alunos.length > 0) {
            console.log('📋 Primeiros 5 alunos:', this.alunos.slice(0, 5).map(a => ({ 
                nome: a.nome, 
                turma: a.turma, 
                dia: a.dia,
                professor: a.professor 
            })));
        } else {
            console.warn('⚠️ Nenhum aluno encontrado!');
        }
    }

    extrairTurmaDoNome(nomeCompleto) {
        // Extrair código da turma (ex: W12 B, T6 A, etc.)
        const match = nomeCompleto.match(/^([A-Z]\d+\s*[A-Z])/);
        return match ? match[1] : 'Não identificada';
    }

    processarTurmas(dados, professorNome) {
        const dias = ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'];
        
        dados.forEach(row => {
            const time = row['Unnamed: 1'];
            if (time && !time.includes('TEACHER')) {
                dias.forEach((day, dayIndex) => {
                    const colIndex = (dayIndex + 2) + (Math.floor(dayIndex / 6) * 9);
                    const content = row[`Unnamed: ${colIndex}`];
                    
                    if (content && content.trim() && !content.includes('COORD.') && !content.includes('LIVRE') && !content.includes('INT.')) {
                        if (content.includes(' - ')) {
                            const [nomeCompleto, data] = content.split(' - ');
                            const turmaCodigo = this.extrairTurmaDoNome(nomeCompleto);
                            
                            if (!this.turmas.find(t => t.codigo === turmaCodigo && t.dia === day)) {
                                this.turmas.push({
                                    codigo: turmaCodigo,
                                    professor: professorNome,
                                    dia: day,
                                    horario: time,
                                    nivel: this.extrairNivel(turmaCodigo),
                                    alunos: []
                                });
                            }
                            
                            // Adicionar aluno à turma
                            const turma = this.turmas.find(t => t.codigo === turmaCodigo && t.dia === day);
                            if (turma) {
                                turma.alunos.push(nomeCompleto.trim());
                            }
                        }
                    }
                });
            }
        });
    }

    extrairNivel(turmaCodigo) {
        if (turmaCodigo.startsWith('T')) return 'Teen';
        if (turmaCodigo.startsWith('W')) return 'Kids';
        if (turmaCodigo.startsWith('F')) return 'Foundation';
        if (turmaCodigo.startsWith('KIDS')) return 'Kids';
        if (turmaCodigo.startsWith('INT.')) return 'Kids';
        if (turmaCodigo.startsWith('FRANCES')) return 'Foundation';
        if (turmaCodigo.startsWith('TOTS')) return 'Kids';
        return 'Não identificado';
    }

    // Fallback para dados antigos do excelData
    extrairDadosExcel() {
        console.log('🔄 Usando fallback - extraindo dados do excelData...');
        
        if (typeof excelData !== 'undefined' && excelData.Horários) {
            const dados = excelData.Horários;
            console.log('📊 Total de linhas em Horários:', dados.length);
            
            dados.forEach((row, index) => {
                Object.keys(row).forEach(colKey => {
                    const content = row[colKey];
                    
                    if (content && content.trim() && 
                        !content.includes('COORD.') && 
                        !content.includes('LIVRE') && 
                        !content.includes('INT.') &&
                        !content.includes('ONLINE') &&
                        !content.includes('TEACHER') &&
                        !['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO'].includes(content.trim()) &&
                        !content.match(/^\d{2}:\d{2}:\d{2}$/)) {
                        
                        if (content.length > 3 && !content.match(/^Unnamed/)) {
                            const nomeLimpo = content.trim();
                            
                            if (!this.alunos.find(a => a.nome === nomeLimpo)) {
                                const novoAluno = {
                                    nome: nomeLimpo,
                                    data: '',
                                    turma: 'Não identificada',
                                    dia: 'Não identificado',
                                    horario: 'Não identificado',
                                    professor: 'Não identificado'
                                };
                                
                                this.alunos.push(novoAluno);
                                
                                if (this.alunos.length <= 10) {
                                    console.log(`👤 Aluno ${this.alunos.length}: ${novoAluno.nome}`);
                                }
                            }
                        }
                    }
                });
            });
        } else {
            console.warn('⚠️ Nenhum dado excelData encontrado');
        }
        
        this.alunos.sort((a, b) => a.nome.localeCompare(b.nome));
        console.log(`✅ Fallback - Dados extraídos: ${this.alunos.length} alunos`);
    }

    preencherSelects() {
        console.log('🔄 Preenchendo selects...');
        
        // Horários já estão no HTML, não precisa preencher dinamicamente
        const horarioSelect = document.getElementById('horarioSelect');
        if (horarioSelect) {
            console.log('✅ Select de horários encontrado (já preenchido no HTML)');
        }
        
        console.log('✅ Selects verificados');
    }

    getProfessorDaTurma(turmaCodigo) {
        const turma = this.turmas.find(t => t.codigo === turmaCodigo);
        return turma ? turma.professor : 'Não informado';
    }

    filtrarTurmasPorHorario(horarioSelecionado) {
        console.log('🔄 Filtrando turmas para o horário:', horarioSelecionado);
        
        const turmaSelect = document.getElementById('turmaSelect');
        if (!turmaSelect) {
            console.error('❌ Select de turmas não encontrado');
            return;
        }
        
        // Obter a data selecionada para determinar o dia da semana
        const dataInput = document.getElementById('dataReposicao');
        const dataSelecionada = dataInput ? dataInput.value : '';
        
        let diaSemana = '';
        if (dataSelecionada) {
            const data = new Date(dataSelecionada);
            const dias = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];
            diaSemana = dias[data.getDay()];
            console.log('📅 Dia da semana para a data:', diaSemana);
        }
        
        // Filtrar turmas baseado no horário e opcionalmente no dia
        let turmasFiltradas = [];
        
        if (horarioSelecionado) {
            turmasFiltradas = this.turmas.filter(turma => {
                // Filtrar por horário
                const mesmoHorario = turma.horario === horarioSelecionado;
                
                // Se tiver data selecionada, filtrar também por dia
                const mesmoDia = !diaSemana || turma.dia === diaSemana;
                
                return mesmoHorario && mesmoDia;
            });
        }
        
        console.log(`📚 Turmas encontradas para ${horarioSelecionado}${diaSemana ? ' na ' + diaSemana : ''}:`, turmasFiltradas.length);
        
        // Limpar select atual
        turmaSelect.innerHTML = '<option value="">Selecione uma turma...</option>';
        
        if (turmasFiltradas.length === 0) {
            // Se não encontrou turmas para o horário específico, mostrar todas do horário (ignorando dia)
            if (horarioSelecionado) {
                const turmasDoHorario = this.turmas.filter(turma => turma.horario === horarioSelecionado);
                console.log('🔄 Mostrando todas as turmas do horário (ignorando dia):', turmasDoHorario.length);
                
                turmasDoHorario.forEach(turma => {
                    const option = document.createElement('option');
                    option.value = `${turma.codigo} - ${turma.dia}`;
                    option.textContent = `${turma.codigo} - ${turma.dia} (${turma.professor})`;
                    turmaSelect.appendChild(option);
                });
                
                if (turmasDoHorario.length > 0) {
                    console.log('⚠️ Nenhuma turma encontrada para este dia, mas existem turmas neste horário em outros dias');
                }
            }
        } else {
            // Adicionar turmas filtradas
            turmasFiltradas.forEach(turma => {
                const option = document.createElement('option');
                option.value = `${turma.codigo} - ${turma.dia}`;
                option.textContent = `${turma.codigo} - ${turma.dia} (${turma.professor})`;
                turmaSelect.appendChild(option);
            });
            
            if (turmasFiltradas.length > 0) {
                console.log('✅ Turmas filtradas com sucesso:', turmasFiltradas.map(t => `${t.codigo} - ${t.dia}`));
            }
        }
        
        // Se ainda não tiver opções, mostrar mensagem
        if (turmaSelect.options.length === 1) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Nenhuma turma disponível para este horário';
            option.disabled = true;
            turmaSelect.appendChild(option);
            console.log('⚠️ Nenhuma turma disponível para este horário');
        }
    }

    exibirInformacoesAluno(alunoNome) {
        const alunoInfo = document.getElementById('alunoInfo');
        
        if (!alunoNome) {
            alunoInfo.classList.add('hidden');
            return;
        }

        const aluno = this.alunos.find(a => a.nome === alunoNome);
        if (!aluno) return;

        document.getElementById('alunoTurma').textContent = aluno.turma;
        document.getElementById('alunoProfessor').textContent = aluno.professor || 'Não informado';
        document.getElementById('alunoStatus').textContent = 'Ativo';
        document.getElementById('alunoStatus').className = 'value status-badge active';
        
        alunoInfo.classList.remove('hidden');
    }

    exibirInformacoesTurma(turmaSelecionada) {
        const turmaInfo = document.getElementById('turmaInfo');
        
        if (!turmaSelecionada) {
            turmaInfo.classList.add('hidden');
            return;
        }

        const [codigo, dia] = turmaSelecionada.split(' - ');
        const turma = this.turmas.find(t => t.codigo === codigo && t.dia === dia);
        
        if (!turma) return;

        document.getElementById('turmaProfessor').textContent = turma.professor;
        document.getElementById('turmaDia').textContent = turma.dia;
        document.getElementById('turmaNivel').textContent = turma.nivel;
        document.getElementById('turmaAlunos').textContent = `${turma.alunos.length} alunos`;
        
        turmaInfo.classList.remove('hidden');
    }

    getProfessorDaTurma(turmaCodigo) {
        const turma = this.turmas.find(t => t.codigo === turmaCodigo);
        return turma ? turma.professor : 'Não identificado';
    }

    prepararAgendamento() {
        console.log('🔄 Preparando agendamento...');
        
        const form = document.getElementById('reposicaoForm');
        if (!form) {
            console.error('❌ Formulário não encontrado');
            return;
        }
        
        // Verificar campos obrigatórios
        const alunoValue = document.getElementById('alunoNome').value;
        const turmaValue = document.getElementById('alunoTurma').value;
        const professorValue = document.getElementById('alunoProfessor').value;
        const emailValue = document.getElementById('alunoEmail').value;
        const dataValue = document.getElementById('dataReposicao').value;
        const horarioValue = document.getElementById('horarioSelect').value;
        const motivoValue = document.getElementById('motivoReposicao').value;
        const criarEvento = document.getElementById('criarEventoGoogle').checked;
        
        console.log('📋 Valores do formulário:');
        console.log('  Aluno:', alunoValue);
        console.log('  Turma:', turmaValue);
        console.log('  Professor:', professorValue);
        console.log('  E-mail:', emailValue);
        console.log('  Data:', dataValue);
        console.log('  Horário:', horarioValue);
        console.log('  Motivo:', motivoValue);
        console.log('  Criar evento:', criarEvento);
        
        // Validação
        if (!alunoValue) {
            console.error('❌ Nome do aluno não informado');
            this.showToast('Por favor, informe o nome do aluno');
            return;
        }
        
        if (!turmaValue) {
            console.error('❌ Turma não informada');
            this.showToast('Por favor, informe a turma');
            return;
        }
        
        if (!professorValue) {
            console.error('❌ Professor não informado');
            this.showToast('Por favor, informe o nome do professor');
            return;
        }
        
        if (!emailValue) {
            console.error('❌ E-mail não informado');
            this.showToast('Por favor, informe o e-mail');
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
        
        if (!motivoValue) {
            console.error('❌ Motivo não informado');
            this.showToast('Por favor, informe o motivo');
            return;
        }
        
        const agendamento = {
            id: Date.now(),
            aluno: alunoValue,
            turma: turmaValue,
            professor: professorValue,
            email: emailValue,
            data: dataValue,
            horario: horarioValue,
            motivo: motivoValue,
            status: 'pendente',
            criadoEm: new Date().toISOString(),
            criarEvento: criarEvento
        };
        
        console.log('✅ Agendamento preparado:', agendamento);
        
        // Exibir modal de confirmação
        this.exibirModalConfirmacao(agendamento);
    }

    exibirModalConfirmacao(agendamento) {
        console.log('🔄 Exibindo modal de confirmação...');
        
        const modal = document.getElementById('confirmModal');
        const details = document.getElementById('confirmDetails');
        
        if (!modal) {
            console.error('❌ Modal de confirmação não encontrado');
            this.showToast('Erro ao exibir modal de confirmação');
            return;
        }
        
        if (!details) {
            console.error('❌ Elemento confirmDetails não encontrado');
            this.showToast('Erro ao exibir detalhes');
            return;
        }
        
        console.log('📋 Dados do agendamento:', agendamento);
        
        details.innerHTML = `
            <div class="detail-item">
                <strong>Aluno:</strong> ${agendamento.aluno}
            </div>
            <div class="detail-item">
                <strong>Turma:</strong> ${agendamento.turma}
            </div>
            <div class="detail-item">
                <strong>Professor:</strong> ${agendamento.professor}
            </div>
            <div class="detail-item">
                <strong>E-mail:</strong> ${agendamento.email}
            </div>
            <div class="detail-item">
                <strong>Data:</strong> ${this.formatarData(agendamento.data)}
            </div>
            <div class="detail-item">
                <strong>Horário:</strong> ${agendamento.horario}
            </div>
            <div class="detail-item">
                <strong>Motivo:</strong> ${agendamento.motivo || 'Não informado'}
            </div>
            ${agendamento.criarEvento ? `
                <div class="detail-item google-calendar-info">
                    <i class="fab fa-google"></i>
                    <strong>Evento no Google Calendar:</strong> Será criado automaticamente
                </div>
            ` : ''}
        `;
        
        // Forçar exibição do modal
        modal.classList.add('active');
        modal.classList.remove('hidden');
        modal.dataset.agendamento = JSON.stringify(agendamento);
        
        console.log('✅ Modal de confirmação exibido');
        console.log('🔍 Classes do modal:', modal.className);
        console.log('🔍 Display do modal:', modal.style.display);
        console.log('🔍 Visibility do modal:', getComputedStyle(modal).visibility);
        console.log('🔍 Z-index do modal:', getComputedStyle(modal).zIndex);
    }

    confirmarAgendamento() {
        console.log('✅ Confirmando agendamento...');
        
        const modal = document.getElementById('confirmModal');
        if (!modal) {
            console.error('❌ Modal não encontrado para confirmar');
            return;
        }
        
        const agendamento = JSON.parse(modal.dataset.agendamento);
        console.log('📋 Agendamento a ser salvo:', agendamento);
        
        // Salvar agendamento
        this.agendamentos.push(agendamento);
        this.salvarAgendamentos();
        
        // Criar evento no Google Calendar se solicitado
        if (agendamento.criarEvento && this.googleCalendar) {
            this.criarEventoGoogleCalendar(agendamento);
        }
        
        this.showToast('Agendamento realizado com sucesso!');
        this.limparFormulario();
        
        // Fechar modal corretamente
        modal.classList.remove('active');
        modal.classList.add('hidden');
        
        // Renderizar agendamentos para garantir que o card apareça
        this.renderizarAgendamentos();
        
        console.log('✅ Agendamento confirmado e salvo');
        console.log(`📋 Total de agendamentos: ${this.agendamentos.length}`);
    }

    async criarEventoGoogleCalendar(agendamento) {
        try {
            console.log('🔄 Criando lembrete no Google Calendar...');
            
            // Usar sempre o método de link (funciona imediatamente)
            if (this.googleCalendar) {
                const resultado = this.googleCalendar.criarEventoViaLink(agendamento);
                console.log('✅ Lembrete criado:', resultado.url);
                this.showToast('📅 Lembrete criado! Confirme no Google Calendar.');
            } else {
                console.warn('⚠️ Google Calendar não disponível');
                this.showToast('Agendamento salvo!');
            }
        } catch (error) {
            console.error('❌ Erro ao criar lembrete:', error);
            this.showToast('Agendamento salvo!');
        }
    }

    salvarAgendamentos() {
        localStorage.setItem('agendamentos_reposicao', JSON.stringify(this.agendamentos));
    }

    carregarAgendamentos() {
        const salvos = localStorage.getItem('agendamentos_reposicao');
        return salvos ? JSON.parse(salvos) : [];
    }

    renderizarAgendamentos() {
        console.log('🔄 Renderizando agendamentos...');
        
        const container = document.getElementById('agendamentosList');
        const filtroData = document.getElementById('filterData');
        const filtroStatus = document.getElementById('filterStatus');
        
        if (!container) {
            console.error('❌ Container agendamentosList não encontrado');
            return;
        }
        
        if (!filtroData) {
            console.error('❌ Elemento filterData não encontrado');
            return;
        }
        
        if (!filtroStatus) {
            console.error('❌ Elemento filterStatus não encontrado');
            return;
        }
        
        console.log('📊 Agendamentos totais:', this.agendamentos.length);
        console.log('📅 Filtro data:', filtroData.value);
        console.log('📋 Filtro status:', filtroStatus.value);
        
        let agendamentosFiltrados = this.agendamentos;
        
        if (filtroData.value) {
            agendamentosFiltrados = agendamentosFiltrados.filter(a => a.data === filtroData.value);
            console.log('✅ Filtrados por data:', agendamentosFiltrados.length);
        }
        
        if (filtroStatus.value) {
            agendamentosFiltrados = agendamentosFiltrados.filter(a => a.status === filtroStatus.value);
            console.log('✅ Filtrados por status:', agendamentosFiltrados.length);
        }
        
        if (agendamentosFiltrados.length === 0) {
            console.log('⚠️ Nenhum agendamento encontrado com os filtros');
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>Nenhum agendamento encontrado</h3>
                    <p>Não há agendamentos que correspondam aos filtros selecionados.</p>
                </div>
            `;
            return;
        }
        
        console.log('🎯 Renderizando', agendamentosFiltrados.length, 'agendamentos');
        
        container.innerHTML = agendamentosFiltrados
            .sort((a, b) => new Date(a.data) - new Date(b.data))
            .map(agendamento => this.criarCardAgendamento(agendamento))
            .join('');
            
        console.log('✅ Agendamentos renderizados com sucesso');
    }

    criarCardAgendamento(agendamento) {
        const aluno = this.alunos.find(a => a.nome === agendamento.aluno);
        const turma = this.turmas.find(t => `${t.codigo} - ${t.dia}` === agendamento.turma);
        
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
                            <span><strong>Professor:</strong> ${turma ? turma.professor : 'N/A'}</span>
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
                        Criado em ${this.formatarDataHora(agendamento.criadoEm)}
                    </small>
                    <div class="card-actions">
                        <button class="btn-action btn-edit" onclick="sistemaReposicao.editarAgendamento(${agendamento.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="sistemaReposicao.excluirAgendamento(${agendamento.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button class="btn-action btn-pdf" onclick="sistemaReposicao.exportarParaPDF(${agendamento.id})" title="Exportar PDF">
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
                <button class="btn-icon btn-success" onclick="sistemaReposicao.atualizarStatus(${agendamento.id}, 'confirmado')" title="Confirmar">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="sistemaReposicao.atualizarStatus(${agendamento.id}, 'cancelado')" title="Cancelar">
                    <i class="fas fa-times"></i>
                </button>
            `;
        } else if (agendamento.status === 'confirmado') {
            return `
                <button class="btn-icon btn-success" onclick="sistemaReposicao.atualizarStatus(${agendamento.id}, 'realizado')" title="Marcar como realizado">
                    <i class="fas fa-check-double"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="sistemaReposicao.atualizarStatus(${agendamento.id}, 'cancelado')" title="Cancelar">
                    <i class="fas fa-times"></i>
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
            this.renderizarAgendamentos();
            this.showToast(`Status atualizado para ${this.formatarStatus(novoStatus)}`);
        }
    }

    getStatusClass(status) {
        const classes = {
            pendente: 'pending',
            confirmado: 'confirmed',
            realizado: 'completed',
            cancelado: 'cancelled'
        };
        return classes[status] || 'pending';
    }

    getStatusIcon(status) {
        const icons = {
            pendente: 'fa-clock',
            confirmado: 'fa-check',
            realizado: 'fa-check-double',
            cancelado: 'fa-times'
        };
        return icons[status] || 'fa-clock';
    }

    formatarStatus(status) {
        const statusMap = {
            pendente: 'Pendente',
            confirmado: 'Confirmado',
            realizado: 'Realizado',
            cancelado: 'Cancelado'
        };
        return statusMap[status] || status;
    }

    formatarData(dataString) {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatarDataHora(dataString) {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Função para exportar agendamento individual para PDF
    exportarParaPDF(agendamentoId) {
        console.log('🔄 Exportando agendamento para PDF:', agendamentoId);
        
        const agendamento = this.agendamentos.find(a => a.id === agendamentoId);
        if (!agendamento) {
            console.error('❌ Agendamento não encontrado');
            this.showToast('Agendamento não encontrado');
            return;
        }
        
        const aluno = this.alunos.find(a => a.nome === agendamento.aluno);
        const turma = this.turmas.find(t => `${t.codigo} - ${t.dia}` === agendamento.turma);
        
        // Conteúdo HTML para o PDF
        const conteudoPDF = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Comprovante de Agendamento de Reposição</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background: #f5f5f5;
                    }
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        background: white;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        border-bottom: 3px solid #667eea;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        color: #667eea;
                        margin: 0;
                        font-size: 24px;
                    }
                    .header p {
                        color: #666;
                        margin: 5px 0 0 0;
                    }
                    .info-section {
                        margin-bottom: 25px;
                    }
                    .info-section h3 {
                        color: #333;
                        border-bottom: 2px solid #f0f0f0;
                        padding-bottom: 10px;
                        margin-bottom: 15px;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                    }
                    .info-item {
                        padding: 10px;
                        background: #f9f9f9;
                        border-radius: 5px;
                    }
                    .info-item strong {
                        color: #667eea;
                        display: block;
                        margin-bottom: 5px;
                    }
                    .status-badge {
                        display: inline-block;
                        padding: 8px 16px;
                        border-radius: 20px;
                        font-weight: bold;
                        text-transform: uppercase;
                        font-size: 12px;
                    }
                    .status-pendente {
                        background: #fff3cd;
                        color: #856404;
                    }
                    .status-confirmado {
                        background: #d4edda;
                        color: #155724;
                    }
                    .status-realizado {
                        background: #cce5ff;
                        color: #004085;
                    }
                    .status-cancelado {
                        background: #f8d7da;
                        color: #721c24;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #eee;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                    }
                    .watermark {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) rotate(-45deg);
                        font-size: 100px;
                        color: rgba(102, 126, 234, 0.1);
                        pointer-events: none;
                        z-index: -1;
                    }
                </style>
            </head>
            <body>
                <div class="watermark">MAIKITO-SAN</div>
                <div class="container">
                    <div class="header">
                        <h1><i class="fas fa-calendar-check"></i> Comprovante de Agendamento</h1>
                        <p>Maikito-san - Centro de Idiomas</p>
                    </div>
                    
                    <div class="info-section">
                        <h3>📋 Informações do Agendamento</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>Código do Agendamento:</strong>
                                #${String(agendamento.id).padStart(8, '0')}
                            </div>
                            <div class="info-item">
                                <strong>Status:</strong>
                                <span class="status-badge status-${agendamento.status}">${agendamento.status}</span>
                            </div>
                            <div class="info-item">
                                <strong>Data da Reposição:</strong>
                                ${this.formatarData(agendamento.data)}
                            </div>
                            <div class="info-item">
                                <strong>Horário:</strong>
                                ${agendamento.horario}
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h3>👤 Informações do Aluno</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>Nome:</strong>
                                ${agendamento.aluno}
                            </div>
                            <div class="info-item">
                                <strong>Turma:</strong>
                                ${agendamento.turma}
                            </div>
                            <div class="info-item">
                                <strong>Professor:</strong>
                                ${turma ? turma.professor : 'N/A'}
                            </div>
                            <div class="info-item">
                                <strong>Dia da Aula:</strong>
                                ${turma ? turma.dia : 'N/A'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h3>💭 Motivo da Reposição</h3>
                        <div class="info-item">
                            <strong>Motivo:</strong>
                            ${agendamento.motivo || 'Não informado'}
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h3>📅 Informações Gerais</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <strong>Data de Criação:</strong>
                                ${this.formatarDataHora(agendamento.criadoEm)}
                            </div>
                            <div class="info-item">
                                <strong>Última Atualização:</strong>
                                ${this.formatarDataHora(agendamento.atualizadoEm || agendamento.criadoEm)}
                            </div>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>Este comprovante foi gerado automaticamente pelo sistema Maikito-san</p>
                        <p>Data de emissão: ${this.formatarDataHora(new Date().toISOString())}</p>
                        <p>Para dúvidas, entre em contato com a secretaria.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        // Criar uma janela para impressão
        const printWindow = window.open('', '_blank');
        printWindow.document.write(conteudoPDF);
        printWindow.document.close();
        
        // Esperar o conteúdo carregar e então imprimir
        printWindow.onload = function() {
            printWindow.print();
            printWindow.close();
        };
        
        this.showToast('PDF gerado com sucesso!');
    }

    // Função para exportar todos os agendamentos para PDF
    exportarTodosParaPDF() {
        console.log('🔄 Exportando todos os agendamentos para PDF...');
        
        if (this.agendamentos.length === 0) {
            this.showToast('Nenhum agendamento para exportar');
            return;
        }
        
        // Agrupar agendamentos por status
        const agrupados = this.agendamentos.reduce((acc, ag) => {
            if (!acc[ag.status]) acc[ag.status] = [];
            acc[ag.status].push(ag);
            return acc;
        }, {});
        
        // Conteúdo HTML para o PDF
        const conteudoPDF = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Relatório de Agendamentos de Reposição</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background: #f5f5f5;
                    }
                    .container {
                        max-width: 1000px;
                        margin: 0 auto;
                        background: white;
                        padding: 30px;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        border-bottom: 3px solid #667eea;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        color: #667eea;
                        margin: 0;
                        font-size: 28px;
                    }
                    .header p {
                        color: #666;
                        margin: 5px 0 0 0;
                    }
                    .summary {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 15px;
                        margin-bottom: 30px;
                    }
                    .summary-card {
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        padding: 20px;
                        border-radius: 10px;
                        text-align: center;
                    }
                    .summary-card h3 {
                        margin: 0 0 10px 0;
                        font-size: 32px;
                    }
                    .summary-card p {
                        margin: 0;
                        opacity: 0.9;
                    }
                    .section {
                        margin-bottom: 30px;
                    }
                    .section h2 {
                        color: #333;
                        border-bottom: 2px solid #f0f0f0;
                        padding-bottom: 10px;
                        margin-bottom: 20px;
                    }
                    .agendamento-item {
                        background: #f9f9f9;
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 15px;
                        border-left: 4px solid #667eea;
                    }
                    .agendamento-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 10px;
                    }
                    .agendamento-title {
                        font-weight: bold;
                        color: #333;
                    }
                    .status-badge {
                        padding: 4px 12px;
                        border-radius: 12px;
                        font-size: 11px;
                        font-weight: bold;
                        text-transform: uppercase;
                    }
                    .status-pendente { background: #fff3cd; color: #856404; }
                    .status-confirmado { background: #d4edda; color: #155724; }
                    .status-realizado { background: #cce5ff; color: #004085; }
                    .status-cancelado { background: #f8d7da; color: #721c24; }
                    .agendamento-details {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 10px;
                        font-size: 14px;
                        color: #666;
                    }
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #eee;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                    }
                    .watermark {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) rotate(-45deg);
                        font-size: 150px;
                        color: rgba(102, 126, 234, 0.05);
                        pointer-events: none;
                        z-index: -1;
                    }
                    @media print {
                        .watermark { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="watermark">MAIKITO-SAN</div>
                <div class="container">
                    <div class="header">
                        <h1><i class="fas fa-file-pdf"></i> Relatório de Agendamentos</h1>
                        <p>Maikito-san - Centro de Idiomas</p>
                        <p>Gerado em: ${this.formatarDataHora(new Date().toISOString())}</p>
                    </div>
                    
                    <div class="summary">
                        <div class="summary-card">
                            <h3>${this.agendamentos.length}</h3>
                            <p>Total de Agendamentos</p>
                        </div>
                        <div class="summary-card" style="background: linear-gradient(135deg, #ffc107, #ff9800);">
                            <h3>${(agrupados.pendente || []).length}</h3>
                            <p>Pendentes</p>
                        </div>
                        <div class="summary-card" style="background: linear-gradient(135deg, #4caf50, #8bc34a);">
                            <h3>${(agrupados.confirmado || []).length}</h3>
                            <p>Confirmados</p>
                        </div>
                        <div class="summary-card" style="background: linear-gradient(135deg, #2196f3, #03a9f4);">
                            <h3>${(agrupados.realizado || []).length}</h3>
                            <p>Realizados</p>
                        </div>
                    </div>
                    
                    ${Object.entries(agrupados).map(([status, ags]) => `
                        <div class="section">
                            <h2>${status.charAt(0).toUpperCase() + status.slice(1)} (${ags.length})</h2>
                            ${ags.map(ag => {
                                const aluno = this.alunos.find(a => a.nome === ag.aluno);
                                const turma = this.turmas.find(t => `${t.codigo} - ${t.dia}` === ag.turma);
                                return `
                                    <div class="agendamento-item">
                                        <div class="agendamento-header">
                                            <div class="agendamento-title">
                                                <i class="fas fa-user"></i> ${ag.aluno}
                                            </div>
                                            <span class="status-badge status-${ag.status}">${ag.status}</span>
                                        </div>
                                        <div class="agendamento-details">
                                            <div><i class="fas fa-calendar"></i> <strong>Data:</strong> ${this.formatarData(ag.data)}</div>
                                            <div><i class="fas fa-clock"></i> <strong>Horário:</strong> ${ag.horario}</div>
                                            <div><i class="fas fa-users"></i> <strong>Turma:</strong> ${ag.turma}</div>
                                            <div><i class="fas fa-chalkboard-teacher"></i> <strong>Professor:</strong> ${turma ? turma.professor : 'N/A'}</div>
                                            <div><i class="fas fa-comment"></i> <strong>Motivo:</strong> ${ag.motivo || 'Não informado'}</div>
                                            <div><i class="fas fa-calendar-plus"></i> <strong>Criado em:</strong> ${this.formatarData(ag.criadoEm)}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `).join('')}
                    
                    <div class="footer">
                        <p>Este relatório foi gerado automaticamente pelo sistema Maikito-san</p>
                        <p>Total de ${this.agendamentos.length} agendamentos encontrados</p>
                        <p>Para dúvidas, entre em contato com a secretaria.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        // Criar uma janela para impressão
        const printWindow = window.open('', '_blank');
        printWindow.document.write(conteudoPDF);
        printWindow.document.close();
        
        // Esperar o conteúdo carregar e então imprimir
        printWindow.onload = function() {
            printWindow.print();
            printWindow.close();
        };
        
        this.showToast('Relatório PDF gerado com sucesso!');
    }

    limparFormulario() {
        console.log('🧹 Limpando formulário...');
        
        const form = document.getElementById('reposicaoForm');
        if (form) {
            form.reset();
            
            // Limpar campos específicos
            document.getElementById('alunoNome').value = '';
            document.getElementById('alunoProfessor').value = '';
            document.getElementById('alunoEmail').value = '';
            document.getElementById('alunoTurma').value = 'Reposição Geral';
            document.getElementById('dataReposicao').value = '';
            document.getElementById('horarioSelect').value = '';
            document.getElementById('motivoReposicao').value = '';
            document.getElementById('criarEventoGoogle').checked = true;
            
            console.log('✅ Formulário limpo');
        }
    }

    closeModal() {
        document.getElementById('confirmModal').classList.add('hidden');
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
}

// Funções globais para acesso no HTML
let sistemaReposicao;

function limparFormulario() {
    sistemaReposicao.limparFormulario();
}

function closeModal() {
    sistemaReposicao.closeModal();
}

function confirmarAgendamento() {
    sistemaReposicao.confirmarAgendamento();
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    sistemaReposicao = new SistemaReposicao();
});
