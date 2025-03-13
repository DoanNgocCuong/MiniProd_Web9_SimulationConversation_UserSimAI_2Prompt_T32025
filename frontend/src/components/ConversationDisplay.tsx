
import React, { useState, useEffect } from 'react';
import { Conversation, Message } from '@/types/conversation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface ConversationMessageProps {
  message: Message;
  index: number;
}

// Helper component to simulate typing effect
const TypingEffect = ({ text, onComplete }: { text: string, onComplete: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(current => current + 1);
      }, 15 + Math.random() * 20); // Randomize typing speed slightly
      
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [currentIndex, text, onComplete]);
  
  return <span>{displayedText}</span>;
};

const ConversationMessage = ({ message, index }: ConversationMessageProps) => {
  const [isTyping, setIsTyping] = useState(true);
  
  return (
    <div
      key={message.timestamp + index}
      className={cn(
        "message-bubble flex flex-col max-w-[80%] rounded-lg p-3 mb-2",
        message.role === "Agent" 
          ? "bg-primary/10 border border-primary/20 mr-auto" 
          : "bg-secondary/80 border border-secondary ml-auto"
      )}
      style={{ '--index': index } as React.CSSProperties}
    >
      <div className="flex items-center mb-1">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background/80 mr-2">
          {message.role}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <div className="text-sm whitespace-pre-wrap">
        {isTyping ? (
          <TypingEffect text={message.content} onComplete={() => setIsTyping(false)} />
        ) : (
          message.content
        )}
      </div>
    </div>
  );
};

interface SingleConversationProps {
  conversation: Conversation;
}

const SingleConversation = ({ conversation }: SingleConversationProps) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  return (
    <div className="rounded-lg bg-card/60 border shadow-sm p-4 mb-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">
          User Prompt {conversation.userPromptId.slice(-4)}
          {conversation.isActive && (
            <span className="ml-2 text-xs text-primary animate-pulse">
              (Active)
            </span>
          )}
        </h3>
      </div>
      
      <ScrollArea className="h-[300px] w-full">
        <div className="p-2 space-y-4">
          {conversation.messages.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              Conversation will appear here
            </div>
          ) : (
            conversation.messages.map((message, index) => (
              <ConversationMessage key={message.timestamp + index} message={message} index={index} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
    </div>
  );
};

interface ConversationDisplayProps {
  conversations: Conversation[];
}

const ConversationDisplay = ({ conversations }: ConversationDisplayProps) => {
  if (conversations.length === 0) {
    return (
      <div className="w-full h-full rounded-xl backdrop-blur-sm bg-card/80 border overflow-hidden shadow-sm">
        <div className="p-3 border-b bg-muted/50 backdrop-blur-sm">
          <h3 className="text-sm font-medium">Conversations</h3>
        </div>
        <div className="flex items-center justify-center h-[calc(100%-40px)] text-muted-foreground">
          No active conversations
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full rounded-xl backdrop-blur-sm bg-card/80 border overflow-hidden shadow-sm">
      <div className="p-3 border-b bg-muted/50 backdrop-blur-sm">
        <h3 className="text-sm font-medium">Conversations</h3>
      </div>
      
      <ScrollArea className="h-[calc(100%-40px)]">
        <div className="p-4 space-y-1">
          {conversations.map((conversation, index) => (
            <React.Fragment key={conversation.id}>
              <SingleConversation conversation={conversation} />
              {index < conversations.length - 1 && <Separator className="my-3" />}
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ConversationDisplay;
