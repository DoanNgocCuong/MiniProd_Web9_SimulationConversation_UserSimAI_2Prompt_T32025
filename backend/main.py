from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
import uuid
from datetime import datetime
from typing import Dict, List
import time
import random

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store for active connections
active_connections: Dict[str, WebSocket] = {}

class ConnectionManager:
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        active_connections[client_id] = websocket
        
    def disconnect(self, client_id: str):
        if client_id in active_connections:
            del active_connections[client_id]
            
    async def send_message(self, message: dict, client_id: str):
        if client_id in active_connections:
            await active_connections[client_id].send_json(message)

manager = ConnectionManager()

async def simulate_conversation(agent_prompt: str, user_prompt: str, conversation_id: str, client_id: str):
    """Simulate a conversation between agent and user prompts"""
    
    # Initialize conversation with the first message from Agent
    current_turn = "Agent"
    turns = 0
    max_turns = 5  # Limit to 5 back-and-forth exchanges
    
    # Simulate first message from agent
    await asyncio.sleep(1)  # Add a small delay for realism
    first_message = {
        "type": "message",
        "conversation_id": conversation_id,
        "message": {
            "role": "Agent",
            "content": f"Hello! I'm your AI assistant based on this prompt: '{agent_prompt[:30]}...'",
            "timestamp": datetime.now().isoformat()
        }
    }
    await manager.send_message(first_message, client_id)
    
    # Alternate between agent and user responses
    while turns < max_turns:
        await asyncio.sleep(2 + random.random() * 3)  # Random delay between 2-5 seconds
        
        if current_turn == "Agent":
            current_turn = "User"
            message_content = f"As a user with prompt '{user_prompt[:20]}...', I have a question about {random.choice(['pricing', 'features', 'support', 'documentation', 'use cases'])}"
        else:
            current_turn = "Agent"
            message_content = f"Based on my programming: '{agent_prompt[:20]}...', I can tell you that {random.choice(['we offer flexible plans', 'our features include AI capabilities', 'our support team is available 24/7', 'comprehensive documentation is available', 'typical use cases include automation'])}"
        
        message = {
            "type": "message",
            "conversation_id": conversation_id,
            "message": {
                "role": current_turn,
                "content": message_content,
                "timestamp": datetime.now().isoformat()
            }
        }
        
        await manager.send_message(message, client_id)
        turns += 1
    
    # Send completion message
    await asyncio.sleep(1)
    completion_message = {
        "type": "completion",
        "conversation_id": conversation_id,
        "message": "Conversation completed"
    }
    await manager.send_message(completion_message, client_id)

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            data_json = json.loads(data)
            
            if data_json["type"] == "start_conversation":
                agent_prompt = data_json["agent_prompt"]
                user_prompts = data_json["user_prompts"]
                
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
                    task = asyncio.create_task(
                        simulate_conversation(
                            agent_prompt, 
                            user_prompt["content"], 
                            conversation_id,
                            client_id
                        )
                    )
                    tasks.append(task)
                
                # Let the conversations run in the background
                asyncio.gather(*tasks)
                
    except WebSocketDisconnect:
        manager.disconnect(client_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 