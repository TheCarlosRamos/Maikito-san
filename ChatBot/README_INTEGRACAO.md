# 🤖 Chatbot Maikito-san - Integração com Dashboard

## 📋 Visão Geral

O Chatbot Maikito-san é um assistente de IA inteligente integrado ao dashboard da escola, capaz de responder perguntas sobre alunos, turmas, reposições e estatísticas usando os dados reais dos arquivos CSV.

## 🚀 Funcionalidades

### Recursos Principais
- **📊 Análise de Dados**: Processa `organized.csv` e `reposicoes_completas.csv`
- **🔍 Busca Inteligente**: Encontra informações específicas de alunos e turmas
- **📈 Estatísticas**: Gera relatórios e estatísticas gerais da escola
- **💬 Conversação Natural**: Interface de chat amigável com modelo Gemma-2B
- **🎯 Respostas Contextuais**: Usa os dados reais para responder perguntas

### Tipos de Perguntas Suportadas
- "Quais são as estatísticas gerais da escola?"
- "Me fale sobre a turma INT 1"
- "Quantas reposições temos em março?"
- "Quem são os alunos da turma KIDS?"
- "Quais professores temos na escola?"
- "Me mostre os dados do aluno [nome]"

## 📁 Estrutura de Arquivos

```
ChatBot/
├── app.py                    # Aplicação principal do chatbot
├── data_processor.py         # Módulo de processamento de dados CSV
├── start_chatbot.py          # Script facilitador para iniciar o chatbot
├── requirements.txt         # Dependências Python
├── README_INTEGRACAO.md     # Este arquivo
└── ../chatbot.html         # Interface integrada ao dashboard
```

## 🛠️ Instalação e Configuração

### 1. Pré-requisitos
- Python 3.8 ou superior
- GPU recomendada (para melhor performance)
- Arquivos CSV: `organized.csv` e `reposicoes_completas.csv`

### 2. Instalar Dependências
```bash
cd ChatBot
pip install -r requirements.txt
```

### 3. Configurar Token do Hugging Face (Opcional)
```bash
export HF_TOKEN="seu_token_aqui"
```

### 4. Iniciar o Chatbot

#### Método 1: Script Facilitador (Recomendado)
```bash
python start_chatbot.py
```

#### Método 2: Direto
```bash
python app.py
```

### 5. Acessar o Chatbot
- **Interface Direta**: http://localhost:7860
- **Via Dashboard**: http://localhost:8000/chatbot.html (com servidor web rodando)

## 🔧 Configuração dos Dados

### Arquivos CSV Esperados

#### organized.csv
```csv
professor,horario,aluno,nivel
Prof. João,08:00,Maria Silva,INT 1
Prof. Ana,09:00,João Santos,KIDS 2
...
```

#### reposicoes_completas.csv
```csv
Nome,Turma,Data,Dia,Hora,Mes,Ano
Maria Silva,INT 1,04/03/2026,Quarta,08:00,MAR,2026
João Santos,KIDS 2,07/03/2026,Sábado,08:00,MAR,2026
...
```

## 🎮 Uso do Chatbot

### Interface Web
1. Acesse http://localhost:7860 ou o dashboard
2. Digite sua pergunta no campo de chat
3. Use as perguntas exemplo como referência
4. O chatbot responderá baseado nos dados reais

### Integração com Dashboard
- O chatbot está integrado no menu de navegação principal
- Status de conexão é exibido em tempo real
- Estatísticas básicas são mostradas na interface
- Perguntas podem ser enviadas via botões exemplo

## 🔍 Como Funciona

### Processamento de Dados
1. **Carregamento**: Os arquivos CSV são carregados na inicialização
2. **Indexação**: Dados são estruturados para busca eficiente
3. **Contexto**: Informações resumidas são fornecidas ao modelo
4. **Busca**: Consultas específicas são processadas quando necessário

### Fluxo de Resposta
1. Usuário faz uma pergunta
2. Sistema identifica o tipo de consulta
3. Dados relevantes são extraídos dos CSVs
4. Contexto é montado para o modelo de IA
5. Modelo gera resposta baseada nos dados
6. Resposta é apresentada ao usuário

## 🛠️ Personalização

### Adicionar Novos Tipos de Perguntas
Edite `data_processor.py` para adicionar novos métodos de busca:

```python
def get_custom_info(self, query_param: str) -> str:
    # Implementar lógica personalizada
    pass
```

### Modificar Prompt do Sistema
Edite `app.py` na função `chatbot_with_data()` para ajustar o comportamento:

```python
system_prompt = f"""Você é um assistente especialista...
# Personalize aqui
"""
```

## 🐛 Solução de Problemas

### Problemas Comuns

#### Chatbot não inicia
```bash
# Verificar dependências
pip install -r requirements.txt

# Verificar arquivos de dados
ls ../organized.csv
ls ../reposicoes_completas.csv
```

#### Respostas imprecisas
- Verifique se os dados CSV estão corretos
- Confirme os nomes das colunas
- Teste com perguntas mais específicas

#### Conexão com dashboard
- Certifique-se que ambos servidores estão rodando (portas 8000 e 7860)
- Verifique se não há bloqueio de firewall
- Confirme os caminhos dos arquivos

### Logs e Debug
O sistema gera logs detalhados:
```bash
# Verificar logs de inicialização
python start_chatbot.py

# Logs do navegador (F12) para interface web
```

## 📊 Performance

### Recomendações
- **GPU**: Use GPU para melhor performance do modelo
- **Memória**: Mínimo 8GB RAM recomendado
- **Dados**: Arquivos CSV com até 10.000 linhas

### Otimizações
- Modelo usa quantização de 4-bit
- Cache de dados em memória
- Busca otimizada com pandas

## 🔮 Futuras Melhorias

- [ ] Suporte a mais fontes de dados
- [ ] Interface de administração
- [ ] Histórico de conversas
- [ ] Exportação de relatórios
- [ ] Integração com banco de dados
- [ ] Modo multilíngue

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs de erro
2. Consulte a seção de solução de problemas
3. Teste com o script `start_chatbot.py`
4. Verifique a configuração dos arquivos CSV

## 📄 Licença

Este projeto está licenciado sob os termos do arquivo LICENSE na raiz do projeto.
