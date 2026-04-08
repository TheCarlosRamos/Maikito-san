import gradio as gr
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
import torch

print("Carregando Gemma 2B (4-bit) na CPU...")

tokenizer = AutoTokenizer.from_pretrained("google/gemma-2-2b-it")
model = AutoModelForCausalLM.from_pretrained(
    "google/gemma-2-2b-it",
    device_map="cpu",
    torch_dtype=torch.bfloat16,
    quantization_config=BitsAndBytesConfig(load_in_4bit=True)
)
print("Modelo carregado! Respostas em 3-8 segundos.")

def chat(message, history):
    inputs = tokenizer(message, return_tensors="pt")
    outputs = model.generate(
        **inputs,
        max_new_tokens=20,
        temperature=0.5,
        do_sample=True,
        top_p=0.9,
        repetition_penalty=1.1
    )
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

# === RODAR LOCALMENTE (SEM INTERNET) ===
gr.ChatInterface(
    fn=chat,
    title="Chat Presidencial com Gemma (Local)",
    description="Rodando na sua AMD Ryzen 5 PRO!",
    examples=["Me conte uma piada.", "Quem é o presidente?"]
).launch(
    share=False,           # SEM TÚNEL PÚBLICO
    server_name="127.0.0.1",
    server_port=7860
)