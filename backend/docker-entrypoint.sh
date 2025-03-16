#!/bin/bash
set -e

echo "=== Docker container starting up ==="

# Kiểm tra file .env
echo "Checking .env file..."
if [ -f /app/.env ]; then
  echo ".env file exists"
  # Hiển thị nội dung file .env (ẩn các giá trị nhạy cảm)
  grep -v "KEY\|SECRET\|PASSWORD" /app/.env | sed 's/\(.*=\).*/\1****/' || echo "No readable content in .env"
else
  echo "WARNING: .env file not found!"
fi

# Kiểm tra biến môi trường
echo "Checking environment variables..."
if [ -z "$OPENAI_API_KEY" ]; then
  # Nếu không có biến môi trường, thử đọc từ file .env
  if [ -f /app/.env ]; then
    OPENAI_API_KEY=$(grep "OPENAI_API_KEY" /app/.env | cut -d '=' -f2)
    if [ -n "$OPENAI_API_KEY" ]; then
      echo "OPENAI_API_KEY found in .env file"
      # Export biến để các ứng dụng con có thể sử dụng
      export OPENAI_API_KEY
    else
      echo "WARNING: OPENAI_API_KEY not found in .env file!"
    fi
  else
    echo "WARNING: OPENAI_API_KEY is not set and .env file not found!"
  fi
else
  echo "OPENAI_API_KEY is set in environment"
fi

# Kiểm tra kết nối mạng
echo "Checking network connectivity..."
echo "Pinging Google DNS..."
ping -c 2 8.8.8.8 || echo "WARNING: Cannot ping Google DNS"

# Lấy API endpoint từ biến môi trường hoặc giá trị mặc định
API_ENDPOINT=${API_BASE_URL:-"http://103.253.20.13:9404"}
echo "Checking API endpoint connectivity to $API_ENDPOINT..."
curl -s --connect-timeout 5 $API_ENDPOINT -o /dev/null || echo "WARNING: Cannot connect to API endpoint"

echo "DNS resolution test..."
nslookup api.openai.com || echo "WARNING: Cannot resolve OpenAI domain"

echo "=== Environment checks completed ==="

# Chạy lệnh được truyền vào
exec "$@" 