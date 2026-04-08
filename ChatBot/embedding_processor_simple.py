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
        
        # Carregar dados do CSV como fallback
        self.load_csv_data()

    def load_csv_data(self):
        """Carrega dados do CSV como fallback"""
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

    def embed_query(self, query: str):
        """Simulação de embedding (placeholder)"""
        # Simulação simples de embedding baseado no texto
        words = query.lower().split()
        embedding = np.zeros(768)  # tamanho padrão
        
        # Preencher embedding baseado nas palavras
        for i, word in enumerate(words[:50]):  # limitar a 50 palavras
            hash_val = hash(word) % 1000
            embedding[i % 768] = hash_val / 1000.0
        
        return embedding

    def search_similar(self, query, top_k=5, origem=None):
        """Busca similar usando dados do CSV"""
        if self.csv_data.empty:
            return []
        
        query_lower = query.lower()
        results = []
        
        # Busca textual simples no CSV
        for _, row in self.csv_data.iterrows():
            texto = str(row['texto']).lower()
            aluno = str(row['aluno']).lower()
            turma = str(row['turma']).lower()
            data = str(row['data']).lower()
            
            score = 0
            
            # Busca exata no texto principal
            if query_lower in texto:
                score += 1.0
            
            # Busca em campos específicos
            if query_lower in aluno:
                score += 0.9
            if query_lower in turma:
                score += 0.8
            if query_lower in data:
                score += 0.7
            
            # Busca por partes
            query_parts = query_lower.split()
            for part in query_parts:
                if part in texto:
                    score += 0.6
                if part in aluno:
                    score += 0.5
                if part in turma:
                    score += 0.4
                if part in data:
                    score += 0.3
            
            # Correspondência aproximada para meses
            month_mappings = {
                'março': ['marco', 'mar', '03'],
                'abril': ['abr', '04'],
                'maio': ['mai', '05'],
                'junho': ['jun', '06'],
                'janeiro': ['jan', '01'],
                'fevereiro': ['fev', '02'],
                'julho': ['jul', '07'],
                'agosto': ['ago', '08'],
                'setembro': ['set', '09'],
                'outubro': ['out', '10'],
                'novembro': ['nov', '11'],
                'dezembro': ['dez', '12']
            }
            
            for month, variants in month_mappings.items():
                if query_lower in variants:
                    if month in texto or any(var in texto for var in variants):
                        score += 0.8
                    if month in data or any(var in data for var in variants):
                        score += 0.7
                elif query_lower == month:
                    if any(var in texto for var in variants):
                        score += 0.8
                    if any(var in data for var in variants):
                        score += 0.7
            
            if score > 0.3:  # threshold mínimo
                # Filtrar por origem se especificado
                if origem and row.get('origem') != origem:
                    continue
                    
                results.append({
                    "texto": row['texto'],
                    "metadata": {
                        "aluno": row.get('aluno', ''),
                        "turma": row.get('turma', ''),
                        "data": row.get('data', ''),
                        "hora": row.get('hora', ''),
                        "origem": row.get('origem', '')
                    },
                    "score": min(score / 3.0, 1.0)  # normalizar score
                })
        
        # Ordenar por score
        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:top_k]
