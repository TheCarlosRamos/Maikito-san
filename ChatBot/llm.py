"""
llm.py
Responsável pela geração da resposta final usando Gemma,
a partir do contexto recuperado pelo RAG.
"""

import google.generativeai as genai
import os
from typing import List

# ===============================
# Configuração do Google AI
# ===============================

def configure_llm():
    api_key = os.getenv("GOOGLE_API_KEY", "AIzaSyDLQ4bW0sG0_JGfhVCaTU8nzH2HpcBVY6c")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY não configurada")

    genai.configure(api_key=api_key)

# ===============================
# Classe LLM
# ===============================

class GemmaLLM:
    def __init__(self, model_name: str = "models/gemma-3-4b-it"):
        configure_llm()

        self.model = genai.GenerativeModel(
            model_name=model_name,
            generation_config={
                "temperature": 0.1,      # muito baixo = mais factual
                "top_p": 0.8,           # mais focado no contexto
                "max_output_tokens": 800,  # mais espaço para respostas detalhadas
                "candidate_count": 1       # uma resposta por vez
            }
        )

    def build_prompt(self, question: str, context_chunks: List[str]) -> str:
        """
        Prompt RAG: força a resposta a usar SOMENTE o contexto.
        """
        context = "\n".join(
            f"- {chunk}" for chunk in context_chunks
        )

        return f"""
Você é um assistente educacional especialista da Maikito-san.
Seu objetivo é analisar cuidadosamente os dados fornecidos e responder EXATAMENTE o que foi perguntado, usando SOMENTE as informações disponíveis.

INSTRUÇÕES ESPECÍFICAS:
1. FOCO TOTAL: Responda APENAS à pergunta feita, não invente informações
2. CONTEXTO OBRIGATÓRIO: Use TODOS os dados relevantes fornecidos
3. SE NÃO TIVER DADOS: Diga "Não encontrei informações sobre [tópico] nos dados disponíveis"
4. FORMATAÇÃO: Use emojis, bullet points (•) e parágrafos claros
5. OBJETIVIDADE: Seja direto, útil e informativo

ANÁLISE NECESSÁRIA:
- Identifique o tipo de pergunta (aluno, turma, datas, estatísticas)
- Extraia informações relevantes dos dados fornecidos
- Agrupe informações relacionadas
- Forneça números e dados específicos quando disponíveis

### DADOS DISPONÍVEIS PARA ANÁLISE
{context}

### PERGUNTA ESPECÍFICA
{question}

### RESPOSTA BASEADA NOS DADOS:
"""

    def generate_answer(self, question: str, context_chunks: List[str]) -> str:
        """
        Gera a resposta final usando Gemma.
        """
        prompt = self.build_prompt(question, context_chunks)

        response = self.model.generate_content(prompt)

        return response.text.strip()