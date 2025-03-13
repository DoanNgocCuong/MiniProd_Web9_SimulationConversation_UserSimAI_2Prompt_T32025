
export type Role = 'Agent' | 'User';

export interface Message {
  role: Role;
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  userPromptId: string;
  messages: Message[];
  isActive: boolean;
}

export interface UserPrompt {
  id: string;
  content: string;
  isSelected: boolean;
}

export interface PromptConfig {
  agentPrompt: string;
  userPrompts: UserPrompt[];
}
