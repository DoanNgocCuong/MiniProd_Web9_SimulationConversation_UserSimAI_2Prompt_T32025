
```bash
@app.post("/check-dod-gen-feedback")
async def check_dod():
    try:
        response = requests.post(
            "http://103.253.20.13:5011/v1/workflows/run",
            headers={
                "Authorization": "Bearer app-o5cIDSJ7ik1kUzc80rsuaiPh",
                "Content-Type": "application/json"
            },
            json={
                "inputs": {
                    "conversation": "Pika: chào cậu",
                    "DoD": "abv"
                },
                "response_mode": "blocking",
                "user": "abc-123"
            },
            timeout=1800  # 30 minutes
        )
        return {
            "status": response.status_code,
            "content": response.json(),  # Convert response text to JSON
            "time": time.time()
        }
    except Exception as e:
        return {"error": str(e)}
```


- Dùng API  này viết hàm @genFeedback.js 

- Khi người dùng ấn: Start Simulation thì:  
    - Sau khi call tới generateMockData đê tạo từng conversation cho từng user. 
    Chẳng hạn output thu được là: user - bot - user - bot - user - bot - ....
    => Bạn hãy gom toàn bộ 1 conversation này lại + với dod từ input from @AgentMode.js để truyền vào hàm @genFeedback.js 
    - Sau khi call hàm @genFeedback.js thì sẽ lấy được OUTPUT của Conversation + với dod input from @AgentMode.js 
    - Sau đó bạn hãy lấy OUTPUT của hàm @genFeedback.js và update lại @ConversationOutput.js là feedback để hiển thị lên UI

```
{
  "status": 200,
  "content": {
    "task_id": "6638b6cd-256d-44e2-becc-eb22cf5d5e47",
    "workflow_run_id": "8af00b5c-91c1-4f79-8bb2-65b94515ed75",
    "data": {
      "id": "8af00b5c-91c1-4f79-8bb2-65b94515ed75",
      "workflow_id": "3a5162f3-2e20-427f-a972-52ca50604969",
      "status": "succeeded",
      "outputs": {
        "output": "{\"status\":\"fail\", \"explain\":\"Conversation không đạt DoD vì không có thông tin chi tiết về yêu cầu cần đạt được (abv) và cũng thiếu nội dung giảng dạy hoặc tương tác giữa robot và bạn nhỏ. Câu 'Pika: chào cậu' không đủ để đánh giá sự hoàn thành của một bài học.\"}"
      },
      "error": null,
      "elapsed_time": 2.351029183715582,
      "total_tokens": 195,
      "total_steps": 3,
      "created_at": 1742393177,
      "finished_at": 1742393179
    }
  },
  "time": 1742393179.217319
}
```

---
UI trả vào đây

để trả ra lắp vào đây : <div class="p-3 rounded-t-xl border-b bg-gray-800/50 border-gray-700"><div class="flex items-center gap-2 mb-2"><span class="px-3 py-1 rounded-full text-sm font-medium bg-red-900/50 text-red-300">FAIL</span><span class="text-sm text-gray-300">Score: 0/100</span></div><p class="text-sm text-gray-400">Waiting for analysis...</p></div>
