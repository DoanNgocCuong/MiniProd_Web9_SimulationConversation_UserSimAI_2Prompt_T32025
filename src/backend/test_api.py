import requests
import json

BASE_URL = "http://localhost:25050"

def test_simulate_endpoint():
    url = f"{BASE_URL}/simulate"
    payload = {
        "bot_id": 16,
        "user_prompt": "xin chào",
        "max_turns": 3
    }
    
    response = requests.post(url, json=payload)
    print(f"Status code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    print("Testing /simulate endpoint:")
    test_simulate_endpoint() 