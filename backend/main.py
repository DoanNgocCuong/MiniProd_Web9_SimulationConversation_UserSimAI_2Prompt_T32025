import asyncio
import socket
import logging
import time
import traceback
from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from def_simulation import run_simulation_with_params

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("api.log")
    ]
)
logger = logging.getLogger("simulation-api")

# Create FastAPI app
app = FastAPI(title="Simulation API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
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
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@app.get("/health")
async def health_check():
    logger.info("Health check requested")
    return {"status": "healthy", "service": "simulation-api", "timestamp": time.time()}

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

# Function to find an available port
def find_available_port(start_port=25050, max_attempts=100):
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) != 0:
                return port
    return start_port  # Fallback to original port if none found

# Run the app with uvicorn when executed directly
if __name__ == "__main__":
    try:
        import uvicorn
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