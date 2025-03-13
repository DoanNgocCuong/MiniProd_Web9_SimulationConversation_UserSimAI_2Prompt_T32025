
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { Message, Conversation, UserPrompt } from '@/types/conversation';
import PromptInput from '@/components/PromptInput';
import UserPromptList from '@/components/UserPromptList';
import ConversationDisplay from '@/components/ConversationDisplay';
import { createWebSocket } from '@/services/mockWebSocket';
import { cn } from '@/lib/utils';
import { Play, StopCircle } from 'lucide-react';

const Index = () => {
  const [agentPrompt, setAgentPrompt] = useState('');
  const [userPrompts, setUserPrompts] = useState<UserPrompt[]>([
    { id: uuidv4(), content: '', isSelected: true }
  ]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sockets, setSockets] = useState<Record<string, WebSocket>>({});

  // Clean up WebSockets when component unmounts
  useEffect(() => {
    return () => {
      Object.values(sockets).forEach(socket => {
        if (socket) {
          socket.close();
        }
      });
    };
  }, [sockets]);

  const handleAgentPromptChange = (value: string) => {
    setAgentPrompt(value);
  };

  const handleUserPromptContentChange = (id: string, content: string) => {
    setUserPrompts(prev => 
      prev.map(prompt => 
        prompt.id === id ? { ...prompt, content } : prompt
      )
    );
  };

  const handleUserPromptSelectionChange = (id: string, isSelected: boolean) => {
    setUserPrompts(prev => 
      prev.map(prompt => 
        prompt.id === id ? { ...prompt, isSelected } : prompt
      )
    );
  };

  const handleAddUserPrompt = () => {
    setUserPrompts(prev => [
      ...prev, 
      { id: uuidv4(), content: '', isSelected: true }
    ]);
  };

  const handleDeleteUserPrompt = (id: string) => {
    setUserPrompts(prev => prev.filter(prompt => prompt.id !== id));
    
    // Also remove any active conversations using this prompt
    setConversations(prev => prev.filter(conv => conv.userPromptId !== id));
    
    // Close the corresponding socket
    if (sockets[id]) {
      sockets[id].close();
      setSockets(prev => {
        const newSockets = { ...prev };
        delete newSockets[id];
        return newSockets;
      });
    }
  };

  const handleStartConversation = () => {
    if (!agentPrompt.trim()) {
      toast.error("Please fill in the Agent Prompt before starting");
      return;
    }

    const selectedPrompts = userPrompts.filter(p => p.isSelected);
    
    if (selectedPrompts.length === 0) {
      toast.error("Please select at least one User Prompt before starting");
      return;
    }

    const emptySelectedPrompts = selectedPrompts.filter(p => !p.content.trim());
    if (emptySelectedPrompts.length > 0) {
      toast.error("Please fill in all selected User Prompts before starting");
      return;
    }

    setIsConnecting(true);

    // Start a new conversation for each selected prompt
    selectedPrompts.forEach(userPrompt => {
      // If there's already an active conversation for this prompt, skip it
      if (conversations.some(conv => conv.userPromptId === userPrompt.id && conv.isActive)) {
        toast.info(`Conversation for User Prompt ${userPrompt.id.slice(-4)} is already in progress`);
        return;
      }

      // Create a new conversation
      const newConversationId = uuidv4();
      setConversations(prev => [
        ...prev.filter(c => c.userPromptId !== userPrompt.id), // Remove previous conversations with this prompt
        {
          id: newConversationId,
          userPromptId: userPrompt.id,
          messages: [],
          isActive: true
        }
      ]);

      try {
        // For development, use our mock WebSocket
        const ws = createWebSocket('ws://localhost:8000/ws');
        
        // Store the socket reference
        setSockets(prev => ({
          ...prev,
          [userPrompt.id]: ws
        }));

        ws.onopen = () => {
          console.log(`WebSocket connection established for prompt ${userPrompt.id}`);
          
          // Send the initial prompts to start the conversation
          ws.send(JSON.stringify({
            action: 'start',
            agentPrompt,
            userPrompt: userPrompt.content
          }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Handle complete message
            if (data.type === 'complete') {
              setConversations(prev => 
                prev.map(conv => 
                  conv.id === newConversationId ? { ...conv, isActive: false } : conv
                )
              );
              toast.success(`Conversation for User Prompt ${userPrompt.id.slice(-4)} completed`);
              return;
            }
            
            // Handle new message
            setConversations(prev => 
              prev.map(conv => 
                conv.id === newConversationId 
                  ? { ...conv, messages: [...conv.messages, data] } 
                  : conv
              )
            );
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };

        ws.onclose = () => {
          console.log(`WebSocket connection closed for prompt ${userPrompt.id}`);
          setConversations(prev => 
            prev.map(conv => 
              conv.id === newConversationId ? { ...conv, isActive: false } : conv
            )
          );
        };

        ws.onerror = (error) => {
          console.error(`WebSocket error for prompt ${userPrompt.id}:`, error);
          toast.error(`Connection error for User Prompt ${userPrompt.id.slice(-4)}. Please try again.`);
          setConversations(prev => 
            prev.map(conv => 
              conv.id === newConversationId ? { ...conv, isActive: false } : conv
            )
          );
        };
      } catch (error) {
        console.error(`Error creating WebSocket for prompt ${userPrompt.id}:`, error);
        toast.error(`Failed to establish connection for User Prompt ${userPrompt.id.slice(-4)}`);
        setConversations(prev => 
          prev.map(conv => 
            conv.id === newConversationId ? { ...conv, isActive: false } : conv
          )
        );
      }
    });

    setIsConnecting(false);
  };

  const handleStopConversations = () => {
    // Stop all active conversations
    Object.entries(sockets).forEach(([promptId, socket]) => {
      if (socket) {
        socket.send(JSON.stringify({ action: 'stop' }));
      }
    });

    // Mark all conversations as inactive
    setConversations(prev => 
      prev.map(conv => ({ ...conv, isActive: false }))
    );
  };

  const hasActiveConversations = conversations.some(conv => conv.isActive);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-accent/20">
      <div className="fixed inset-0 bg-primary/5 -z-10">
        <div className="absolute inset-0 bg-grid-slate-400/[0.05] bg-[length:32px_32px]"></div>
      </div>
      
      <main className="flex-1 container max-w-6xl py-12 px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 space-y-2 animate-fade-in">
          <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            AI Conversation Simulator
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            AI Ping-Pong Conversation
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Set up AI conversation prompts and watch the AIs converse with each other in real-time.
          </p>
        </div>

        {/* Agent Prompt */}
        <div className="mb-6">
          <PromptInput
            label="Agent"
            value={agentPrompt}
            onChange={handleAgentPromptChange}
            placeholder="Enter the prompt for the Agent role..."
            className="md:transform hover:-rotate-1 transition-transform"
            height="min-h-[150px]"
          />
        </div>

        {/* User Prompts */}
        <div className="mb-8">
          <UserPromptList
            userPrompts={userPrompts}
            onContentChange={handleUserPromptContentChange}
            onSelectionChange={handleUserPromptSelectionChange}
            onAddPrompt={handleAddUserPrompt}
            onDeletePrompt={handleDeleteUserPrompt}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center mb-10">
          <Button
            onClick={hasActiveConversations ? handleStopConversations : handleStartConversation}
            className={cn(
              "start-button min-w-[200px] py-6 rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg",
              hasActiveConversations
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-primary hover:bg-primary/90"
            )}
            disabled={isConnecting || (!agentPrompt.trim() || userPrompts.every(p => !p.isSelected))}
          >
            {isConnecting ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                Connecting...
              </>
            ) : hasActiveConversations ? (
              <>
                <StopCircle className="w-5 h-5" />
                Stop Conversations
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Simulation
              </>
            )}
          </Button>
        </div>

        {/* Conversation Display */}
        <div className="h-[500px] animate-fade-in opacity-0" style={{ animationDelay: '300ms' }}>
          <ConversationDisplay conversations={conversations} />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t bg-card/50 backdrop-blur-sm">
        <div className="container text-center text-sm text-muted-foreground">
          <p>AI Conversation Simulator &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
