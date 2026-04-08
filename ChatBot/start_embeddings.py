#!/usr/bin/env python3
"""
Script para iniciar o Chatbot Maikito-san com Embeddings Intelligence
"""
import os
import sys
import subprocess

def check_embeddings_requirements():
    """Verifica requisitos para versão com embeddings"""
    print("🔍 Verificando requisitos para versão com embeddings...")
    
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
    
    try:
        import sklearn
        print("✅ sklearn encontrado")
    except ImportError:
        print("❌ sklearn não encontrado. Instalando...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "scikit-learn"])
    
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

def main():
    """Função principal"""
    print("=" * 80)
    print("🧠 CHATBOT MAIKITO-SAN - EMBEDDINGS INTELLIGENCE")
    print("=" * 80)
    
    # Verificar arquivo de embeddings
    if not check_embeddings_file():
        print("\n❌ Arquivo de embeddings não encontrado!")
        print("Certifique-se de que o arquivo 'csv_pronto_embeddings.csv' existe na pasta 'tabelas/'")
        return False
    
    # Verificar requisitos
    if not check_embeddings_requirements():
        print("\n❌ Falha na verificação de requisitos")
        return False
    
    # Iniciar chatbot com embeddings
    print("\n🚀 Iniciando Chatbot com Embeddings Intelligence...")
    print("🎯 Recursos avançados:")
    print("   • Busca semântica avançada")
    print("   • 1.100+ registros indexados")
    print("   • Correspondência aproximada")
    print("   • Análise de contexto")
    print("   • Tolerância a erros de digitação")
    
    try:
        # Mudar para o diretório do ChatBot
        chatbot_dir = os.path.dirname(__file__)
        os.chdir(chatbot_dir)
        
        # Iniciar o app_embeddings.py
        print("\n🔄 Iniciando servidor com embeddings na porta 5002...")
        print("📱 Acesse diretamente: http://localhost:5002")
        print("🌐 Ou via dashboard: http://localhost:8080/chatbot.html")
        print("\n⚠️  Pressione Ctrl+C para parar o servidor")
        print("-" * 80)
        
        subprocess.run([sys.executable, "app_embeddings.py"])
        
    except KeyboardInterrupt:
        print("\n👋 Servidor encerrado pelo usuário")
    except Exception as e:
        print(f"❌ Erro ao iniciar chatbot: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
