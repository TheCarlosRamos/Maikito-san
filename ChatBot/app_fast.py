import gradio as gr
from llama_cpp import Llama
import os

# CONFIGURAÇÃO DE PROXY (CRÍTICO PARA REDES CORPORATIVAS)
os.environ["NO_PROXY"] = "localhost,127.0.0.1,0.0.0.0"
os.environ["no_proxy"] = "localhost,127.0.0.1,0.0.0.0"

MODEL_PATH = "./models/gemma-2-2b-it-Q4_K_M.gguf"

print("Carregando Gemma 2B (GGUF)...")

if not os.path.exists(MODEL_PATH):
    print(f"ERRO: Modelo não encontrado em {MODEL_PATH}")
    print("Execute 'python download_model.py' primeiro!")
    exit(1)

llm = Llama(
    model_path=MODEL_PATH,
    n_ctx=4096,
    verbose=False
)

def chat(message, history):
    # Construir prompt com histórico limitado para caber no contexto
    prompt = ""
    for turn in history[-5:]: # Mantém últimas 5 trocas
        prompt += f"<start_of_turn>user\n{turn[0]}<end_of_turn>\n"
        prompt += f"<start_of_turn>model\n{turn[1]}<end_of_turn>\n"
    
    prompt += f"<start_of_turn>user\n{message}<end_of_turn>\n<start_of_turn>model\n"
    
    output = llm(
        prompt,
        max_tokens=300,
        stop=["<end_of_turn>"],
        echo=False,
        temperature=0.7
    )
    
    return output['choices'][0]['text'].strip()

# Interface
gr.ChatInterface(
    fn=chat,
    title="Chat Presidencial",
    description=" ",
    examples=["Me conte uma piada.", "Resuma o que é Inteligência Artificial."]
).launch(
    server_name="127.0.0.1",
    server_port=7860
)
