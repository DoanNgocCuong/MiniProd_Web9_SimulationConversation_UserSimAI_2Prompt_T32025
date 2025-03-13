
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { UserPrompt } from '@/types/conversation';

interface UserPromptItemProps {
  userPrompt: UserPrompt;
  index: number; // Added index prop for numbering
  onContentChange: (id: string, content: string) => void;
  onSelectionChange: (id: string, isSelected: boolean) => void;
  onDelete: (id: string) => void;
  isDeleteDisabled: boolean;
}

const UserPromptItem = ({
  userPrompt,
  index,
  onContentChange,
  onSelectionChange,
  onDelete,
  isDeleteDisabled
}: UserPromptItemProps) => {
  return (
    <div className="prompt-container p-4 space-y-2 flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox 
            id={`checkbox-${userPrompt.id}`}
            checked={userPrompt.isSelected}
            onCheckedChange={(checked) => 
              onSelectionChange(userPrompt.id, checked === true)
            }
          />
          <label 
            htmlFor={`checkbox-${userPrompt.id}`}
            className="text-sm font-medium cursor-pointer flex items-center"
          >
            <span className="flex items-center justify-center rounded-full bg-primary/10 w-6 h-6 text-xs font-semibold mr-1.5">
              {index + 1}
            </span>
            User Prompt {userPrompt.id.slice(-4)}
          </label>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {userPrompt.content.length} characters
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(userPrompt.id)}
            disabled={isDeleteDisabled}
            className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Textarea
        placeholder="Enter the prompt for the User role..."
        value={userPrompt.content}
        onChange={(e) => onContentChange(userPrompt.id, e.target.value)}
        className="min-h-[80px] resize-none bg-background/50 focus-visible:ring-2 transition-all"
      />
    </div>
  );
};

export default UserPromptItem;
