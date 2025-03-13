
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface PromptInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  height?: string;
}

const PromptInput = ({
  label,
  value,
  onChange,
  placeholder,
  className,
  height = "min-h-[120px]"
}: PromptInputProps) => {
  return (
    <div className={`prompt-container p-4 space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <Label htmlFor={label.toLowerCase()} className="text-sm font-medium">
          {label} Prompt
        </Label>
        <div className="text-xs text-muted-foreground">
          {value.length} characters
        </div>
      </div>
      <Textarea
        id={label.toLowerCase()}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${height} resize-none bg-background/50 focus-visible:ring-2 transition-all`}
      />
    </div>
  );
};

export default PromptInput;
