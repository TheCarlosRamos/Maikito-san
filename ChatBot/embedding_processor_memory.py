import chromadb
import numpy as np
import pandas as pd
import os

class EmbeddingProcessor:
    def __init__(self):
        # Carregar dados do CSV
        self.load_csv_data()
        
        # Criar coleção em memória
        self.client = chromadb.Client()
        self.collection = self.client.get_or_create_collection(
            name="aulas_embeddings"
        )
        
        # Adicionar dados à coleção
        self.populate_collection()
        print("✅ ChromaDB em memória configurado com embeddings!")

    def load_csv_data(self):
        """Carrega dados do CSV"""
        try:
            csv_path = '../tabelas/csv_pronto_embeddings.csv'
            if os.path.exists(csv_path):
                self.csv_data = pd.read_csv(csv_path)
                print(f"✅ Carregados {len(self.csv_data)} registros do CSV")
            else:
                self.csv_data = pd.DataFrame()
                print("❌ CSV não encontrado")
        except Exception as e:
            print(f"❌ Erro ao carregar CSV: {e}")
            self.csv_data = pd.DataFrame()

    def populate_collection(self):
        """Popula a coleção com dados do CSV"""
        if self.csv_data.empty:
            return
        
        # Preparar dados
        texts = self.csv_data['texto'].tolist()
        metadatas = []
        
        for _, row in self.csv_data.iterrows():
            metadata = {
                'aluno': row.get('aluno', ''),
                'turma': row.get('turma', ''),
                'data': row.get('data', ''),
                'hora': row.get('hora', ''),
                'origem': row.get('origem', '')
            }
            metadatas.append(metadata)
        
        # Gerar embeddings simples
        embeddings = self.generate_simple_embeddings(texts)
        
        # Adicionar à coleção
        ids = [f"doc_{i}" for i in range(len(texts))]
        
        self.collection.add(
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
            ids=ids
        )
        
        print(f"✅ {len(texts)} documentos adicionados à coleção em memória!")

    def generate_simple_embeddings(self, texts):
        """Gera embeddings simples baseados em hash"""
        embeddings = []
        
        for text in texts:
            # Simulação simples de embedding
            words = str(text).lower().split()
            embedding = np.zeros(768)  # tamanho padrão
            
            # Preencher embedding baseado nas palavras
            for i, word in enumerate(words[:50]):
                hash_val = hash(word) % 1000
                embedding[i % 768] = hash_val / 1000.0
            
            embeddings.append(embedding)
        
        return embeddings

    def embed_query(self, query: str):
        """Gera embedding simples para a query"""
        words = query.lower().split()
        embedding = np.zeros(768)
        
        for i, word in enumerate(words[:50]):
            hash_val = hash(word) % 1000
            embedding[i % 768] = hash_val / 1000.0
        
        return embedding

    def search_similar(self, query, top_k=5, origem=None):
        """Busca similar usando ChromaDB em memória"""
        query_vector = self.embed_query(query)
        
        where_filter = {}
        if origem:
            where_filter["origem"] = origem
        
        results = self.collection.query(
            query_embeddings=[query_vector.tolist()],
            n_results=top_k,
            where=where_filter
        )
        
        docs = []
        for i in range(len(results["documents"][0])):
            docs.append({
                "texto": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "score": 1 - results["distances"][0][i]  # converter distância para score
            })
        
        return docs
