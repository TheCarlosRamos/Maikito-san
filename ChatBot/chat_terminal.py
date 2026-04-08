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
print("Modelo carregado! Digite 'sair' para parar.\n")

while True:
    msg = input("Você: ")
    if msg.lower() in ["sair", "exit", "quit"]:
        print("Tchau! 👋")
        break
    
    print("Gemma: Processando...", end="")
    inputs = tokenizer(msg, return_tensors="pt")
    outputs = model.generate(
        **inputs,
        max_new_tokens=100,
        temperature=0.5,
        do_sample=True,
        top_p=0.9,
        repetition_penalty=1.1
    )
    resposta = tokenizer.decode(outputs[0], skip_special_tokens=True)
    print("\rGemma: " + resposta[len(msg):].strip() + "\n")