#!/usr/bin/env python3
"""
Chatbot Maikito-san - Versão Web Simples
"""
from flask import Flask, render_template_string, request, jsonify
import pandas as pd
import os
from data_processor import DataProcessor
import json

app = Flask(__name__)

# Inicializar processador de dados
print("🤖 Carregando dados do chatbot...")
data_processor = DataProcessor()
context_summary = data_processor.get_context_summary()
print("✅ Dados carregados com sucesso!")

class SimpleChatbot:
    def __init__(self, data_processor):
        self.data_processor = data_processor
        self.context = data_processor.get_context_summary()
    
    def respond(self, message):
        """Responde mensagens usando regras e dados CSV"""
        message_lower = message.lower().strip()
        
        # Remover acentos para comparação
        import unicodedata
        message_lower = unicodedata.normalize('NFKD', message_lower).encode('ASCII', 'ignore').decode('ASCII')
        
        # Saudações
        greetings = ['oi', 'ola', 'hello', 'bom dia', 'boa tarde', 'boa noite', 'hi', 'eae']
        if any(word in message_lower for word in greetings):
            return "Olá! Sou o assistente da Maikito-san. Posso ajudar com informações sobre alunos, turmas, reposições e estatísticas. O que você gostaria de saber?"
        
        # Estatísticas gerais
        stats_keywords = ['estatistica', 'estatisticas', 'dados gerais', 'resumo', 'overview', 'geral']
        if any(word in message_lower for word in stats_keywords):
            return self.data_processor.get_statistics()
        
        # Buscar por turma
        if 'turma' in message_lower:
            # Extrair nome da turma
            words = message.split()
            for i, word in enumerate(words):
                if word.lower() == 'turma' and i + 1 < len(words):
                    turma_name = " ".join(words[i+1:])
                    return self.data_processor.get_turma_info(turma_name)
        
        # Buscar por aluno
        student_keywords = ['aluno', 'aluna', 'alunos']
        if any(word in message_lower for word in student_keywords):
            if any(word in message_lower for word in ['chama', 'nome', 'procuro', 'buscar']):
                # Tentar extrair nome do aluno
                words = message.split()
                for i, word in enumerate(words):
                    if word.lower() in ['aluno', 'aluna'] and i + 1 < len(words):
                        student_name = " ".join(words[i+1:])
                        return self.data_processor.get_student_info(student_name)
            else:
                return "Para buscar informações de um aluno específico, diga algo como: 'Me fale sobre o aluno [nome]' ou 'Qual aluno se chama [nome]?'"
        
        # Reposições
        repo_keywords = ['reposicao', 'reposicoes', 'aula extra', 'aula reposicao', 'make up']
        if any(word in message_lower for word in repo_keywords):
            if 'marco' in message_lower or 'março' in message_lower or 'mar' in message_lower:
                return "📅 **Reposições em Março 2026:**\n\nTemos várias reposições agendadas para março, incluindo alunos das turmas INT 1, INT 3, KIDS 1, KIDS 2, etc. Os horários variam entre 08:00 e 09:00, ocorrendo principalmente em dias de semana (Segunda a Sábado).\n\nPara informações mais detalhadas sobre uma turma ou aluno específico, é só perguntar!"
            elif 'abril' in message_lower or 'apr' in message_lower:
                return "📅 **Reposições em Abril 2026:**\n\nOs dados de abril estão sendo atualizados. Em breve teremos as informações completas das reposições deste mês."
            else:
                return "📅 **Sobre Reposições:**\n\nO sistema registra todas as reposições de aulas com informações detalhadas como:\n- Nome do aluno\n- Turma\n- Data e horário\n- Dia da semana\n- Mês/ano de referência\n\nPosso filtrar por mês específico (março, abril, etc.) ou por turma/aluno específico. O que você gostaria de saber?"
        
        # Professores
        teacher_keywords = ['professor', 'professores', 'prof', 'profa', 'staff']
        if any(word in message_lower for word in teacher_keywords):
            return "👨‍🏫 **Professores da Maikito-san:**\n\nContamos com uma equipe dedicada de professores para as diferentes turmas e níveis:\n- **Professores de Inglês:** Turmas INT 1, INT 2, INT 3\n- **Professores de Kids:** Turmas KIDS 1, KIDS 2\n- **Professores de nível básico e intermediário\n\nCada professor é responsável por horários específicos durante a semana, com aulas de segunda a sábado nos períodos da manhã e tarde."
        
        # Ajuda
        help_keywords = ['ajuda', 'ajudar', 'o que voce faz', 'funcionalidades', 'comando', 'help']
        if any(word in message_lower for word in help_keywords):
            return """🤖 **Como posso ajudar:**
            
📊 **Estatísticas:** "Quais são as estatísticas gerais?"
👥 **Turmas:** "Me fale sobre a turma INT 1"
👤 **Alunos:** "Me fale sobre o aluno [nome]"
📅 **Reposições:** "Quantas reposições temos em março?"
👨‍🏫 **Professores:** "Quais professores temos?"
            
Sou especializado nos dados da escola Maikito-san e uso informações reais dos nossos sistemas!"""
        
        # Resposta padrão
        return f"""🤔 Não entendi completamente sua pergunta. 

Tente uma dessas opções:
📊 "Quais são as estatísticas gerais?"
👥 "Me fale sobre a turma INT 1"
📅 "Quantas reposições temos em março?"
👨‍🏫 "Quais professores temos?"
🆘 "Ajuda"

Ou seja mais específico sobre alunos, turmas ou datas que terei prazer em ajudar!"""

# Inicializar chatbot
chatbot = SimpleChatbot(data_processor)

# HTML template
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🤖 Chat Maikito-san IA</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .chat-container {
            width: 90%;
            max-width: 800px;
            height: 80vh;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .chat-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        
        .chat-header h1 {
            font-size: 1.5em;
            margin-bottom: 5px;
        }
        
        .chat-header p {
            opacity: 0.9;
            font-size: 0.9em;
        }
        
        .chat-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: #f8f9fa;
        }
        
        .message {
            margin-bottom: 15px;
            display: flex;
            align-items: flex-start;
        }
        
        .message.user {
            justify-content: flex-end;
        }
        
        .message-content {
            max-width: 70%;
            padding: 12px 16px;
            border-radius: 18px;
            word-wrap: break-word;
        }
        
        .message.user .message-content {
            background: #667eea;
            color: white;
            border-bottom-right-radius: 4px;
        }
        
        .message.bot .message-content {
            background: white;
            color: #333;
            border: 1px solid #e1e5e9;
            border-bottom-left-radius: 4px;
        }
        
        .chat-input {
            padding: 20px;
            background: white;
            border-top: 1px solid #e1e5e9;
        }
        
        .input-container {
            display: flex;
            gap: 10px;
        }
        
        #messageInput {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid #e1e5e9;
            border-radius: 25px;
            font-size: 16px;
            outline: none;
            transition: border-color 0.3s;
        }
        
        #messageInput:focus {
            border-color: #667eea;
        }
        
        #sendButton {
            padding: 12px 24px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            transition: background 0.3s;
        }
        
        #sendButton:hover {
            background: #5a6fd8;
        }
        
        #sendButton:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        .typing-indicator {
            display: none;
            padding: 10px;
            color: #666;
            font-style: italic;
        }
        
        .examples {
            padding: 15px;
            background: #f0f2f5;
            border-radius: 10px;
            margin-bottom: 10px;
        }
        
        .example-btn {
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 8px 12px;
            margin: 5px;
            cursor: pointer;
            font-size: 0.9em;
            transition: all 0.3s;
        }
        
        .example-btn:hover {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
        
        @media (max-width: 768px) {
            .chat-container {
                width: 95%;
                height: 90vh;
            }
            
            .message-content {
                max-width: 85%;
            }
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            <h1>🤖 Chat Maikito-san IA</h1>
            <p>Assistente inteligente com dados da escola</p>
        </div>
        
        <div class="chat-messages" id="chatMessages">
            <div class="examples">
                <div style="margin-bottom: 10px; font-weight: bold;">💡 Exemplos:</div>
                <button class="example-btn" onclick="sendExample('Quais são as estatísticas gerais da escola?')">📊 Estatísticas gerais</button>
                <button class="example-btn" onclick="sendExample('Me fale sobre a turma INT 1')">👥 Turma INT 1</button>
                <button class="example-btn" onclick="sendExample('Quantas reposições temos em março?')">📅 Reposições março</button>
                <button class="example-btn" onclick="sendExample('Quais professores temos na escola?')">👨‍🏫 Professores</button>
            </div>
        </div>
        
        <div class="typing-indicator" id="typingIndicator">🤔 Digitando...</div>
        
        <div class="chat-input">
            <div class="input-container">
                <input type="text" id="messageInput" placeholder="Digite sua pergunta..." onkeypress="handleKeyPress(event)">
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
            messageContent.innerHTML = content;
            
            messageDiv.appendChild(messageContent);
            messagesContainer.appendChild(messageContent);
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
                addMessage('❌ Desculpe, ocorreu um erro. Tente novamente.', false);
            }
        }
        
        function sendExample(message) {
            document.getElementById('messageInput').value = message;
            sendMessage();
        }
        
        function handleKeyPress(event) {
            if (event.key === 'Enter') {
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
    print("🚀 Iniciando servidor web simplificado...")
    print("📱 Acesse: http://localhost:5000")
    print("🌐 Ou via dashboard: http://localhost:8080/chatbot.html")
    print("\n⚠️  Pressione Ctrl+C para parar o servidor")
    print("-" * 50)
    
    app.run(host='127.0.0.1', port=5000, debug=False)
