import json

with open('relational.json') as f:
    data = json.load(f)

# Procurar dados de SegQua (segunda e quarta?)
segqua = [item for item in data if item.get('sheet') == 'SegQua']
print(f'Total de itens em SegQua: {len(segqua)}')

# Encontrar linhas que pareçam ter nomes de alunos (não números ou vazias)
alunos_candidates = []
for item in segqua:
    val = str(item.get('value', '')).strip()
    # Procurar por valores que pareçam nomes (com letras, não números)
    if val and len(val) > 2 and not val.startswith('Unnamed') and any(c.isalpha() for c in val):
        alunos_candidates.append(item)

print(f'\nPrimeiros 50 candidatos a alunos:')
for item in alunos_candidates[:50]:
    print(f"Row {item['row']:3d}, Col {item['column']:15s}: {item['value'][:60]}")

# Mostrar estrutura por linha de uma linha específica
print(f'\n\nDados completos da linha 1 (primeiros 20 itens):')
linha1 = [item for item in segqua if item['row'] == 1]
for item in linha1[:20]:
    print(f"Col {item['column']:15s}: {item['value'][:60]}")
