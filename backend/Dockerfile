FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Expose the port the app runs on
EXPOSE 25050

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "25050"] 