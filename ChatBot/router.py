import re

class IntentRouter:
    def route(self, message: str):
        msg = message.lower()

        if any(k in msg for k in ["reposi", "reposicao", "falta", "remarcada"]):
            return "reposicoes"

        if any(k in msg for k in ["turma", "aula", "horario", "int", "kids"]):
            return "agenda"

        if re.search(r"\b(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\b", msg):
            return "reposicoes"

        return "geral"
