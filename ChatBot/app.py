import gradio as gr
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from huggingface_hub import login
import os
from data_processor import DataProcessor

# === LOGIN HF ===
HF_TOKEN = os.getenv("HF_TOKEN")
if HF_TOKEN:
    login(token=HF_TOKEN)
    print("Logado no Hugging Face!")

# === MODELO GEMMA ===
model_name = "google/gemma-2-2b-it"
print("Carregando Gemma 2B...")

quantization_config = BitsAndBytesConfig(load_in_4bit=True)
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    device_map="auto",
    torch_dtype=torch.bfloat16,
    quantization_config=quantization_config
)
print("Modelo carregado!")

# === PROCESSADOR DE DADOS ===
print("Inicializando processador de dados...")
data_processor = DataProcessor()
context_summary = data_processor.get_context_summary()
print("✅ Processador de dados inicializado!")

# === HISTÓRICO ===
chat_history = []

def chatbot_with_data(message, history):
    global chat_history
    chat_history.append({"role": "user", "content": message})
    
    # Verificar se a pergunta é sobre dados específicos
    message_lower = message.lower()
    context_data = ""
    
    # Buscar informações específicas baseado na pergunta
    if "aluno" in message_lower and "chama" in message_lower:
        # Extrair nome do aluno (simplificado)
        words = message.split()
        for i, word in enumerate(words):
            if word.lower() in ["aluno", "aluna"] and i + 1 < len(words):
                student_name = " ".join(words[i+1:])
                context_data = data_processor.get_student_info(student_name)
                break
    
    elif "turma" in message_lower:
        # Extrair nome da turma
        words = message.split()
        for i, word in enumerate(words):
            if word.lower() == "turma" and i + 1 < len(words):
                turma_name = " ".join(words[i+1:])
                context_data = data_processor.get_turma_info(turma_name)
                break
    
    elif "estatística" in message_lower or "estatisticas" in message_lower or "dados" in message_lower:
        context_data = data_processor.get_statistics()
    
    # Construir prompt com contexto dos dados
    system_prompt = f"""Você é um assistente especialista em dados da escola Maikito-san. 
Use as seguintes informações para responder às perguntas:

{context_summary}

{context_data}

Responda de forma clara, concisa e útil. Se não encontrar a informação nos dados, diga que não encontrou."""
    
    # Adicionar o prompt do sistema ao início do histórico
    full_history = [{"role": "system", "content": system_prompt}] + chat_history
    
    prompt = "".join([
        f"<start_of_turn>{turn['role']}\n{turn['content']}<end_of_turn>\n"
        for turn in full_history
    ]) + "<start_of_turn>model\n"
    
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    outputs = model.generate(
        **inputs,
        max_new_tokens=200,        # Aumentado para respostas mais detalhadas
        temperature=0.3,          # Reduzido para respostas mais precisas
        do_sample=True,
        top_p=0.9,
        repetition_penalty=1.1,
        pad_token_id=tokenizer.eos_token_id
    )
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    bot_response = response.split("<start_of_turn>model\n")[-1].split("<end_of_turn>")[0].strip()
    
    chat_history.append({"role": "assistant", "content": bot_response})
    
    return [(turn["content"], None) if turn["role"] == "user" else (None, turn["content"]) for turn in chat_history]

# === INTERFACE ===
with gr.Blocks(title="Chat Maikito-san IA") as demo:
    gr.Markdown("# 🤖 Chat Maikito-san IA")
    gr.Markdown("### Assistente inteligente com dados da escola")
    gr.Markdown("Posso responder perguntas sobre alunos, turmas, reposições e estatísticas!")

    gr.ChatInterface(
        fn=chatbot_with_data,
        examples=[
            "Quais são as estatísticas gerais da escola?",
            "Me fale sobre a turma INT 1",
            "Quantas reposições temos em março?",
            "Quem são os alunos da turma KIDS?",
            "Me mostre os dados organizados",
            "Quais professores temos na escola?"
        ]
    )

demo.launch(server_name="0.0.0.0", server_port=7860)