"""
chat_engine_rag.py
Motor RAG completo com LLM Gemma
"""
from embedding_processor_memory import EmbeddingProcessor
from llm import GemmaLLM
from router import IntentRouter
from memory import SessionMemory
import unicodedata

class ChatEngineRAG:
    def __init__(self):
        self.embedding_processor = EmbeddingProcessor()
        self.llm = GemmaLLM()
        self.router = IntentRouter()
        self.memory = SessionMemory()
        
        print("🧠 ChatEngine RAG inicializado com:")
        print("  - ChromaDB (1.100+ documentos)")
        print("  - Gemma LLM (Google AI)")
        print("  - Router de Intenções")
        print("  - Memória de Sessão")

    def normalize(self, text: str) -> str:
        return unicodedata.normalize(
            "NFKD", text.lower()
        ).encode("ascii", "ignore").decode("ascii")

    def respond(self, message: str, session_id: int) -> str:
        """Resposta completa RAG"""
        message_norm = self.normalize(message)
        session = self.memory.get(session_id)

        # 🔹 1. Roteamento de intenção
        intent = self.router.route(message)
        self.memory.update(session_id, ultima_intencao=intent)

        # 🔹 2. Recuperação de contexto (RAG)
        context_results = self.embedding_processor.search_similar(
            query=message,
            top_k=5,
            origem="reposicoes" if intent == "reposicoes" else None
        )

        if not context_results:
            return (
                "❌ Não encontrei informações relevantes.\n\n"
                "Tente perguntas como:\n"
                "• 'Quais reposições em março?'\n"
                "• 'Me fale sobre Gabriela'\n"
                "• 'Quem são os alunos da INT 1?'\n"
            )

        # 🔹 3. Extração de contexto
        context_chunks = [result["texto"] for result in context_results]
        
        # 🔹 4. Geração de resposta com LLM
        try:
            response = self.llm.generate_answer(message, context_chunks)
            
            # 🔹 5. Formatação final
            formatted_response = self.format_rag_response(
                response=response,
                context_results=context_results,
                original_query=message,
                intent=intent
            )
            
            return formatted_response
            
        except Exception as e:
            print(f"❌ Erro no LLM: {e}")
            return self.format_fallback_response(context_results, message)

    def format_rag_response(self, response: str, context_results: list, original_query: str, intent: str):
        """Formata resposta RAG completa"""
        formatted = f"🤖 **Resposta RAG para:** _{original_query}_\n\n"
        formatted += f"**Intenção detectada:** {intent}\n\n"
        formatted += f"**Resposta Gerada:**\n{response}\n\n"
        formatted += "---\n\n"
        formatted += "📚 **Fontes Usadas:**\n"
        
        for i, result in enumerate(context_results[:3], 1):
            score = result["score"] * 100
            texto = result["texto"]
            meta = result["metadata"]
            
            formatted += f"**{i}. ({score:.0f}% Match)** {texto}\n"
            
            # Metadados relevantes
            extras = []
            if meta.get("aluno"):
                extras.append(f"Aluno: {meta['aluno']}")
            if meta.get("turma"):
                extras.append(f"Turma: {meta['turma']}")
            if meta.get("data"):
                extras.append(f"Data: {meta['data']}")
            
            if extras:
                formatted += f"🧾 {' | '.join(extras)}\n"
            
            formatted += "\n"
        
        formatted += (
            "\n✅ _Resposta gerada por RAG + Gemma LLM_\n"
            f"📊 Contexto recuperado: {len(context_results)} documentos\n"
            f"🧠 Modelo: Gemma-2B (Google AI)\n"
            f"🔍 Busca semântica: ChromaDB"
        )
        
        return formatted

    def format_fallback_response(self, context_results: list, original_query: str):
        """Resposta de fallback quando LLM falha"""
        formatted = f"🔍 **Resultados para:** _{original_query}_\n\n"
        formatted += "⚠️ **Usando modo de busca direta (LLM indisponível)**\n\n"
        
        for i, result in enumerate(context_results, 1):
            score = result["score"] * 100
            texto = result["texto"]
            meta = result["metadata"]
            
            formatted += f"**{i}. ({score:.0f}% Match)** {texto}\n"
            
            extras = []
            if meta.get("aluno"):
                extras.append(f"Aluno: {meta['aluno']}")
            if meta.get("turma"):
                extras.append(f"Turma: {meta['turma']}")
            if meta.get("data"):
                extras.append(f"Data: {meta['data']}")
            
            if extras:
                formatted += f"🧾 {' | '.join(extras)}\n"
            
            formatted += "\n"
        
        formatted += (
            "\n📝 Configure a API Key do Google AI para respostas com IA.\n"
            "Atualmente usando busca semântica sem geração de linguagem."
        )
        
        return formatted
