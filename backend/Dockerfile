FROM python:3.9

WORKDIR /app

RUN pip install --no-cache-dir fastapi uvicorn python-dotenv openai aiohttp psutil requests websockets

COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 25050

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "25050", "--reload"] 