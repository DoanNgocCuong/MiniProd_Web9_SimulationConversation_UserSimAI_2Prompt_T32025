FROM python:3.9

WORKDIR /app

# Cài đặt các công cụ debug
RUN apt-get update && apt-get install -y \
    iputils-ping \
    curl \
    net-tools \
    dnsutils \
    && rm -rf /var/lib/apt/lists/*

# Cài đặt tất cả các dependencies cần thiết
RUN pip install --no-cache-dir fastapi uvicorn python-dotenv openai>=1.0.0 aiohttp requests typing-extensions

# Copy các file cần thiết
COPY . .

# Tạo thư mục logs với quyền đầy đủ
RUN mkdir -p logs && chmod 777 logs

# Mở port
EXPOSE 25050

# Thiết lập biến môi trường
ENV PYTHONUNBUFFERED=1

# Thêm script kiểm tra kết nối
RUN echo '#!/bin/bash\n\
echo "=== CONTAINER STARTUP CHECKS ==="\n\
echo "Date: $(date)"\n\
echo "Hostname: $(hostname)"\n\
echo "IP Address: $(hostname -I)"\n\
echo ""\n\
echo "=== NETWORK CHECKS ==="\n\
echo "Checking DNS..."\n\
cat /etc/resolv.conf\n\
echo ""\n\
echo "Checking routes..."\n\
ip route\n\
echo ""\n\
echo "Pinging API server..."\n\
ping -c 4 103.253.20.13 || echo "Ping failed"\n\
echo ""\n\
echo "Testing connection to API server..."\n\
curl -v --connect-timeout 10 http://103.253.20.13:9404/robot-ai-lesson/api/v1/bot/initConversation -H "Content-Type: application/json" -d "{\"bot_id\": 16, \"conversation_id\": \"test\", \"input_slots\": {}}" || echo "Connection failed"\n\
echo ""\n\
echo "=== ENVIRONMENT VARIABLES ==="\n\
echo "API_BASE_URL: $API_BASE_URL"\n\
echo "OPENAI_API_KEY exists: $(if [ -n "$OPENAI_API_KEY" ]; then echo Yes; else echo No; fi)"\n\
echo ""\n\
echo "=== STARTING APPLICATION ==="\n\
exec "$@"\n\
' > /app/docker-entrypoint.sh

RUN chmod +x /app/docker-entrypoint.sh

# Chạy ứng dụng FastAPI với script kiểm tra
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "25050"] 