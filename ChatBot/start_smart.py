"""
start_smart.py
Script para iniciar o chatbot inteligente com verificação de dependências
"""

import sys
import os
import subprocess
import importlib

def check_dependencies():
    """Verifica dependências necessárias"""
    print("🔍 Verificando dependências...")
    
    required_packages = [
        "fastapi",
        "uvicorn",
        "pandas",
        "chromadb",
        "google-generativeai",
        "websockets"
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == "google-generativeai":
                importlib.import_module("google.generativeai")
            else:
                importlib.import_module(package)
            print(f"✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package}")
    
    if missing_packages:
        print(f"\n📦 Instalando pacotes faltantes: {missing_packages}")
        subprocess.check_call([
            sys.executable, "-m", "pip", "install"
        ] + missing_packages)
        print("✅ Pacotes instalados!")
    else:
        print("✅ Todas as dependências estão OK!")

def check_files():
    """Verifica arquivos necessários"""
    print("\n📁 Verificando arquivos...")
    
    required_files = [
        "../tabelas/csv_pronto_embeddings.csv",
        "csv_documentos_agregados.csv",
        "embedding_processor_smart.py",
        "chat_engine_smart.py",
        "main_smart.py",
        "intent_router.py",
        "llm.py",
        "memory.py"
    ]
    
    missing_files = []
    
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path}")
        else:
            missing_files.append(file_path)
            print(f"❌ {file_path}")
    
    if missing_files:
        print(f"\n❌ Arquivos faltantes: {missing_files}")
        return False
    
    return True

def check_api_key():
    """Verifica API Key"""
    print("\n🔑 Verificando API Key...")
    
    api_key = os.getenv("GOOGLE_API_KEY")
    if api_key:
        print(f"✅ API Key encontrada (primeiros 10 chars: {api_key[:10]}...)")
        return True
    else:
        print("⚠️ GOOGLE_API_KEY não encontrada no ambiente")
        print("🔧 Usando fallback configurado no código")
        return True  # Tem fallback no código

def generate_aggregated_if_needed():
    """Gera documentos agregados se necessário"""
    if not os.path.exists("csv_documentos_agregados.csv"):
        print("\n📋 Gerando documentos agregados...")
        try:
            subprocess.check_call([sys.executable, "aggregate_documents.py"])
            print("✅ Documentos agregados gerados!")
        except Exception as e:
            print(f"❌ Erro ao gerar documentos: {e}")
            return False
    else:
        print("✅ Documentos agregados já existem")
    
    return True

def main():
    """Função principal"""
    print("=" * 80)
    print("🚀 INICIANDO CHATBOT SMART MAIKITO-SAN")
    print("=" * 80)
    
    # Verificações
    if not check_files():
        print("\n❌ Verifique os arquivos faltantes antes de continuar")
        return
    
    if not generate_aggregated_if_needed():
        print("\n❌ Não foi possível gerar documentos agregados")
        return
    
    check_dependencies()
    check_api_key()
    
    print("\n" + "=" * 80)
    print("🎯 SISTEMA SMART PRONTO!")
    print("=" * 80)
    print("📊 Recursos Avançados:")
    print("  🧠 Documentos Agregados (estruturados)")
    print("  🎯 Intent Router (classificação inteligente)")
    print("  🔍 Smart Search (busca otimizada)")
    print("  💾 Session Memory (contexto)")
    print("  🤖 Gemma LLM (respostas precisas)")
    print("  📈 ChromaDB (1000+ docs)")
    print("=" * 80)
    print("🌐 Acessos:")
    print("  📱 Interface: http://localhost:8000")
    print("  🔌 WebSocket: ws://localhost:8000/ws/chat")
    print("  📚 Docs: http://localhost:8000/docs")
    print("  ❤️  Health: http://localhost:8000/health")
    print("=" * 80)
    print("🚀 Iniciando servidor...")
    
    # Iniciar servidor
    try:
        import uvicorn
        uvicorn.run(
            "main_smart:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n👋 Servidor encerrado pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro ao iniciar servidor: {e}")

if __name__ == "__main__":
    main()
