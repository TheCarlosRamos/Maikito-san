#!/usr/bin/env python3
"""
Script para iniciar o Chatbot Maikito-san - Versão Simplificada
"""
import os
import sys
import subprocess

def check_simple_requirements():
    """Verifica requisitos básicos"""
    print("🔍 Verificando requisitos básicos...")
    
    requirements = [
        ("fastapi", "FastAPI"),
        ("uvicorn", "Uvicorn"),
        ("websockets", "WebSockets"),
        ("pandas", "Pandas"),
        ("chromadb", "ChromaDB")
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

def main():
    """Função principal"""
    print("=" * 70)
    print("🚀 CHATBOT MAIKITO-SAN - VERSÃO SIMPLIFICADA")
    print("=" * 70)
    
    # Verificar requisitos
    if not check_simple_requirements():
        print("\n❌ Falha na verificação de requisitos")
        return False
    
    # Iniciar servidor simplificado
    print("\n🚀 Iniciando Chatbot Simplificado...")
    print("🎯 Recursos:")
    print("   • Busca semântica simulada")
    print("   • WebSocket Real-time")
    print("   • FastAPI Performance")
    print("   • Dados dos CSVs")
    print("   • 1.100+ registros")
    
    try:
        # Mudar para o diretório do ChatBot
        chatbot_dir = os.path.dirname(__file__)
        os.chdir(chatbot_dir)
        
        # Iniciar o main_simple.py
        print("\n🔄 Iniciando servidor na porta 8000...")
        print("📱 Acesse: http://localhost:8000")
        print("🌐 WebSocket: ws://localhost:8000/ws/chat")
        print("📚 API Docs: http://localhost:8000/docs")
        print("\n⚠️  Pressione Ctrl+C para parar")
        print("-" * 70)
        
        subprocess.run([sys.executable, "main_simple.py"])
        
    except KeyboardInterrupt:
        print("\n👋 Servidor encerrado pelo usuário")
    except Exception as e:
        print(f"❌ Erro ao iniciar chatbot: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
