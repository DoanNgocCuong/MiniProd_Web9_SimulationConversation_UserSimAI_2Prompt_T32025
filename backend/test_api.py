import requests
import json
import time
import random

def test_api_connection():
    base_url = "http://103.253.20.13:9404"
    init_endpoint = f"{base_url}/robot-ai-lesson/api/v1/bot/initConversation"
    webhook_endpoint = f"{base_url}/robot-ai-lesson/api/v1/bot/webhook"
    
    # Test parameters
    bot_id = 16
    timeout = 10
    
    # Generate conversation ID
    timestamp = int(time.time() * 1000)
    random_suffix = str(random.randint(100, 999))
    conversation_id = f"conv_{timestamp}_{random_suffix}"
    
    # Test init conversation
    init_payload = {
        "bot_id": bot_id,
        "conversation_id": conversation_id,
        "input_slots": {}
    }
    
    print(f"Testing connection to {init_endpoint}")
    print(f"Payload: {json.dumps(init_payload, indent=2)}")
    
    try:
        init_response = requests.post(
            init_endpoint,
            headers={'Content-Type': 'application/json'},
            json=init_payload,
            timeout=timeout
        )
        
        print(f"Status code: {init_response.status_code}")
        if init_response.status_code == 200:
            print(f"Response: {json.dumps(init_response.json(), indent=2)}")
            
            # Test sending a message
            message_payload = {
                "conversation_id": conversation_id,
                "message": "Hello, how are you?"
            }
            
            print(f"\nTesting message to {webhook_endpoint}")
            print(f"Payload: {json.dumps(message_payload, indent=2)}")
            
            message_response = requests.post(
                webhook_endpoint,
                headers={'Content-Type': 'application/json'},
                json=message_payload,
                timeout=timeout
            )
            
            print(f"Status code: {message_response.status_code}")
            if message_response.status_code == 200:
                print(f"Response: {json.dumps(message_response.json(), indent=2)}")
            else:
                print(f"Error response: {message_response.text}")
        else:
            print(f"Error response: {init_response.text}")
    
    except requests.Timeout:
        print("Request timed out")
    except requests.RequestException as e:
        print(f"Request error: {str(e)}")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")

if __name__ == "__main__":
    test_api_connection() 