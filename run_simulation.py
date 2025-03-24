import os
import json
import dotenv
from openai import OpenAI
from def_ApiClientB import AICoachAPI
from def_simulate_with_api import simulate_with_api

def main():
    # Tải biến môi trường từ file .env
    dotenv.load_dotenv()
    
    print("=== BẮT ĐẦU MÔ PHỎNG CUỘC TRÒ CHUYỆN ===")
    
    # Lấy OpenAI API key từ biến môi trường
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        print("Không tìm thấy OPENAI_API_KEY trong file .env")
        openai_api_key = input("Nhập OpenAI API key: ")
        os.environ["OPENAI_API_KEY"] = openai_api_key
    else:
        print("Đã tải OPENAI_API_KEY từ file .env")
    
    # Khởi tạo OpenAI client
    openai_client = OpenAI(api_key=openai_api_key)
    
    # Khởi tạo API client
    api_client = AICoachAPI()
    if not api_client.init_conversation():
        print("Không thể khởi tạo cuộc trò chuyện với API. Đang thoát...")
        return
    
    # Cấu hình mô phỏng
    roleA_prompt = """Bạn là một học sinh lớp 10 đang học về hóa học. Bạn đang nói chuyện với giáo viên hóa học của mình.
    Hãy hỏi những câu hỏi liên quan đến hóa học, đặc biệt là về bảng tuần hoàn và liên kết hóa học.
    Hãy giữ câu hỏi ngắn gọn, rõ ràng và phù hợp với trình độ học sinh lớp 10.
    Hãy phản hồi lại câu trả lời của giáo viên một cách lịch sự và thể hiện sự tò mò học hỏi."""
    
    max_turns = int(input("Nhập số lượt tối đa cho cuộc trò chuyện (ví dụ: 5): "))
    
    # Tùy chọn: Sử dụng lịch sử cuộc trò chuyện ban đầu
    use_initial_history = input("Bạn có muốn sử dụng lịch sử cuộc trò chuyện ban đầu không? (y/n): ").lower() == 'y'
    initial_history = None
    
    if use_initial_history:
        initial_message = input("Nhập tin nhắn ban đầu từ RoleA: ")
        initial_history = json.dumps([{"role": "roleA", "content": initial_message}])
    
    # Chạy mô phỏng
    print("\nBắt đầu mô phỏng cuộc trò chuyện...")
    message_history, response_times, full_logs = simulate_with_api(
        roleA_prompt=roleA_prompt,
        maxTurns=max_turns,
        openai_client=openai_client,
        api_client=api_client,
        initialConversationHistory=initial_history
    )
    
    # Lưu kết quả
    import time
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
    
    # Hiển thị cuộc trò chuyện
    print("\n=== CUỘC TRÒ CHUYỆN ĐÃ HOÀN THÀNH ===")
    print(f"Tổng số lượt: {len(message_history) // 2}")
    print(f"Kết quả đã được lưu trong thư mục: {results_dir}")
    
    print("\n=== NỘI DUNG CUỘC TRÒ CHUYỆN ===")
    for i, msg in enumerate(message_history):
        role = "Học sinh" if msg["role"] == "roleA" else "Giáo viên"
        print(f"\n[{role}]: {msg['content']}")
    
    print("\n=== KẾT THÚC MÔ PHỎNG ===")

if __name__ == "__main__":
    main() 