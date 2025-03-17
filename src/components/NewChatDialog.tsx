
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, PlusCircle, Sparkles } from "lucide-react";
import { Chat } from "@/hooks/useChats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateChat: (title: string) => Promise<void>;
  isLoading: boolean;
  exampleChats: Chat[];
  onSelectExampleChat: (chatId: string) => void;
}

export const NewChatDialog = ({ 
  open, 
  onOpenChange, 
  onCreateChat, 
  isLoading,
  exampleChats,
  onSelectExampleChat
}: NewChatDialogProps) => {
  const [title, setTitle] = useState("");
  const [activeTab, setActiveTab] = useState<string>("create");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when dialog opens and create tab is active
  useEffect(() => {
    if (open && inputRef.current && activeTab === "create") {
      // Use a longer timeout to ensure the dialog is fully rendered and visible
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, activeTab]);

  // Reset title and tab when dialog closes
  useEffect(() => {
    if (!open) {
      setTitle("");
      setActiveTab("create");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    await onCreateChat(title.trim());
    setTitle("");
  };

  const handleExampleSelect = (chatId: string) => {
    onSelectExampleChat(chatId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Workflow Chat</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Create New
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Examples
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  ref={inputRef}
                  placeholder="Workflow title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                  autoFocus
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
          </TabsContent>
          
          <TabsContent value="examples" className="pt-4">
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {exampleChats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No example workflows available</p>
                  <p className="text-sm mt-1">Click "Load example workflow" to add some</p>
                </div>
              ) : (
                exampleChats.map(chat => (
                  <Button
                    key={chat.id}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4"
                    onClick={() => handleExampleSelect(chat.id)}
                  >
                    <Sparkles className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div className="truncate">{chat.title}</div>
                  </Button>
                ))
              )}
            </div>
            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatDialog;
