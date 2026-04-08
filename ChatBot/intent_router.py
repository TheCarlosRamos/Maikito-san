import re
import unicodedata

MESES = {
    "janeiro": "01",
    "fevereiro": "02",
    "março": "03",
    "marco": "03",
    "abril": "04",
    "maio": "05",
    "junho": "06",
    "julho": "07",
    "agosto": "08",
    "setembro": "09",
    "outubro": "10",
    "novembro": "11",
    "dezembro": "12",
}

def normalize(text: str) -> str:
    return unicodedata.normalize(
        "NFKD", text.lower()
    ).encode("ascii", "ignore").decode("ascii")


def route_intent(question: str) -> dict:
    q = normalize(question)

    # -------------------------
    # PROFESSOR
    # -------------------------
    if "professor" in q:
        match = re.search(r"professor\s+([a-z\s]+)", q)
        return {
            "intent": "professor",
            "where": {"tipo": "professor"},
            "entity": match.group(1).strip() if match else None,
            "strategy": "entity"
        }

    # -------------------------
    # TURMAS (KIDS / INT)
    # -------------------------
    if "turma" in q or "turmas" in q:
        if "kids" in q:
            return {
                "intent": "turmas_categoria",
                "where": {"tipo": "turma", "categoria": "KIDS"},
                "strategy": "list"
            }
        if "int" in q:
            return {
                "intent": "turmas_categoria",
                "where": {"tipo": "turma", "categoria": "INT"},
                "strategy": "list"
            }

    # -------------------------
    # REPOSIÇÕES POR MÊS
    # -------------------------
    for mes_nome, mes_num in MESES.items():
        if mes_nome in q:
            return {
                "intent": "reposicoes_mes",
                "where": {"tipo": "resumo_reposicoes", "mes": mes_num},
                "mes": mes_nome,
                "strategy": "summary"
            }

    # -------------------------
    # REPOSIÇÃO POR ALUNO
    # -------------------------
    if "reposi" in q:
        return {
            "intent": "reposicao_aluno",
            "where": {"origem": "reposicoes"},
            "strategy": "rag"
        }

    # -------------------------
    # AGENDA / TURMA
    # -------------------------
    if any(k in q for k in ["aula", "horario", "agenda", "int", "kids", "lk"]):
        # Tentar extrair o alvo (turma ou aluno)
        match = re.search(r"(?:turma|aluno|da|do|de)\s+([a-z0-9\s]+)", q)
        entity = match.group(1).strip() if match else question
        # Limpar pontuações ou palavras desnecessárias (exemplo básico)
        entity = entity.replace("?", "").replace("!", "").strip()
        
        return {
            "intent": "agenda_turma",
            "where": {"origem": "organized"},
            "entity": entity,
            "strategy": "entity"
        }

    # -------------------------
    # FALLBACK
    # -------------------------
    return {
        "intent": "busca_geral",
        "where": {},
        "strategy": "rag"
    }
