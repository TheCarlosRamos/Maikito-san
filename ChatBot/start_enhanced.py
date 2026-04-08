#!/usr/bin/env python3
"""
Script para iniciar o Chatbot Maikito-san versão enhanced (estilo ChatGPT)
"""
import os
import sys
import subprocess

def check_enhanced_requirements():
    """Verifica requisitos para versão enhanced"""
    print("🔍 Verificando requisitos para versão enhanced...")
    
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
    print("=" * 70)
    print("🤖 CHATBOT MAIKITO-SAN - VERSÃO ENHANCED (ESTILO CHATGPT)")
    print("=" * 70)
    
    # Verificar requisitos
    if not check_enhanced_requirements():
        print("\n❌ Falha na verificação de requisitos")
        return False
    
    # Iniciar chatbot enhanced
    print("\n🚀 Iniciando Chatbot Enhanced Maikito-san...")
    print("🎯 Recursos avançados ativados:")
    print("   • Respostas estilo ChatGPT")
    print("   • Extração inteligente de entidades")
    print("   • Contextualização avançada")
    print("   • Interface melhorada")
    print("   • Análise detalhada de dados")
    
    try:
        # Mudar para o diretório do ChatBot
        chatbot_dir = os.path.dirname(__file__)
        os.chdir(chatbot_dir)
        
        # Iniciar o app_enhanced.py
        print("\n🔄 Iniciando servidor enhanced na porta 5001...")
        print("📱 Acesse diretamente: http://localhost:5001")
        print("🌐 Ou via dashboard: http://localhost:8080/chatbot.html")
        print("\n⚠️  Pressione Ctrl+C para parar o servidor")
        print("-" * 70)
        
        subprocess.run([sys.executable, "app_enhanced.py"])
        
    except KeyboardInterrupt:
        print("\n👋 Servidor encerrado pelo usuário")
    except Exception as e:
        print(f"❌ Erro ao iniciar chatbot: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
