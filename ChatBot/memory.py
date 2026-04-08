class SessionMemory:
    def __init__(self):
        self.sessions = {}

    def get(self, session_id):
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "aluno": None,
                "turma": None,
                "periodo": None,
                "ultima_intencao": None
            }
        return self.sessions[session_id]

    def update(self, session_id, **kwargs):
        session = self.get(session_id)
        for k, v in kwargs.items():
            if v:
                session[k] = v

    def clear(self, session_id):
        if session_id in self.sessions:
            del self.sessions[session_id]