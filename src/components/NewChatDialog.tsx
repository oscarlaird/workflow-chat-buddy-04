
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateChat: (title: string) => Promise<void>;
  isLoading: boolean;
}

export const NewChatDialog = ({ 
  open, 
  onOpenChange, 
  onCreateChat, 
  isLoading 
}: NewChatDialogProps) => {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when dialog opens
  useEffect(() => {
    if (open && inputRef.current) {
      // Use a small timeout to ensure the dialog is fully rendered
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    await onCreateChat(title.trim());
    setTitle("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Workflow Chat</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              ref={inputRef}
              placeholder="Workflow title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Chat"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatDialog;
