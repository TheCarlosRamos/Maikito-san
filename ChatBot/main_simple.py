from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from connection_manager import ConnectionManager
from chat_engine_simple import ChatEngine
import uvicorn

app = FastAPI(title="Maikito-san RAG Chatbot (Simple)")

manager = ConnectionManager()
chat_engine = ChatEngine()

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
                "message": "🔍 Buscando informações..."
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
        chat_engine.clear_session(session_id)

if __name__ == "__main__":
    print("🚀 Servidor RAG Simplificado iniciado!")
    print("📱 Acesse: http://localhost:8000")
    print("🌐 WebSocket: ws://localhost:8000/ws/chat")
    print("📚 API Docs: http://localhost:8000/docs")
    print("⚠️  Modo: Simulação (sem API Key)")
    
    uvicorn.run(
        "main_simple:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
