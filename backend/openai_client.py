import time
from typing import List, Tuple
import openai

def convert_roles_for_api(messages, is_agent_turn=True):
    """
    Convert agent/user roles to assistant/user for OpenAI API
    is_agent_turn: True if it's agent's turn, False if it's user's turn
    """
    converted_messages = []
    for msg in messages:
        if is_agent_turn:
            if msg["role"] == "Agent":
                role = "assistant"
            else:
                role = "user"
        else:
            if msg["role"] == "User":
                role = "assistant"
            else:
                role = "user"
        
        converted_messages.append({
            "role": role,
            "content": msg["content"]
        })
    return converted_messages

async def generate_agent_response(agent_prompt: str, conversation_history: List[dict]) -> Tuple[str, float]:
    """Generate response for Agent (roleA in the source code)"""
    try:
        start_time = time.time()
        
        # Format messages for OpenAI
        api_messages = [{"role": "system", "content": agent_prompt}]
        if conversation_history:
            converted_history = convert_roles_for_api(conversation_history, is_agent_turn=True)
            api_messages.extend(converted_history)
        
        # Call OpenAI API
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=api_messages,
            temperature=0.7,
            max_tokens=300
        )
        
        end_time = time.time()
        response_time = end_time - start_time
        agent_message = response.choices[0].message.content
        
        return agent_message, response_time
    except Exception as e:
        print(f"Error generating agent response: {e}")
        return f"I'm sorry, I couldn't generate a response. Error: {str(e)[:100]}...", 0

async def generate_user_response(user_prompt: str, conversation_history: List[dict]) -> Tuple[str, float]:
    """Generate response for User (roleB in the source code)"""
    try:
        start_time = time.time()
        
        # Format messages for OpenAI
        api_messages = [{"role": "system", "content": user_prompt}]
        if conversation_history:
            converted_history = convert_roles_for_api(conversation_history, is_agent_turn=False)
            api_messages.extend(converted_history)
        
        # Call OpenAI API
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=api_messages,
            temperature=0.7,
            max_tokens=300
        )
        
        end_time = time.time()
        response_time = end_time - start_time
        user_message = response.choices[0].message.content
        
        return user_message, response_time
    except Exception as e:
        print(f"Error generating user response: {e}")
        return f"I'm sorry, I couldn't generate a response. Error: {str(e)[:100]}...", 0 