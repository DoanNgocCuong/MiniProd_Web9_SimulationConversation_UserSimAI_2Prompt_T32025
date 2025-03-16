FROM python:3.9

WORKDIR /app

# Cài đặt các công cụ debug
RUN apt-get update && apt-get install -y \
    iputils-ping \
    curl \
    net-tools \
    dnsutils \
    && rm -rf /var/lib/apt/lists/*

# Cài đặt tất cả các dependencies cần thiết - Sửa phiên bản OpenAI
RUN pip install --no-cache-dir fastapi uvicorn python-dotenv openai==0.28.1 aiohttp requests typing-extensions

# Copy các file cần thiết
COPY main.py .
COPY def_simulation.py .
COPY .env .

# Tạo thư mục logs với quyền đầy đủ
RUN mkdir -p logs && chmod 777 logs

# Mở port
EXPOSE 25050

# Thiết lập biến môi trường
ENV PYTHONUNBUFFERED=1

# Kiểm tra kết nối mạng khi container khởi động
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Chạy ứng dụng FastAPI
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "25050"] 