
import { Message, Role } from '@/types/conversation';

// This is a mock class that simulates WebSocket for development
export class MockWebSocketService {
  private callbacks: { [key: string]: ((event: any) => void)[] } = {
    open: [],
    message: [],
    close: [],
    error: []
  };
  private isOpen = false;
  private shouldFail = false;
  private messageIndex = 0;
  private agentPrompt = '';
  private userPrompt = '';
  private intervalId: number | null = null;
  
  constructor(url: string) {
    console.log(`Creating mock WebSocket connection to ${url}`);
    
    // Simulate connection opening
    setTimeout(() => {
      this.isOpen = true;
      this.triggerCallbacks('open', {});
    }, 500);
  }

  addEventListener(event: string, callback: (event: any) => void) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  removeEventListener(event: string, callback: (event: any) => void) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  send(data: string) {
    if (!this.isOpen) {
      this.triggerCallbacks('error', { message: 'Connection not open' });
      return;
    }

    try {
      const parsedData = JSON.parse(data);
      console.log('Mock WebSocket received:', parsedData);
      
      if (parsedData.action === 'start') {
        this.agentPrompt = parsedData.agentPrompt;
        this.userPrompt = parsedData.userPrompt;
        this.startConversation();
      } else if (parsedData.action === 'stop') {
        this.stopConversation();
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }

  close() {
    this.stopConversation();
    this.isOpen = false;
    this.triggerCallbacks('close', {});
  }

  private triggerCallbacks(event: string, data: any) {
    if (this.callbacks[event]) {
      const eventObj = { data: typeof data === 'string' ? data : JSON.stringify(data) };
      this.callbacks[event].forEach(callback => callback(eventObj));
    }
  }

  private startConversation() {
    this.messageIndex = 0;
    this.simulateMessage();
    
    // Send a message every few seconds to simulate conversation
    this.intervalId = window.setInterval(() => {
      this.simulateMessage();
    }, 2000 + Math.random() * 2000);
  }

  private stopConversation() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private simulateMessage() {
    this.messageIndex++;
    
    // End the conversation after a reasonable number of exchanges
    if (this.messageIndex > 10) {
      this.triggerCallbacks('message', {
        type: 'complete',
        message: 'Conversation completed'
      });
      this.stopConversation();
      return;
    }
    
    const role: Role = this.messageIndex % 2 === 1 ? 'Agent' : 'User';
    
    // Generate a simulated message based on the prompt and conversation progress
    let messageContent = '';
    
    // More realistic conversation examples
    const agentMessages = [
      "Hello! I'm your AI assistant. How can I help you today?",
      "That's an interesting point. Could you elaborate more on what you're looking for?",
      "Based on your request, I think we should consider the following options...",
      "I've analyzed your question and here's what I found...",
      "Let me suggest a different approach that might work better for your needs."
    ];
    
    const userMessages = [
      "Hi there! I need help with a project I'm working on.",
      "Sure, I'm trying to figure out how to implement a feature that would allow...",
      "That makes sense. What would be the best way to integrate this with my existing system?",
      "Thanks for the information. I have a follow-up question about...",
      "Could you provide some code examples or documentation links?"
    ];
    
    if (role === 'Agent') {
      messageContent = agentMessages[(this.messageIndex - 1) / 2 % agentMessages.length];
    } else {
      messageContent = userMessages[(this.messageIndex - 2) / 2 % userMessages.length];
    }
    
    const message: Message = {
      role,
      content: messageContent,
      timestamp: Date.now()
    };
    
    this.triggerCallbacks('message', message);
  }
}

// This function creates either a real WebSocket or a mock one based on the environment
export function createWebSocket(url: string): WebSocket {
  // For development, return our mock implementation
  // In production, this would return a real WebSocket
  return new MockWebSocketService(url) as unknown as WebSocket;
}
