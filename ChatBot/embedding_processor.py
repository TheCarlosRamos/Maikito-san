import chromadb
import numpy as np
import google.generativeai as genai
from sklearn.metrics.pairwise import cosine_similarity
import os

# Configurar API Key
genai.configure(api_key=os.getenv("GOOGLE_API_KEY", "AIzaSyDLQ4bW0sG0_JGfhVCaTU8nzH2HpcBVY6c"))

class EmbeddingProcessor:
    def __init__(self, persist_dir="vectordb"):
        self.client = chromadb.Client(
            chromadb.config.Settings(
                persist_directory=persist_dir,
                anonymized_telemetry=False
            )
        )

        self.collection = self.client.get_or_create_collection(
            name="aulas_embeddings"
        )

    def embed_query(self, query: str):
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=query
        )
        return np.array(result.embedding)

    def search_similar(
        self,
        query,
        top_k=5,
        origem=None
    ):
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
                "score": 1 - results["distances"][0][i]
            })

        return docs