
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from "sonner";

type WebSocketStatus = 'connecting' | 'open' | 'closed' | 'error';

interface WebSocketHook {
  sendMessage: (message: any) => void;
  lastMessage: string | null;
  status: WebSocketStatus;
  close: () => void;
}

export function useWebSocket(url: string): WebSocketHook {
  const [status, setStatus] = useState<WebSocketStatus>('connecting');
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket(url);
    wsRef.current = socket;

    socket.onopen = () => {
      setStatus('open');
      console.log('WebSocket connection established');
    };

    socket.onmessage = (event) => {
      console.log('Message received:', event.data);
      setLastMessage(event.data);
    };

    socket.onclose = () => {
      setStatus('closed');
      console.log('WebSocket connection closed');
    };

    socket.onerror = (error) => {
      setStatus('error');
      console.error('WebSocket error:', error);
      toast.error("WebSocket connection error. Please try again.");
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [url]);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const messageString = typeof message === 'string' ? message : JSON.stringify(message);
      wsRef.current.send(messageString);
      console.log('Message sent:', messageString);
    } else {
      console.error('WebSocket is not connected');
      toast.error("Connection not established. Please try again.");
    }
  }, []);

  const close = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  return { sendMessage, lastMessage, status, close };
}
