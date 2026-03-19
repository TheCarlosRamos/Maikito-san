#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para converter o arquivo CSV para Excel
"""

import pandas as pd
import os
from datetime import datetime

def csv_para_excel(caminho_csv='tabelas/01.csv', caminho_excel=None):
    """
    Converte o arquivo CSV para Excel
    """
    try:
        # Verificar se o arquivo CSV existe
        if not os.path.exists(caminho_csv):
            print(f"Erro: Arquivo {caminho_csv} não encontrado!")
            return False
        
        # Se não for especificado o caminho do Excel, usar o mesmo nome do CSV
        if caminho_excel is None:
            nome_base = os.path.splitext(os.path.basename(caminho_csv))[0]
            caminho_excel = f"tabelas/{nome_base}.xlsx"
        
        print(f"Lendo arquivo: {caminho_csv}")
        
        # Ler o arquivo CSV tratando campos extras
        df = pd.read_csv(caminho_csv, on_bad_lines='skip')
        
        # Remover linhas completamente vazias
        df = df.dropna(how='all')
        
        print(f"Total de linhas: {len(df)}")
        print(f"Colunas: {list(df.columns)}")
        
        # Salvar como Excel
        with pd.ExcelWriter(caminho_excel, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Dados', index=False)
            
            # Adicionar uma planilha de resumo
            resumo = criar_resumo(df)
            resumo.to_excel(writer, sheet_name='Resumo', index=False)
        
        print(f"✅ Excel criado com sucesso!")
        print(f"📊 Arquivo salvo como: {caminho_excel}")
        
        # Estatísticas
        print(f"\n📈 Estatísticas:")
        print(f"   Total de registros: {len(df)}")
        if 'teacher' in df.columns:
            professores = df['teacher'].dropna().unique()
            print(f"   Professores: {len(professores)}")
        if 'dia' in df.columns:
            dias = df['dia'].dropna().unique()
            print(f"   Dias da semana: {len(dias)}")
        if 'turma' in df.columns:
            turmas = df['turma'].dropna().unique()
            print(f"   Turmas: {len(turmas)}")
        if 'aluno' in df.columns:
            alunos = df['aluno'].dropna()
            print(f"   Total de alunos: {len(alunos)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao processar: {e}")
        return False

def criar_resumo(df):
    """
    Cria uma planilha de resumo com estatísticas
    """
    resumo_data = []
    
    # Resumo por professor
    if 'teacher' in df.columns:
        prof_stats = df.groupby('teacher').agg({
            'aluno': 'count'
        }).reset_index()
        prof_stats.columns = ['Professor', 'Total de Alunos']
        resumo_data.append(('=== POR PROFESSOR ===', ''))
        for _, row in prof_stats.iterrows():
            resumo_data.append((row['Professor'], row['Total de Alunos']))
    
    # Resumo por turma
    if 'turma' in df.columns:
        turma_stats = df.groupby('turma').agg({
            'aluno': 'count'
        }).reset_index()
        turma_stats.columns = ['Turma', 'Total de Alunos']
        resumo_data.append(('', ''))
        resumo_data.append(('=== POR TURMA ===', ''))
        for _, row in turma_stats.iterrows():
            resumo_data.append((row['Turma'], row['Total de Alunos']))
    
    # Resumo por dia
    if 'dia' in df.columns:
        dia_stats = df.groupby('dia').agg({
            'aluno': 'count'
        }).reset_index()
        dia_stats.columns = ['Dia', 'Total de Alunos']
        resumo_data.append(('', ''))
        resumo_data.append(('=== POR DIA ===', ''))
        for _, row in dia_stats.iterrows():
            resumo_data.append((row['Dia'], row['Total de Alunos']))
    
    resumo_df = pd.DataFrame(resumo_data, columns=['Categoria', 'Valor'])
    return resumo_df

if __name__ == "__main__":
    print("🔄 Convertendo CSV para Excel...")
    print("=" * 50)
    
    # Executar a conversão
    sucesso = csv_para_excel()
    
    print("=" * 50)
    if sucesso:
        print("✨ Processo concluído com sucesso!")
        print("\n💡 Dica: Use o script 'atualizar_json.py' para atualizar o dashboard")
    else:
        print("❌ Falha no processo!")
