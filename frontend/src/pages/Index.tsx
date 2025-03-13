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
import { Play, StopCircle, PauseCircle, Loader2 } from 'lucide-react';
import websocketService from "@/services/websocketService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [agentPrompt, setAgentPrompt] = useState('');
  const [userPrompts, setUserPrompts] = useState<UserPrompt[]>([
    { id: uuidv4(), content: '', isSelected: true }
  ]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Connect to WebSocket when component mounts
    setIsConnecting(true);
    websocketService.connect({
      onConnected: () => {
        setIsConnected(true);
        setIsConnecting(false);
        toast.success('Connected to server');
      },
      onDisconnected: () => {
        setIsConnected(false);
        setIsConnecting(true);
        toast.error('Disconnected from server');
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error');
      },
      onConversationUpdate: (updatedConversation) => {
        setConversations(prevConversations => {
          const index = prevConversations.findIndex(c => c.id === updatedConversation.id);
          if (index >= 0) {
            const newConversations = [...prevConversations];
            newConversations[index] = updatedConversation;
            return newConversations;
          } else {
            return [...prevConversations, updatedConversation];
          }
        });
      }
    });

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

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
  };

  const handleStartSimulation = () => {
    if (!isConnected) {
      toast.error('Not connected to server');
      return;
    }

    if (!agentPrompt.trim()) {
      toast.error('Agent prompt cannot be empty');
      return;
    }

    const selectedPrompts = userPrompts.filter(p => p.isSelected);
    if (selectedPrompts.length === 0) {
      toast.error('Select at least one user prompt');
      return;
    }

    if (selectedPrompts.some(p => !p.content.trim())) {
      toast.error('Selected user prompts cannot be empty');
      return;
    }

    // Reset conversations
    setConversations([]);
    
    // Start the simulation
    websocketService.startConversations(agentPrompt, userPrompts);
    setIsRunning(true);
    toast.success('Simulation started');
  };

  const hasActiveConversations = conversations.some(conv => conv.isActive);

  return (
    <div className="container py-6 flex flex-col min-h-screen gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">AI Conversation Simulator</h1>
        <p className="text-muted-foreground">
          Create conversations between an agent and multiple user prompts
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        <div className="flex flex-col gap-4">
          <div className="space-y-4">
            <PromptInput
              label="Agent"
              value={agentPrompt}
              onChange={handleAgentPromptChange}
              placeholder="Enter the prompt for the Agent role..."
              className="bg-card/60 border rounded-lg shadow-sm"
            />
            
            <UserPromptList
              userPrompts={userPrompts}
              onContentChange={handleUserPromptContentChange}
              onSelectionChange={handleUserPromptSelectionChange}
              onAddPrompt={handleAddUserPrompt}
              onDeletePrompt={handleDeleteUserPrompt}
            />
          </div>
          
          <div className="mt-auto">
            <Button 
              onClick={handleStartSimulation}
              disabled={isConnecting || !isConnected || isRunning}
              className="w-full py-6"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : !isConnected ? (
                <>Disconnected</>
              ) : isRunning ? (
                <>
                  <PauseCircle />
                  Simulation in progress
                </>
              ) : (
                <>
                  <Play />
                  Start Simulation
                </>
              )}
            </Button>
          </div>
        </div>
        
        <ConversationDisplay conversations={conversations} />
      </div>
    </div>
  );
};

export default Index;
