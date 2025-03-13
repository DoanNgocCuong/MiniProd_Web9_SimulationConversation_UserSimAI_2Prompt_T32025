import { Conversation, UserPrompt } from "@/types/conversation";

type WebSocketCallback = (event: MessageEvent) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private clientId: string;
  private messageHandlers: Map<string, WebSocketCallback> = new Map();

  constructor() {
    this.clientId = crypto.randomUUID();
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Use environment variable or fallback to localhost
      const wsUrl = import.meta.env.VITE_BACKEND_URL || 'ws://localhost:8000';
      this.socket = new WebSocket(`${wsUrl}/ws/${this.clientId}`);

      this.socket.onopen = () => {
        console.log("WebSocket connected");
        resolve();
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const handler = this.messageHandlers.get(data.type);
        if (handler) {
          handler(event);
        }
      };

      this.socket.onclose = () => {
        console.log("WebSocket disconnected");
      };
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  startConversations(agentPrompt: string, userPrompts: UserPrompt[]) {
    if (!this.socket) {
      throw new Error("WebSocket not connected");
    }

    const selectedPrompts = userPrompts.filter(prompt => prompt.isSelected);
    
    this.socket.send(JSON.stringify({
      type: "start_conversation",
      agent_prompt: agentPrompt,
      user_prompts: selectedPrompts
    }));
  }

  onMessage(type: string, callback: WebSocketCallback) {
    this.messageHandlers.set(type, callback);
    return () => this.messageHandlers.delete(type);
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService(); 