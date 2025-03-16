import asyncio
import socket
import logging
import time
import traceback
import os
import sys
import requests
import json
from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from def_simulation import run_simulation_with_params

# Configure logging with fallback to console if file logging fails
try:
    # Configure logging
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, "api.log")
    
    # Try to create a test file to check permissions
    try:
        with open(log_file, 'a') as f:
            pass
        
        # If we can write to the file, set up both handlers
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler(),
                logging.FileHandler(log_file)
            ]
        )
    except PermissionError:
        # If we can't write to the file, only use console logging only.
        print(f"WARNING: Cannot write to log file {log_file}. Using console logging only.")
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler()
            ]
        )
except Exception as e:
    # Fallback to basic logging if anything goes wrong
    print(f"Error setting up logging: {str(e)}")
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

logger = logging.getLogger("simulation-api")
logger.info("Logging initialized")

# Create FastAPI app
app = FastAPI(title="Simulation API")

# Get CORS origins from environment or use default
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
logger.info(f"CORS origins: {cors_origins}")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = f"{time.time()}-{id(request)}"
    logger.info(f"Request {request_id} started: {request.method} {request.url.path}")
    
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"Request {request_id} completed: status={response.status_code}, time={process_time:.3f}s")
        return response
    except Exception as e:
        logger.error(f"Request {request_id} failed: {str(e)}")
        logger.error(traceback.format_exc())
        raise

# Define request models
class SimulationRequest(BaseModel):
    bot_id: int
    user_prompt: str
    max_turns: int = 3
    history: Optional[List[Dict[str, Any]]] = None

# Define API endpoints
@app.post("/run-simulation")
async def api_run_simulation(request: SimulationRequest):
    logger.info(f"Starting simulation with bot_id={request.bot_id}, prompt='{request.user_prompt}'")
    print("api_run_simulation")
    try:
        start_time = time.time()
        # Thêm log chi tiết hơn
        logger.info(f"Environment variables: OPENAI_API_KEY exists: {'Yes' if os.environ.get('OPENAI_API_KEY') else 'No'}")
        
        result = await run_simulation_with_params(
            bot_id=request.bot_id,
            user_prompt=request.user_prompt,
            max_turns=request.max_turns,
            history=request.history
        )
        elapsed_time = time.time() - start_time
        logger.info(f"Simulation completed in {elapsed_time:.3f}s")
        return result
    except Exception as e:
        logger.error(f"Simulation failed: {str(e)}")
        logger.error(traceback.format_exc())
        # Trả về lỗi chi tiết hơn
        return {
            "success": False,
            "conversation": [],
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        # raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@app.get("/health")
async def health_check():
    logger.info("Health check requested")
    
    # Kiểm tra kết nối đến API bên ngoài
    api_status = "unknown"
    api_error = None
    try:
        api_url = os.environ.get("API_BASE_URL", "http://103.253.20.13:9404")
        response = requests.get(f"{api_url}/robot-ai-lesson/api/v1/health", timeout=5)
        if response.status_code == 200:
            api_status = "connected"
        else:
            api_status = f"error: {response.status_code}"
    except Exception as e:
        api_status = "error"
        api_error = str(e)
    
    # Kiểm tra OpenAI API key
    openai_key_status = "set" if os.environ.get("OPENAI_API_KEY") else "missing"
    
    return {
        "status": "healthy", 
        "service": "simulation-api", 
        "timestamp": time.time(),
        "environment": os.environ.get("ENVIRONMENT", "production"),
        "python_version": sys.version,
        "api_connection": api_status,
        "api_error": api_error,
        "openai_key": openai_key_status,
        "hostname": socket.gethostname(),
        "ip": socket.gethostbyname(socket.gethostname())
    }

# Keep the test function for debugging
async def test_simulation():
    logger.info("Running test simulation")
    print("test_simulation")
    # Test the run_simulation_with_params function with custom parameters
    try:
        result = await run_simulation_with_params(
            bot_id=16,
            user_prompt="xin chào",
            max_turns=3,
            history=None
        )
        
        # Print results
        print(result)
        logger.info("Test simulation completed successfully")
    except Exception as e:
        logger.error(f"Test simulation failed: {str(e)}")
        logger.error(traceback.format_exc())

# Add this new endpoint to your main.py file
@app.post("/simulate")
async def simulate(data: dict = Body(...)):
    logger.info(f"Simulate endpoint called with data: {data}")
    try:
        # You can either:
        # 1. Process the data directly here
        # 2. Or call your existing simulation function
        
        # Option 2 example:
        bot_id = data.get("bot_id")
        user_prompt = data.get("user_prompt")
        max_turns = data.get("max_turns", 3)
        history = data.get("history")
        
        result = await run_simulation_with_params(
            bot_id=bot_id,
            user_prompt=user_prompt,
            max_turns=max_turns,
            history=history
        )
        
        return result
    except Exception as e:
        logger.error(f"Simulation failed: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "success": False,
            "conversation": [],
            "error": str(e),
            "traceback": traceback.format_exc()
        }

# In Docker, we don't need to find an available port
# The port is fixed in the Dockerfile and docker-compose.yml
if __name__ == "__main__":
    # Check if running in Docker
    in_docker = os.environ.get("DOCKER", False)
    
    if in_docker:
        # Docker setup - port is fixed
        logger.info("Running in Docker environment")
        import uvicorn
        uvicorn.run("main:app", host="0.0.0.0", port=25050)
    else:
        # Local development setup - find available port
        try:
            import uvicorn
            
            # Function to find an available port
            def find_available_port(start_port=25050, max_attempts=100):
                for port in range(start_port, start_port + max_attempts):
                    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                        if s.connect_ex(('localhost', port)) != 0:
                            return port
                return start_port  # Fallback to original port if none found
            
            # Find an available port
            port = find_available_port()
            logger.info(f"Starting server on port {port}")
            print(f"Starting server on port {port}")
            uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
        except ModuleNotFoundError as e:
            error_msg = f"Error: {e}"
            logger.error(error_msg)
            print(error_msg)
            print("Please install required dependencies:")
            print("pip install fastapi uvicorn typing-extensions")