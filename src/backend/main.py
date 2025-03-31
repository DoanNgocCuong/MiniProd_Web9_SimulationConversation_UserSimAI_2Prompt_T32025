import os
import logging
from sqlite3 import paramstyle
import sys
import requests
import json
import time
from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from utils import read_user_prompts
from database.db import update_prompt, init_db
import httpx
import asyncio
import socket
import traceback
from def_run_simulation_with_params import run_simulation_with_params  # Import hàm từ tệp mới


# Thiết lập logging chi tiết
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),  # Log ra console
        logging.FileHandler("logs/api_detailed.log")  # Log ra file
    ]
)
logger = logging.getLogger("simulation-api")
logger.info("Logging initialized with detailed configuration")

# Create FastAPI app
app = FastAPI(title="Simulation API")

# Get CORS origins from environment or use default
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
logger.info(f"CORS origins: {cors_origins}")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database when starting the application
init_db()

@app.get("/get-prompts")
async def get_prompts():
    file_path = "user_prompts.txt"  # Path to your text file
    prompts = read_user_prompts(file_path)
    return {"prompts": prompts}

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

class PromptUpdate(BaseModel):
    id: int
    name: str
    content: str

class CheckDoDRequest(BaseModel):
    inputs: dict
    response_mode: str
    user: str

class ReportRequest(BaseModel):
    conversation: str

@app.post("/simulate")
async def simulate(data: dict = Body(...)):
    logger.info(f"Simulate endpoint called with data: {data}")
    try:
        # Log chi tiết
        logger.info(f"Starting simulation with bot_id={data.get('bot_id')}, prompt='{data.get('user_prompt')}'")
        logger.info(f"Max turns: {data.get('max_turns', 3)}")
        logger.info(f"History provided: {'Yes' if data.get('history') else 'No'}")
        
        # Tăng timeout cho các request đến API bên ngoài
        start_time = time.time()
        result = await asyncio.wait_for(
            run_simulation_with_params(
                bot_id=data.get("bot_id"),
                user_prompt=data.get("user_prompt"),
                max_turns=data.get("max_turns", 3),
                history=data.get("history")
            ),
            timeout=1800  # Tăng lên 30 phút
        )
        elapsed_time = time.time() - start_time
        
        # Log kết quả
        logger.info(f"Simulation completed in {elapsed_time:.2f} seconds")
        logger.info(f"Conversation length: {len(result.get('conversation', []))} messages")
        logger.info(f"Simulation success: {result.get('success', False)}")
        
        return result
    except asyncio.TimeoutError:
        logger.error("Simulation timed out after 30 minutes")
        return {
            "success": False,
            "conversation": [],
            "error": "Simulation timed out after 30 minutes"
        }
    except Exception as e:
        logger.error(f"Simulation failed: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "success": False,
            "conversation": [],
            "error": str(e),
            "traceback": traceback.format_exc()
        }

# Health check endpoint
@app.get("/health")
async def health_check():
    logger.info("Health check requested")
    
    # Kiểm tra kết nối đến API bên ngoài
    api_status = "unknown"
    api_error = None
    try:
        api_url = os.environ.get("API_BASE_URL", "http://103.253.20.13:9404")
        logger.info(f"Trying to connect to: {api_url}")
        response = requests.get(f"{api_url}/robot-ai-lesson/api/v1/health", timeout=5)
        logger.info(f"Response status: {response.status_code}")
        logger.info(f"Response content: {response.text}")
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



# Hàm ghi log chi tiết
def log_step(message, level="INFO"):
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{level}] {message}")
    # Ghi vào file log
    try:
        with open("logs/startup.log", "a") as f:
            f.write(f"[{timestamp}] [{level}] {message}\n")
    except:
        pass
    
    # Sử dụng logger để ghi log chi tiết
    if level == "INFO":
        logger.info(message)
    elif level == "ERROR":
        logger.error(message)
    elif level == "WARNING":
        logger.warning(message)
    elif level == "DEBUG":
        logger.debug(message)

# Thêm log khi khởi động
log_step("=== STARTING APPLICATION ===")
log_step(f"Python version: {sys.version}")
log_step(f"Current directory: {os.getcwd()}")
log_step(f"Environment variables: OPENAI_API_KEY exists: {'Yes' if os.environ.get('OPENAI_API_KEY') else 'No'}")
log_step(f"API_BASE_URL: {os.environ.get('API_BASE_URL', 'Not set')}")

@app.post("/check-dod-gen-feedback")
async def check_dod(data: CheckDoDRequest):
    try:
        # Extract conversation and DoD from the request body
        conversation = data.inputs.get("conversation", "")
        dod = data.inputs.get("DoD", "")

        # Log the received data for debugging
        print(f"Received conversation: {conversation}")
        print(f"Received DoD: {dod}")

        # Make the external request with the received data
        response = requests.post(
            "http://103.253.20.13:5011/v1/workflows/run",
            headers={
                "Authorization": "Bearer app-o5cIDSJ7ik1kUzc80rsuaiPh",
                "Content-Type": "application/json"
            },
            json={
                "inputs": {
                    "conversation": conversation,
                    "DoD": dod
                },
                "response_mode": data.response_mode,
                "user": data.user
            },
            timeout=1800  # 30 minutes
        )

        # Return the response from the external service
        return {
            "status": response.status_code,
            "content": response.json(),  # Convert response text to JSON
            "time": time.time()
        }
    except Exception as e:
        return {"error": str(e)}

@app.post("/update-prompt")
async def update_prompt_endpoint(prompt_update: PromptUpdate):
    try:
        success = update_prompt(
            prompt_update.id,
            prompt_update.name,
            prompt_update.content
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="Prompt not found")

        return {"message": "Prompt updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-report")
async def generate_report(request: Request):
    try:
        data = await request.json()
        conversation = data.get('conversation')
        print(f"Conversationsss: {conversation}")

        if not conversation:
            return JSONResponse(
                status_code=400,
                content={"error": "Missing conversation text"}
            )

        # Call n8n API to generate report
        n8n_url = "https://n8n.hacknao.edu.vn/webhook/1ca924af-dc7d-460b-82e6-18b9c7fea7ac"
        headers = {
            "Content-Type": "application/json"
        }
        params = {
            "conversation": conversation
        }
        
        print(f"Conversationsss2: {params}")
        async with httpx.AsyncClient() as client:
            response = await client.post(n8n_url, headers=headers, json=params)
        
        if response.status_code != 200:
            logging.error(f"Error from n8n API: {response.text}")
            print(f"Error from n8n API: {response.text}")
            return JSONResponse(
                status_code=response.status_code,
                content={"error": "Failed to generate report"}
            )

        # Parse and validate response
        try:
            response_data = response.json()
            print(f"Response from n8n API: {response_data}")
            
            # Validate response structure
            if not isinstance(response_data, dict) or 'choices' not in response_data:
                raise ValueError("Invalid response format from n8n API")
                
            return JSONResponse(content=response_data)
        except ValueError as ve:
            logging.error(f"Invalid response format: {str(ve)}")
            return JSONResponse(
                status_code=500,
                content={"error": "Invalid response format from n8n API"}
            )

    except Exception as e:
        logging.error(f"Error generating report: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Internal server error: {str(e)}"}
        )

# In Docker, we don't need to find an available port
# The port is fixed in the Dockerfile and docker-compose.yml
if __name__ == "__main__":
    # Check if running in Docker
    in_docker = os.environ.get("DOCKER", False)
    
    log_step(f"Running in Docker: {in_docker}")
    
    if in_docker:
        # Docker setup - port is fixed
        logger.info("Running in Docker environment")
        log_step("Running in Docker environment")
        import uvicorn
        log_step("Starting uvicorn server on port 25050")
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
            log_step(f"Starting server on port {port}")
            print(f"Starting server on port {port}")
            uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
        except ModuleNotFoundError as e:
            error_msg = f"Error: {e}"
            logger.error(error_msg)
            log_step(error_msg, "ERROR")
            print(error_msg)
            print("Please install required dependencies:")
            print("pip install fastapi uvicorn typing-extensions")
