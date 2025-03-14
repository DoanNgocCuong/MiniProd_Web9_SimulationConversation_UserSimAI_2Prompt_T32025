import time
import json
import requests
import random
import asyncio
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
        self.last_error = ""
        print(f"[AICoachAPI] Initialized with bot_id={bot_id}, base_url={base_url}")

    async def init_conversation(self) -> bool:
        """Initializes a new conversation with the bot."""
        # Tạo conversation_id đơn giản
        # Quan trọng: Theo tài liệu, conversation_id có thể là bất kỳ chuỗi nào
        timestamp = int(time.time())
        conversation_id = f"{timestamp}{random.randint(1000, 9999)}"
        
        # Chuẩn bị payload theo tài liệu
        payload = {
            "bot_id": self.bot_id,
            "conversation_id": conversation_id,
            "input_slots": {}
        }
        
        try:
            print(f"\n[AICoachAPI] Initializing conversation...")
            print(f"[AICoachAPI] Endpoint: {self.init_endpoint}")
            print(f"[AICoachAPI] Payload: {json.dumps(payload, indent=2)}")
            
            # Headers theo tài liệu
            headers = {
                'Content-Type': 'application/json'
            }
            
            # Sử dụng asyncio để thực hiện yêu cầu HTTP không đồng bộ
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: requests.post(
                    self.init_endpoint,
                    headers=headers,
                    json=payload,
                    timeout=self.timeout
                )
            )
            
            print(f"[AICoachAPI] Init response status: {response.status_code}")
            
            # Kiểm tra mã trạng thái
            if response.status_code != 200:
                self.last_error = f"API trả về mã lỗi: {response.status_code}. {response.text}"
                print(f"[AICoachAPI] Error: Non-200 status code: {response.status_code}")
                print(f"[AICoachAPI] Response: {response.text}")
                return False
                
            # Phân tích phản hồi
            try:
                response_data = response.json()
                print(f"[AICoachAPI] Init successful. Response: {json.dumps(response_data, indent=2)}")
                
                # Kiểm tra phản hồi theo tài liệu
                # Theo tài liệu, phản hồi thành công có "status": 0, "msg": "Success"
                if "status" in response_data and (response_data["status"] == 0 or response_data["status"] == "0" or response_data["status"] == "OK"):
                    self.current_conversation_id = conversation_id
                    return True
                else:
                    self.last_error = f"API trả về trạng thái không hợp lệ: {response_data.get('status')}. {response_data.get('msg', '')}"
                    print(f"[AICoachAPI] Error: Invalid response format or status not OK")
                    return False
            except ValueError:
                self.last_error = "Phản hồi không phải là JSON hợp lệ"
                print(f"[AICoachAPI] Error: Invalid JSON response")
                return False
                
        except requests.Timeout:
            self.last_error = "Yêu cầu hết thời gian chờ"
            print("[AICoachAPI] Error: Request timed out while initializing conversation")
            return False
        except requests.RequestException as e:
            self.last_error = f"Lỗi kết nối: {str(e)}"
            print(f"[AICoachAPI] Error initializing conversation: {str(e)}")
            return False
        except Exception as e:
            self.last_error = f"Lỗi không xác định: {str(e)}"
            print(f"[AICoachAPI] Unexpected error initializing conversation: {str(e)}")
            return False

    async def send_message(self, message: str) -> Tuple[str, float, Dict[str, Any]]:
        """Sends a message to the bot and returns the response."""
        if not self.current_conversation_id:
            return "No active conversation. Please initialize first.", 0, {}
        
        # Chuẩn bị payload theo tài liệu
        payload = {
            "conversation_id": self.current_conversation_id,
            "message": message
        }
        
        try:
            print(f"\n[AICoachAPI] Sending message...")
            print(f"[AICoachAPI] Endpoint: {self.webhook_endpoint}")
            print(f"[AICoachAPI] Payload: {json.dumps(payload, indent=2)}")
            
            # Headers theo tài liệu
            headers = {
                'Content-Type': 'application/json'
            }
            
            start_time = time.time()
            
            # Sử dụng asyncio để thực hiện yêu cầu HTTP không đồng bộ
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: requests.post(
                    self.webhook_endpoint,
                    headers=headers,
                    json=payload,
                    timeout=self.timeout
                )
            )
            
            end_time = time.time()
            response_time = end_time - start_time
            
            print(f"[AICoachAPI] Message response status: {response.status_code}")
            
            if response.status_code != 200:
                print(f"[AICoachAPI] Error: Non-200 status code: {response.status_code}")
                print(f"[AICoachAPI] Response: {response.text}")
                return f"Error: API returned status code {response.status_code}", response_time, {}
                
            try:
                response_data = response.json()
                print(f"[AICoachAPI] Message sent successfully. Response: {json.dumps(response_data, indent=2)}")
                
                # Trích xuất phản hồi theo tài liệu
                # Theo tài liệu, phản hồi có "text" là mảng các chuỗi
                if response_data and "text" in response_data and len(response_data["text"]) > 0:
                    return response_data["text"][0], response_time, response_data
                else:
                    return "No response from bot.", response_time, response_data
            except ValueError:
                print(f"[AICoachAPI] Error: Invalid JSON response")
                return "Error: Invalid response format", response_time, {}
            
        except requests.Timeout:
            print("[AICoachAPI] Error: Request timed out while sending message")
            return "Request timed out.", 0, {}
        except requests.RequestException as e:
            print(f"[AICoachAPI] Error sending message: {str(e)}")
            return f"Error: {str(e)}", 0, {}
        except Exception as e:
            print(f"[AICoachAPI] Unexpected error sending message: {str(e)}")
            return f"Error: {str(e)}", 0, {} 