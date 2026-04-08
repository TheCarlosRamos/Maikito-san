#!/usr/bin/env python3
"""
Script simplificado para iniciar o Chatbot Maikito-san
"""
import os
import sys
import subprocess

def check_simple_requirements():
    """Verifica requisitos básicos"""
    print("🔍 Verificando requisitos básicos...")
    
    try:
        import gradio
        print("✅ gradio encontrado")
    except ImportError:
        print("❌ gradio não encontrado. Instalando...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "gradio>=4.0.0"])
    
    try:
        import pandas
        print("✅ pandas encontrado")
    except ImportError:
        print("❌ pandas não encontrado. Instalando...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pandas"])
    
    return True

def check_data_files():
    """Verifica arquivos de dados"""
    print("\n📁 Verificando arquivos de dados...")
    
    current_dir = os.path.dirname(__file__)
    parent_dir = os.path.dirname(current_dir)
    
    files_to_check = [
        (os.path.join(parent_dir, "organized.csv"), "organized.csv"),
        (os.path.join(parent_dir, "reposicoes_completas.csv"), "reposicoes_completas.csv")
    ]
    
    all_exist = True
    for file_path, file_name in files_to_check:
        if os.path.exists(file_path):
            print(f"✅ {file_name} encontrado")
        else:
            print(f"❌ {file_name} não encontrado")
            all_exist = False
    
    return all_exist

def start_simple_chatbot():
    """Inicia o chatbot simplificado"""
    print("\n🚀 Iniciando Chatbot Simplificado Maikito-san...")
    
    try:
        # Mudar para o diretório do ChatBot
        chatbot_dir = os.path.dirname(__file__)
        os.chdir(chatbot_dir)
        
        # Iniciar o app_simple.py
        print("🔄 Iniciando servidor simplificado na porta 7860...")
        print("📱 Acesse: http://localhost:7860")
        print("🌐 Ou via dashboard: http://localhost:8080/chatbot.html")
        print("\n⚠️  Pressione Ctrl+C para parar o servidor")
        print("-" * 50)
        
        subprocess.run([sys.executable, "app_simple.py"])
        
    except KeyboardInterrupt:
        print("\n👋 Servidor encerrado pelo usuário")
    except Exception as e:
        print(f"❌ Erro ao iniciar chatbot: {e}")
        return False
    
    return True

def main():
    """Função principal"""
    print("=" * 60)
    print("🤖 CHATBOT MAIKITO-SAN - VERSÃO SIMPLIFICADA")
    print("=" * 60)
    
    # Verificar requisitos
    if not check_simple_requirements():
        print("\n❌ Falha na verificação de requisitos")
        return False
    
    # Verificar arquivos de dados
    if not check_data_files():
        print("\n⚠️ Alguns arquivos de dados não foram encontrados")
        print("O chatbot funcionará, mas com funcionalidades limitadas")
    
    # Iniciar chatbot
    return start_simple_chatbot()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
