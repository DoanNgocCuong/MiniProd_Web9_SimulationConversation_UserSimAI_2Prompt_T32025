
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { UserPrompt } from '@/types/conversation';
import UserPromptItem from './UserPromptItem';

interface UserPromptListProps {
  userPrompts: UserPrompt[];
  onContentChange: (id: string, content: string) => void;
  onSelectionChange: (id: string, isSelected: boolean) => void;
  onAddPrompt: () => void;
  onDeletePrompt: (id: string) => void;
}

const UserPromptList = ({
  userPrompts,
  onContentChange,
  onSelectionChange,
  onAddPrompt,
  onDeletePrompt
}: UserPromptListProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">User Prompts</h3>
        <Button 
          onClick={onAddPrompt}
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          Add New Prompt
        </Button>
      </div>
      
      <div className="space-y-2">
        {userPrompts.map((prompt, index) => (
          <UserPromptItem
            key={prompt.id}
            userPrompt={prompt}
            index={index}
            onContentChange={onContentChange}
            onSelectionChange={onSelectionChange}
            onDelete={onDeletePrompt}
            isDeleteDisabled={userPrompts.length <= 1}
          />
        ))}
      </div>
    </div>
  );
};

export default UserPromptList;
