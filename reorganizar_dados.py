import json
import re
from collections import defaultdict

def reorganizar_horarios(dados_crus):
    """
    Reorganiza os dados de horários do Excel mal estruturado para uma estrutura limpa
    """
    horarios_organizados = []

    if not dados_crus or len(dados_crus) < 3:
        return horarios_organizados

    # Identificar professores (linha 0, colunas com nomes)
    professores = []
    linha_professores = dados_crus[0]

    for key, value in linha_professores.items():
        if key.startswith('Unnamed: ') and value and value.strip():
            col_index = int(key.split(': ')[1])
            professores.append({
                'nome': value.strip(),
                'coluna_inicio': col_index
            })

    # Identificar dias da semana (linha 1)
    linha_dias = dados_crus[1]
    dias_por_professor = {}

    for prof in professores:
        dias_prof = []
        for i in range(7):  # 7 dias da semana
            col_key = f'Unnamed: {prof["coluna_inicio"] + 1 + i}'
            if col_key in linha_dias and linha_dias[col_key]:
                dias_prof.append(linha_dias[col_key].strip())
        dias_por_professor[prof['nome']] = dias_prof

    # Processar dados de horários (linhas 2+)
    for linha_idx, linha in enumerate(dados_crus[2:], 2):
        horario = linha.get('Unnamed: 1', '').strip()
        if not horario or ':' not in horario:
            continue

        # Para cada professor, extrair as turmas dos dias
        for prof in professores:
            prof_nome = prof['nome']
            coluna_base = prof['coluna_inicio'] + 1  # +1 porque Unnamed: 1 é horário

            for dia_idx, dia in enumerate(dias_por_professor[prof_nome]):
                coluna_turma = f'Unnamed: {coluna_base + dia_idx}'
                turma = linha.get(coluna_turma, '').strip()

                if turma and turma != dia:  # Evitar duplicatas dos cabeçalhos
                    # Identificar alunos (linhas subsequentes)
                    alunos = []
                    linha_atual = linha_idx + 1

                    while linha_atual < len(dados_crus):
                        linha_aluno = dados_crus[linha_atual]
                        aluno_nome = linha_aluno.get(coluna_turma, '').strip()

                        if aluno_nome and not aluno_nome.replace(':', '').replace('TEACHER', '').strip():
                            # É uma linha de professor
                            teacher_match = re.search(r'TEACHER:\s*(.+)', aluno_nome, re.IGNORECASE)
                            if teacher_match:
                                prof_nome_real = teacher_match.group(1).strip()
                                break
                        elif aluno_nome and aluno_nome != 'TEACHER':
                            alunos.append(aluno_nome)
                            linha_atual += 1
                        else:
                            break

                    # Criar registro organizado
                    registro = {
                        'professor': prof_nome,
                        'horario': horario,
                        'dia': dia,
                        'turma': turma,
                        'alunos': alunos,
                        'quantidade_alunos': len(alunos)
                    }

                    # Adicionar apenas se não for cabeçalho
                    if turma not in ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO']:
                        horarios_organizados.append(registro)

    return horarios_organizados

def reorganizar_estatisticas(dados_crus):
    """
    Reorganiza os dados de estatísticas (Pef) que já estão mais estruturados
    """
    estatisticas_organizadas = []

    for item in dados_crus:
        if item.get('Unnamed: 0') and item.get('Unnamed: 1') is not None:
            registro = {
                'metrica': item['Unnamed: 0'].strip(),
                'valor': item['Unnamed: 1'],
                'tipo': 'estatistica'
            }
            estatisticas_organizadas.append(registro)

    return estatisticas_organizadas

def main():
    # Carregar dados originais
    with open('dados.json', 'r', encoding='utf-8') as f:
        dados_originais = json.load(f)

    # Reorganizar horários
    horarios_crus = dados_originais.get('Horários', [])
    horarios_organizados = reorganizar_horarios(horarios_crus)

    # Reorganizar estatísticas
    estatisticas_crus = dados_originais.get('Pef', [])
    estatisticas_organizadas = reorganizar_estatisticas(estatisticas_crus)

    # Criar estrutura final organizada
    dados_organizados = {
        'horarios': horarios_organizados,
        'estatisticas': estatisticas_organizadas,
        'metadata': {
            'total_horarios': len(horarios_organizados),
            'total_estatisticas': len(estatisticas_organizadas),
            'professores_unicos': len(set(h['professor'] for h in horarios_organizados)),
            'turmas_unicas': len(set(h['turma'] for h in horarios_organizados))
        }
    }

    # Salvar dados organizados
    with open('dados_organizados.json', 'w', encoding='utf-8') as f:
        json.dump(dados_organizados, f, ensure_ascii=False, indent=2)

    print("✅ Dados reorganizados com sucesso!")
    print(f"📊 {len(horarios_organizados)} registros de horário processados")
    print(f"📈 {len(estatisticas_organizadas)} estatísticas processadas")
    print(f"👨‍🏫 {dados_organizados['metadata']['professores_unicos']} professores únicos")
    print(f"📚 {dados_organizados['metadata']['turmas_unicas']} turmas únicas")

    # Mostrar exemplo dos dados organizados
    if horarios_organizados:
        print("\n📋 Exemplo de horário organizado:")
        print(json.dumps(horarios_organizados[0], ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()