#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para converter o arquivo CSV para o formato JSON usado pelo dashboard
"""

import pandas as pd
import json
from collections import defaultdict
import os

def csv_para_json(caminho_csv='tabelas/01.csv', caminho_json='dados_organizados.json'):
    """
    Converte o arquivo CSV para o formato JSON do dashboard
    """
    try:
        # Verificar se o arquivo CSV existe
        if not os.path.exists(caminho_csv):
            print(f"Erro: Arquivo {caminho_csv} não encontrado!")
            return False
        
        # Ler o arquivo CSV tratando campos extras
        print(f"Lendo arquivo: {caminho_csv}")
        df = pd.read_csv(caminho_csv, on_bad_lines='skip')
        
        # Remover linhas vazias
        df = df.dropna(subset=['aluno'])
        print(f"Total de linhas válidas: {len(df)}")
        
        # Agrupar dados
        agrupado = defaultdict(list)
        
        for _, row in df.iterrows():
            # Normalizar o dia para maiúsculas e tratar valores inválidos
            dia_raw = row['dia'] if pd.notna(row['dia']) else ''
            if dia_raw.lower() == 'dia':
                continue  # Pular linhas com 'dia' inválido
            
            chave = (
                row['teacher'].upper() if pd.notna(row['teacher']) else '', 
                row['horario'] if pd.notna(row['horario']) else '',
                dia_raw.upper(),  # Converter para maiúsculas
                row['turma'] if pd.notna(row['turma']) else ''
            )
            
            aluno = row['aluno'] if pd.notna(row['aluno']) else ''
            obs = row['observacoes'] if pd.notna(row['observacoes']) else ''
            
            if obs:
                aluno_com_obs = f"{aluno} - {obs}"
            else:
                aluno_com_obs = aluno
            
            agrupado[chave].append(aluno_com_obs)
        
        # Converter para o formato JSON esperado
        horarios = []
        for (professor, horario, dia, turma), alunos in agrupado.items():
            horarios.append({
                'professor': professor,
                'horario': horario,
                'dia': dia,
                'turma': turma,
                'alunos': alunos,
                'quantidade_alunos': len(alunos)
            })
        
        # Criar o dicionário final
        dados_finais = {
            'horarios': horarios
        }
        
        # Salvar como JSON
        with open(caminho_json, 'w', encoding='utf-8') as f:
            json.dump(dados_finais, f, ensure_ascii=False, indent=2)
        
        print(f"✅ JSON atualizado com sucesso!")
        print(f"📊 Total de horários: {len(horarios)}")
        print(f"💾 Arquivo salvo como: {caminho_json}")
        
        # Estatísticas adicionais
        professores = set(h['professor'] for h in horarios if h['professor'])
        dias = set(h['dia'] for h in horarios if h['dia'])
        turmas = set(h['turma'] for h in horarios if h['turma'])
        
        print(f"\n📈 Estatísticas:")
        print(f"   Professores: {len(professores)}")
        print(f"   Dias da semana: {len(dias)}")
        print(f"   Turmas: {len(turmas)}")
        print(f"   Total de alunos: {sum(h['quantidade_alunos'] for h in horarios)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao processar: {e}")
        return False

if __name__ == "__main__":
    print("🔄 Atualizando JSON a partir do CSV...")
    print("=" * 50)
    
    # Executar a conversão
    sucesso = csv_para_json()
    
    print("=" * 50)
    if sucesso:
        print("✨ Processo concluído com sucesso!")
    else:
        print("❌ Falha no processo!")
