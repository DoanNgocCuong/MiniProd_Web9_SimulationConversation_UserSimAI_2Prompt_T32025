from typing import Dict
from fastapi import WebSocket
import websockets
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """Connect a new client"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"connection open")
        
    def disconnect(self, client_id: str):
        """Disconnect a client"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"connection closed")
            
    async def is_connected(self, client_id: str) -> bool:
        """Check if a client is still connected."""
        return client_id in self.active_connections
    
    async def send_message(self, message: dict, client_id: str):
        """Send a message to a specific client"""
        try:
            if client_id in self.active_connections:
                await self.active_connections[client_id].send_json(message)
            else:
                logger.warning(f"Attempted to send message to disconnected client {client_id}")
        except websockets.exceptions.ConnectionClosedError as e:
            logger.warning(f"Connection to client {client_id} was closed. Removing from active connections. Error: {str(e)}")
            self.disconnect(client_id)
        except Exception as e:
            logger.error(f"Error sending message to client {client_id}: {str(e)}") 