"""
main_rag_complete.py
Servidor RAG completo com todos os componentes
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from connection_manager import ConnectionManager
from chat_engine_rag import ChatEngineRAG
import uvicorn
import os

app = FastAPI(
    title="Maikito-san RAG Chatbot (Completo)",
    description="Sistema RAG completo com ChromaDB + Gemma LLM + Router + Memory"
)

manager = ConnectionManager()
chat_engine = ChatEngineRAG()

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await manager.connect(websocket)
    session_id = id(websocket)

    try:
        while True:
            data = await websocket.receive_text()

            # Evento: usuário enviou mensagem
            await websocket.send_json({
                "type": "status",
                "message": "🧠 Processando com RAG completo..."
            })

            response = chat_engine.respond(
                message=data,
                session_id=session_id
            )

            await websocket.send_json({
                "type": "answer",
                "message": response
            })

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        chat_engine.memory.clear(session_id)

@app.get("/")
async def root():
    return {
        "message": "Maikito-san RAG Chatbot (Completo)",
        "features": [
            "ChromaDB Vector Database",
            "Gemma LLM (Google AI)",
            "Semantic Search",
            "Intent Router",
            "Session Memory",
            "WebSocket Real-time"
        ],
        "endpoints": {
            "websocket": "/ws/chat",
            "rest": "/chat",
            "docs": "/docs"
        },
        "status": "operational"
    }

@app.post("/chat")
async def chat_rest(message_data: dict):
    try:
        message = message_data.get("message", "")
        if not message:
            return {"error": "Mensagem vazia"}, 400
        
        response = chat_engine.respond(message, session_id=0)
        return {"response": response}
        
    except Exception as e:
        print(f"Erro no chat REST: {e}")
        return {"error": "Erro interno"}, 500

if __name__ == "__main__":
    print("=" * 80)
    print("🚀 MAIKITO-SAN RAG CHATBOT - VERSÃO COMPLETA")
    print("=" * 80)
    print("🎯 Componentes Ativos:")
    print("  ✅ ChromaDB - Banco vetorial (1.100+ docs)")
    print("  ✅ Gemma LLM - Google AI Language Model")
    print("  ✅ Router - Classificação de intenções")
    print("  ✅ Memory - Memória de sessão")
    print("  ✅ WebSocket - Comunicação real-time")
    print("  ✅ FastAPI - Servidor assíncrono")
    print("-" * 80)
    
    # Verificar API Key
    api_key = os.getenv("GOOGLE_API_KEY")
    if api_key:
        print("🔑 API Key do Google AI configurada")
        print("🤖 Respostas com Gemma LLM ativadas")
    else:
        print("⚠️  API Key do Google AI não configurada")
        print("📝 Usando modo de busca semântica apenas")
    
    print("-" * 80)
    print("🌐 Acesse:")
    print("  📱 Interface: http://localhost:8000")
    print("  🌐 WebSocket: ws://localhost:8000/ws/chat")
    print("  📚 API Docs: http://localhost:8000/docs")
    print("  🧠 RAG: Retrieval-Augmented Generation")
    print("-" * 80)
    print("⚠️  Pressione Ctrl+C para parar")
    print("=" * 80)
    
    uvicorn.run(
        "main_rag_complete:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
