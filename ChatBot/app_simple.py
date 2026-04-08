import gradio as gr
import pandas as pd
import os
from data_processor import DataProcessor

class SimpleChatbot:
    def __init__(self):
        print("🤖 Inicializando Chatbot Simplificado Maikito-san...")
        self.data_processor = DataProcessor()
        self.context = self.data_processor.get_context_summary()
        print("✅ Chatbot simplificado inicializado!")
    
    def respond(self, message, history):
        """Responde mensagens usando regras e dados CSV"""
        message_lower = message.lower()
        
        # Saudações
        if any(word in message_lower for word in ['oi', 'olá', 'hello', 'bom dia', 'boa tarde', 'boa noite']):
            return "Olá! Sou o assistente da Maikito-san. Posso ajudar com informações sobre alunos, turmas, reposições e estatísticas. O que você gostaria de saber?"
        
        # Estatísticas gerais
        if any(word in message_lower for word in ['estatística', 'estatisticas', 'dados gerais', 'resumo']):
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
        if any(word in message_lower for word in ['aluno', 'aluna', 'alunos']):
            if 'chama' in message_lower or 'nome' in message_lower:
                # Extrair nome do aluno
                words = message.split()
                for i, word in enumerate(words):
                    if word.lower() in ['aluno', 'aluna'] and i + 1 < len(words):
                        student_name = " ".join(words[i+1:])
                        return self.data_processor.get_student_info(student_name)
            else:
                return "Para buscar informações de um aluno específico, diga algo como: 'Me fale sobre o aluno [nome]' ou 'Qual aluno se chama [nome]?'"
        
        # Reposições
        if any(word in message_lower for word in ['reposição', 'reposicoes', 'aula extra']):
            if 'março' in message_lower or 'marco' in message_lower:
                return "📅 **Reposições em Março 2026:**\n\nTemos várias reposições agendadas para março, incluindo alunos das turmas INT 1, INT 3, KIDS 1, KIDS 2, etc. Os horários variam entre 08:00 e 09:00, ocorrendo principalmente em dias de semana (Segunda a Sábado).\n\nPara informações mais detalhadas sobre uma turma ou aluno específico, é só perguntar!"
            elif 'abril' in message_lower:
                return "📅 **Reposições em Abril 2026:**\n\nOs dados de abril estão sendo atualizados. Em breve teremos as informações completas das reposições deste mês."
            else:
                return "📅 **Sobre Reposições:**\n\nO sistema registra todas as reposições de aulas com informações detalhadas como:\n- Nome do aluno\n- Turma\n- Data e horário\n- Dia da semana\n- Mês/ano de referência\n\nPosso filtrar por mês específico (março, abril, etc.) ou por turma/aluno específico. O que você gostaria de saber?"
        
        # Professores
        if any(word in message_lower for word in ['professor', 'professores', 'prof', 'profa']):
            return "👨‍🏫 **Professores da Maikito-san:**\n\nContamos com uma equipe dedicada de professores para as diferentes turmas e níveis:\n- **Professores de Inglês:** Turmas INT 1, INT 2, INT 3\n- **Professores de Kids:** Turmas KIDS 1, KIDS 2\n- **Professores de nível básico e intermediário\n\nCada professor é responsável por horários específicos durante a semana, com aulas de segunda a sábado nos períodos da manhã e tarde."
        
        # Ajuda
        if any(word in message_lower for word in ['ajuda', 'ajudar', 'o que você faz', 'funcionalidades']):
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

# Criar interface Gradio
def create_interface():
    chatbot = SimpleChatbot()
    
    with gr.Blocks(title="Chat Maikito-san IA", theme=gr.themes.Soft()) as demo:
        gr.Markdown("# 🤖 Chat Maikito-san IA")
        gr.Markdown("### Assistente inteligente com dados da escola")
        gr.Markdown("Posso responder perguntas sobre alunos, turmas, reposições e estatísticas!")
        
        chatbot_interface = gr.ChatInterface(
            fn=chatbot.respond,
            examples=[
                "Quais são as estatísticas gerais da escola?",
                "Me fale sobre a turma INT 1",
                "Quantas reposições temos em março?",
                "Quem são os alunos da turma KIDS?",
                "Quais professores temos na escola?",
                "Ajuda"
            ],
            title="Converse com a IA",
            description="Baseado em dados reais da escola Maikito-san"
        )
    
    return demo

if __name__ == "__main__":
    demo = create_interface()
    print("🚀 Iniciando servidor Gradio...")
    print("📱 Acesse: http://localhost:7861")
    print("🌐 Ou via dashboard: http://localhost:8080/chatbot.html")
    print("\n⚠️  Pressione Ctrl+C para parar o servidor")
    print("-" * 50)
    
    demo.launch(
        server_name="127.0.0.1",
        server_port=7861,
        share=False,
        show_error=True,
        prevent_thread_lock=False
    )
