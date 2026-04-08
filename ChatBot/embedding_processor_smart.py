"""
embedding_processor_smart.py
Versão inteligente que usa documentos agregados e intent router
"""

import pandas as pd
import chromadb
from typing import List, Dict, Any
import google.generativeai as genai
import os
from intent_router import route_intent

class SmartEmbeddingProcessor:
    def __init__(self):
        print("🧠 Inicializando SmartEmbeddingProcessor...")
        
        # Configurar API
        api_key = os.getenv("GOOGLE_API_KEY", "AIzaSyDLQ4bW0sG0_JGfhVCaTU8nzH2HpcBVY6c")
        genai.configure(api_key=api_key)
        
        # Carregar dados
        self.df_original = self._load_original_data()
        self.df_agregado = self._load_aggregated_data()
        
        # Configurar ChromaDB em memória
        self.client = chromadb.Client()
        self.collection = self._setup_collection()
        
        print(f"✅ SmartEmbeddingProcessor pronto!")
        print(f"   📊 Original: {len(self.df_original)} docs")
        print(f"   📋 Agregado: {len(self.df_agregado)} docs")
        print(f"   🔍 Total: {len(self.df_original) + len(self.df_agregado)} docs")

    def _load_original_data(self) -> pd.DataFrame:
        """Carrega dados originais"""
        try:
            df = pd.read_csv("../tabelas/csv_pronto_embeddings.csv")
            print(f"✅ Carregados {len(df)} documentos originais")
            return df
        except Exception as e:
            print(f"❌ Erro ao carregar dados originais: {e}")
            return pd.DataFrame()

    def _load_aggregated_data(self) -> pd.DataFrame:
        """Carrega dados agregados"""
        try:
            df = pd.read_csv("csv_documentos_agregados.csv")
            print(f"✅ Carregados {len(df)} documentos agregados")
            return df
        except Exception as e:
            print(f"❌ Erro ao carregar dados agregados: {e}")
            return pd.DataFrame()

    def _setup_collection(self):
        """Configura coleção ChromaDB com todos os dados"""
        # Deletar coleção existente
        try:
            self.client.delete_collection("smart_embeddings")
        except:
            pass
        
        collection = self.client.create_collection("smart_embeddings")
        
        # Combinar dados
        all_docs = []
        
        # Adicionar documentos originais
        for idx, row in self.df_original.iterrows():
            metadata = {"tipo": "original"}
            
            if pd.notna(row.get("aluno")):
                metadata["aluno"] = str(row.get("aluno"))
            if pd.notna(row.get("turma")):
                metadata["turma"] = str(row.get("turma"))
            if pd.notna(row.get("data")):
                metadata["data"] = str(row.get("data"))
            if pd.notna(row.get("hora")):
                metadata["hora"] = str(row.get("hora"))
            if pd.notna(row.get("origem")):
                metadata["origem"] = str(row.get("origem"))
                
            all_docs.append({
                "id": f"orig_{idx}",
                "text": str(row.get("texto", "")),
                "metadata": metadata
            })
        
        # Adicionar documentos agregados
        for _, row in self.df_agregado.iterrows():
            metadata = {
                "origem": "agregado",
                "tipo": row.get("tipo", "")
            }
            
            # Adicionar metadados específicos
            if pd.notna(row.get("professor")):
                metadata["professor"] = str(row.get("professor"))
            if pd.notna(row.get("turmas")):
                metadata["turmas"] = str(row.get("turmas"))
            if pd.notna(row.get("categoria")):
                metadata["categoria"] = str(row.get("categoria"))
            if pd.notna(row.get("mes")):
                mes_val = row.get("mes")
                if isinstance(mes_val, float):
                    metadata["mes"] = f"{int(mes_val):02d}"
                else:
                    metadata["mes"] = str(mes_val).zfill(2)
            if pd.notna(row.get("quantidade")):
                metadata["quantidade"] = str(row.get("quantidade"))
            
            all_docs.append({
                "id": f"agg_{_}",
                "text": str(row.get("texto", "")),
                "metadata": metadata
            })
        
        # Adicionar ao ChromaDB
        documents = [doc["text"] for doc in all_docs]
        metadatas = [doc["metadata"] for doc in all_docs]
        ids = [doc["id"] for doc in all_docs]
        
        collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        
        print(f"✅ {len(all_docs)} documentos adicionados à coleção smart!")
        return collection

    def smart_search(self, query: str, n_results: int = 5) -> Dict[str, Any]:
        """
        Busca inteligente que usa intent router para otimizar resultados
        """
        # Identificar intenção
        intent_info = route_intent(query)
        print(f"🎯 Intent detectado: {intent_info['intent']}")
        
        # Estratégia baseada na intenção
        if intent_info["strategy"] == "entity":
            return self._entity_search(intent_info, n_results)
        elif intent_info["strategy"] == "list":
            return self._list_search(intent_info, n_results)
        elif intent_info["strategy"] == "summary":
            return self._summary_search(intent_info, n_results)
        else:
            return self._semantic_search(query, n_results, intent_info["where"])

    def _format_where(self, where: dict) -> Any:
        """Formata where para aceitar múltiplas condições no ChromaDB"""
        if not where:
            return None
        if len(where) > 1:
            return {"$and": [{k: v} for k, v in where.items()]}
        return where

    def _entity_search(self, intent_info: dict, n_results: int) -> Dict[str, Any]:
        """Busca por entidade específica (professor, aluno)"""
        entity = intent_info.get("entity", "")
        where = intent_info.get("where", {})
        
        # Buscar por metadados específicos
        if entity and "professor" in where:
            # Buscar documentos do professor
            where_filter = {"tipo": "professor"}
            if entity:
                where_filter["professor"] = entity
            
            results = self.collection.query(
                query_texts=[f"Professor {entity}"],
                where=self._format_where(where_filter),
                n_results=n_results
            )
        else:
            # Busca semântica normal
            results = self.collection.query(
                query_texts=[entity],
                where=self._format_where(where),
                n_results=n_results
            )
        
        return self._format_results(results)

    def _list_search(self, intent_info: dict, n_results: int) -> Dict[str, Any]:
        """Busca por listas (turmas, categorias)"""
        where = intent_info.get("where", {})
        
        results = self.collection.query(
            query_texts=[intent_info.get("intent", "")],
            where=self._format_where(where),
            n_results=n_results
        )
        
        return self._format_results(results)

    def _summary_search(self, intent_info: dict, n_results: int) -> Dict[str, Any]:
        """Busca por resumos (reposições por mês)"""
        where = intent_info.get("where", {})
        
        results = self.collection.query(
            query_texts=[f"reposições {intent_info.get('mes', '')}"],
            where=self._format_where(where),
            n_results=n_results
        )
        
        return self._format_results(results)

    def _semantic_search(self, query: str, n_results: int, where: dict = None) -> Dict[str, Any]:
        """Busca semântica padrão"""
        results = self.collection.query(
            query_texts=[query],
            where=self._format_where(where),
            n_results=n_results
        )
        
        return self._format_results(results)

    def _format_results(self, results: dict) -> Dict[str, Any]:
        """Formata resultados do ChromaDB"""
        formatted = []
        
        if results and results.get("documents") and results["documents"][0]:
            for i, doc in enumerate(results["documents"][0]):
                metadata = results["metadatas"][0][i] if results.get("metadatas") else {}
                distance = results["distances"][0][i] if results.get("distances") else 0
                
                # Converter distância para score
                score = max(0, min(100, (1 - distance) * 100))
                
                formatted.append({
                    "texto": doc,
                    "metadata": metadata,
                    "score": score / 100
                })
        
        return {"results": formatted}

    def get_context_chunks(self, query: str, max_chunks: int = 3) -> List[str]:
        """
        Obtém chunks de contexto para o LLM
        """
        search_results = self.smart_search(query, n_results=max_chunks)
        
        chunks = []
        for result in search_results.get("results", []):
            chunk = f"📋 {result['texto']}"
            
            # Adicionar metadados relevantes
            metadata = result.get("metadata", {})
            if metadata.get("tipo") == "professor":
                chunk += f"\n👨‍🏫 Professor: {metadata.get('professor', '')}"
                chunk += f"\n📚 Turmas: {metadata.get('turmas', '')}"
            elif metadata.get("tipo") == "turma":
                chunk += f"\n📂 Categoria: {metadata.get('categoria', '')}"
                chunk += f"\n📚 Turmas: {metadata.get('turmas', '')}"
            elif metadata.get("tipo") == "resumo_reposicoes":
                chunk += f"\n📅 Mês: {metadata.get('mes', '')}"
                chunk += f"\n📊 Quantidade: {metadata.get('quantidade', '')}"
            elif metadata.get("origem") == "reposicoes":
                chunk += f"\n👤 Aluno: {metadata.get('aluno', '')}"
                chunk += f"\n📚 Turma: {metadata.get('turma', '')}"
                chunk += f"\n📅 Data: {metadata.get('data', '')}"
                chunk += f"\n⏰ Hora: {metadata.get('hora', '')}"
            
            chunks.append(chunk)
        
        return chunks
