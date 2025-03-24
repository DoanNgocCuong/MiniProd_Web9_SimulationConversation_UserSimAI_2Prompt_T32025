import os
import asyncio
import json
import traceback
import time
from openai import OpenAI
from def_ApiClientB import AICoachAPI
from def_simulate_with_api import simulate_with_api

# Thêm hàm run_simulation_with_params
async def run_simulation_with_params(bot_id, user_prompt, max_turns=3, history=None):
    """
    Hàm bất đồng bộ để chạy mô phỏng cuộc trò chuyện với các tham số được cung cấp.
    
    Args:
        bot_id (int): ID của bot sẽ sử dụng
        user_prompt (str): Prompt cho người dùng (roleA)
        max_turns (int): Số lượt tối đa cho cuộc trò chuyện
        history (list, optional): Lịch sử cuộc trò chuyện ban đầu
        
    Returns:
        dict: Kết quả mô phỏng bao gồm cuộc trò chuyện và thông tin khác
    """
    try:
        # Tải biến môi trường từ file .env
        import dotenv
        dotenv.load_dotenv()
        
        # Lấy OpenAI API key từ biến môi trường
        openai_api_key = os.getenv("OPENAI_API_KEY")
        
        # Khởi tạo OpenAI client
        openai_client = OpenAI(api_key=openai_api_key)
        
        # Khởi tạo API client
        api_client = AICoachAPI(bot_id=bot_id)
        
        if not api_client.init_conversation():
            return {
                "success": False,
                "error": "Không thể khởi tạo cuộc trò chuyện với API"
            }
        
        # Sử dụng history nếu được cung cấp, nếu không thì dùng mặc định
        initial_history = history if history else [{"role": "roleA", "content": "sẵn sàng"}]
        
        # Chạy mô phỏng
        message_history, response_times, full_logs = simulate_with_api(
            roleA_prompt=user_prompt,
            maxTurns=max_turns,
            openai_client=openai_client,
            api_client=api_client,
            initialConversationHistory=json.dumps(initial_history)
        )
        
        # Lưu kết quả nếu cần
        timestamp = int(time.time())
        results_dir = "results"
        os.makedirs(results_dir, exist_ok=True)
        
        # Lưu lịch sử tin nhắn
        with open(f"{results_dir}/conversation_history_{timestamp}.json", "w", encoding="utf-8") as f:
            json.dump(message_history, f, ensure_ascii=False, indent=2)
        
        # Lưu thời gian phản hồi
        with open(f"{results_dir}/response_times_{timestamp}.json", "w", encoding="utf-8") as f:
            json.dump(response_times, f, ensure_ascii=False, indent=2)
        
        # Lưu nhật ký đầy đủ
        with open(f"{results_dir}/full_logs_{timestamp}.json", "w", encoding="utf-8") as f:
            json.dump(full_logs, f, ensure_ascii=False, indent=2)
        
        return {
            "success": True,
            "conversation": message_history,
            "response_times": response_times,
            "full_logs": full_logs,
            "timestamp": timestamp
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }