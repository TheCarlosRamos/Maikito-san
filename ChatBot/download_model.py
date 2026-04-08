from huggingface_hub import hf_hub_download
import os

MODEL_REPO = "bartowski/gemma-2-2b-it-GGUF"
MODEL_FILE = "gemma-2-2b-it-Q4_K_M.gguf"
LOCAL_DIR = "./models"

print(f"Baixando {MODEL_FILE} de {MODEL_REPO}...")
print("Isso pode levar alguns minutos (aprox 1.5GB).")

if not os.path.exists(LOCAL_DIR):
    os.makedirs(LOCAL_DIR)

model_path = hf_hub_download(
    repo_id=MODEL_REPO,
    filename=MODEL_FILE,
    local_dir=LOCAL_DIR,
    local_dir_use_symlinks=False
)

print(f"\nModelo salvo em: {model_path}")
print("Configuração concluída!")
