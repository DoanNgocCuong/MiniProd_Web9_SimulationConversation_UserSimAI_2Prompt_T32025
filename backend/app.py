import os
import json
import time
import sys
import asyncio
import requests
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get OpenAI API key from environment variable
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("Error: OPENAI_API_KEY environment variable not set")
    sys.exit(1)

# Initialize OpenAI client
client = AsyncOpenAI(api_key=api_key)

# Initialize FastAPI app
app = FastAPI(title="Bot Simulation API")

# Define request model
class SimulationRequest(BaseModel):
    bot_id: int = 16
    user_prompt: str = "sẵn sàng"
    max_turns: int = 3
    history: str = "[]"

# Define response model
class SimulationResponse(BaseModel):
    success: bool
    conversation_history: List[dict]
    simulation_conversation: List[dict] = []
    error: Optional[str] = None

class SimulationTester:
    def __init__(self, bot_id=16):
        self.base_url = "http://103.253.20.13:9404"
        self.init_endpoint = f"{self.base_url}/robot-ai-lesson/api/v1/bot/initConversation"
        self.webhook_endpoint = f"{self.base_url}/robot-ai-lesson/api/v1/bot/webhook"
        self.conversation_id = str(int(time.time() * 1001))
        self.bot_id = bot_id
        self.conversation_history = []
    
    async def init_conversation(self):
        """Initialize conversation with the bot."""
        print(f"\n===== Initializing Conversation =====")
        print(f"Bot ID: {self.bot_id}")
        print(f"Conversation ID: {self.conversation_id}")
        
        payload = {
            "bot_id": self.bot_id,
            "conversation_id": self.conversation_id,
            "input_slots": {}
        }
        
        # Thêm retry logic và tăng timeout
        max_retries = 1
        timeout_seconds = 3600  # Tăng timeout lên 100000 giây
        retry_delay = 1
        
        for attempt in range(max_retries):
            try:
                print(f"Connection attempt {attempt+1}/{max_retries}...")
                start_time = time.time()
                
                # Thêm verify=False để bỏ qua SSL verification nếu cần
                response = requests.post(
                    self.init_endpoint,
                    headers={'Content-Type': 'application/json'},
                    json=payload,
                    timeout=timeout_seconds,
                    verify=False  # Thêm dòng này nếu có vấn đề về SSL
                )
                
                elapsed_time = time.time() - start_time
                
                print(f"Response received in {elapsed_time:.2f} seconds")
                print(f"Status code: {response.status_code}")
                
                if response.status_code != 200:
                    print(f"Error: HTTP {response.status_code}")
                    print(f"Response: {response.text}")
                    if attempt < max_retries - 1:
                        print(f"Retrying in {retry_delay} seconds...")
                        await asyncio.sleep(retry_delay)
                        continue
                    return False
                
                data = response.json()
                if data.get("status") != 0 or data.get("msg") != "Success":
                    print(f"Error: API returned error: {data}")
                    return False
                
                print(f"Conversation initialized successfully")
                return True
                
            except Exception as e:
                print(f"Error on attempt {attempt+1}: {str(e)}")
                if attempt < max_retries - 1:
                    print(f"Retrying in {retry_delay} seconds...")
                    await asyncio.sleep(retry_delay)
                else:
                    print(f"All {max_retries} attempts failed")
                    # Trả về False thay vì raise exception để tránh crash
                    return False
    
    # Tương tự, thêm retry logic cho send_message
    async def send_message(self, message):
        """Send a message to the bot."""
        print(f"\n===== Sending Message =====")
        print(f"Message: {message}")
        
        payload = {
            "conversation_id": self.conversation_id,
            "message": message
        }
        
        # Thêm retry logic và tăng timeout
        max_retries = 1
        timeout_seconds = 3600  # Tăng timeout lên 100000 giây
        retry_delay = 1
        
        for attempt in range(max_retries):
            try:
                print(f"Send attempt {attempt+1}/{max_retries}...")
                start_time = time.time()
                
                response = requests.post(
                    self.webhook_endpoint,
                    headers={'Content-Type': 'application/json'},
                    json=payload,
                    timeout=timeout_seconds,
                    verify=False  # Thêm dòng này nếu có vấn đề về SSL
                )
                
                elapsed_time = time.time() - start_time
                
                print(f"Response received in {elapsed_time:.2f} seconds")
                print(f"Status code: {response.status_code}")
                
                if response.status_code != 200:
                    print(f"Error: HTTP {response.status_code}")
                    print(f"Response: {response.text}")
                    if attempt < max_retries - 1:
                        print(f"Retrying in {retry_delay} seconds...")
                        await asyncio.sleep(retry_delay)
                        continue
                    return None
                
                data = response.json()
                status = data.get("status")
                text = data.get("text", [])
                
                print(f"Status: {status}")
                if isinstance(text, list) and len(text) > 0:
                    bot_response = text[0]
                    print(f"Bot response: {bot_response[:100]}...")
                    
                    # Add to conversation history
                    self.conversation_history.append({"role": "roleA", "content": message})
                    self.conversation_history.append({"role": "roleB", "content": bot_response})
                    
                    return bot_response
                else:
                    print(f"Bot response: {text}")
                    return str(text)
                
            except Exception as e:
                print(f"Error on attempt {attempt+1}: {str(e)}")
                if attempt < max_retries - 1:
                    print(f"Retrying in {retry_delay} seconds...")
                    await asyncio.sleep(retry_delay)
                else:
                    print(f"All {max_retries} attempts failed")
                    return None
    
    async def generate_user_response(self, bot_message):
        """Generate a user response using OpenAI."""
        print(f"\n===== Generating User Response =====")
        
        # Prepare the prompt for OpenAI
        system_prompt = """
        You are a helpful assistant that generates the next user message in a conversation.
        The user is learning English from a bot. Generate a natural, brief response that continues the conversation.
        Your response should be in Vietnamese and should be a single message without any explanation or additional text.
        """
        
        # Format conversation history for the prompt
        formatted_history = []
        for msg in self.conversation_history:
            role = "user" if msg["role"] == "roleA" else "assistant"
            formatted_history.append({"role": role, "content": msg["content"]})
        
        # Add system message at the beginning
        messages = [{"role": "system", "content": system_prompt}] + formatted_history
        
        try:
            start_time = time.time()
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=100,
                temperature=0.7
            )
            elapsed_time = time.time() - start_time
            
            user_message = response.choices[0].message.content.strip()
            print(f"Generated in {elapsed_time:.2f} seconds: {user_message}")
            return user_message
        except Exception as e:
            print(f"Error generating user response: {str(e)}")
            return "Tôi không hiểu. Bạn có thể giải thích rõ hơn không?"
    
    async def run_simulation(self, initial_message="sẵn sàng", turns=3):
        """Run a full simulation."""
        print(f"\n===== Starting Simulation =====")
        print(f"Initial message: {initial_message}")
        print(f"Number of turns: {turns}")
        
        # Initialize conversation
        if not await self.init_conversation():
            print("Failed to initialize conversation")
            return False
        
        # Send initial message
        bot_response = await self.send_message(initial_message)
        if not bot_response:
            print("Failed to get initial bot response")
            return False
        
        # Add initial message to conversation history if it's not already there
        if not any(msg["role"] == "roleA" and msg["content"] == initial_message for msg in self.conversation_history):
            self.conversation_history.insert(0, {"role": "roleA", "content": initial_message})
            if bot_response:
                self.conversation_history.insert(1, {"role": "roleB", "content": bot_response})
        
        # Run conversation turns
        for i in range(1, turns):
            print(f"\n----- Turn {i}/{turns-1} -----")
            
            # Generate user response
            user_message = await self.generate_user_response(bot_response)
            
            # Send user message to bot
            bot_response = await self.send_message(user_message)
            if not bot_response:
                print(f"Failed to get bot response in turn {i}")
                return False
        
        print("\n===== Simulation Completed =====")
        print(f"Total messages: {len(self.conversation_history)}")
        
        # Print conversation summary
        print("\n===== Conversation Summary =====")
        for i, msg in enumerate(self.conversation_history):
            role_name = "User" if msg["role"] == "roleA" else "Bot"
            content = msg["content"]
            if len(content) > 100:
                content = content[:100] + "..."
            print(f"{i+1}. {role_name}: {content}")
        
        return True

# Add this health check endpoint
@app.get("/healthy")
async def health_check():
    return {"status": "ok"}

@app.post("/simulate", response_model=SimulationResponse)
async def simulate(request: SimulationRequest):
    """API endpoint to run a simulation"""
    try:
        # Extract parameters from request
        bot_id = request.bot_id
        user_prompt = request.user_prompt
        max_turns = request.max_turns
        history_json = request.history
        
        # Parse history from JSON string
        try:
            history = json.loads(history_json)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=400, detail=f"Invalid history JSON: {str(e)}")
        
        # Initialize tester with specified bot_id
        tester = SimulationTester(bot_id=bot_id)
        
        # Convert history format if needed
        conversation_history = []
        for msg in history:
            role = "roleA" if msg["role"] == "user" else "roleB"
            conversation_history.append({"role": role, "content": msg["content"]})
        
        # Set conversation history
        tester.conversation_history = conversation_history
        
        # Run simulation
        success = await tester.run_simulation(user_prompt, max_turns)
        
        # Keep original roles in the API response
        formatted_history = []
        for msg in tester.conversation_history:
            formatted_history.append({"role": msg["role"], "content": msg["content"]})
        
        # Format the simulation conversation
        simulation_conversation = []
        for i, msg in enumerate(tester.conversation_history):
            role_name = "User" if msg["role"] == "roleA" else "Bot"
            simulation_conversation.append({
                "role": role_name,
                "content": msg["content"]
            })
        
        return SimulationResponse(
            success=success,
            conversation_history=formatted_history,
            simulation_conversation=simulation_conversation
        )
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in simulation: {error_details}")
        
        # Still return any available conversation history
        formatted_history = []
        simulation_conversation = []
        
        if 'tester' in locals() and hasattr(tester, 'conversation_history'):
            for msg in tester.conversation_history:
                formatted_history.append({"role": msg["role"], "content": msg["content"]})
                
                role_name = "User" if msg["role"] == "roleA" else "Bot"
                simulation_conversation.append({
                    "role": role_name,
                    "content": msg["content"]
                })
        
        return SimulationResponse(
            success=False,
            conversation_history=formatted_history,
            simulation_conversation=simulation_conversation,
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=25050) 