"""
main_smart.py
Servidor FastAPI com chatbot inteligente (documentos agregados + intent router)
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import asyncio
from typing import Dict, Set

from chat_engine_smart import SmartChatEngine

app = FastAPI(
    title="Maikito-san Smart Chatbot",
    description="Chatbot RAG com documentos agregados e intent router",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Chat Engine
chat_engine = SmartChatEngine()

# Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}
        self.session_counter = 0

    async def connect(self, websocket: WebSocket) -> int:
        await websocket.accept()
        self.session_counter += 1
        session_id = self.session_counter
        self.active_connections[session_id] = websocket
        
        # Enviar mensagem de boas-vindas
        welcome_msg = {
            "type": "status",
            "message": f"🤖 Chatbot Smart conectado! Sessão: {session_id}"
        }
        await websocket.send_text(json.dumps(welcome_msg))
        
        return session_id

    def disconnect(self, session_id: int):
        if session_id in self.active_connections:
            del self.active_connections[session_id]

    async def send_message(self, session_id: int, message: str):
        if session_id in self.active_connections:
            websocket = self.active_connections[session_id]
            await websocket.send_text(json.dumps({
                "type": "response",
                "message": message
            }))

manager = ConnectionManager()

# Request Model
class ChatRequest(BaseModel):
    message: str

# Endpoints
@app.get("/")
async def root():
    return {
        "message": "Maikito-san Smart Chatbot",
        "version": "2.0.0",
        "features": [
            "🧠 Documentos Agregados",
            "🎯 Intent Router Inteligente",
            "🔍 Smart Search",
            "💾 Session Memory",
            "🤖 Gemma LLM Otimizado",
            "📊 ChromaDB Avançado"
        ],
        "endpoints": {
            "websocket": "/ws/chat",
            "rest": "/chat",
            "docs": "/docs"
        },
        "status": "operational"
    }

@app.post("/chat")
async def chat_rest(request: ChatRequest):
    """Endpoint REST para chat"""
    try:
        response = chat_engine.respond(request.message, session_id=0)
        return {"response": response}
    except Exception as e:
        return {"error": f"Erro: {str(e)}"}, 500

@app.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    """Endpoint WebSocket para chat em tempo real"""
    session_id = await manager.connect(websocket)
    
    try:
        while True:
            # Receber mensagem
            data = await websocket.receive_text()
            message_data = json.loads(data)
            message = message_data.get("message", "")
            
            if not message.strip():
                continue
            
            # Enviar status de processamento
            await websocket.send_text(json.dumps({
                "type": "status",
                "message": "🔍 Processando sua pergunta..."
            }))
            
            # Processar mensagem
            try:
                response = chat_engine.respond(message, session_id)
                
                # Enviar resposta
                await manager.send_message(session_id, response)
                
            except Exception as e:
                error_msg = f"❌ Erro ao processar: {str(e)}"
                await manager.send_message(session_id, error_msg)
                
    except WebSocketDisconnect:
        manager.disconnect(session_id)
        print(f"🔌 Cliente {session_id} desconectado")
    except Exception as e:
        print(f"❌ Erro no WebSocket: {e}")
        manager.disconnect(session_id)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "chat_engine": "smart",
        "active_connections": len(manager.active_connections)
    }

if __name__ == "__main__":
    import uvicorn
    
    print("=" * 80)
    print("🚀 MAIKITO-SAN SMART CHATBOT")
    print("=" * 80)
    print("🎯 Recursos Avançados:")
    print("  ✅ Documentos Agregados (47 docs estruturados)")
    print("  ✅ Intent Router (classificação inteligente)")
    print("  ✅ Smart Search (busca otimizada)")
    print("  ✅ Session Memory (contexto)")
    print("  ✅ Gemma LLM (respostas precisas)")
    print("  ✅ ChromaDB (1000+ docs)")
    print("=" * 80)
    
    uvicorn.run(
        "main_smart:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
