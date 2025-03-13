from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
import uuid
import os
from dotenv import load_dotenv
import openai

from connection_manager import ConnectionManager
from conversation_simulator import simulate_conversation_with_openai, simulate_conversation_with_api

# Load environment variables
load_dotenv()

# Configure OpenAI API
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create connection manager
manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            data_json = json.loads(data)
            
            if data_json["type"] == "start_conversation":
                agent_mode = data_json.get("agent_mode", "prompt")  # "prompt" or "bot_id"
                agent_prompt = data_json.get("agent_prompt", "")
                bot_id = data_json.get("bot_id", 16)
                user_prompts = data_json["user_prompts"]
                max_turns = data_json.get("max_turns", 5)  # Get max_turns from frontend, default to 5
                
                # Create a response with conversation IDs
                conversations = []
                for user_prompt in user_prompts:
                    conversation_id = str(uuid.uuid4())
                    conversations.append({
                        "id": conversation_id,
                        "userPromptId": user_prompt["id"],
                        "status": "starting"
                    })
                
                # Send initial response with conversation IDs
                await websocket.send_json({
                    "type": "conversations_created",
                    "conversations": conversations
                })
                
                # Start all conversations in parallel
                tasks = []
                for idx, user_prompt in enumerate(user_prompts):
                    conversation_id = conversations[idx]["id"]
                    
                    if agent_mode == "bot_id":
                        task = asyncio.create_task(
                            simulate_conversation_with_api(
                                user_prompt["content"], 
                                conversation_id,
                                client_id,
                                manager,
                                bot_id,
                                max_turns  # Pass max_turns to the simulator
                            )
                        )
                    else:  # agent_mode == "prompt"
                        task = asyncio.create_task(
                            simulate_conversation_with_openai(
                                agent_prompt, 
                                user_prompt["content"], 
                                conversation_id,
                                client_id,
                                manager,
                                max_turns  # Pass max_turns to the simulator
                            )
                        )
                    tasks.append(task)
                
                # Let the conversations run in the background
                asyncio.gather(*tasks)
                
    except WebSocketDisconnect:
        manager.disconnect(client_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=25050) 