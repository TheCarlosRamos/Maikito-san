from embedding_processor import EmbeddingProcessor
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

        # 🔹 Busca semântica real
        results = self.embedding_processor.search_similar(
            query=message,
            top_k=5,
            origem=origem
        )

        if not results:
            return (
                "Não encontrei dados suficientes.\n\n"
                "Tente incluir nome do aluno, turma ou período."
            )

        return self.format_response(results)

    def format_response(self, results):
        response = "✅ **Resultados encontrados:**\n\n"

        for i, r in enumerate(results, 1):
            score = r["score"] * 100
            texto = r["texto"]
            meta = r["metadata"]

            response += f"**{i}. ({score:.0f}%)** {texto}\n"

            extras = []
            for key in ["aluno", "turma", "data", "hora"]:
                if meta.get(key):
                    extras.append(f"{key.capitalize()}: {meta[key]}")

            if extras:
                response += "🧾 " + " | ".join(extras) + "\n"

            response += "\n"

        response += "_Resposta gerada via busca semântica (Gemini Embeddings)._"
        return response
