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
import { websocketService } from "@/services/websocketService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [agentPrompt, setAgentPrompt] = useState('');
  const [userPrompts, setUserPrompts] = useState<UserPrompt[]>([
    { id: uuidv4(), content: '', isSelected: true }
  ]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await websocketService.connect();
        setIsConnected(true);
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to simulation server.",
          variant: "destructive",
        });
      }
    };

    connectWebSocket();

    // Handle conversations created
    const removeConversationsHandler = websocketService.onMessage(
      "conversations_created",
      (event) => {
        const data = JSON.parse(event.data);
        const newConversations = data.conversations.map(
          (conversation: any) => ({
            id: conversation.id,
            userPromptId: conversation.userPromptId,
            messages: [],
            isActive: true,
          })
        );
        setConversations(newConversations);
      }
    );

    // Handle new messages
    const removeMessageHandler = websocketService.onMessage(
      "message",
      (event) => {
        const data = JSON.parse(event.data);
        setConversations((prevConversations) => 
          prevConversations.map((conversation) => {
            if (conversation.id === data.conversation_id) {
              return {
                ...conversation,
                messages: [...conversation.messages, data.message],
              };
            }
            return conversation;
          })
        );
      }
    );

    // Handle conversation completion
    const removeCompletionHandler = websocketService.onMessage(
      "completion",
      (event) => {
        const data = JSON.parse(event.data);
        setConversations((prevConversations) =>
          prevConversations.map((conversation) => {
            if (conversation.id === data.conversation_id) {
              return {
                ...conversation,
                isActive: false,
              };
            }
            return conversation;
          })
        );
      }
    );

    return () => {
      removeConversationsHandler();
      removeMessageHandler();
      removeCompletionHandler();
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
    // Validate inputs
    if (!agentPrompt.trim()) {
      toast({
        title: "Missing Agent Prompt",
        description: "Please enter an Agent prompt before starting.",
        variant: "destructive",
      });
      return;
    }

    const selectedPrompts = userPrompts.filter((p) => p.isSelected);
    if (selectedPrompts.length === 0) {
      toast({
        title: "No User Prompts Selected",
        description: "Please select at least one User prompt before starting.",
        variant: "destructive",
      });
      return;
    }

    const emptyPrompts = selectedPrompts.filter((p) => !p.content.trim());
    if (emptyPrompts.length > 0) {
      toast({
        title: "Empty User Prompts",
        description: "Some selected User prompts are empty. Please fill them in.",
        variant: "destructive",
      });
      return;
    }

    // Clear previous conversations
    setConversations([]);
    setIsSimulating(true);

    // Start new conversations
    websocketService.startConversations(agentPrompt, userPrompts);
  };

  const hasActiveConversations = conversations.some(conv => conv.isActive);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-8 text-center">
        AI Conversation Simulator
      </h1>

      <div className="grid grid-cols-1 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Agent Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <PromptInput
              label="Agent"
              value={agentPrompt}
              onChange={handleAgentPromptChange}
              placeholder="Enter the prompt for the Agent role (AI assistant)..."
              height="min-h-[150px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <UserPromptList
              userPrompts={userPrompts}
              onContentChange={handleUserPromptContentChange}
              onSelectionChange={handleUserPromptSelectionChange}
              onAddPrompt={handleAddUserPrompt}
              onDeletePrompt={handleDeleteUserPrompt}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mb-8">
        <Button
          size="lg"
          onClick={handleStartSimulation}
          disabled={!isConnected || isSimulating && conversations.length === 0}
          className="px-8"
        >
          {!isConnected 
            ? "Connecting..." 
            : (isSimulating && conversations.length === 0) 
              ? "Starting..." 
              : "Start Simulation"}
        </Button>
      </div>

      <div className="h-[600px]">
        <ConversationDisplay conversations={conversations} />
      </div>
    </div>
  );
};

export default Index;
