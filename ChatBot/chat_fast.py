from llama_cpp import Llama

MODEL_PATH = "./models/gemma-2-2b-it-Q4_K_M.gguf"

print("Carregando Gemma 2B (GGUF) na CPU...")
try:
    llm = Llama(
        model_path=MODEL_PATH,
        # n_gpu_layers=0, # 0 para CPU, aumentar se tiver GPU
        n_ctx=2048,       # Contexto
        verbose=False
    )
    print("Modelo carregado! Digite 'sair' para parar.\n")
except Exception as e:
    print(f"Erro ao carregar modelo: {e}")
    print(f"Verifique se o arquivo existe em {MODEL_PATH}")
    print("Execute: python download_model.py")
    exit(1)

while True:
    msg = input("Você: ")
    if msg.lower() in ["sair", "exit", "quit"]:
        print("Tchau! 👋")
        break
    
    # Formato do prompt para Gemma
    prompt = f"<start_of_turn>user\n{msg}<end_of_turn>\n<start_of_turn>model\n"
    
    print("Gemma: ", end="", flush=True)
    output = llm(
        prompt,
        max_tokens=200,
        stop=["<end_of_turn>"],
        echo=False
    )
    
    resposta = output['choices'][0]['text']
    print(resposta.strip() + "\n")
