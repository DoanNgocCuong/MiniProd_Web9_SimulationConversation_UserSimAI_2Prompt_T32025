import json
import time
from def_promptA import generate_roleA_response

def simulate_with_api(roleA_prompt, maxTurns, openai_client, api_client, initialConversationHistory=None):
    """Simulate conversation using OpenAI for RoleA and API for RoleB"""
    message_history = []
    response_times = []
    full_log = []  # Lưu toàn bộ response từ API
    conversationTurnCount = 0

    print("\n=== Initial Settings ===")
    print(f"RoleA Prompt: {roleA_prompt[:100]}..." if roleA_prompt else "RoleA Prompt: None")
    print(f"Max Turns: {maxTurns}")

    # Get initial message from history
    initial_message = "sẵn sàng"  # default
    if initialConversationHistory is not None:
        try:
            history = json.loads(initialConversationHistory)
            if history and history[0]["role"] == "roleA":
                initial_message = history[0]["content"]
                # Add initial roleA message to history
                message_history.append({"role": "roleA", "content": initial_message})
                full_log.append("")  # Empty log for roleA message
                response_times.append(0)  # 0 for initial message
            print(f"\nUsing initial message: {initial_message}")
        except json.JSONDecodeError as e:
            print(f"Error parsing conversation history: {e}")

    # Start with RoleB using the initial message
    api_response = api_client.send_message(initial_message)
    
    if api_response and "text" in api_response:
        roleB_message = api_response["text"][0]
        message_history.append({"role": "roleB", "content": roleB_message})
        # Lưu toàn bộ response
        full_log.append(json.dumps(api_response, ensure_ascii=False, indent=2))
        process_time = round(float(api_response.get("process_time", 0)), 6)
        response_times.append(process_time)
        
        if api_response.get("status") == "END":
            print("[INFO] Received END status from API. Ending conversation.")
            return message_history, response_times, full_log
    else:
        print("[ERROR] Failed to get initial response from API")
        return message_history, response_times, full_log

    # Start conversation loop
    while conversationTurnCount < maxTurns:
        try:
            # RoleA turn with OpenAI
            roleA_message, roleA_time = generate_roleA_response(
                openai_client,
                roleA_prompt,
                message_history
            )
            message_history.append({"role": "roleA", "content": roleA_message})
            full_log.append("")  # Empty log for roleA message
            response_times.append(round(roleA_time, 6))

            # RoleB turn with API
            api_response = api_client.send_message(roleA_message)

            if api_response and "text" in api_response:
                roleB_message = api_response["text"][0]
                message_history.append({"role": "roleB", "content": roleB_message})
                # Lưu toàn bộ response
                full_log.append(json.dumps(api_response, ensure_ascii=False, indent=2))
                process_time = round(float(api_response.get("process_time", 0)), 6)
                response_times.append(process_time)
                
                if api_response.get("status") == "END":
                    print("[INFO] Received END status from API. Ending conversation.")
                    break
            else:
                print("[ERROR] Failed to get response from API")
                full_log.append("")  # Empty log for failed API response
                break

            conversationTurnCount += 1
            print(f"\n=== End of Turn {conversationTurnCount}/{maxTurns} ===")
            time.sleep(1)

        except Exception as e:
            print(f"\nError during conversation: {str(e)}")
            full_log.append("")  # Empty log for error case
            break

    return message_history, response_times, full_log
