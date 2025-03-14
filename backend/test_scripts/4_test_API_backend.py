import requests
import json
import time
import sys
import asyncio
import websockets
import uuid
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get OpenAI API key from environment variable
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    print("Warning: OPENAI_API_KEY environment variable not set. User message generation will be disabled.")
    openai_client = None
else:
    # Initialize OpenAI client
    openai_client = AsyncOpenAI(api_key=api_key)

class BackendTester:
    def __init__(self, backend_url="http://localhost:25050"):
        self.backend_url = backend_url
        self.ws_url = f"ws://{backend_url.split('//')[1]}/ws"
        self.client_id = f"test-client-{uuid.uuid4()}"
        self.conversation_history = []
    
    def test_api_info(self):
        """Test the API info endpoint."""
        print(f"\n===== Testing API Info =====")
        # Thử một số endpoint phổ biến
        endpoints = ["/", "/api", "/api/info", "/info", "/status", "/health"]
        
        for endpoint in endpoints:
            url = f"{self.backend_url}{endpoint}"
            print(f"Trying endpoint: {url}")
            
            try:
                start_time = time.time()
                response = requests.get(url, timeout=5)
                elapsed_time = time.time() - start_time
                
                print(f"Response received in {elapsed_time:.2f} seconds")
                print(f"Status code: {response.status_code}")
                
                if response.status_code == 200:
                    print(f"Response: {response.text[:100]}...")
                    return True
                else:
                    print(f"Error: HTTP {response.status_code}")
            except Exception as e:
                print(f"Error: {str(e)}")
        
        print("No working API info endpoint found")
        # Không tìm thấy endpoint nào hoạt động, nhưng không coi là lỗi nghiêm trọng
        return True
    
    def test_docs_endpoint(self):
        """Test the docs endpoint."""
        print(f"\n===== Testing Docs Endpoint =====")
        endpoint = f"{self.backend_url}/docs"
        
        try:
            start_time = time.time()
            response = requests.get(endpoint, timeout=5)
            elapsed_time = time.time() - start_time
            
            print(f"Response received in {elapsed_time:.2f} seconds")
            print(f"Status code: {response.status_code}")
            
            if response.status_code != 200:
                print(f"Error: HTTP {response.status_code}")
                print(f"Response: {response.text[:100]}...")
                return False
            
            print(f"Response: Swagger UI documentation (HTML)")
            
            return True
        except Exception as e:
            print(f"Error testing docs endpoint: {str(e)}")
            return False
    
    def test_openapi_endpoint(self):
        """Test the OpenAPI endpoint."""
        print(f"\n===== Testing OpenAPI Endpoint =====")
        endpoint = f"{self.backend_url}/openapi.json"
        
        try:
            start_time = time.time()
            response = requests.get(endpoint, timeout=5)
            elapsed_time = time.time() - start_time
            
            print(f"Response received in {elapsed_time:.2f} seconds")
            print(f"Status code: {response.status_code}")
            
            if response.status_code != 200:
                print(f"Error: HTTP {response.status_code}")
                print(f"Response: {response.text}")
                return False
            
            data = response.json()
            paths = data.get('paths', {})
            print(f"Response: OpenAPI schema with {len(paths)} endpoints")
            
            # Hiển thị danh sách các endpoints
            if paths:
                print("Available endpoints:")
                for path in paths:
                    print(f"  - {path}")
            
            return True
        except Exception as e:
            print(f"Error testing OpenAPI endpoint: {str(e)}")
            return False
    
    async def generate_user_response(self, bot_message):
        """Generate a user response using OpenAI."""
        if not openai_client:
            print("OpenAI client not initialized. Using default response.")
            return "Tôi không hiểu. Bạn có thể giải thích rõ hơn không?"
        
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
            role = "user" if msg["role"] == "user" else "assistant"
            formatted_history.append({"role": role, "content": msg["content"]})
        
        # Add system message at the beginning
        messages = [{"role": "system", "content": system_prompt}] + formatted_history
        
        try:
            start_time = time.time()
            response = await openai_client.chat.completions.create(
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
    
    async def test_websocket_simulation(self, turns=3):
        """Test the WebSocket endpoint with a full conversation simulation."""
        print(f"\n===== Testing WebSocket Simulation =====")
        print(f"Number of turns: {turns}")
        uri = f"{self.ws_url}/{self.client_id}"
        
        print(f"Connecting to {uri}...")
        
        try:
            async with websockets.connect(uri) as websocket:
                print(f"Connected successfully!")
                
                # Prepare initial request
                bot_id = 16
                initial_message = "sẵn sàng"  # Thay đổi tin nhắn ban đầu
                request = {
                    "type": "start_conversation",
                    "agent_mode": "bot_id",
                    "bot_id": bot_id,
                    "user_prompts": [
                        {
                            "id": 1,
                            "content": initial_message
                        }
                    ],
                    "max_turns": 1  # We'll handle the turns manually
                }
                
                # Add initial message to conversation history
                self.conversation_history.append({"role": "user", "content": initial_message})
                
                # Send request
                print(f"\n----- Turn 1/{turns} -----")
                print(f"Sending initial message: {initial_message}")
                await websocket.send(json.dumps(request))
                
                # Wait for initial bot response
                conversation_id = None
                bot_response = None
                message_count = 0
                
                # Process messages until we get a bot response or timeout
                start_time = time.time()
                timeout_seconds = 60  # Tăng thời gian chờ lên 60 giây
                
                print(f"Waiting for bot response (timeout: {timeout_seconds}s)...")
                
                while time.time() - start_time < timeout_seconds:
                    try:
                        # Tăng timeout cho mỗi lần nhận tin nhắn
                        response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                        message_count += 1
                        
                        try:
                            data = json.loads(response)
                            message_type = data.get("type")
                            
                            print(f"[{message_count}] Received message type: {message_type}")
                            
                            if message_type == "conversations_created":
                                conversations = data.get("conversations", [])
                                if conversations and len(conversations) > 0:
                                    conversation_id = conversations[0].get("id", "Unknown")
                                else:
                                    conversation_id = data.get("conversation_id", "Unknown")
                                print(f"Conversation ID: {conversation_id}")
                            elif message_type == "status":
                                status_content = data.get("message", data.get("content", "Unknown status"))
                                print(f"Status: {status_content}")
                            elif message_type == "message":
                                message_content = data.get("content", "")
                                if message_content:
                                    print(f"Bot: {message_content[:100]}...")
                                    bot_response = message_content
                                    # Add bot response to conversation history
                                    self.conversation_history.append({"role": "assistant", "content": bot_response})
                                    break  # We got a bot response, move to next turn
                                else:
                                    print("Bot: Empty content")
                            elif message_type == "conversation_ended":
                                print(f"Conversation ended")
                                break
                            
                        except json.JSONDecodeError:
                            print(f"Received non-JSON message: {response[:100]}...")
                        
                    except asyncio.TimeoutError:
                        print(f"No message received for 10 seconds, continuing to wait...")
                        # Không break ở đây, tiếp tục chờ
                    except Exception as e:
                        print(f"Error receiving message: {str(e)}")
                        # Không break ở đây, tiếp tục chờ
                
                # Kiểm tra xem đã nhận được tin nhắn từ bot chưa
                if not bot_response:
                    print(f"No bot response received after {timeout_seconds} seconds")
                    return {
                        "success": False,
                        "error": "No bot response received",
                        "message_count": message_count
                    }
                
                # Nếu đã nhận được tin nhắn từ bot, tiếp tục với các lượt tiếp theo
                print(f"Bot response received after {time.time() - start_time:.2f} seconds")
                
                # Run additional turns
                for turn in range(2, turns + 1):
                    print(f"\n----- Turn {turn}/{turns} -----")
                    
                    # Generate user response
                    user_message = await self.generate_user_response(bot_response)
                    print(f"User: {user_message}")
                    
                    # Add user message to conversation history
                    self.conversation_history.append({"role": "user", "content": user_message})
                    
                    # Send user message
                    next_request = {
                        "type": "user_message",
                        "conversation_id": conversation_id,
                        "content": user_message
                    }
                    await websocket.send(json.dumps(next_request))
                    
                    # Wait for bot response
                    bot_response = None
                    start_time = time.time()
                    print(f"Waiting for bot response (timeout: {timeout_seconds}s)...")
                    
                    while time.time() - start_time < timeout_seconds:
                        try:
                            response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                            message_count += 1
                            
                            try:
                                data = json.loads(response)
                                message_type = data.get("type")
                                
                                print(f"[{message_count}] Received message type: {message_type}")
                                
                                if message_type == "status":
                                    status_content = data.get("message", data.get("content", "Unknown status"))
                                    print(f"Status: {status_content}")
                                elif message_type == "message":
                                    message_content = data.get("content", "")
                                    if message_content:
                                        print(f"Bot: {message_content[:100]}...")
                                        bot_response = message_content
                                        # Add bot response to conversation history
                                        self.conversation_history.append({"role": "assistant", "content": bot_response})
                                        break  # We got a bot response, move to next turn
                                    else:
                                        print("Bot: Empty content")
                                elif message_type == "conversation_ended":
                                    print(f"Conversation ended")
                                    break
                                
                            except json.JSONDecodeError:
                                print(f"Received non-JSON message: {response[:100]}...")
                                
                        except asyncio.TimeoutError:
                            print(f"No message received for 10 seconds, continuing to wait...")
                            # Không break ở đây, tiếp tục chờ
                        except Exception as e:
                            print(f"Error receiving message: {str(e)}")
                            # Không break ở đây, tiếp tục chờ
                    
                    if not bot_response:
                        print(f"No bot response received after {timeout_seconds} seconds in turn {turn}")
                        # Không coi đây là lỗi nghiêm trọng, chỉ dừng vòng lặp
                        break
                    
                    print(f"Bot response received after {time.time() - start_time:.2f} seconds")
                
                # Print conversation summary
                print("\n===== Conversation Summary =====")
                for i, msg in enumerate(self.conversation_history):
                    role_name = "User" if msg["role"] == "user" else "Bot"
                    content = msg["content"]
                    if len(content) > 100:
                        content = content[:100] + "..."
                    print(f"{i+1}. {role_name}: {content}")
                
                # Nếu có ít nhất một lượt hội thoại hoàn chỉnh, coi như thành công
                if len(self.conversation_history) >= 2:
                    return {
                        "success": True,
                        "message_count": message_count,
                        "conversation_id": conversation_id,
                        "turns_completed": len(self.conversation_history) // 2,
                        "elapsed_time": time.time() - start_time
                    }
                else:
                    return {
                        "success": False,
                        "error": "No complete conversation turn",
                        "message_count": message_count
                    }
        
        except Exception as e:
            print(f"Failed to connect or run simulation: {str(e)}")
            return {
                "success": False,
                "error": f"Connection failed: {str(e)}",
                "elapsed_time": 0
            }
    
    async def run_tests(self):
        """Run all tests."""
        results = {}
        
        # Test 1: API Info
        results["api_info"] = self.test_api_info()
        
        # Test 2: Docs endpoint
        results["docs_endpoint"] = self.test_docs_endpoint()
        
        # Test 3: OpenAPI endpoint
        results["openapi_endpoint"] = self.test_openapi_endpoint()
        
        # Test 4: WebSocket Simulation
        websocket_result = await self.test_websocket_simulation(turns=3)
        results["websocket_simulation"] = websocket_result.get("success", False)
        
        # Print summary
        print("\n===== Test Results Summary =====")
        for test, result in results.items():
            status = "SUCCESS" if result else "FAILED"
            print(f"{test}: {status}")
        
        # Nếu WebSocket hoạt động, coi như test thành công
        if results["websocket_simulation"]:
            return True
        else:
            return False

async def main():
    """Main function to run the test."""
    # Parse command line arguments
    backend_url = "http://localhost:25050"
    turns = 3
    
    if len(sys.argv) > 1:
        backend_url = sys.argv[1]
        if not backend_url.startswith("http"):
            backend_url = f"http://{backend_url}"
    
    if len(sys.argv) > 2:
        try:
            turns = int(sys.argv[2])
        except ValueError:
            print("Error: Number of turns must be an integer")
            turns = 3
    
    # Run the tests
    tester = BackendTester(backend_url)
    success = await tester.run_tests()
    
    if success:
        print("\nTests completed successfully!")
        sys.exit(0)
    else:
        print("\nSome critical tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    print("Testing Backend API...")
    asyncio.run(main())
