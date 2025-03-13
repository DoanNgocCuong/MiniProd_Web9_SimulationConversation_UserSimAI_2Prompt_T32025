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
    
    try:
        print(f"[Simulator] Starting API conversation with bot_id={bot_id}, max_turns={max_turns}")
        
        # Kiểm tra kết nối trước khi bắt đầu
        if not await manager.is_connected(client_id):
            print(f"Client {client_id} is no longer connected. Stopping simulation.")
            return
            
        # Kiểm tra Bot ID là số nguyên dương
        if not isinstance(bot_id, int) or bot_id <= 0:
            error_message = {
                "type": "error",
                "conversation_id": conversation_id,
                "message": f"Bot ID {bot_id} không hợp lệ. Bot ID phải là số nguyên dương."
            }
            if await manager.is_connected(client_id):
                await manager.send_message(error_message, client_id)
            return
            
        # Initialize API client
        api_client = AICoachAPI(bot_id=bot_id, timeout=60)
        
        # Quan trọng: Xử lý lỗi khởi tạo đúng cách
        if not api_client.init_conversation():
            error_detail = getattr(api_client, 'last_error', '')
            error_message = {
                "type": "error",
                "conversation_id": conversation_id,
                "message": f"Không thể khởi tạo cuộc hội thoại với Bot ID: {bot_id}. {error_detail} Vui lòng sử dụng Bot ID 16 đã được xác nhận hoạt động."
            }
            if await manager.is_connected(client_id):
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
        
    except Exception as e:
        print(f"[Simulator] Error in API conversation: {str(e)}")
        error_message = {
            "type": "error",
            "conversation_id": conversation_id,
            "message": f"Error in conversation: {str(e)}"
        }
        await manager.send_message(error_message, client_id) 