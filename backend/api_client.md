
1. Init Conversation
```
curl --location 'http://103.253.20.13:9404/robot-ai-lesson/api/v1/bot/initConversation' \
--header 'Content-Type: application/json' \
--data '{
    "bot_id": 16,
    "conversation_id": "123456789",
    "input_slots": {}
}'
```


```
{
    "status": 0,
    "msg": "Success",
    "conversation_id": "123456789"
}
```

2. Webhook

```bash
curl --location 'http://103.253.20.13:9404/robot-ai-lesson/api/v1/bot/webhook' \
--header 'Content-Type: application/json' \
--data '{
    "conversation_id": "123456789",
    "message": "sẵn sàng"
}'
```

Output: 
```
{
    "status": "success",
    "text": [
        "This is the response from RoleB."
    ],
    "process_time": 0.123456
}
```

Full Output: 
```
{
    "status": "CHAT",
    "text": [
        "Giờ chúng ta sẽ luyện tập chọn cách dịch đúng của câu từ tiếng Việt sang tiếng Anh nhé! Mình cùng bắt đầu nha. "
    ],
    "record": {
        "CUR_TASK_STATUS": "CHAT",
        "NEXT_ACTION": 0
    },
    "conversation_id": "123456789",
    "input_slots": {},
    "logs": {
        "status": "CHAT",
        "text": [
            "Giờ chúng ta sẽ luyện tập chọn cách dịch đúng của câu từ tiếng Việt sang tiếng Anh nhé! Mình cùng bắt đầu nha. "
        ],
        "conversation_id": "123456789",
        "msg": "scuccess",
        "record": {
            "status": "CHAT",
            "CUR_INTENT": "fallback",
            "INTENT_PREDICT_LLM": null,
            "NEXT_ACTION": 1,
            "PRE_ACTION": null,
            "CUR_ACTION": "Giờ chúng ta sẽ luyện tập chọn cách dịch đúng của câu từ tiếng Việt sang tiếng Anh nhé! Mình cùng bắt đầu nha. ",
            "LOOP_COUNT": [
                {
                    "fallback": 1
                },
                {},
                {},
                {},
                {}
            ],
            "SYSTEM_SCORE_SUM": 0
        },
        "process_time": 0.003558635711669922
    },
    "process_time": 0.2216784954071045
}
```

Muốn lấy thêm các keys khác (chẳng hạn: key: LOOP_COUNT để tính toán , ... thì code thêm ở file: def_simulate_with_api.py nhé)