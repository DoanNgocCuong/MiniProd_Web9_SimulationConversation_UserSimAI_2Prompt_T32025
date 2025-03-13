import asyncio
from datetime import datetime
from typing import List, Dict, Optional, Tuple
import time

from connection_manager import ConnectionManager
from openai_client import generate_agent_response, generate_user_response
from api_client import AICoachAPI

async def simulate_conversation_with_openai(
    agent_prompt: str, 
    user_prompt: str, 
    conversation_id: str, 
    client_id: str,
    manager: ConnectionManager,
    max_turns: int = 5
):
    """Simulate a conversation between agent and user prompts using OpenAI for both roles"""
    
    # Initialize conversation history
    conversation_history = []
    
    # Start with agent
    agent_message, agent_time = await generate_agent_response(agent_prompt, conversation_history)
    
    # Create message object
    first_message = {
        "type": "message",
        "conversation_id": conversation_id,
        "message": {
            "role": "Agent",
            "content": agent_message,
            "timestamp": datetime.now().isoformat(),
            "response_time": round(agent_time, 3)
        }
    }
    
    # Send to client
    await manager.send_message(first_message, client_id)
    
    # Add to history
    conversation_history.append({"role": "Agent", "content": agent_message})
    
    # Conversation loop
    for turn in range(max_turns):
        await asyncio.sleep(1)  # Add a small delay for realism
        
        # User turn
        user_message, user_time = await generate_user_response(user_prompt, conversation_history)
        
        # Create message object
        user_message_obj = {
            "type": "message",
            "conversation_id": conversation_id,
            "message": {
                "role": "User",
                "content": user_message,
                "timestamp": datetime.now().isoformat(),
                "response_time": round(user_time, 3)
            }
        }
        
        # Send to client
        await manager.send_message(user_message_obj, client_id)
        
        # Add to history
        conversation_history.append({"role": "User", "content": user_message})
        
        await asyncio.sleep(1)  # Add a small delay for realism
        
        # Agent turn
        agent_message, agent_time = await generate_agent_response(agent_prompt, conversation_history)
        
        # Create message object
        agent_message_obj = {
            "type": "message",
            "conversation_id": conversation_id,
            "message": {
                "role": "Agent",
                "content": agent_message,
                "timestamp": datetime.now().isoformat(),
                "response_time": round(agent_time, 3)
            }
        }
        
        # Send to client
        await manager.send_message(agent_message_obj, client_id)
        
        # Add to history
        conversation_history.append({"role": "Agent", "content": agent_message})
    
    # Send completion message
    await asyncio.sleep(1)
    completion_message = {
        "type": "completion",
        "conversation_id": conversation_id,
        "message": "Conversation completed",
        "data": {
            "total_turns": max_turns,
            "conversation_history": conversation_history
        }
    }
    await manager.send_message(completion_message, client_id)

async def simulate_conversation_with_api(
    user_prompt: str, 
    conversation_id: str, 
    client_id: str,
    manager: ConnectionManager,
    bot_id: int = 16,
    max_turns: int = 5
):
    """Simulate a conversation with external API for Agent and OpenAI for User"""
    
    # Initialize API client
    api_client = AICoachAPI(bot_id=bot_id)
    if not api_client.init_conversation():
        error_message = {
            "type": "error",
            "conversation_id": conversation_id,
            "message": f"Failed to initialize API conversation with Bot ID: {bot_id}"
        }
        await manager.send_message(error_message, client_id)
        return
    
    # Initialize conversation history
    conversation_history = []
    
    # Start with user
    user_message, user_time = await generate_user_response(user_prompt, conversation_history)
    
    # Create message object
    first_message = {
        "type": "message",
        "conversation_id": conversation_id,
        "message": {
            "role": "User",
            "content": user_message,
            "timestamp": datetime.now().isoformat(),
            "response_time": round(user_time, 3)
        }
    }
    
    # Send to client
    await manager.send_message(first_message, client_id)
    
    # Add to history
    conversation_history.append({"role": "User", "content": user_message})
    
    # Send to API and get response
    agent_message, agent_time, full_response = await api_client.send_message(user_message)
    
    # Create message object
    agent_message_obj = {
        "type": "message",
        "conversation_id": conversation_id,
        "message": {
            "role": "Agent",
            "content": agent_message,
            "timestamp": datetime.now().isoformat(),
            "response_time": round(agent_time, 3),
            "full_response": full_response
        }
    }
    
    # Send to client
    await manager.send_message(agent_message_obj, client_id)
    
    # Add to history
    conversation_history.append({"role": "Agent", "content": agent_message})
    
    # Check if API wants to end conversation
    if full_response.get("status") == "END":
        completion_message = {
            "type": "completion",
            "conversation_id": conversation_id,
            "message": "Conversation completed (API requested end)",
            "data": {
                "total_turns": 1,
                "conversation_history": conversation_history
            }
        }
        await manager.send_message(completion_message, client_id)
        return
    
    # Conversation loop
    for turn in range(max_turns - 1):  # -1 because we already did one turn
        await asyncio.sleep(1)  # Add a small delay for realism
        
        # User turn
        user_message, user_time = await generate_user_response(user_prompt, conversation_history)
        
        # Create message object
        user_message_obj = {
            "type": "message",
            "conversation_id": conversation_id,
            "message": {
                "role": "User",
                "content": user_message,
                "timestamp": datetime.now().isoformat(),
                "response_time": round(user_time, 3)
            }
        }
        
        # Send to client
        await manager.send_message(user_message_obj, client_id)
        
        # Add to history
        conversation_history.append({"role": "User", "content": user_message})
        
        await asyncio.sleep(1)  # Add a small delay for realism
        
        # Send to API and get response
        agent_message, agent_time, full_response = await api_client.send_message(user_message)
        
        # Create message object
        agent_message_obj = {
            "type": "message",
            "conversation_id": conversation_id,
            "message": {
                "role": "Agent",
                "content": agent_message,
                "timestamp": datetime.now().isoformat(),
                "response_time": round(agent_time, 3),
                "full_response": full_response
            }
        }
        
        # Send to client
        await manager.send_message(agent_message_obj, client_id)
        
        # Add to history
        conversation_history.append({"role": "Agent", "content": agent_message})
        
        # Check if API wants to end conversation
        if full_response.get("status") == "END":
            completion_message = {
                "type": "completion",
                "conversation_id": conversation_id,
                "message": "Conversation completed (API requested end)",
                "data": {
                    "total_turns": turn + 2,  # +2 because we started at 0 and did one earlier
                    "conversation_history": conversation_history
                }
            }
            await manager.send_message(completion_message, client_id)
            return
    
    # Send completion message
    await asyncio.sleep(1)
    completion_message = {
        "type": "completion",
        "conversation_id": conversation_id,
        "message": "Conversation completed",
        "data": {
            "total_turns": max_turns,
            "conversation_history": conversation_history
        }
    }
    await manager.send_message(completion_message, client_id) 