#!/usr/bin/env python3
"""
Script para configurar e popular o ChromaDB com embeddings
"""
import pandas as pd
import numpy as np
import google.generativeai as genai
import chromadb
import os
from tqdm import tqdm

def load_embeddings():
    """Carrega os dados do CSV de embeddings"""
    print("📁 Carregando dados dos embeddings...")
    
    embeddings_path = '../tabelas/csv_pronto_embeddings.csv'
    if not os.path.exists(embeddings_path):
        print(f"❌ Arquivo não encontrado: {embeddings_path}")
        return None
    
    df = pd.read_csv(embeddings_path)
    print(f"✅ Carregados {len(df)} registros")
    return df

def setup_chromadb():
    """Configura o ChromaDB"""
    print("🔹 Configurando ChromaDB...")
    
    # Criar diretório se não existir
    persist_dir = "vectordb"
    os.makedirs(persist_dir, exist_ok=True)
    
    # Inicializar cliente
    client = chromadb.Client(
        chromadb.config.Settings(
            persist_directory=persist_dir,
            anonymized_telemetry=False
        )
    )
    
    # Deletar coleção existente para recriar
    try:
        client.delete_collection("aulas_embeddings")
        print("🗑️ Coleção existente removida")
    except:
        pass
    
    # Criar nova coleção
    collection = client.get_or_create_collection(
        name="aulas_embeddings"
    )
    
    print("✅ ChromaDB configurado!")
    return collection

def generate_embeddings_batch(texts, batch_size=100):
    """Gera embeddings em lote"""
    embeddings = []
    
    print("🧠 Gerando embeddings com Gemini...")
    for i in tqdm(range(0, len(texts), batch_size), desc="Processando"):
        batch = texts[i:i+batch_size]
        
        for text in batch:
            try:
                result = genai.embed_content(
                    model="models/text-embedding-004",
                    content=text
                )
                embeddings.append(np.array(result.embedding))
            except Exception as e:
                print(f"⚠️ Erro ao gerar embedding: {e}")
                embeddings.append(np.zeros(768))  # fallback
    
    return embeddings

def populate_chromadb(df, collection):
    """Popula o ChromaDB com os dados"""
    print("📦 Populando ChromaDB...")
    
    # Preparar dados
    texts = df['texto'].tolist()
    metadatas = []
    
    for _, row in df.iterrows():
        metadata = {
            'aluno': row.get('aluno', ''),
            'turma': row.get('turma', ''),
            'data': row.get('data', ''),
            'hora': row.get('hora', ''),
            'origem': row.get('origem', '')
        }
        metadatas.append(metadata)
    
    # Gerar embeddings
    embeddings = generate_embeddings_batch(texts)
    
    # Adicionar ao ChromaDB
    ids = [f"doc_{i}" for i in range(len(texts))]
    
    collection.add(
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas,
        ids=ids
    )
    
    print(f"✅ {len(texts)} documentos adicionados ao ChromaDB!")

def main():
    """Função principal"""
    print("=" * 70)
    print("🚀 CONFIGURAÇÃO DO CHROMADB COM GEMINI EMBEDDINGS")
    print("=" * 70)
    
    # Carregar dados
    df = load_embeddings()
    if df is None:
        return False
    
    # Configurar ChromaDB
    collection = setup_chromadb()
    
    # Popular com dados
    populate_chromadb(df, collection)
    
    print("\n✅ ChromaDB configurado com sucesso!")
    print(f"📊 Total de documentos: {len(df)}")
    print(f"📁 Diretório: vectordb/")
    print(f"🧪 Coleção: aulas_embeddings")
    print("\n🎯 Pronto para usar com RAG!")
    
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        exit(1)
