import pandas as pd
from collections import defaultdict
import re

INPUT_CSV = "../tabelas/csv_pronto_embeddings.csv"
OUTPUT_CSV = "csv_documentos_agregados.csv"

def normalize(text):
    if not isinstance(text, str):
        return ""
    return text.strip()

def aggregate_professors(df):
    """
    Cria documentos do tipo PROFESSOR
    """
    professors = defaultdict(set)

    for _, row in df.iterrows():
        texto = str(row.get("texto", ""))

        match = re.search(r"professor\s+([A-ZÀ-ÿ\s]+)", texto, re.IGNORECASE)
        if match:
            prof = normalize(match.group(1))
            turma = normalize(row.get("turma"))
            if turma:
                professors[prof].add(turma)

    records = []
    for prof, turmas in professors.items():
        texto = (
            f"Professor {prof} leciona as seguintes turmas: "
            + ", ".join(sorted(turmas)) + "."
        )

        records.append({
            "texto": texto,
            "tipo": "professor",
            "professor": prof,
            "turmas": ", ".join(sorted(turmas)),
            "origem": "agregado"
        })

    return records


def aggregate_turmas(df):
    """
    Cria documentos do tipo TURMA / CATEGORIA (ex: KIDS)
    """
    categorias = defaultdict(set)

    for _, row in df.iterrows():
        turma = normalize(row.get("turma"))
        if turma:
            if turma.upper().startswith("KIDS"):
                categorias["KIDS"].add(turma)
            elif turma.upper().startswith("INT"):
                categorias["INT"].add(turma)

    records = []
    for categoria, turmas in categorias.items():
        texto = (
            f"As turmas da categoria {categoria} são: "
            + ", ".join(sorted(turmas)) + "."
        )

        records.append({
            "texto": texto,
            "tipo": "turma",
            "categoria": categoria,
            "turmas": ", ".join(sorted(turmas)),
            "origem": "agregado"
        })

    return records


def aggregate_reposicoes_por_mes(df):
    """
    Cria documentos de resumo mensal de reposições
    """
    reposicoes = df[df["origem"] == "reposicoes"]
    meses = defaultdict(list)

    for _, row in reposicoes.iterrows():
        data = str(row.get("data", ""))
        if "/" in data:
            mes = data.split("/")[1]
            meses[mes].append(row)

    records = []
    for mes, rows in meses.items():
        texto = (
            f"No mês {mes}, ocorreram {len(rows)} reposições de aula. "
            "As reposições envolvem diferentes alunos e turmas."
        )

        records.append({
            "texto": texto,
            "tipo": "resumo_reposicoes",
            "mes": mes,
            "quantidade": len(rows),
            "origem": "agregado"
        })

    return records


def main():
    print("📥 Lendo CSV base...")
    df = pd.read_csv(INPUT_CSV)

    aggregated_records = []

    print("🧠 Agregando professores...")
    aggregated_records.extend(aggregate_professors(df))

    print("🧠 Agregando turmas...")
    aggregated_records.extend(aggregate_turmas(df))

    print("🧠 Agregando reposições por mês...")
    aggregated_records.extend(aggregate_reposicoes_por_mes(df))

    df_agg = pd.DataFrame(aggregated_records)

    print(f"💾 Salvando {len(df_agg)} documentos agregados...")
    df_agg.to_csv(OUTPUT_CSV, index=False)

    print("✅ Agregação concluída!")
    print(f"Arquivo gerado: {OUTPUT_CSV}")


if __name__ == "__main__":
    main()
