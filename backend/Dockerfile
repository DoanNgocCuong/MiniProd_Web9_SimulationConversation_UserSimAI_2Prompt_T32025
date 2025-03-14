FROM python:3.9

WORKDIR /app

# Install all required dependencies
RUN pip install --no-cache-dir fastapi uvicorn python-dotenv openai aiohttp requests typing-extensions

# Copy only the necessary files
COPY main.py .
COPY def_simulation.py .
COPY .env .

# Create logs directory with proper permissions
RUN mkdir -p logs && chmod 777 logs

# Expose port
EXPOSE 25050

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Run the FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "25050"] 