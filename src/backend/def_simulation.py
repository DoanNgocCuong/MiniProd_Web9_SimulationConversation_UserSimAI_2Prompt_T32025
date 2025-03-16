import os
import json
import time
import sys
import asyncio
import requests
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import openai
from dotenv import load_dotenv
import logging
import random
import traceback

# Thiết lập logging chi tiết
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),  # Log ra console
        logging.FileHandler("logs/simulation_detailed.log")  # Log ra file
    ]
)
logger = logging.getLogger("simulation")

# Thêm vào đầu file, sau phần import
def log_step(message, level="INFO"):
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{level}] {message}")
    # Ghi vào file log
    try:
        with open("logs/simulation.log", "a") as f:
            f.write(f"[{timestamp}] [{level}] {message}\n")
    except:
        pass  # Bỏ qua nếu không ghi được vào file
    
    # Sử dụng logger để ghi log chi tiết
    if level == "INFO":
        logger.info(message)
    elif level == "ERROR":
        logger.error(message)
    elif level == "WARNING":
        logger.warning(message)
    elif level == "DEBUG":
        logger.debug(message)

# Thêm log khi khởi động
log_step("=== LOADING SIMULATION MODULE ===")
log_step(f"Current directory: {os.getcwd()}")
log_step(f"Environment variables: OPENAI_API_KEY exists: {'Yes' if os.environ.get('OPENAI_API_KEY') else 'No'}")

# Load environment variables from .env file
# Đảm bảo tìm file .env ở thư mục hiện tại
env_path = os.path.join(os.path.dirname(__file__), '.env')
log_step(f"Looking for .env file at: {env_path}")
if os.path.exists(env_path):
    log_step(f"Loading .env file from {env_path}")
    load_dotenv(env_path)
else:
    log_step(f".env file not found at {env_path}, trying default location")
    load_dotenv()

# Get OpenAI API key from environment variable
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    log_step("Error: OPENAI_API_KEY environment variable not set", "ERROR")
    print("Error: OPENAI_API_KEY environment variable not set")
else:
    log_step("OPENAI_API_KEY is set")
    print("OPENAI_API_KEY is set")

# Thiết lập API key cho OpenAI SDK 0.28.1
openai.api_key = api_key

# Lấy API base URL từ biến môi trường hoặc sử dụng giá trị mặc định
API_BASE_URL = os.getenv("API_BASE_URL", "http://103.253.20.13:9404")
log_step(f"Using API base URL: {API_BASE_URL}")

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
        self.base_url = API_BASE_URL
        self.init_endpoint = f"{self.base_url}/robot-ai-lesson/api/v1/bot/initConversation"
        self.webhook_endpoint = f"{self.base_url}/robot-ai-lesson/api/v1/bot/webhook"
        self.conversation_id = str(int(time.time() * 1001))
        self.bot_id = bot_id
        self.conversation_history = []
        logger.info(f"SimulationTester initialized with bot_id={bot_id}, base_url={self.base_url}")
    
    async def init_conversation(self):
        """Initialize conversation with the bot."""
        logger.info(f"Initializing conversation with bot_id={self.bot_id}, conversation_id={self.conversation_id}")
        print(f"\n===== Initializing Conversation =====")
        print(f"Bot ID: {self.bot_id}")
        print(f"Conversation ID: {self.conversation_id}")
        
        payload = {
            "bot_id": self.bot_id,
            "conversation_id": self.conversation_id,
            "input_slots": {}
        }
        
        try:
            start_time = time.time()
            logger.info(f"Sending request to {self.init_endpoint}")
            response = requests.post(
                self.init_endpoint,
                headers={'Content-Type': 'application/json'},
                json=payload,
                timeout=30  # Tăng timeout lên 30 giây
            )
            elapsed_time = time.time() - start_time
            
            logger.info(f"Response received in {elapsed_time:.2f}s with status code {response.status_code}")
            print(f"Response received in {elapsed_time:.2f} seconds")
            print(f"Status code: {response.status_code}")
            
            if response.status_code != 200:
                error_msg = f"Error: HTTP {response.status_code}, Response: {response.text}"
                logger.error(error_msg)
                print(error_msg)
                return False
            
            data = response.json()
            if data.get("status") != 0 or data.get("msg") != "Success":
                error_msg = f"Error: API returned error: {data}"
                logger.error(error_msg)
                print(error_msg)
                return False
            
            logger.info("Conversation initialized successfully")
            print(f"Conversation initialized successfully")
            return True
            
        except requests.exceptions.Timeout as e:
            error_msg = f"Error: Request timed out: {str(e)}"
            logger.error(error_msg)
            print(error_msg)
            return False
        except requests.exceptions.ConnectionError as e:
            error_msg = f"Error: Connection error: {str(e)}"
            logger.error(error_msg)
            print(error_msg)
            return False
        except Exception as e:
            error_msg = f"Error initializing conversation: {str(e)}"
            logger.error(error_msg)
            print(error_msg)
            return False
    
    async def send_message(self, message):
        """Send a message to the bot."""
        logger.info(f"Sending message: '{message}'")
        print(f"\n===== Sending Message =====")
        print(f"Message: {message}")
        
        payload = {
            "conversation_id": self.conversation_id,
            "message": message
        }
        
        try:
            start_time = time.time()
            logger.info(f"Sending request to {self.webhook_endpoint}")
            
            # Thêm log chi tiết
            logger.info(f"Request payload: {json.dumps(payload)}")
            
            response = requests.post(
                self.webhook_endpoint,
                headers={'Content-Type': 'application/json'},
                json=payload,
                timeout=1800  # Tăng timeout lên 30 phút
            )
            
            elapsed_time = time.time() - start_time
            logger.info(f"Response received in {elapsed_time:.2f}s with status code {response.status_code}")
            
            # Thêm log chi tiết
            if response.status_code == 200:
                logger.info(f"Response content: {response.text[:500]}...")
            else:
                logger.error(f"Error response: {response.text}")
            
            if response.status_code != 200:
                error_msg = f"Error: HTTP {response.status_code}, Response: {response.text}"
                logger.error(error_msg)
                print(error_msg)
                return None
            
            data = response.json()
            status = data.get("status")
            text = data.get("text", [])
            
            logger.info(f"Response status: {status}")
            print(f"Status: {status}")
            if isinstance(text, list) and len(text) > 0:
                bot_response = text[0]
                logger.info(f"Bot response received: {bot_response[:100]}...")
                print(f"Bot response: {bot_response[:100]}...")
                
                # Add to conversation history only if not duplicate
                if not self.conversation_history or (
                    message != self.conversation_history[-2]["content"] if len(self.conversation_history) >= 2 else True
                ):
                    self.conversation_history.append({"role": "roleA", "content": message})
                    self.conversation_history.append({"role": "roleB", "content": bot_response})
                
                logger.info(f"Response data: {json.dumps(data)[:500]}")
                return bot_response
            else:
                logger.warning(f"Unexpected bot response format: {text}")
                print(f"Bot response: {text}")
                return str(text)
            
        except requests.exceptions.Timeout as e:
            error_msg = f"Error: Request timed out: {str(e)}"
            logger.error(error_msg)
            print(error_msg)
            return None
        except requests.exceptions.ConnectionError as e:
            error_msg = f"Error: Connection error: {str(e)}"
            logger.error(error_msg)
            print(error_msg)
            return None
        except Exception as e:
            error_msg = f"Error sending message: {str(e)}"
            logger.error(error_msg)
            print(error_msg)
            return None
    
    async def generate_user_response(self, bot_response):
        """Generate a user response based on the conversation history."""
        logger.info("Generating user response")
        print(f"\n===== Generating User Response =====")
        
        # Create a system prompt
        system_prompt = """
        You are simulating a student who is learning English. 
        You should respond to the teacher's messages in a natural way, 
        asking questions when appropriate and showing enthusiasm for learning.
        Keep your responses relatively short (1-3 sentences).
        """
        
        # Format conversation history for the prompt
        formatted_history = []
        for msg in self.conversation_history:
            role = "user" if msg["role"] == "roleA" else "assistant"
            formatted_history.append({"role": role, "content": msg["content"]})
        
        try:
            import openai
            
            # Khởi tạo client đúng cách, không có proxies
            client = openai.OpenAI(
                api_key=api_key
                # Không thêm proxies ở đây
            )
            
            start_time = time.time()
            logger.info("Sending request to OpenAI API")
            
            # Gọi API với cú pháp mới
            response = await asyncio.to_thread(
                client.chat.completions.create,
                model="gpt-4o-mini",
                messages=[{"role": "system", "content": system_prompt}] + formatted_history,
                max_tokens=100,
                temperature=0.7
            )
            
            elapsed_time = time.time() - start_time
            
            # Đọc kết quả đúng cách trong API mới
            user_message = response.choices[0].message.content.strip()
            logger.info(f"Generated user response in {elapsed_time:.2f}s: {user_message}")
            print(f"Generated in {elapsed_time:.2f} seconds: {user_message}")
            return user_message
        except Exception as e:
            error_msg = f"Error generating user response: {str(e)}"
            logger.error(error_msg)
            print(error_msg)
            
            # Tạo câu trả lời ngẫu nhiên thay vì luôn dùng "Tôi không hiểu"
            fallback_responses = [
                "Tôi hiểu rồi, cảm ơn bạn!",
                "Thú vị quá! Cho tôi biết thêm được không?",
                "Vâng, tôi thích ý tưởng đó.",
                "Tôi nghĩ tôi hiểu ý bạn rồi.",
                "Tôi thích học tiếng Anh, có thể cho tôi ví dụ khác không?"
            ]
            return random.choice(fallback_responses)
    
    async def run_simulation(self, initial_message="sẵn sàng", turns=3):
        """Run a full simulation."""
        logger.info(f"Starting simulation with initial_message='{initial_message}', turns={turns}")
        print(f"\n===== Starting Simulation =====")
        print(f"Initial message: {initial_message}")
        print(f"Number of turns: {turns}")
        
        # Initialize conversation
        if not await self.init_conversation():
            error_msg = "Failed to initialize conversation"
            logger.error(error_msg)
            print(error_msg)
            return False
        
        # Send initial message
        bot_response = await self.send_message(initial_message)
        if not bot_response:
            error_msg = "Failed to get initial bot response"
            logger.error(error_msg)
            print(error_msg)
            return False
        
        # Run conversation turns
        for i in range(1, turns+1):
            logger.info(f"Starting turn {i}/{turns}")
            print(f"\n----- Turn {i}/{turns} -----")
            
            # Generate user response
            user_message = await self.generate_user_response(bot_response)
            
            # Send user message to bot
            bot_response = await self.send_message(user_message)
            if not bot_response:
                error_msg = f"Failed to get bot response in turn {i}"
                logger.error(error_msg)
                print(error_msg)
                return False
        
        logger.info("Simulation completed successfully")
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
        
        logger.info(f"Conversation ended with {len(self.conversation_history)} messages")
        return True

async def run_simulation_with_params(bot_id=16, user_prompt="sẵn sàng", max_turns=3, history=None):
    """
    Run a simulation with specific parameters.
    
    Args:
        bot_id (int): ID of the bot to simulate
        user_prompt (str): Initial message to send to the bot
        max_turns (int): Maximum number of conversation turns
        history (list): Optional existing conversation history
        
    Returns:
        dict: Simulation results
    """
    try:
        # Log chi tiết
        logger.info(f"Starting simulation with params: bot_id={bot_id}, prompt='{user_prompt}', max_turns={max_turns}")
        logger.info(f"History provided: {'Yes' if history else 'No'}")
        
        # Initialize tester with specified bot_id
        tester = SimulationTester(bot_id)
        
        # Set conversation history if provided
        if history:
            if isinstance(history, str):
                try:
                    # Try to parse JSON string
                    history_data = json.loads(history)
                    logger.info(f"Parsed history from JSON string, {len(history_data)} messages")
                    tester.conversation_history = history_data
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse history JSON: {str(e)}")
                    return {
                        "success": False,
                        "conversation": [],
                        "error": f"Invalid history JSON: {str(e)}"
                    }
            else:
                logger.info(f"Using provided history object, {len(history)} messages")
                tester.conversation_history = history
        
        # Run simulation
        start_time = time.time()
        success = await tester.run_simulation(user_prompt, max_turns)
        elapsed_time = time.time() - start_time
        
        # Log kết quả
        logger.info(f"Simulation completed in {elapsed_time:.2f} seconds")
        logger.info(f"Conversation length: {len(tester.conversation_history)} messages")
        logger.info(f"Simulation success: {success}")
        
        # Format the conversation for return
        formatted_conversation = []
        for msg in tester.conversation_history:
            role_name = "User" if msg["role"] == "roleA" else "Bot"
            formatted_conversation.append({
                "role": role_name,
                "content": msg["content"]
            })
        
        return {
            "success": success,
            "conversation": formatted_conversation
        }
        
    except Exception as e:
        error_msg = f"Error in simulation: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        print(error_msg)
        return {
            "success": False,
            "conversation": [],
            "error": str(e)
        }

async def get_conversation(bot_id=16, user_prompt="sẵn sàng", max_turns=3, history=None):
    """
    Run a simulation with specific parameters and return only the conversation,
    without printing logs.
    
    Args:
        bot_id (int): ID of the bot to simulate
        user_prompt (str): Initial message to send to the bot
        max_turns (int): Maximum number of conversation turns
        history (list): Optional existing conversation history
        
    Returns:
        list: Conversation history as a list of message objects
    """
    try:
        # Initialize tester with specified bot_id
        tester = SimulationTester(bot_id)
        
        # Set conversation history if provided
        if history:
            tester.conversation_history = history
        
        # Store original print function
        original_print = print
        
        # Define a no-op print function to suppress logs
        def silent_print(*args, **kwargs):
            pass
        
        # Replace print with silent version
        import builtins
        builtins.print = silent_print
        
        try:
            # Run simulation silently
            await tester.run_simulation(user_prompt, max_turns)
        finally:
            # Restore original print function
            builtins.print = original_print
        
        # Format the conversation for return
        formatted_conversation = []
        for msg in tester.conversation_history:
            role_name = "User" if msg["role"] == "roleA" else "Bot"
            formatted_conversation.append({
                "role": role_name,
                "content": msg["content"]
            })
        
        # Return only the conversation
        return formatted_conversation
        
    except Exception as e:
        # Print error with original print function
        import builtins
        original_print = builtins.print
        original_print(f"Error in simulation: {str(e)}")
        return []  # Return empty list on error

async def main():
    """Main function to run the test."""
    # Parse command line arguments
    initial_message = "sẵn sàng"
    turns = 3
    
    if len(sys.argv) > 1:
        initial_message = sys.argv[1]
    if len(sys.argv) > 2:
        try:
            turns = int(sys.argv[2])
        except ValueError:
            print("Error: Number of turns must be an integer")
            return
    
    # Run the simulation using the new function
    result = await run_simulation_with_params(
        bot_id=16,
        user_prompt=initial_message,
        max_turns=turns
    )
    
    if result["success"]:
        print("\nSimulation completed successfully!")
    else:
        print("\nSimulation failed!")
        
    # Print conversation
    print("\n===== Conversation =====")
    for i, msg in enumerate(result["conversation"]):
        print(f"{i+1}. {msg['role']}: {msg['content'][:100]}...")

if __name__ == "__main__":
    asyncio.run(main())
