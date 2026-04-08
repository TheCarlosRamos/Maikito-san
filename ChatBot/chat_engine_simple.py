from embedding_processor_simple import EmbeddingProcessor
import unicodedata

class ChatEngine:
    def __init__(self):
        self.embedding_processor = EmbeddingProcessor()
        self.sessions = {}

    def normalize(self, text: str) -> str:
        return unicodedata.normalize(
            "NFKD", text.lower()
        ).encode("ascii", "ignore").decode("ascii")

    def get_session(self, session_id):
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "last_student": None,
                "last_turma": None
            }
        return self.sessions[session_id]

    def clear_session(self, session_id):
        if session_id in self.sessions:
            del self.sessions[session_id]

    def respond(self, message: str, session_id: int) -> str:
        message_norm = self.normalize(message)
        session = self.get_session(session_id)

        # 🔹 Roteamento simples
        origem = None
        if "reposi" in message_norm:
            origem = "reposicoes"
        elif any(k in message_norm for k in ["turma", "aula", "int", "kids"]):
            origem = "organized"

        # 🔹 Busca semântica simulada
        results = self.embedding_processor.search_similar(
            query=message,
            top_k=5,
            origem=origem
        )

        if not results:
            return (
                "Não encontrei dados suficientes.\n\n"
                "Tente incluir nome do aluno, turma ou período.\n\n"
                "Exemplos:\n"
                "• 'Gabriela'\n"
                "• 'INT 1'\n"
                "• 'março'\n"
            )

        return self.format_response(results, message)

    def format_response(self, results, original_query):
        response = f"🔎 **Resultados para:** _{original_query}_\n\n"

        for i, r in enumerate(results, 1):
            texto = r["texto"]
            score = r["score"] * 100
            meta = r["metadata"]

            response += f"**{i}. ({score:.0f}%)** {texto}\n"

            # Metadados úteis
            extras = []
            if meta.get("aluno"):
                extras.append(f"Aluno: {meta['aluno']}")
            if meta.get("turma"):
                extras.append(f"Turma: {meta['turma']}")
            if meta.get("data"):
                extras.append(f"Data: {meta['data']}")
            if meta.get("hora"):
                extras.append(f"Hora: {meta['hora']}")

            if extras:
                response += "🧾 " + " | ".join(extras) + "\n"

            response += "\n"

        response += (
            "✅ _Busca feita com inteligência semântica simulada_\n"
            "Encontrei informações relevantes usando análise de texto e correspondência aproximada.\n\n"
            "Para resultados mais precisos, configure a API Key do Google AI."
        )

        return response
