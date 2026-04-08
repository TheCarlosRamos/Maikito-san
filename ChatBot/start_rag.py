#!/usr/bin/env python3
"""
Script para iniciar o Chatbot Maikito-san com RAG + Embeddings + WebSocket
"""
import os
import sys
import subprocess

def check_rag_requirements():
    """Verifica requisitos para versão RAG"""
    print("🔍 Verificando requisitos para RAG + Embeddings...")
    
    requirements = [
        ("fastapi", "FastAPI"),
        ("uvicorn", "Uvicorn"),
        ("websockets", "WebSockets"),
        ("google.generativeai", "Google Generative AI"),
        ("chromadb", "ChromaDB"),
        ("numpy", "NumPy"),
        ("pandas", "Pandas")
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

def check_embeddings_file():
    """Verifica se o arquivo de embeddings existe"""
    embeddings_path = '../tabelas/csv_pronto_embeddings.csv'
    if os.path.exists(embeddings_path):
        print(f"✅ Arquivo de embeddings encontrado: {embeddings_path}")
        return True
    else:
        print(f"❌ Arquivo de embeddings não encontrado: {embeddings_path}")
        return False

def setup_vector_db():
    """Configura o banco de dados vetorial"""
    try:
        from embedding_processor import EmbeddingProcessor
        print("🔹 Configurando ChromaDB...")
        processor = EmbeddingProcessor()
        print("✅ ChromaDB configurado com sucesso!")
        return True
    except Exception as e:
        print(f"❌ Erro ao configurar ChromaDB: {e}")
        return False

def main():
    """Função principal"""
    print("=" * 80)
    print("🚀 CHATBOT MAIKITO-SAN - RAG + GEMINI EMBEDDINGS + WEBSOCKET")
    print("=" * 80)
    
    # Verificar arquivo de embeddings
    if not check_embeddings_file():
        print("\n❌ Arquivo de embeddings não encontrado!")
        print("Certifique-se de que o arquivo 'csv_pronto_embeddings.csv' existe na pasta 'tabelas/'")
        return False
    
    # Verificar requisitos
    if not check_rag_requirements():
        print("\n❌ Falha na verificação de requisitos")
        return False
    
    # Configurar banco vetorial
    if not setup_vector_db():
        print("\n❌ Falha na configuração do banco vetorial")
        return False
    
    # Iniciar servidor RAG
    print("\n🚀 Iniciando Chatbot com RAG + Embeddings...")
    print("🎯 Recursos avançados:")
    print("   • RAG (Retrieval-Augmented Generation)")
    print("   • Gemini Embeddings (text-embedding-004)")
    print("   • ChromaDB Vector Database")
    print("   • WebSocket Real-time")
    print("   • FastAPI High Performance")
    print("   • 1.100+ registros indexados")
    
    try:
        # Mudar para o diretório do ChatBot
        chatbot_dir = os.path.dirname(__file__)
        os.chdir(chatbot_dir)
        
        # Iniciar o mainzinha.py
        print("\n🔄 Iniciando servidor RAG na porta 8000...")
        print("📱 Acesse diretamente: http://localhost:8000")
        print("🌐 WebSocket: ws://localhost:8000/ws/chat")
        print("📚 API Docs: http://localhost:8000/docs")
        print("\n⚠️  Pressione Ctrl+C para parar o servidor")
        print("-" * 80)
        
        subprocess.run([sys.executable, "mainzinha.py"])
        
    except KeyboardInterrupt:
        print("\n👋 Servidor RAG encerrado pelo usuário")
    except Exception as e:
        print(f"❌ Erro ao iniciar chatbot RAG: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
