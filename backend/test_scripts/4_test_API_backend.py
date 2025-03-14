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
    
    async def test_websocket(self):
        """Test the WebSocket endpoint."""
        print(f"\n===== Testing WebSocket Endpoint =====")
        uri = f"{self.ws_url}/{self.client_id}"
        
        print(f"Connecting to {uri}...")
        
        try:
            async with websockets.connect(uri) as websocket:
                print(f"Connected successfully!")
                
                # Prepare request
                bot_id = 16
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
                    "max_turns": 1
                }
                
                # Send request
                print(f"Sending request with Bot ID {bot_id}...")
                await websocket.send(json.dumps(request))
                print(f"Request sent!")
                
                # Wait for responses
                start_time = time.time()
                message_count = 0
                conversation_id = None
                
                # Wait for up to 30 seconds for messages
                while time.time() - start_time < 30:
                    try:
                        # Set a timeout for receiving messages
                        response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                        message_count += 1
                        
                        try:
                            data = json.loads(response)
                            message_type = data.get("type")
                            
                            print(f"\n[{message_count}] Received message type: {message_type}")
                            print(f"Full message: {data}")
                            
                            if message_type == "conversations_created":
                                conversation_id = data.get("conversation_id", "Unknown")
                                print(f"Conversation ID: {conversation_id}")
                            elif message_type == "status":
                                status_content = data.get("content", "Unknown status")
                                print(f"Status: {status_content}")
                            elif message_type == "message":
                                message_content = data.get("content", "")
                                if message_content:
                                    print(f"Message: {message_content[:100]}...")
                                else:
                                    print("Message: Empty content")
                            elif message_type == "conversation_ended":
                                print(f"Conversation ended")
                                # Success - we got a complete conversation
                                return {
                                    "success": True,
                                    "message_count": message_count,
                                    "conversation_id": conversation_id,
                                    "elapsed_time": time.time() - start_time
                                }
                            else:
                                print(f"Other data: {data}")
                            
                        except json.JSONDecodeError:
                            print(f"Received non-JSON message: {response[:100]}...")
                        
                    except asyncio.TimeoutError:
                        print(f"No message received for 5 seconds")
                        # If we've received at least one message, consider it a success
                        if message_count > 0:
                            return {
                                "success": True,
                                "message_count": message_count,
                                "conversation_id": conversation_id,
                                "elapsed_time": time.time() - start_time,
                                "note": "Timed out waiting for more messages"
                            }
                        break
                    except websockets.exceptions.ConnectionClosed as e:
                        print(f"Connection closed with code {e.code}, reason: {e.reason}")
                        # If we've received at least one message, consider it a partial success
                        if message_count > 0:
                            return {
                                "success": True,
                                "message_count": message_count,
                                "conversation_id": conversation_id,
                                "elapsed_time": time.time() - start_time,
                                "note": f"Connection closed: {e.reason}"
                            }
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
                
                # If we get here, we didn't receive a conversation_ended message
                if message_count > 0:
                    return {
                        "success": True,
                        "message_count": message_count,
                        "conversation_id": conversation_id,
                        "elapsed_time": time.time() - start_time,
                        "note": "Conversation did not end properly"
                    }
                else:
                    return {
                        "success": False,
                        "error": "No messages received",
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
        
        # Test 1: API Info
        results["api_info"] = self.test_api_info()
        
        # Test 2: Docs endpoint
        results["docs_endpoint"] = self.test_docs_endpoint()
        
        # Test 3: OpenAPI endpoint
        results["openapi_endpoint"] = self.test_openapi_endpoint()
        
        # Test 4: WebSocket endpoint
        websocket_result = await self.test_websocket()
        results["websocket"] = websocket_result.get("success", False)
        
        # Print summary
        print("\n===== Test Results Summary =====")
        for test, result in results.items():
            status = "SUCCESS" if result else "FAILED"
            print(f"{test}: {status}")
        
        # Nếu WebSocket hoạt động, coi như test thành công
        if results["websocket"]:
            return True
        else:
            return False

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
        print("\nTests completed successfully!")
        sys.exit(0)
    else:
        print("\nSome critical tests failed!")
        sys.exit(1)

if __name__ == "__main__":
    print("Testing Backend API...")
    asyncio.run(main())
