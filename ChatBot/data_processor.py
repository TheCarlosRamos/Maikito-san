import pandas as pd
import os
from typing import Dict, List, Any

class DataProcessor:
    def __init__(self):
        self.organized_data = None
        self.reposicoes_data = None
        self.load_data()
    
    def load_data(self):
        """Carrega os dados dos arquivos CSV"""
        try:
            # Carregar organized.csv
            organized_path = '../organized.csv'
            if os.path.exists(organized_path):
                self.organized_data = pd.read_csv(organized_path)
                print(f"✅ Dados carregados: {len(self.organized_data)} linhas do organized.csv")
            else:
                print("❌ Arquivo organized.csv não encontrado")
            
            # Carregar reposicoes_completas.csv
            reposicoes_path = '../reposicoes_completas.csv'
            if os.path.exists(reposicoes_path):
                self.reposicoes_data = pd.read_csv(reposicoes_path)
                print(f"✅ Dados carregados: {len(self.reposicoes_data)} linhas do reposicoes_completas.csv")
            else:
                print("❌ Arquivo reposicoes_completas.csv não encontrado")
                
        except Exception as e:
            print(f"❌ Erro ao carregar dados: {e}")
    
    def get_context_summary(self) -> str:
        """Gera um resumo do contexto dos dados para o modelo"""
        context = "CONTEXT DOS DADOS DA ESCOLA MAIKITO-SAN:\n\n"
        
        if self.organized_data is not None:
            context += f"DADOS ORGANIZADOS ({len(self.organized_data)} registros):\n"
            context += "- Colunas: " + ", ".join(self.organized_data.columns.tolist()) + "\n"
            
            # Estatísticas básicas
            if 'aluno' in self.organized_data.columns:
                alunos_unicos = self.organized_data['aluno'].dropna().nunique()
                context += f"- Alunos únicos: {alunos_unicos}\n"
            
            if 'professor' in self.organized_data.columns:
                professores_unicos = self.organized_data['professor'].dropna().nunique()
                context += f"- Professores únicos: {professores_unicos}\n"
            
            if 'nivel' in self.organized_data.columns:
                niveis = self.organized_data['nivel'].dropna().unique()
                context += f"- Níveis: {', '.join(str(n) for n in niveis[:10])}\n"
        
        context += "\n"
        
        if self.reposicoes_data is not None:
            context += f"DADOS DE REPOSIÇÕES ({len(self.reposicoes_data)} registros):\n"
            context += "- Colunas: " + ", ".join(self.reposicoes_data.columns.tolist()) + "\n"
            
            # Estatísticas básicas
            if 'Nome' in self.reposicoes_data.columns:
                alunos_reposicao = self.reposicoes_data['Nome'].nunique()
                context += f"- Alunos com reposição: {alunos_reposicao}\n"
            
            if 'Turma' in self.reposicoes_data.columns:
                turmas = self.reposicoes_data['Turma'].unique()
                context += f"- Turmas: {', '.join(str(t) for t in turmas[:10])}\n"
            
            if 'Mes' in self.reposicoes_data.columns:
                meses = self.reposicoes_data['Mes'].unique()
                context += f"- Meses: {', '.join(str(m) for m in meses)}\n"
        
        return context
    
    def search_data(self, query: str) -> Dict[str, Any]:
        """Busca informações relevantes nos dados baseado na query"""
        results = {}
        query_lower = query.lower()
        
        # Buscar em organized.csv
        if self.organized_data is not None:
            if 'aluno' in self.organized_data.columns:
                aluno_matches = self.organized_data[
                    self.organized_data['aluno'].astype(str).str.lower().str.contains(query_lower, na=False)
                ]
                if not aluno_matches.empty:
                    results['alunos_organized'] = aluno_matches.to_dict('records')
            
            if 'professor' in self.organized_data.columns:
                professor_matches = self.organized_data[
                    self.organized_data['professor'].astype(str).str.lower().str.contains(query_lower, na=False)
                ]
                if not professor_matches.empty:
                    results['professores'] = professor_matches.to_dict('records')
        
        # Buscar em reposicoes_completas.csv
        if self.reposicoes_data is not None:
            if 'Nome' in self.reposicoes_data.columns:
                nome_matches = self.reposicoes_data[
                    self.reposicoes_data['Nome'].astype(str).str.lower().str.contains(query_lower, na=False)
                ]
                if not nome_matches.empty:
                    results['reposicoes_aluno'] = nome_matches.to_dict('records')
            
            if 'Turma' in self.reposicoes_data.columns:
                turma_matches = self.reposicoes_data[
                    self.reposicoes_data['Turma'].astype(str).str.lower().str.contains(query_lower, na=False)
                ]
                if not turma_matches.empty:
                    results['reposicoes_turma'] = turma_matches.to_dict('records')
        
        return results
    
    def get_student_info(self, student_name: str) -> str:
        """Obtém informações detalhadas de um aluno com busca inteligente"""
        info = f"Informações sobre '{student_name}':\n\n"
        
        # Limpar e normalizar nome para busca
        search_name = self.normalize_search_term(student_name)
        
        # Buscar em organized.csv com correspondência aproximada
        found_organized = False
        if self.organized_data is not None and 'aluno' in self.organized_data.columns:
            # Busca exata primeiro
            aluno_data = self.organized_data[
                self.organized_data['aluno'].astype(str).str.lower().str.contains(search_name.lower(), na=False)
            ]
            
            # Se não encontrar, tentar busca aproximada
            if aluno_data.empty:
                aluno_data = self.fuzzy_search_student(self.organized_data, 'aluno', student_name)
            
            if not aluno_data.empty:
                found_organized = True
                info += "DADOS ORGANIZADOS:\n"
                for _, row in aluno_data.iterrows():
                    info += f"- Professor: {row.get('professor', 'N/A')}\n"
                    info += f"- Horário: {row.get('horario', 'N/A')}\n"
                    info += f"- Nível: {row.get('nivel', 'N/A')}\n\n"
        
        # Buscar em reposicoes_completas.csv com correspondência aproximada
        found_reposicoes = False
        if self.reposicoes_data is not None and 'Nome' in self.reposicoes_data.columns:
            # Busca exata primeiro
            reposicoes_data = self.reposicoes_data[
                self.reposicoes_data['Nome'].astype(str).str.lower().str.contains(search_name.lower(), na=False)
            ]
            
            # Se não encontrar, tentar busca aproximada
            if reposicoes_data.empty:
                reposicoes_data = self.fuzzy_search_student(self.reposicoes_data, 'Nome', student_name)
            
            if not reposicoes_data.empty:
                found_reposicoes = True
                info += "REPOSIÇÕES:\n"
                for _, row in reposicoes_data.iterrows():
                    info += f"- Data: {row.get('Data', 'N/A')}\n"
                    info += f"- Dia: {row.get('Dia', 'N/A')}\n"
                    info += f"- Hora: {row.get('Hora', 'N/A')}\n"
                    info += f"- Turma: {row.get('Turma', 'N/A')}\n"
                    info += f"- Mês/Ano: {row.get('Mes', 'N/A')}/{row.get('Ano', 'N/A')}\n\n"
        
        # Se não encontrou nada, tentar sugestões
        if not found_organized and not found_reposicoes:
            suggestions = self.find_similar_students(student_name)
            if suggestions:
                info = f"""🔍 **Não encontrei exatamente '{student_name}', mas encontrei alunos com nomes similares:**

{self.format_suggestions(suggestions)}

**💡 Dicas para busca:**
• Use o nome completo quando possível
• Verifique a grafia correta
• Tente variações (ex: "Adna" para "Adna Queiroz")
• Use apenas o primeiro nome se o completo não funcionar

Gostaria de informações sobre algum destes alunos?"""
            else:
                info = f"""🔍 **Não foram encontradas informações sobre '{student_name}'**

**🔍 Possíveis razões:**
• O nome pode estar grafado de forma diferente no sistema
• O aluno pode estar matriculado em outro período
• Erro de digitação no nome

**💡 Sugestões:**
• Verifique a grafia correta do nome
• Tente usar apenas o primeiro nome
• Consulte a lista completa de alunos da turma
• Entre em contato com a secretaria para confirmação

Posso ajudar a buscar de outra forma ou verificar informações de turmas específicas?"""
        
        return info
    
    def normalize_search_term(self, term: str) -> str:
        """Normaliza termo de busca removendo acentos e caracteres especiais"""
        import unicodedata
        # Remover acentos
        term = unicodedata.normalize('NFKD', term).encode('ASCII', 'ignore').decode('ASCII')
        # Remover caracteres especiais e converter para minúsculas
        term = ''.join(c for c in term.lower() if c.isalnum() or c.isspace())
        return term.strip()
    
    def fuzzy_search_student(self, df, column, search_term):
        """Busca aproximada usando várias estratégias"""
        import re
        from difflib import SequenceMatcher
        
        search_normalized = self.normalize_search_term(search_term)
        matches = []
        
        for idx, row in df.iterrows():
            if pd.isna(row[column]):
                continue
                
            name_in_df = str(row[column])
            name_normalized = self.normalize_search_term(name_in_df)
            
            # Busca por partes do nome
            search_parts = search_normalized.split()
            name_parts = name_normalized.split()
            
            # Verificar correspondência parcial
            for search_part in search_parts:
                for name_part in name_parts:
                    if search_part == name_part:
                        matches.append((1.0, row))
                        break
                    elif SequenceMatcher(None, search_part, name_part).ratio() > 0.7:
                        matches.append((SequenceMatcher(None, search_part, name_part).ratio(), row))
                        break
            
            # Busca por substring
            if search_normalized in name_normalized or name_normalized in search_normalized:
                matches.append((0.9, row))
        
        # Retornar melhores correspondências
        if matches:
            matches.sort(key=lambda x: x[0], reverse=True)
            best_matches = [row for score, row in matches if score >= 0.7]
            if best_matches:
                return pd.DataFrame(best_matches)
        
        return pd.DataFrame()
    
    def find_similar_students(self, student_name):
        """Encontra alunos com nomes similares"""
        import unicodedata
        from difflib import SequenceMatcher
        
        search_normalized = self.normalize_search_term(student_name)
        similar_students = []
        
        # Buscar em organized.csv
        if self.organized_data is not None and 'aluno' in self.organized_data.columns:
            for _, row in self.organized_data.iterrows():
                if pd.isna(row['aluno']):
                    continue
                    
                name_in_df = str(row['aluno'])
                name_normalized = self.normalize_search_term(name_in_df)
                
                # Calcular similaridade
                similarity = SequenceMatcher(None, search_normalized, name_normalized).ratio()
                
                if similarity > 0.6:  # 60% de similaridade
                    similar_students.append((similarity, name_in_df, 'organized'))
        
        # Buscar em reposicoes.csv
        if self.reposicoes_data is not None and 'Nome' in self.reposicoes_data.columns:
            for _, row in self.reposicoes_data.iterrows():
                if pd.isna(row['Nome']):
                    continue
                    
                name_in_df = str(row['Nome'])
                name_normalized = self.normalize_search_term(name_in_df)
                
                similarity = SequenceMatcher(None, search_normalized, name_normalized).ratio()
                
                if similarity > 0.6:
                    similar_students.append((similarity, name_in_df, 'reposicoes'))
        
        # Remover duplicados e ordenar por similaridade
        unique_students = {}
        for similarity, name, source in similar_students:
            name_lower = name.lower()
            if name_lower not in unique_students or similarity > unique_students[name_lower][0]:
                unique_students[name_lower] = (similarity, name, source)
        
        # Retornar top 5 sugestões
        sorted_students = sorted(unique_students.values(), key=lambda x: x[0], reverse=True)
        return sorted_students[:5]
    
    def format_suggestions(self, suggestions):
        """Formata sugestões de forma legível"""
        formatted = ""
        for i, (similarity, name, source) in enumerate(suggestions, 1):
            similarity_pct = int(similarity * 100)
            source_icon = "📊" if source == 'organized' else "📅"
            formatted += f"{i}. {source_icon} **{name}** (similaridade: {similarity_pct}%)\n"
        return formatted
    
    def get_turma_info(self, turma_name: str) -> str:
        """Obtém informações detalhadas de uma turma"""
        info = f"Informações sobre a turma '{turma_name}':\n\n"
        
        # Buscar em organized.csv
        if self.organized_data is not None and 'nivel' in self.organized_data.columns:
            turma_data = self.organized_data[
                self.organized_data['nivel'].astype(str).str.lower().str.contains(turma_name.lower(), na=False)
            ]
            if not turma_data.empty:
                info += f"DADOS ORGANIZADOS ({len(turma_data)} alunos):\n"
                alunos = turma_data['aluno'].dropna().unique()[:10]  # Limitar a 10 alunos
                for aluno in alunos:
                    info += f"- {aluno}\n"
                info += "\n"
        
        # Buscar em reposicoes_completas.csv
        if self.reposicoes_data is not None and 'Turma' in self.reposicoes_data.columns:
            reposicoes_turma = self.reposicoes_data[
                self.reposicoes_data['Turma'].astype(str).str.lower().str.contains(turma_name.lower(), na=False)
            ]
            if not reposicoes_turma.empty:
                info += f"REPOSIÇÕES DA TURMA ({len(reposicoes_turma)} registros):\n"
                for _, row in reposicoes_turma.iterrows():
                    info += f"- {row.get('Nome', 'N/A')} - {row.get('Data', 'N/A')} {row.get('Hora', 'N/A')}\n"
                info += "\n"
        
        if info == f"Informações sobre a turma '{turma_name}':\n\n":
            info = f"Não foram encontradas informações sobre a turma '{turma_name}'."
        
        return info
    
    def get_statistics(self) -> str:
        """Retorna estatísticas gerais dos dados"""
        stats = "ESTATÍSTICAS GERAIS:\n\n"
        
        if self.organized_data is not None:
            stats += f"DADOS ORGANIZADOS:\n"
            stats += f"- Total de registros: {len(self.organized_data)}\n"
            
            if 'aluno' in self.organized_data.columns:
                stats += f"- Alunos únicos: {self.organized_data['aluno'].dropna().nunique()}\n"
            
            if 'professor' in self.organized_data.columns:
                stats += f"- Professores únicos: {self.organized_data['professor'].dropna().nunique()}\n"
            
            if 'nivel' in self.organized_data.columns:
                niveis_count = self.organized_data['nivel'].dropna().value_counts()
                stats += "- Distribuição por nível:\n"
                for nivel, count in niveis_count.head(5).items():
                    stats += f"  * {nivel}: {count} alunos\n"
        
        stats += "\n"
        
        if self.reposicoes_data is not None:
            stats += f"DADOS DE REPOSIÇÕES:\n"
            stats += f"- Total de reposições: {len(self.reposicoes_data)}\n"
            
            if 'Nome' in self.reposicoes_data.columns:
                stats += f"- Alunos com reposição: {self.reposicoes_data['Nome'].nunique()}\n"
            
            if 'Turma' in self.reposicoes_data.columns:
                stats += f"- Turmas com reposição: {self.reposicoes_data['Turma'].nunique()}\n"
            
            if 'Mes' in self.reposicoes_data.columns:
                meses_count = self.reposicoes_data['Mes'].value_counts()
                stats += "- Reposições por mês:\n"
                for mes, count in meses_count.items():
                    stats += f"  * {mes}: {count} reposições\n"
        
        return stats
