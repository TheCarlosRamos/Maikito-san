#!/usr/bin/env python3
"""
Script para iniciar o Chatbot com dados da escola Maikito-san
"""
import os
import sys
import subprocess
from pathlib import Path

def check_requirements():
    """Verifica se todos os requisitos estão instalados"""
    print("🔍 Verificando requisitos...")
    
    try:
        import pandas
        print("✅ pandas encontrado")
    except ImportError:
        print("❌ pandas não encontrado. Instalando...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pandas"])
    
    try:
        import gradio
        print("✅ gradio encontrado")
    except ImportError:
        print("❌ gradio não encontrado. Instalando...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "gradio>=4.0.0"])
    
    try:
        import torch
        print("✅ torch encontrado")
    except ImportError:
        print("❌ torch não encontrado. Instalando...")
        print("⚠️  PyTorch pode requerer instalação manual. Visite: https://pytorch.org/")
        return False
    
    try:
        import transformers
        print("✅ transformers encontrado")
    except ImportError:
        print("❌ transformers não encontrado. Instalando...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "transformers"])
    
    return True

def check_data_files():
    """Verifica se os arquivos de dados existem"""
    print("\n📁 Verificando arquivos de dados...")
    
    current_dir = Path(__file__).parent
    parent_dir = current_dir.parent
    
    files_to_check = [
        (parent_dir / "organized.csv", "organized.csv"),
        (parent_dir / "reposicoes_completas.csv", "reposicoes_completas.csv")
    ]
    
    all_exist = True
    for file_path, file_name in files_to_check:
        if file_path.exists():
            print(f"✅ {file_name} encontrado")
        else:
            print(f"❌ {file_name} não encontrado em: {file_path}")
            all_exist = False
    
    return all_exist

def start_chatbot():
    """Inicia o chatbot"""
    print("\n🚀 Iniciando Chatbot Maikito-san...")
    
    try:
        # Mudar para o diretório do ChatBot
        chatbot_dir = Path(__file__).parent
        os.chdir(chatbot_dir)
        
        # Iniciar o app.py
        print("🔄 Iniciando servidor Gradio na porta 7860...")
        print("📱 Acesse: http://localhost:7860")
        print("🌐 Ou via dashboard: http://localhost:8000/chatbot.html")
        print("\n⚠️  Pressione Ctrl+C para parar o servidor")
        print("-" * 50)
        
        subprocess.run([sys.executable, "app.py"])
        
    except KeyboardInterrupt:
        print("\n👋 Servidor encerrado pelo usuário")
    except Exception as e:
        print(f"❌ Erro ao iniciar chatbot: {e}")
        return False
    
    return True

def main():
    """Função principal"""
    print("=" * 60)
    print("🤖 CHATBOT MAIKITO-SAN - INICIADOR")
    print("=" * 60)
    
    # Verificar requisitos
    if not check_requirements():
        print("\n❌ Falha na verificação de requisitos. Instale manualmente:")
        print("pip install -r requirements.txt")
        return False
    
    # Verificar arquivos de dados
    if not check_data_files():
        print("\n❌ Arquivos de dados não encontrados. Verifique os caminhos.")
        return False
    
    # Iniciar chatbot
    return start_chatbot()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
