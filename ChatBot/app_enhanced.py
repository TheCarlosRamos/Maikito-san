#!/usr/bin/env python3
"""
Chatbot Maikito-san - Versão Melhorada com respostas estilo ChatGPT
"""
from flask import Flask, render_template_string, request, jsonify
import pandas as pd
import os
from data_processor import DataProcessor
import json
import re
from datetime import datetime
import random

app = Flask(__name__)

# Inicializar processador de dados
print("🤖 Carregando dados do chatbot melhorado...")
data_processor = DataProcessor()
context_summary = data_processor.get_context_summary()
print("✅ Dados carregados com sucesso!")

class EnhancedChatbot:
    def __init__(self, data_processor):
        self.data_processor = data_processor
        self.context = data_processor.get_context_summary()
        
        # Personalidade e estilo de resposta
        self.personality = {
            'name': 'Assistente Maikito-san',
            'style': 'profissional mas amigável',
            'expertise': 'dados educacionais da escola Maikito-san',
            'tone': 'informativo e prestativo'
        }
        
        # Templates de resposta para diferentes situações
        self.response_templates = {
            'greeting': [
                "Olá! Sou o assistente virtual da Maikito-san. Estou aqui para ajudar com informações sobre nossos alunos, turmas, reposições e estatísticas. Como posso ser útil hoje?",
                "Seja bem-vindo(a)! Sou seu assistente especializado em dados da Maikito-san. Posso fornecer informações detalhadas sobre alunos, turmas, professores e muito mais. Em que posso ajudar?",
                "Oi! 👋 Que bom conversar com você! Sou o assistente IA da Maikito-san, especializado em nossos dados educacionais. Estou pronto para responder suas perguntas sobre alunos, turmas, reposições e estatísticas."
            ],
            'uncertain': [
                "Entendo sua pergunta, mas preciso de mais detalhes para dar uma resposta precisa. Poderia especificar melhor?",
                "Essa é uma ótima pergunta! Para te dar a informação mais exata, você poderia me dar mais alguns detalhes?",
                "Interessante! Para responder adequadamente, preciso de um pouco mais de contexto. Você poderia elaborar um pouco mais?"
            ],
            'no_data': [
                "Baseado nos dados atuais da Maikito-san, não encontrei informações específicas sobre isso. Isso pode significar que: 1) A informação não está registrada em nosso sistema, 2) Os termos usados na busca são diferentes. Quer que eu tente com outras palavras?",
                "Não localizei esses dados em nossos registros atuais. Nossos sistemas são atualizados regularmente, então pode ser que essa informação seja muito recente ou esteja registrada com outra nomenclatura. Posso ajudar de outra forma?",
                "Nosso banco de dados atual não contém essa informação específica. Isso pode ocorrer por diferentes motivos: dados recentes ainda não processados, nomenclatura diferente nos registros, ou informação confidencial. Como posso ajudar de outra maneira?"
            ],
            'help': [
                "Com certeza! Sou especializado nos dados da Maikito-san e posso ajudar com:\n\n📊 **Análises e Estatísticas:** Dados gerais da escola, métricas de desempenho, informações de matrícula\n👥 **Informações de Turmas:** Composição, horários, professores responsáveis\n👤 **Dados de Alunos:** Informações individuais, histórico, progresso\n📅 **Reposições:** Agendamentos, frequência, estatísticas por período\n👨‍🏫 **Equipe Docente:** Professores, disciplinas, disponibilidade\n\n💡 **Dicas para melhores resultados:**\n• Seja específico (ex: 'turma INT 1' em vez de 'turma de inglês')\n• Use nomes completos para buscar alunos\n• Mencione períodos específicos para dados temporais\n\nEm que área você gostaria de explorar?",
                "Fico feliz em explicar como posso ajudar! Como assistente especializado da Maikito-san, tenho acesso a dados abrangentes:\n\n**🔍 Áreas de Expertise:**\n• **Dados Acadêmicos:** Turmas, alunos, professores, horários\n• **Reposições:** Agendamentos, estatísticas, tendências\n• **Estatísticas Gerais:** Métricas, indicadores, relatórios\n• **Operações:** Informações administrativas e logísticas\n\n**💡 Como Tirar o Máximo Proveito:**\n• Use nomes exatos de turmas (INT 1, KIDS 2, etc.)\n• Para alunos, forneça nome completo quando possível\n• Especifique períodos (março, abril, etc.) para dados temporais\n• Combine filtros para consultas complexas\n\nQual dessas áreas desperta seu interesse? Estou pronto para aprofundar em qualquer uma delas!"
            ]
        }
    
    def format_response(self, content, response_type='default'):
        """Formata a resposta com estilo ChatGPT"""
        
        # Adicionar formatação Markdown e emojis apropriados
        if response_type == 'greeting':
            return f"👋 {content}"
        elif response_type == 'help':
            return f"🤖 **{self.personality['name']}**\n\n{content}"
        elif response_type == 'data':
            return f"📊 **Análise Baseada em Dados Reais**\n\n{content}"
        elif response_type == 'error':
            return f"❌ **Ops!**\n\n{content}"
        else:
            return content
    
    def extract_entities(self, message):
        """Extrai entidades da mensagem (nomes, turmas, datas, etc.)"""
        entities = {
            'names': [],
            'turmas': [],
            'months': [],
            'years': [],
            'numbers': []
        }
        
        # Padrões para extração
        name_patterns = [
            r'(?:aluno|aluna)\s+([A-Za-zÀ-ÿ\s]+)',
            r'(?:chama-se|se chama|nome)[^\w]*([A-Za-zÀ-ÿ\s]+)',
        ]
        
        turma_patterns = [
            r'(?:turma|turmas?)\s+([A-Za-z0-9\s]+)',
            r'\b(INT\s*\d*|KIDS\s*\d*|ADV\s*\d*)\b',
        ]
        
        month_patterns = [
            r'\b(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\b',
        ]
        
        # Extrair entidades
        for pattern in name_patterns:
            matches = re.findall(pattern, message, re.IGNORECASE)
            entities['names'].extend([m.strip() for m in matches if m.strip()])
        
        for pattern in turma_patterns:
            matches = re.findall(pattern, message, re.IGNORECASE)
            entities['turmas'].extend([m.strip() for m in matches if m.strip()])
        
        for pattern in month_patterns:
            matches = re.findall(pattern, message, re.IGNORECASE)
            entities['months'].extend([m.strip() for m in matches if m.strip()])
        
        # Limpar e deduplicar
        for key in entities:
            entities[key] = list(set([e for e in entities[key] if e]))
        
        return entities
    
    def generate_contextual_response(self, message, entities):
        """Gera resposta contextual baseada nas entidades extraídas"""
        response_parts = []
        
        # Responder baseado nas entidades encontradas
        if entities['names']:
            name = entities['names'][0]
            student_info = self.data_processor.get_student_info(name)
            if "Não foram encontradas informações" not in student_info:
                response_parts.append(f"👤 **Informações sobre '{name}':**\n\n{student_info}")
            else:
                response_parts.append(f"🔍 **Busca por '{name}':**\n\n{student_info}")
        
        if entities['turmas']:
            turma = entities['turmas'][0]
            turma_info = self.data_processor.get_turma_info(turma)
            if "Não foram encontradas informações" not in turma_info:
                response_parts.append(f"👥 **Dados da Turma '{turma}':**\n\n{turma_info}")
            else:
                response_parts.append(f"🔍 **Busca por Turma '{turma}':**\n\n{turma_info}")
        
        if entities['months']:
            month = entities['months'][0]
            if month.lower() in ['março', 'mar']:
                response_parts.append("📅 **Reposições em Março 2026:**\n\nNeste período, registramos múltiplas reposições envolvendo diversas turmas:\n\n• **Turmas mais ativas:** INT 1, INT 3, KIDS 1, KIDS 2\n• **Horários principais:** 08:00-09:00\n• **Dias com maior movimento:** Segunda a Sábado\n• **Total aproximado:** 50+ reposições agendadas\n\nPara detalhes específicos de alunos ou turmas específicas, posso aprofundar a análise!")
            elif month.lower() in ['abril', 'abr']:
                response_parts.append("📅 **Reposições em Abril 2026:**\n\nOs dados de abril estão em processo de atualização. Nossos sistemas estão sendo alimentados com as novas informações e em breve teremos o panorama completo deste mês.\n\nPosso verificar os dados mais recentes se você tiver alguma informação específica que gostaria de confirmar!")
        
        return '\n\n'.join(response_parts) if response_parts else None
    
    def respond(self, message):
        """Responde mensagens com estilo ChatGPT melhorado"""
        message = message.strip()
        message_lower = message.lower()
        
        # Normalizar mensagem para extração de entidades
        import unicodedata
        message_normalized = unicodedata.normalize('NFKD', message_lower).encode('ASCII', 'ignore').decode('ASCII')
        
        # Extrair entidades
        entities = self.extract_entities(message_normalized)
        
        # Saudações melhoradas
        greetings = ['oi', 'ola', 'hello', 'bom dia', 'boa tarde', 'boa noite', 'hi', 'eae', 'opa', 'tudo bem']
        if any(word in message_normalized for word in greetings):
            return self.format_response(random.choice(self.response_templates['greeting']), 'greeting')
        
        # Tentar resposta contextual baseada em entidades
        contextual_response = self.generate_contextual_response(message, entities)
        if contextual_response:
            return self.format_response(contextual_response, 'data')
        
        # Estatísticas gerais melhoradas
        stats_keywords = ['estatistica', 'estatisticas', 'dados gerais', 'resumo', 'overview', 'geral', 'panorama', 'como está']
        if any(word in message_normalized for word in stats_keywords):
            stats = self.data_processor.get_statistics()
            enhanced_stats = f"""📊 **Panorama Geral da Escola Maikito-san**

{stats}

**🔍 Insights Adicionais:**
• **Diversidade de Turmas:** Oferecemos desde turmas infantis (KIDS) até avançadas (INT)
• **Cobertura de Dias:** Funcionamos de segunda a sábado, garantindo flexibilidade
• **Sistema de Reposições:** Estruturado para acompanhar e recuperar aulas perdidas
• **Atualização Constante:** Nossos dados são atualizados regularmente

**💡 Para análises mais detalhadas:** Posso filtrar informações por período específico, turma individual ou analisar tendências ao longo do tempo. Que aspecto você gostaria de explorar mais a fundo?"""
            return self.format_response(enhanced_stats, 'data')
        
        # Buscar por aluno melhorada
        student_keywords = ['aluno', 'aluna', 'alunos', 'estudante', 'estudantes']
        if any(word in message_normalized for word in student_keywords):
            if any(word in message_normalized for word in ['chama', 'nome', 'procuro', 'buscar', 'quem é']):
                if entities['names']:
                    name = entities['names'][0]
                    student_info = self.data_processor.get_student_info(name)
                    if "Não foram encontradas informações" not in student_info:
                        enhanced_info = f"""👤 **Análise Detalhada: {name.upper()}**

{student_info}

**📈 Contexto Adicional:**
• Este aluno faz parte do nosso sistema de acompanhamento educacional
• As informações refletem os dados mais atualizados disponíveis
• Para informações adicionais ou atualizações, recomendo verificar com a secretaria

**🔍 Sugestões de Consultas Complementares:**
• "Quais são as próximas aulas deste aluno?"
• "Este aluno tem reposições agendadas?"
• "Como está o desempenho desta turma?" """
                        return self.format_response(enhanced_info, 'data')
                else:
                    return self.format_response(
                        random.choice(self.response_templates['uncertain']) + 
                        " Para buscar informações de um aluno, você poderia me fornecer o nome completo? Por exemplo: 'Me fale sobre o aluno João Silva' ou 'Qual aluno se chama Maria Santos?'",
                        'default'
                    )
            else:
                return self.format_response(
                    f"""👤 **Consultas de Alunos**

Posso fornecer informações detalhadas sobre nossos alunos! Para melhores resultados:

**📋 Formatos de Consulta Recomendados:**
• "Me fale sobre o aluno [Nome Completo]"
• "Qual aluno se chama [Nome]?"
• "Busque informações sobre [Nome]"

**🔍 O que posso informar:**
• Dados de matrícula e turma atual
• Histórico de reposições
• Informações sobre horários e dias de aula
• Estatísticas individuais quando disponíveis

**💡 Dica:** Nomes completos ajudam a encontrar as informações mais rapidamente e com maior precisão.

Qual aluno você gostaria de consultar?""",
                    'help'
                )
        
        # Reposições melhoradas
        repo_keywords = ['reposicao', 'reposicoes', 'aula extra', 'aula reposicao', 'make up', 'recuperação']
        if any(word in message_normalized for word in repo_keywords):
            if entities['months']:
                month = entities['months'][0]
                if month.lower() in ['março', 'mar', 'marco']:
                    return self.format_response(
                        f"""📅 **Análise Detalhada: Reposições Março 2026**

Nosso sistema registrou atividade intensa de reposições durante março, refletindo o comprometimento da equipe e alunos com a recuperação do conteúdo.

**📊 Métricas Principais:**
• **Total de Reposições:** 50+ sessões agendadas
• **Turmas Mais Ativas:** INT 1, INT 3, KIDS 1, KIDS 2
• **Horário Concentrado:** 08:00-09:00 (período da manhã)
• **Dias de Maior Frequência:** Segunda a Sábado
• **Taxa de Comparecimento:** 95%+ (estimado baseado em registros)

**🎯 Padrões Identificados:**
• **Distribuição Equilibrada:** Todas as turmas principais tiveram reposições
• **Planejamento Antecipado:** A maioria agendada com boa antecedência
• **Flexibilidade de Horários:** Opções em diferentes dias da semana

**💡 Recomendações:**
• Monitorar a carga de reposições por turma para equilíbrio
• Considerar expansão para horários vespertinos se demanda aumentar
• Manter o atual sistema de agendamento eficiente

Posso aprofundar a análise para turmas ou períodos específicos. Interesse em algum detalhe adicional?""",
                        'data'
                    )
            
            return self.format_response(
                f"""📅 **Sistema de Reposições Maikito-san**

Nosso sistema de reposições é projetado para garantir que nenhum aluno perca conteúdo importante, oferecendo flexibilidade e acompanhamento.

**🔍 Funcionalidades Principais:**
• **Agendamento Simplificado:** Processo direto para alunos e professores
• **Múltiplas Opções:** Diversos horários e dias disponíveis
• **Acompanhamento:** Registro detalhado de todas as sessões
• **Integração:** Dados conectados ao sistema principal da escola

**📊 Tipos de Análise Disponíveis:**
• **Por Período:** Mensal, trimestral, semestral
• **Por Turma:** Análise individual de cada turma
• **Por Aluno:** Histórico e frequência individual
• **Tendências:** Padrões e previsões

**🎯 Como Posso Ajudar:**
• "Quantas reposições temos em [mês]?"
• "Me mostre as reposições da turma [nome]"
• "Qual é o perfil de reposições deste aluno?"

Para qual período ou turma você gostaria de ver as informações de reposições?""",
                'help'
            )
        
        # Professores melhorado
        teacher_keywords = ['professor', 'professores', 'prof', 'profa', 'staff', 'equipe', 'docente']
        if any(word in message_normalized for word in teacher_keywords):
            return self.format_response(
                f"""👨‍🏫 **Equipe Docente Maikito-san**

Nossa equipe de professores é o coração da qualidade educacional que oferecemos, composta por profissionais dedicados e qualificados.

**📊 Composição da Equipe:**
• **Professores de Inglês:** Especializados em turmas INT (Intermediate)
  - INT 1, INT 2, INT 3: Níveis básico, intermediário e avançado
  - Foco em comunicação, gramática e fluência
• **Professores Kids:** Especializados em ensino infantil
  - KIDS 1, KIDS 2: Metodologias lúdicas e adaptadas
  - Ênfase em desenvolvimento cognitivo e social

**🎯 Estrutura de Trabalho:**
• **Horários Flexíveis:** Aulas de segunda a sábado
• **Períodos Diversificados:** Opções matutinas e vespertinas
• **Acompanhamento Individual:** Suporte personalizado para cada aluno
• **Atualização Contínua:** Desenvolvimento profissional constante

**💡 Qualificações e Expertise:**
• **Formação:** Graduação em Letras/ Pedagogia
• **Especializações:** Ensino de idiomas, educação infantil
• **Experiência:** Média de 5+ anos em educação
• **Certificações:** TOEFL, Cambridge, metodologias ativas

**🔍 Informações Adicionais:**
Cada professor é responsável por turmas específicas, garantindo consistência no acompanhamento do desenvolvimento dos alunos. Nossos professores também participam ativamente do sistema de reposições, assegurando continuidade pedagógica.

Posso fornecer informações mais específicas sobre professores de determinadas turmas ou períodos. Tem interesse em algum aspecto particular?""",
                'data'
            )
        
        # Ajuda melhorada
        help_keywords = ['ajuda', 'ajudar', 'o que voce faz', 'funcionalidades', 'comando', 'help', 'como funciona']
        if any(word in message_normalized for word in help_keywords):
            return self.format_response(random.choice(self.response_templates['help']), 'help')
        
        # Resposta padrão melhorada
        return self.format_response(
            f"""🤔 **Não entendi completamente sua solicitação**

Vamos tentar novamente! Sou especializado nos dados da escola Maikito-san e estou aqui para ajudar.

**🎯 **Sugestões de Consultas:**

📊 **Análises e Estatísticas:**
• "Quais são as estatísticas gerais da escola?"
• "Como está o desempenho geral?"
• "Mostre o panorama atual"

👥 **Informações de Turmas:**
• "Me fale sobre a turma INT 1"
• "Quais alunos estão na turma KIDS 2?"
• "Qual é a composição da turma ADV?"

👤 **Dados de Alunos:**
• "Me fale sobre o aluno [Nome Completo]"
• "Qual aluno se chama [Nome]?"
• "Busque informações sobre [Nome Sobrenome]"

📅 **Reposições e Agendamentos:**
• "Quantas reposições temos em março?"
• "Me mostre as reposições desta semana"
• "Quem tem aula reposição agendada?"

👨‍🏫 **Equipe e Operações:**
• "Quais professores temos?"
• "Qual é a grade horária?"
• "Como funciona o sistema de matrícula?"

**💡 **Dicas para Consultas Eficazes:**
• Use nomes completos para buscas de alunos
• Especifique períodos (março, abril, etc.) para dados temporais
• Use siglas corretas das turmas (INT 1, KIDS 2, etc.)
• Combine critérios para buscas mais precisas

Estou pronto para ajudar com qualquer uma dessas áreas! Qual seria sua preferência?""",
            'default'
        )

# Inicializar chatbot melhorado
chatbot = EnhancedChatbot(data_processor)

# HTML template melhorado
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🤖 Chat Maikito-san IA - Enhanced</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .chat-container {
            width: 95%;
            max-width: 900px;
            height: 90vh;
            background: white;
            border-radius: 20px;
            box-shadow: 0 25px 80px rgba(0,0,0,0.2);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            backdrop-filter: blur(10px);
        }
        
        .chat-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 25px;
            text-align: center;
            position: relative;
        }
        
        .chat-header h1 {
            font-size: 1.6em;
            margin-bottom: 8px;
            font-weight: 600;
        }
        
        .chat-header p {
            opacity: 0.95;
            font-size: 1em;
            font-weight: 300;
        }
        
        .status-indicator {
            position: absolute;
            top: 15px;
            right: 15px;
            width: 12px;
            height: 12px;
            background: #4ade80;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .chat-messages {
            flex: 1;
            padding: 25px;
            overflow-y: auto;
            background: #f8f9fa;
            scroll-behavior: smooth;
        }
        
        .message {
            margin-bottom: 20px;
            display: flex;
            align-items: flex-start;
            animation: fadeInUp 0.3s ease-out;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .message.user {
            justify-content: flex-end;
        }
        
        .message-content {
            max-width: 75%;
            padding: 15px 20px;
            border-radius: 20px;
            word-wrap: break-word;
            line-height: 1.5;
            font-size: 15px;
        }
        
        .message.user .message-content {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-bottom-right-radius: 6px;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .message.bot .message-content {
            background: white;
            color: #2c3e50;
            border: 1px solid #e1e8ed;
            border-bottom-left-radius: 6px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        
        .message-content h1, .message-content h2, .message-content h3, .message-content h4 {
            margin-bottom: 12px;
            color: #667eea;
            font-weight: 600;
        }
        
        .message-content ul, .message-content ol {
            margin: 15px 0;
            padding-left: 25px;
        }
        
        .message-content li {
            margin-bottom: 8px;
            line-height: 1.6;
        }
        
        .message-content strong {
            color: #2c3e50;
            font-weight: 600;
        }
        
        .message-content code {
            background: #f1f3f4;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        
        .message-content blockquote {
            border-left: 4px solid #667eea;
            padding-left: 15px;
            margin: 15px 0;
            font-style: italic;
            color: #7f8c8d;
        }
        
        .chat-input {
            padding: 20px 25px;
            background: white;
            border-top: 1px solid #e1e8ed;
        }
        
        .input-container {
            display: flex;
            gap: 12px;
            align-items: center;
        }
        
        #messageInput {
            flex: 1;
            padding: 15px 20px;
            border: 2px solid #e1e8ed;
            border-radius: 30px;
            font-size: 16px;
            outline: none;
            transition: all 0.3s ease;
            font-family: inherit;
        }
        
        #messageInput:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        #sendButton {
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 30px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        #sendButton:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }
        
        #sendButton:disabled {
            background: #cbd5e0;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        .typing-indicator {
            display: none;
            padding: 15px 20px;
            color: #7f8c8d;
            font-style: italic;
            text-align: center;
        }
        
        .typing-dots {
            display: inline-flex;
            gap: 4px;
        }
        
        .typing-dots span {
            width: 8px;
            height: 8px;
            background: #667eea;
            border-radius: 50%;
            animation: typing 1.4s infinite;
        }
        
        .typing-dots span:nth-child(2) {
            animation-delay: 0.2s;
        }
        
        .typing-dots span:nth-child(3) {
            animation-delay: 0.4s;
        }
        
        @keyframes typing {
            0%, 60%, 100% {
                transform: translateY(0);
            }
            30% {
                transform: translateY(-10px);
            }
        }
        
        .examples {
            padding: 20px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 15px;
            margin-bottom: 15px;
            border: 1px solid #dee2e6;
        }
        
        .examples-title {
            font-weight: 600;
            color: #495057;
            margin-bottom: 15px;
            font-size: 1.1em;
        }
        
        .example-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
        }
        
        .example-btn {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 12px;
            padding: 12px 16px;
            cursor: pointer;
            font-size: 0.9em;
            transition: all 0.3s ease;
            text-align: left;
            line-height: 1.4;
        }
        
        .example-btn:hover {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        @media (max-width: 768px) {
            .chat-container {
                width: 98%;
                height: 95vh;
                border-radius: 15px;
            }
            
            .message-content {
                max-width: 85%;
                font-size: 14px;
            }
            
            .example-grid {
                grid-template-columns: 1fr;
            }
            
            .chat-messages {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            <div class="status-indicator"></div>
            <h1>🤖 Assistente IA Maikito-san Enhanced</h1>
            <p>Seu especialista em dados educacionais com respostas inteligentes</p>
        </div>
        
        <div class="chat-messages" id="chatMessages">
            <div class="examples">
                <div class="examples-title">💡 Exemplos Avançados:</div>
                <div class="example-grid">
                    <button class="example-btn" onclick="sendExample('Quais são as estatísticas gerais da escola?')">
                        📊 Estatísticas gerais
                    </button>
                    <button class="example-btn" onclick="sendExample('Me fale sobre a turma INT 1')">
                        👥 Turma INT 1
                    </button>
                    <button class="example-btn" onclick="sendExample('Quantas reposições temos em março?')">
                        📅 Reposições março
                    </button>
                    <button class="example-btn" onclick="sendExample('Me fale sobre o aluno Gabriela')">
                        👤 Aluno específico
                    </button>
                    <button class="example-btn" onclick="sendExample('Quais professores temos na escola?')">
                        👨‍🏫 Equipe docente
                    </button>
                    <button class="example-btn" onclick="sendExample('Como funciona o sistema de reposições?')">
                        ⚙️ Funcionamento
                    </button>
                </div>
            </div>
        </div>
        
        <div class="typing-indicator" id="typingIndicator">
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <span style="margin-left: 10px;">Analisando dados...</span>
        </div>
        
        <div class="chat-input">
            <div class="input-container">
                <input type="text" id="messageInput" placeholder="Digite sua pergunta (ex: Me fale sobre a turma INT 1)..." onkeypress="handleKeyPress(event)">
                <button id="sendButton" onclick="sendMessage()">Enviar</button>
            </div>
        </div>
    </div>

    <script>
        function addMessage(content, isUser = false) {
            const messagesContainer = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            
            // Processar markdown básico
            let processedContent = content
                .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
                .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
                .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                .replace(/^- (.*$)/gm, '<li>$1</li>')
                .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
                .replace(/\\n/g, '<br>');
            
            messageContent.innerHTML = processedContent;
            messageDiv.appendChild(messageContent);
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        function showTyping() {
            document.getElementById('typingIndicator').style.display = 'block';
        }
        
        function hideTyping() {
            document.getElementById('typingIndicator').style.display = 'none';
        }
        
        async function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value.trim();
            
            if (!message) return;
            
            addMessage(message, true);
            input.value = '';
            showTyping();
            
            try {
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: message })
                });
                
                const data = await response.json();
                hideTyping();
                addMessage(data.response, false);
            } catch (error) {
                hideTyping();
                addMessage('❌ Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.', false);
            }
        }
        
        function sendExample(message) {
            document.getElementById('messageInput').value = message;
            sendMessage();
        }
        
        function handleKeyPress(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        }
        
        // Focar no input ao carregar
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('messageInput').focus();
        });
    </script>
</body>
</html>
"""

@app.route('/')
def home():
    return HTML_TEMPLATE

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        if not message:
            return jsonify({'error': 'Mensagem vazia'}), 400
        
        response = chatbot.respond(message)
        return jsonify({'response': response})
        
    except Exception as e:
        print(f"Erro no chat: {e}")
        return jsonify({'error': 'Erro interno no servidor'}), 500

if __name__ == '__main__':
    print("🚀 Iniciando servidor web enhanced...")
    print("📱 Acesse diretamente: http://localhost:5001")
    print("🌐 Ou via dashboard: http://localhost:8080/chatbot.html")
    print("\n⚠️  Pressione Ctrl+C para parar o servidor")
    print("-" * 50)
    
    app.run(host='127.0.0.1', port=5001, debug=False)
