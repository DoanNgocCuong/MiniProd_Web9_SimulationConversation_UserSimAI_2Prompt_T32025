import asyncio
import websockets
import json
import uuid
import time

async def test_websocket():
    client_id = f"test-client-{uuid.uuid4()}"
    uri = f"ws://localhost:25050/ws/{client_id}"
    
    print(f"Connecting to {uri}...")
    
    try:
        async with websockets.connect(uri) as websocket:
            print(f"Connected successfully!")
            
            # Gửi yêu cầu bắt đầu cuộc hội thoại với Bot ID 16 (đã xác nhận hoạt động)
            request = {
                "type": "start_conversation",
                "agent_mode": "bot_id",
                "bot_id": 16,
                "user_prompts": [
                    {
                        "id": 1,
                        "content": "Xin chào, tôi muốn học tiếng Anh"
                    }
                ],
                "initial_conversation_history": [
                    {"role": "roleA", "content": "sẵn sàng"}
                ],
                "max_turns": 2
            }
            
            print(f"Sending request with Bot ID 16...")
            await websocket.send(json.dumps(request))
            print(f"Request sent!")
            
            # Nhận và hiển thị phản hồi
            message_count = 0
            start_time = time.time()
            
            while True:
                try:
                    response = await websocket.recv()
                    data = json.loads(response)
                    message_count += 1
                    
                    message_type = data.get("type", "unknown")
                    print(f"\n[{message_count}] Received message type: {message_type}")
                    
                    if message_type == "conversations_created":
                        print(f"Conversation IDs: {[c['id'] for c in data['conversations']]}")
                    
                    elif message_type == "status":
                        print(f"Status: {data.get('message', '')}")
                    
                    elif message_type == "message":
                        msg = data.get("message", {})
                        print(f"Message from {msg.get('role')}: {msg.get('content')[:100]}...")
                        if len(msg.get('content', '')) > 100:
                            print("...")
                        print(f"Response time: {msg.get('response_time')} seconds")
                    
                    elif message_type == "error":
                        print(f"ERROR: {data.get('message', '')}")
                    
                    elif message_type == "completion":
                        print(f"Conversation completed: {data.get('message', '')}")
                        print(f"Total messages received: {message_count}")
                        print(f"Total time: {time.time() - start_time:.2f} seconds")
                        break
                    
                except websockets.exceptions.ConnectionClosed as e:
                    print(f"Connection closed with code {e.code}, reason: {e.reason}")
                    break
                except Exception as e:
                    print(f"Error: {str(e)}")
                    break
            
            print("\nTest completed!")
    
    except Exception as e:
        print(f"Failed to connect: {str(e)}")

if __name__ == "__main__":
    print("Starting WebSocket test with Bot ID 16...")
    asyncio.run(test_websocket())