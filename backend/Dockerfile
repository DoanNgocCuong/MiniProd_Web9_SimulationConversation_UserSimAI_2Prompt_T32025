FROM python:3.9

WORKDIR /app

# Install dependencies
RUN pip install --no-cache-dir fastapi uvicorn python-dotenv openai aiohttp requests

# Copy only the necessary files
COPY main.py .
COPY def_simulation.py .
COPY .env .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 25050

# Run the FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "25050"] 