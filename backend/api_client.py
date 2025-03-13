import time
import json
import requests
import random
from typing import Optional, Dict, Any, Tuple

class AICoachAPI:
    """
    AICoachAPI class is used to send messages to a bot and receive responses from it.
    """
    def __init__(self, base_url="http://103.253.20.13:9404", timeout=30, bot_id=16):
        """Initializes the AICoachAPI with the base URL, timeout, and bot ID."""
        self.base_url = base_url
        self.init_endpoint = f"{base_url}/robot-ai-lesson/api/v1/bot/initConversation"
        self.webhook_endpoint = f"{base_url}/robot-ai-lesson/api/v1/bot/webhook"
        self.current_conversation_id = None
        self.timeout = timeout
        self.bot_id = bot_id

    def init_conversation(self) -> bool:
        """Initializes a new conversation and generates a unique conversation ID."""
        timestamp = int(time.time() * 1000)  # Convert to milliseconds
        random_suffix = str(random.randint(100, 999))
        conversation_id = f"conv_{timestamp}_{random_suffix}"
        
        payload = {
            "bot_id": self.bot_id,
            "conversation_id": conversation_id,
            "input_slots": {}
        }
        
        try:
            print(f"\n[AICoachAPI] Initializing conversation...")
            print(f"[AICoachAPI] Endpoint: {self.init_endpoint}")
            print(f"[AICoachAPI] Payload: {json.dumps(payload, indent=2)}")
            
            response = requests.post(
                self.init_endpoint,
                headers={'Content-Type': 'application/json'},
                json=payload,
                timeout=self.timeout
            )
            response.raise_for_status()
            
            print(f"[AICoachAPI] Init successful. Response: {json.dumps(response.json(), indent=2)}")
            self.current_conversation_id = conversation_id
            return True
            
        except requests.Timeout:
            print("[AICoachAPI] Error: Request timed out during initialization")
            return False
        except requests.RequestException as e:
            print(f"[AICoachAPI] Error during initialization: {str(e)}")
            return False

    async def send_message(self, message: str) -> Tuple[str, float, Dict[str, Any]]:
        """Sends a message to the bot and returns the response, response time, and full response data."""
        if not self.current_conversation_id:
            print("[AICoachAPI] Error: No active conversation. Initializing new one...")
            if not self.init_conversation():
                return "Failed to initialize conversation.", 0, {}

        payload = {
            "conversation_id": self.current_conversation_id,
            "message": message
        }
        
        try:
            print(f"\n[AICoachAPI] Sending message...")
            print(f"[AICoachAPI] Endpoint: {self.webhook_endpoint}")
            print(f"[AICoachAPI] Payload: {json.dumps(payload, indent=2)}")
            
            start_time = time.time()
            response = requests.post(
                self.webhook_endpoint,
                headers={'Content-Type': 'application/json'},
                json=payload,
                timeout=self.timeout
            )
            end_time = time.time()
            response_time = end_time - start_time
            
            response.raise_for_status()
            # Get response data
            response_data = response.json()
            print(f"[AICoachAPI] Message sent successfully. Response: {json.dumps(response_data, indent=2)}")
            
            # Extract the text response
            if response_data and "text" in response_data and len(response_data["text"]) > 0:
                return response_data["text"][0], response_time, response_data
            else:
                return "No response from bot.", response_time, response_data
            
        except requests.Timeout:
            print("[AICoachAPI] Error: Request timed out while sending message")
            return "Request timed out.", 0, {}
        except requests.RequestException as e:
            print(f"[AICoachAPI] Error sending message: {str(e)}")
            return f"Error: {str(e)}", 0, {} 