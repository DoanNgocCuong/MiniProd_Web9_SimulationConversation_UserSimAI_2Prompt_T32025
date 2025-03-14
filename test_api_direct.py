# test_api_direct.py
import requests
import json
import time

def test_api():
    """Test kết nối trực tiếp đến API bên ngoài."""
    print("Testing API connection...")
    
    base_url = "http://103.253.20.13:9404"
    init_endpoint = f"{base_url}/robot-ai-lesson/api/v1/bot/initConversation"
    webhook_endpoint = f"{base_url}/robot-ai-lesson/api/v1/bot/webhook"
    
    # Tạo conversation_id
    conversation_id = str(int(time.time() * 1000))
    
    # Test init conversation
    print(f"\n1. Testing init conversation with conversation_id={conversation_id}")
    init_payload = {
        "bot_id": 16,
        "conversation_id": conversation_id,
        "input_slots": {}
    }
    
    print(f"Endpoint: {init_endpoint}")
    print(f"Payload: {json.dumps(init_payload)}")
    
    try:
        start_time = time.time()
        init_response = requests.post(
            init_endpoint,
            headers={'Content-Type': 'application/json'},
            json=init_payload,
            timeout=10
        )
        init_time = time.time() - start_time
        
        print(f"Response received in {init_time:.2f} seconds")
        print(f"Status code: {init_response.status_code}")
        print(f"Response: {init_response.text}")
        
        if init_response.status_code != 200:
            print(f"Error: HTTP {init_response.status_code}")
            return
        
        try:
            init_data = init_response.json()
            print(f"Parsed JSON: {json.dumps(init_data, indent=2)}")
            
            if init_data.get("status") != 0 or init_data.get("msg") != "Success":
                print(f"Error: API returned error: {init_data}")
                return
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {str(e)}")
            return
        
        # Test webhook
        print(f"\n2. Testing webhook with conversation_id={conversation_id}")
        webhook_payload = {
            "conversation_id": conversation_id,
            "message": "sẵn sàng"
        }
        
        print(f"Endpoint: {webhook_endpoint}")
        print(f"Payload: {json.dumps(webhook_payload)}")
        
        start_time = time.time()
        webhook_response = requests.post(
            webhook_endpoint,
            headers={'Content-Type': 'application/json'},
            json=webhook_payload,
            timeout=10
        )
        webhook_time = time.time() - start_time
        
        print(f"Response received in {webhook_time:.2f} seconds")
        print(f"Status code: {webhook_response.status_code}")
        print(f"Response: {webhook_response.text}")
        
        if webhook_response.status_code != 200:
            print(f"Error: HTTP {webhook_response.status_code}")
            return
        
        try:
            webhook_data = webhook_response.json()
            print(f"Parsed JSON: {json.dumps(webhook_data, indent=2)}")
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {str(e)}")
            return
        
        print("\nTest completed successfully!")
        
    except requests.exceptions.Timeout as e:
        print(f"Error: Request timed out: {str(e)}")
    except requests.exceptions.RequestException as e:
        print(f"Error: Request failed: {str(e)}")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_api()