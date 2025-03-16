import os
import json
import time
import sys
import asyncio
import requests
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Server address
DEFAULT_SERVER_URL = "http://103.253.20.13:25050"

class APITester:
    def __init__(self, base_url: str = DEFAULT_SERVER_URL):
        self.base_url = base_url
        self.health_endpoint = f"{base_url}/health"
        self.simulate_endpoint = f"{base_url}/simulate"
    
    def test_health(self) -> bool:
        """Test the health endpoint to check if the server is up."""
        print(f"\n===== Testing Health API =====")
        print(f"URL: {self.health_endpoint}")
        
        try:
            print("Sending request to health endpoint...")
            start_time = time.time()
            
            response = requests.get(
                self.health_endpoint,
                timeout=10  # 10 seconds timeout for health check
            )
            
            elapsed_time = time.time() - start_time
            print(f"Response received in {elapsed_time:.2f} seconds")
            print(f"Status code: {response.status_code}")
            
            if response.status_code == 200:
                print(f"Response: {response.text}")
                print("✅ Health check PASSED")
                return True
            else:
                print(f"Error: Unexpected status code: {response.status_code}")
                print(f"Response: {response.text}")
                print("❌ Health check FAILED")
                return False
            
        except requests.exceptions.Timeout:
            print("❌ Health check FAILED - Request timed out")
            return False
        except requests.exceptions.ConnectionError as e:
            print(f"❌ Health check FAILED - Connection error: {str(e)}")
            return False
        except Exception as e:
            print(f"❌ Health check FAILED - Unexpected error: {str(e)}")
            return False
    
    async def test_minimal(self):
        """Test with minimal settings for quick validation"""
        minimal_payload = {
            "bot_id": 16,
            "user_prompt": "sẵn sàng",
            "max_turns": 1,
            "history": "[{\"role\": \"roleA\", \"content\": \"sẵn sàng\"}]"
        }
        
        print(f"\n===== Running Minimal Test =====")
        print(f"URL: {self.simulate_endpoint}")
        print(f"Payload: {json.dumps(minimal_payload, ensure_ascii=False)}")
        
        try:
            print("\nSending request...")
            start_time = time.time()
            
            response = requests.post(
                self.simulate_endpoint,
                headers={"Content-Type": "application/json"},
                json=minimal_payload,
                timeout=60  # 1 minute timeout
            )
            
            elapsed_time = time.time() - start_time
            print(f"Response received in {elapsed_time:.2f} seconds")
            print(f"Status code: {response.status_code}")
            
            if response.status_code != 200:
                print(f"❌ Test FAILED - HTTP {response.status_code}")
                print(f"Response: {response.text}")
                return False
            
            # Parse response
            data = response.json()
            print(f"\nAPI Status: {data.get('status')}")
            
            if data.get("status") == "error":
                print(f"❌ Test FAILED - API returned error: {data.get('error')}")
                return False
            
            # Display conversation
            conversation = data.get("conversation", [])
            print(f"\n===== Conversation ({len(conversation)} messages) =====")
            
            for i, msg in enumerate(conversation):
                role = msg.get("role")
                content = msg.get("content")
                role_name = "User" if role == "roleA" else "Bot"
                print(f"{i+1}. {role_name}: {content}")
            
            print("\n✅ Minimal test PASSED")
            return True
            
        except Exception as e:
            print(f"❌ Test FAILED - Error: {str(e)}")
            return False
    
    async def test_simulation(self, 
                        bot_id: int = 16, 
                        user_prompt: str = "sẵn sàng", 
                        max_turns: int = 3, 
                        history: Optional[str] = None) -> Dict[str, Any]:
        """Test the simulation API endpoint with full options."""
        print(f"\n===== Testing Simulation API =====")
        print(f"URL: {self.simulate_endpoint}")
        print(f"Bot ID: {bot_id}")
        print(f"User prompt: {user_prompt}")
        print(f"Max turns: {max_turns}")
        print(f"History: {history}")
        
        # Prepare request payload
        payload = {
            "bot_id": bot_id,
            "user_prompt": user_prompt,
            "max_turns": max_turns
        }
        
        if history:
            payload["history"] = history
        
        # Send request to API
        try:
            print("\nSending request to simulation API...")
            start_time = time.time()
            
            response = requests.post(
                self.simulate_endpoint,
                headers={"Content-Type": "application/json"},
                json=payload,
                timeout=300  # 5 minutes timeout for simulation
            )
            
            elapsed_time = time.time() - start_time
            print(f"Response received in {elapsed_time:.2f} seconds")
            print(f"Status code: {response.status_code}")
            
            if response.status_code != 200:
                print(f"❌ Simulation FAILED - HTTP {response.status_code}")
                print(f"Response: {response.text}")
                return {"status": "error", "error": f"HTTP {response.status_code}"}
            
            # Parse response
            data = response.json()
            print(f"\nAPI Status: {data.get('status')}")
            
            # Kiểm tra lỗi trong response
            if data.get("error"):
                print(f"❌ Simulation FAILED - API returned error: {data.get('error')}")
                return data
            
            # Kiểm tra xem có conversation không thay vì kiểm tra status
            conversation = data.get("conversation", [])
            if not conversation:
                print(f"❌ Simulation FAILED - No conversation returned")
                return {"status": "error", "error": "No conversation returned"}
            
            # Display conversation
            print(f"\n===== Conversation ({len(conversation)} messages) =====")
            
            for i, msg in enumerate(conversation):
                role = msg.get("role")
                content = msg.get("content")
                role_name = "User" if role == "roleA" else "Bot"
                
                # Truncate long messages for display
                if len(content) > 100:
                    display_content = content[:100] + "..."
                else:
                    display_content = content
                
                print(f"{i+1}. {role_name}: {display_content}")
            
            print("\n✅ Simulation test PASSED")
            # Thêm trường status vào kết quả nếu chưa có
            if "status" not in data:
                data["status"] = "success"
            return data
            
        except requests.exceptions.Timeout:
            print(f"❌ Simulation FAILED - Request timed out")
            return {"status": "error", "error": "Request timed out"}
                
        except requests.exceptions.ConnectionError as e:
            print(f"❌ Simulation FAILED - Connection error: {str(e)}")
            return {"status": "error", "error": f"Connection error: {str(e)}"}
                
        except Exception as e:
            print(f"❌ Simulation FAILED - Unexpected error: {str(e)}")
            return {"status": "error", "error": str(e)}
    
    def save_conversation(self, data: Dict[str, Any], filename: str = "conversation.json"):
        """Save the conversation to a JSON file."""
        try:
            with open(filename, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"\nConversation saved to {filename}")
        except Exception as e:
            print(f"Error saving conversation: {str(e)}")

    async def direct_test(self, bot_id: int = 16, initial_message: str = "sẵn sàng", turns: int = 3):
        """Test the simulation directly without using the API."""
        print(f"\n===== Testing Direct Simulation =====")
        print(f"Bot ID: {bot_id}")
        print(f"Initial message: {initial_message}")
        print(f"Number of turns: {turns}")
        
        # Import the SimulationTester class properly
        sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        from WebSimulationConversation.backend.test_backend.test_Simulation_direct import SimulationTester
        
        tester = SimulationTester()
        tester.bot_id = bot_id
        
        success = await tester.run_simulation(initial_message, turns)
        
        if success:
            # Convert the conversation history to our format
            conversation = []
            for msg in tester.conversation_history:
                conversation.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
            
            return {
                "status": "success",
                "conversation": conversation
            }
        else:
            return {
                "status": "error",
                "error": "Direct simulation failed"
            }

async def main():
    """Main function to run the test."""
    # Parse command line arguments
    base_url = DEFAULT_SERVER_URL
    bot_id = 16
    user_prompt = "sẵn sàng"
    max_turns = 3
    history = None
    health_only = False
    minimal_test = False
    
    # Allow overriding defaults from command line
    if len(sys.argv) > 1:
        if sys.argv[1] == "health":
            health_only = True
        elif sys.argv[1] == "minimal":
            minimal_test = True
        else:
            base_url = sys.argv[1]
    if len(sys.argv) > 2 and not health_only and not minimal_test:
        bot_id = int(sys.argv[2])
    if len(sys.argv) > 3 and not health_only and not minimal_test:
        user_prompt = sys.argv[3]
    if len(sys.argv) > 4 and not health_only and not minimal_test:
        max_turns = int(sys.argv[4])
    if len(sys.argv) > 5 and not health_only and not minimal_test:
        history = sys.argv[5]
    
    # Create tester
    tester = APITester(base_url)
    
    # Test health endpoint
    server_healthy = tester.test_health()
    
    # Run the appropriate test
    if server_healthy:
        if minimal_test:
            print("\n✅ Server is healthy, running minimal test...")
            await tester.test_minimal()
        elif not health_only:
            print("\n✅ Server is healthy, proceeding with simulation test...")
            result = await tester.test_simulation(bot_id, user_prompt, max_turns, history)
            
            # Save results if successful
            if result.get("status") == "success" or (not result.get("error") and result.get("conversation")):
                tester.save_conversation(result)
                print("\n✅ All tests completed successfully!")
            else:
                print("\n❌ Simulation test failed!")
    else:
        print("\n❌ Health check failed! Not proceeding with further tests.")
        print("Please check if the server is running and accessible.")

if __name__ == "__main__":
    print("\n=================================")
    print("   Backend API Testing Tool")
    print("=================================")
    print(f"Default server: {DEFAULT_SERVER_URL}")
    print("Options:")
    print("  python 4_test_APIBackend.py                - Test with default settings")
    print("  python 4_test_APIBackend.py health         - Test health endpoint only")
    print("  python 4_test_APIBackend.py minimal        - Run minimal test with predefined params")
    print("  python 4_test_APIBackend.py [URL]          - Test with custom server URL")
    print("  python 4_test_APIBackend.py [URL] [BOT_ID] [PROMPT] [MAX_TURNS] [HISTORY]")
    print("=================================\n")
    
    asyncio.run(main()) 
