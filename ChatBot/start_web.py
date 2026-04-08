#!/usr/bin/env python3
"""
Script para iniciar o Chatbot Maikito-san versão web
"""
import os
import sys
import subprocess

def check_web_requirements():
    """Verifica requisitos para versão web"""
    print("🔍 Verificando requisitos para versão web...")
    
    try:
        import flask
        print("✅ flask encontrado")
    except ImportError:
        print("❌ flask não encontrado. Instalando...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "flask"])
    
    try:
        import pandas
        print("✅ pandas encontrado")
    except ImportError:
        print("❌ pandas não encontrado. Instalando...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pandas"])
    
    return True

def main():
    """Função principal"""
    print("=" * 60)
    print("🌐 CHATBOT MAIKITO-SAN - VERSÃO WEB")
    print("=" * 60)
    
    # Verificar requisitos
    if not check_web_requirements():
        print("\n❌ Falha na verificação de requisitos")
        return False
    
    # Iniciar chatbot web
    print("\n🚀 Iniciando Chatbot Web Maikito-san...")
    
    try:
        # Mudar para o diretório do ChatBot
        chatbot_dir = os.path.dirname(__file__)
        os.chdir(chatbot_dir)
        
        # Iniciar o app_web.py
        print("🔄 Iniciando servidor web na porta 5000...")
        print("📱 Acesse diretamente: http://localhost:5000")
        print("🌐 Ou via dashboard: http://localhost:8080/chatbot.html")
        print("\n⚠️  Pressione Ctrl+C para parar o servidor")
        print("-" * 50)
        
        subprocess.run([sys.executable, "app_web.py"])
        
    except KeyboardInterrupt:
        print("\n👋 Servidor encerrado pelo usuário")
    except Exception as e:
        print(f"❌ Erro ao iniciar chatbot: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
