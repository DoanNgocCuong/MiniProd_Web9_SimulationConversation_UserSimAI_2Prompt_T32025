import { Conversation, UserPrompt, Message } from "@/types/conversation";
import { v4 as uuidv4 } from 'uuid';
import { getWebSocketUrl } from "@/lib/env";

interface WebSocketCallbacks {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: any) => void;
  onMessage?: (message: any) => void;
  onConversationUpdate?: (conversation: Conversation) => void;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private clientId: string;
  private callbacks: WebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private conversations: Map<string, Conversation> = new Map();

  constructor() {
    this.clientId = uuidv4();
  }

  connect(callbacks: WebSocketCallbacks = {}) {
    this.callbacks = callbacks;
    
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'ws://localhost:8000';
    const wsUrl = `${backendUrl}/ws/${this.clientId}`;
    
    try {
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        if (this.callbacks.onConnected) {
          this.callbacks.onConnected();
        }
      };
      
      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected', event);
        this.handleDisconnection();
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.callbacks.onError) {
          this.callbacks.onError(error);
        }
      };
      
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        this.handleMessage(data);
        
        if (this.callbacks.onMessage) {
          this.callbacks.onMessage(data);
        }
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.handleDisconnection();
    }
  }
  
  private handleDisconnection() {
    if (this.callbacks.onDisconnected) {
      this.callbacks.onDisconnected();
    }
    
    // Attempt to reconnect
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }
      
      setTimeout(() => {
        this.connect(this.callbacks);
      }, delay);
    }
  }
  
  private handleMessage(data: any) {
    if (data.type === 'conversations_created') {
      // Initialize conversations in our local map
      data.conversations.forEach((conv: any) => {
        this.conversations.set(conv.id, {
          id: conv.id,
          userPromptId: conv.userPromptId,
          messages: [],
          isActive: true
        });
      });
    } else if (data.type === 'message' && data.conversation_id) {
      // Add message to the appropriate conversation
      const conversation = this.conversations.get(data.conversation_id);
      if (conversation) {
        const newMessage: Message = {
          role: data.message.role,
          content: data.message.content,
          timestamp: data.message.timestamp
        };
        
        conversation.messages.push(newMessage);
        this.conversations.set(conversation.id, { ...conversation });
        
        if (this.callbacks.onConversationUpdate) {
          this.callbacks.onConversationUpdate({ ...conversation });
        }
      }
    } else if (data.type === 'completion' && data.conversation_id) {
      // Mark conversation as complete
      const conversation = this.conversations.get(data.conversation_id);
      if (conversation) {
        conversation.isActive = false;
        this.conversations.set(conversation.id, { ...conversation });
        
        if (this.callbacks.onConversationUpdate) {
          this.callbacks.onConversationUpdate({ ...conversation });
        }
      }
    }
  }

  startConversations(agentPrompt: string, userPrompts: UserPrompt[]) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }
    
    const message = {
      type: 'start_conversation',
      agent_prompt: agentPrompt,
      user_prompts: userPrompts.filter(p => p.isSelected)
    };
    
    this.socket.send(JSON.stringify(message));
  }

  getAllConversations(): Conversation[] {
    return Array.from(this.conversations.values());
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();
export default websocketService; 