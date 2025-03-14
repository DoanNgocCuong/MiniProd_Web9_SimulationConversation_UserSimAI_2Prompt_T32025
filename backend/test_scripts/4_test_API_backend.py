import requests
import json
import time
import sys
import asyncio
import websockets
import uuid

class BackendTester:
    def __init__(self, backend_url="http://localhost:25050"):
        self.backend_url = backend_url
        self.ws_url = f"ws://{backend_url.split('//')[1]}/ws"
        self.client_id = f"test-client-{uuid.uuid4()}"
    
    def test_health(self):
        """Test the health endpoint."""
        print(f"\n===== Testing Health Endpoint =====")
        endpoint = f"{self.backend_url}/health"
        
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
            print(f"Response: {data}")
            
            return True
        except Exception as e:
            print(f"Error testing health endpoint: {str(e)}")
            return False
    
    def test_api_connection(self):
        """Test the API connection endpoint."""
        print(f"\n===== Testing API Connection Endpoint =====")
        endpoint = f"{self.backend_url}/test-api-connection"
        
        try:
            start_time = time.time()
            response = requests.get(endpoint, timeout=10)
            elapsed_time = time.time() - start_time
            
            print(f"Response received in {elapsed_time:.2f} seconds")
            print(f"Status code: {response.status_code}")
            
            if response.status_code != 200:
                print(f"Error: HTTP {response.status_code}")
                print(f"Response: {response.text}")
                return False
            
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            
            # Check ping result
            ping_success = data.get("ping", {}).get("success", False)
            if not ping_success:
                print(f"Ping failed: {data.get('ping', {}).get('error', 'Unknown error')}")
            else:
                print(f"Ping successful: {data.get('ping', {}).get('time', 0):.4f} seconds")
            
            # Check API init endpoint result
            api_init_success = data.get("api_init", {}).get("success", False)
            if not api_init_success:
                print(f"API init failed: {data.get('api_init', {}).get('error', 'Unknown error')}")
            else:
                print(f"API init successful: {data.get('api_init', {}).get('time', 0):.4f} seconds")
            
            # Check API webhook endpoint result
            api_webhook_success = data.get("api_webhook", {}).get("success", False)
            if not api_webhook_success:
                print(f"API webhook failed: {data.get('api_webhook', {}).get('error', 'Unknown error')}")
            else:
                print(f"API webhook successful: {data.get('api_webhook', {}).get('time', 0):.4f} seconds")
            
            return ping_success and api_init_success and api_webhook_success
        except Exception as e:
            print(f"Error testing API connection endpoint: {str(e)}")
            return False
    
    async def test_websocket(self, bot_id=16, max_turns=2):
        """Test the WebSocket endpoint."""
        print(f"\n===== Testing WebSocket Endpoint =====")
        uri = f"{self.ws_url}/{self.client_id}"
        
        print(f"Connecting to {uri}...")
        
        try:
            async with websockets.connect(uri) as websocket:
                print(f"Connected successfully!")
                
                # Gửi yêu cầu bắt đầu cuộc hội thoại
                request = {
                    "type": "start_conversation",
                    "agent_mode": "bot_id",
                    "bot_id": bot_id,
                    "user_prompts": [
                        {
                            "id": 1,
                            "content": "Xin chào, tôi muốn học tiếng Anh"
                        }
                    ],
                    "initial_conversation_history": [
                        {"role": "roleA", "content": "sẵn sàng"}
                    ],
                    "max_turns": max_turns
                }
                
                print(f"Sending request with Bot ID {bot_id}...")
                await websocket.send(json.dumps(request))
                print(f"Request sent!")
                
                # Nhận và hiển thị phản hồi
                message_count = 0
                start_time = time.time()
                conversation_id = None
                
                while True:
                    try:
                        response = await asyncio.wait_for(websocket.recv(), timeout=60)
                        data = json.loads(response)
                        message_count += 1
                        
                        message_type = data.get("type", "unknown")
                        print(f"\n[{message_count}] Received message type: {message_type}")
                        
                        if message_type == "conversations_created":
                            conversation_id = data['conversations'][0]['id']
                            print(f"Conversation ID: {conversation_id}")
                        
                        elif message_type == "status":
                            print(f"Status: {data.get('message', '')}")
                        
                        elif message_type == "message":
                            msg = data.get("message", {})
                            role = msg.get('role', 'unknown')
                            content = msg.get('content', '')
                            print(f"Message from {role}: {content[:100]}...")
                            if len(content) > 100:
                                print("...")
                        
                        elif message_type == "error":
                            print(f"ERROR: {data.get('message', '')}")
                            return {
                                "success": False,
                                "error": data.get('message', 'Unknown error'),
                                "message_count": message_count,
                                "elapsed_time": time.time() - start_time
                            }
                        
                        elif message_type == "completion":
                            print(f"Conversation completed: {data.get('message', '')}")
                            elapsed_time = time.time() - start_time
                            print(f"Total messages received: {message_count}")
                            print(f"Total time: {elapsed_time:.2f} seconds")
                            return {
                                "success": True,
                                "conversation_id": conversation_id,
                                "message_count": message_count,
                                "elapsed_time": elapsed_time
                            }
                        
                    except asyncio.TimeoutError:
                        print("Timeout: No response received after 60 seconds")
                        return {
                            "success": False,
                            "error": "Timeout",
                            "message_count": message_count,
                            "elapsed_time": time.time() - start_time
                        }
                    except websockets.exceptions.ConnectionClosed as e:
                        print(f"Connection closed with code {e.code}, reason: {e.reason}")
                        return {
                            "success": False,
                            "error": f"Connection closed: {e.reason}",
                            "message_count": message_count,
                            "elapsed_time": time.time() - start_time
                        }
                    except Exception as e:
                        print(f"Error: {str(e)}")
                        return {
                            "success": False,
                            "error": str(e),
                            "message_count": message_count,
                            "elapsed_time": time.time() - start_time
                        }
        
        except Exception as e:
            print(f"Failed to connect: {str(e)}")
            return {
                "success": False,
                "error": f"Connection failed: {str(e)}",
                "elapsed_time": 0
            }
    
    async def run_tests(self):
        """Run all tests."""
        results = {}
        
        # Test 1: Health endpoint
        results["health"] = self.test_health()
        
        # Test 2: API connection endpoint
        results["api_connection"] = self.test_api_connection()
        
        # Test 3: WebSocket endpoint
        websocket_result = await self.test_websocket()
        results["websocket"] = websocket_result.get("success", False)
        
        # Print summary
        print("\n===== Test Results Summary =====")
        for test, result in results.items():
            status = "SUCCESS" if result else "FAILED"
            print(f"{test}: {status}")
        
        return all(results.values())

async def main():
    """Main function to run the test."""
    # Parse command line arguments
    backend_url = "http://localhost:25050"
    
    if len(sys.argv) > 1:
        backend_url = sys.argv[1]
        if not backend_url.startswith("http"):
            backend_url = f"http://{backend_url}"
    
    # Run the tests
    tester = BackendTester(backend_url)
    success = await tester.run_tests()
    
    if success:
        print("\nAll tests completed successfully!")
        sys.exit(0)
    else:
        print("\nSome tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    print("Testing Backend API...")
    asyncio.run(main())
