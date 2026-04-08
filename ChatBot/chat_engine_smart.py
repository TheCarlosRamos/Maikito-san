"""
chat_engine_smart.py
Chat engine inteligente com documentos agregados e intent router
"""

from llm import GemmaLLM
from memory import SessionMemory
from embedding_processor_smart import SmartEmbeddingProcessor
from intent_router import route_intent

class SmartChatEngine:
    def __init__(self):
        print("🚀 Inicializando SmartChatEngine...")
        
        # Componentes
        self.embedding_processor = SmartEmbeddingProcessor()
        self.llm = GemmaLLM()
        self.memory = SessionMemory()
        
        print("✅ SmartChatEngine pronto!")

    def respond(self, question: str, session_id: int = 0) -> str:
        """
        Gera resposta inteligente usando todos os componentes
        """
        try:
            print(f"\n🔍 Processando pergunta: '{question}'")
            
            # 1. Identificar intenção
            intent_info = route_intent(question)
            print(f"🎯 Intenção: {intent_info['intent']} | Estratégia: {intent_info['strategy']}")
            
            # 2. Atualizar memória
            self.memory.update(session_id, 
                ultima_pergunta=question,
                ultima_intencao=intent_info["intent"],
                entity=intent_info.get("entity"),
                timestamp=__import__("datetime").datetime.now().isoformat()
            )
            
            # 3. Buscar contexto inteligente
            context_chunks = self.embedding_processor.get_context_chunks(
                question, 
                max_chunks=5 if intent_info["strategy"] == "rag" else 3
            )
            
            print(f"📚 Contexto encontrado: {len(context_chunks)} chunks")
            
            # 4. Gerar resposta com LLM
            if context_chunks:
                response = self.llm.generate_answer(question, context_chunks)
            else:
                response = "❌ Não encontrei informações sobre este tema nos dados disponíveis."
            
            # 5. Adicionar metadados da resposta
            response += f"\n\n_🔍 Resposta gerada via busca inteligente ({intent_info['intent']})_"
            
            return response
            
        except Exception as e:
            print(f"❌ Erro no SmartChatEngine: {e}")
            return f"❌ Ocorreu um erro ao processar sua pergunta: {str(e)}"

    def format_response(self, results: list) -> str:
        """
        Formata resultados para exibição
        """
        if not results:
            return "❌ Nenhum resultado encontrado."
        
        response = "✅ **Resultados encontrados:**\n\n"
        
        for i, result in enumerate(results, 1):
            score = result.get("score", 0) * 100
            texto = result.get("texto", "")
            metadata = result.get("metadata", {})
            
            response += f"**{i}. ({score:.0f}%)** {texto}\n"
            
            # Adicionar informações relevantes
            extras = []
            if metadata.get("tipo") == "professor":
                extras.append(f"Professor: {metadata.get('professor', '')}")
                extras.append(f"Turmas: {metadata.get('turmas', '')}")
            elif metadata.get("tipo") == "turma":
                extras.append(f"Categoria: {metadata.get('categoria', '')}")
                extras.append(f"Turmas: {metadata.get('turmas', '')}")
            elif metadata.get("tipo") == "resumo_reposicoes":
                extras.append(f"Mês: {metadata.get('mes', '')}")
                extras.append(f"Quantidade: {metadata.get('quantidade', '')}")
            elif metadata.get("origem") == "reposicoes":
                extras.append(f"Aluno: {metadata.get('aluno', '')}")
                extras.append(f"Turma: {metadata.get('turma', '')}")
                extras.append(f"Data: {metadata.get('data', '')}")
            
            if extras:
                response += "🧾 " + " | ".join(extras) + "\n"
            
            response += "\n"
        
        response += "_🔍 Busca inteligente com documentos agregados._"
        return response

    def get_session_info(self, session_id: int = 0) -> dict:
        """Retorna informações da sessão"""
        return self.memory.get(session_id)

    def clear_session(self, session_id: int = 0):
        """Limpa memória da sessão"""
        self.memory.clear(session_id)
