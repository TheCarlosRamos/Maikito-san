import chromadb
import numpy as np
import pandas as pd
import os

class EmbeddingProcessor:
    def __init__(self, persist_dir="vectordb"):
        self.client = chromadb.Client(
            chromadb.config.Settings(
                persist_directory=persist_dir,
                anonymized_telemetry=False
            )
        )
        
        # Carregar coleção existente
        self.collection = self.client.get_collection("aulas_embeddings")
        print("✅ ChromaDB carregado com embeddings!")

    def embed_query(self, query: str):
        """Gera embedding simples para a query"""
        words = query.lower().split()
        embedding = np.zeros(768)
        
        for i, word in enumerate(words[:50]):
            hash_val = hash(word) % 1000
            embedding[i % 768] = hash_val / 1000.0
        
        return embedding

    def search_similar(self, query, top_k=5, origem=None):
        """Busca similar usando ChromaDB real"""
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
