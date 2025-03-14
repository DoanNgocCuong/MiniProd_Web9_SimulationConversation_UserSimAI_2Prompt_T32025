```bash
curl -X 'POST' \
  'http://103.253.20.13:25050/api/conversations' \
  -H 'Content-Type: application/json' \
  -d '{
  "bot_id": 16,
  "client_id": "your-client-id",
  "max_turns": 10
}'
```