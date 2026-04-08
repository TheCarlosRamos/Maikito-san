#!/usr/bin/env python3
"""
Chatbot Maikito-san
Versão RAG com Gemini Embeddings + ChromaDB
"""

from flask import Flask, request, jsonify
import unicodedata
from embedding_processor import EmbeddingProcessor

app = Flask(__name__)

print("🔹 Inicializando Chatbot Maikito-san (RAG + Embeddings)...")
embedding_processor = EmbeddingProcessor()
print("✅ Sistema pronto!")

# ===============================
# Chatbot
# ===============================

class EmbeddingChatbot:
    def __init__(self, embedding_processor):
        self.embedding_processor = embedding_processor

    def normalize(self, text: str) -> str:
        return unicodedata.normalize(
            "NFKD", text.lower()
        ).encode("ascii", "ignore").decode("ascii")

    def respond(self, message: str) -> str:
        message = message.strip()
        if not message:
            return "Por favor, envie uma pergunta válida."

        message_norm = self.normalize(message)

        # Saudações
        if any(greet in message_norm for greet in ["oi", "ola", "bom dia", "boa tarde", "boa noite", "hello"]):
            return (
                "Olá! 👋 Sou o assistente da Maikito-san.\n\n"
                "Posso responder perguntas sobre:\n"
                "- reposições de aula\n"
                "- alunos\n"
                "- turmas\n"
                "- horários\n\n"
                "Exemplo:\n"
                "• 'O aluno Marcus Vinicius tem reposição?'"
            )

        # 🔹 Roteamento simples por intenção
        origem = None
        if "reposi" in message_norm:
            origem = "reposicoes"
        elif any(k in message_norm for k in ["turma", "aula", "horario", "int", "kids"]):
            origem = "organized"

        # 🔹 Busca semântica real
        results = self.embedding_processor.search_similar(
            query=message,
            top_k=5,
            origem=origem
        )

        if not results:
            return (
                "Não encontrei informações suficientes para responder.\n\n"
                "Tente ser mais específico, por exemplo:\n"
                "• nome do aluno\n"
                "• turma\n"
                "• mês\n"
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
            "✅ _Busca feita com embeddings semânticos (Gemini)_\n"
            "Se quiser, posso refinar por data, aluno ou turma."
        )

        return response


chatbot = EmbeddingChatbot(embedding_processor)

# ===============================
# Rotas Flask
# ===============================

@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.get_json()
        message = data.get("message", "")
        response = chatbot.respond(message)
        return jsonify({"response": response})
    except Exception as e:
        print("❌ Erro:", e)
        return jsonify({"error": "Erro interno"}), 500


@app.route("/")
def home():
    return """
    <h2>Chatbot Maikito-san (RAG + Embeddings)</h2>
    <p>Use POST em <code>/chat</code> com JSON:</p>
    <pre>{ "message": "sua pergunta" }</pre>
    """


if __name__ == "__main__":
    print("🚀 Servidor iniciado em http://127.0.0.1:5002")
    app.run(host="127.0.0.1", port=5002, debug=False)