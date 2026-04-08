import google.generativeai as genai
import os

# Configurar API
api_key = os.getenv("GOOGLE_API_KEY", "AIzaSyDLQ4bW0sG0_JGfhVCaTU8nzH2HpcBVY6c")
genai.configure(api_key=api_key)

# Listar modelos disponíveis
print("🔍 Verificando modelos disponíveis...")
try:
    models = genai.list_models()
    
    print("\n📋 Modelos disponíveis:")
    for model in models:
        if "gemma" in model.name.lower():
            print(f"  ✅ {model.name} - {model.display_name}")
    
    print(f"\n📊 Total de modelos: {len(models)}")
    
except Exception as e:
    print(f"❌ Erro ao listar modelos: {e}")
