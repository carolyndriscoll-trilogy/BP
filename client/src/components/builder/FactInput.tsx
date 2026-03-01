import { useState, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { useAutoSave } from '@/hooks/useAutoSave';

interface FactInputProps {
  fact: { id: number; text: string; verificationStatus: string | null };
  onUpdate: (id: number, fields: { text: string }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function FactInput({ fact, onUpdate, onDelete }: FactInputProps) {
  const [text, setText] = useState(fact.text);

  const handleSave = useCallback(async (data: { text: string }) => {
    if (data.text.trim() && data.text !== fact.text) {
      await onUpdate(fact.id, data);
    }
  }, [fact.id, fact.text, onUpdate]);

  const { triggerSave, saveImmediately } = useAutoSave({
    onSave: handleSave,
    debounceMs: 1500,
  });

  const handleChange = (value: string) => {
    setText(value);
    triggerSave({ text: value });
  };

  return (
    <div className="flex items-start gap-2 group">
      <input
        type="text"
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => saveImmediately({ text })}
        placeholder="Enter a fact..."
        className="flex-1 bg-transparent border-b border-border text-sm text-foreground px-1 py-1.5 focus:outline-none focus:border-dok1 transition-colors placeholder:text-muted-foreground/50"
      />
      <span className="text-[10px] text-muted-foreground/60 px-1.5 py-0.5 bg-muted/50 rounded shrink-0 mt-1">
        pending
      </span>
      <button
        onClick={() => onDelete(fact.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive bg-transparent border-none cursor-pointer shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
