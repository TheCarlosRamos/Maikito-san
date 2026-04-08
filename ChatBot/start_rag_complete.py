#!/usr/bin/env python3
"""
Script para iniciar o Chatbot Maikito-san - Versão RAG Completa
"""
import os
import sys
import subprocess

def check_rag_requirements():
    """Verifica requisitos para RAG completo"""
    print("🔍 Verificando requisitos para RAG Completo...")
    
    requirements = [
        ("fastapi", "FastAPI"),
        ("uvicorn", "Uvicorn"),
        ("websockets", "WebSockets"),
        ("pandas", "Pandas"),
        ("chromadb", "ChromaDB"),
        ("google.generativeai", "Google Generative AI"),
        ("numpy", "NumPy"),
        ("unicodedata", "Unicode Support")
    ]
    
    missing = []
    for module, name in requirements:
        try:
            __import__(module)
            print(f"✅ {name} encontrado")
        except ImportError:
            print(f"❌ {name} não encontrado. Instalando...")
            missing.append(module)
    
    if missing:
        print(f"\n📦 Instalando dependências faltantes...")
        subprocess.check_call([sys.executable, "-m", "pip", "install"] + missing)
    
    return True

def check_api_key():
    """Verifica se a API Key está configurada"""
    api_key = os.getenv("GOOGLE_API_KEY")
    if api_key:
        print("🔑 API Key do Google AI configurada")
        return True
    else:
        print("⚠️  API Key do Google AI não configurada")
        print("📝 Configure com: set GOOGLE_API_KEY=sua_chave_aqui")
        return False

def main():
    """Função principal"""
    print("=" * 80)
    print("🚀 CHATBOT MAIKITO-SAN - RAG COMPLETO")
    print("=" * 80)
    
    # Verificar requisitos
    if not check_rag_requirements():
        print("\n❌ Falha na verificação de requisitos")
        return False
    
    # Verificar API Key
    has_llm = check_api_key()
    
    # Iniciar servidor RAG completo
    print("\n🚀 Iniciando Chatbot RAG Completo...")
    print("🎯 Arquitetura Completa:")
    print("   • ChromaDB - Banco vetorial")
    print("   • Gemma LLM - Language Model")
    print("   • Router - Classificação de intenções")
    print("   • Memory - Memória de sessão")
    print("   • WebSocket - Real-time")
    print("   • FastAPI - Servidor assíncrono")
    
    if has_llm:
        print("   • 🤖 Respostas com IA ativadas")
    else:
        print("   • 📝 Modo busca semântica apenas")
    
    try:
        # Mudar para o diretório do ChatBot
        chatbot_dir = os.path.dirname(__file__)
        os.chdir(chatbot_dir)
        
        # Iniciar o servidor completo
        print("\n🔄 Iniciando servidor RAG completo na porta 8000...")
        print("📱 Acesse: http://localhost:8000")
        print("🌐 WebSocket: ws://localhost:8000/ws/chat")
        print("📚 API Docs: http://localhost:8000/docs")
        print("\n⚠️  Pressione Ctrl+C para parar")
        print("-" * 80)
        
        subprocess.run([sys.executable, "main_rag_complete.py"])
        
    except KeyboardInterrupt:
        print("\n👋 Servidor RAG encerrado pelo usuário")
    except Exception as e:
        print(f"❌ Erro ao iniciar chatbot RAG: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
