
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, PlusCircle, Sparkles, User } from "lucide-react";
import { Chat } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateChat: (title: string) => Promise<void>;
  isLoading: boolean;
  exampleChats: Chat[];
  systemExampleChats: Chat[];
  onSelectExampleChat: (chatId: string) => void;
}

export const NewChatDialog = ({ 
  open, 
  onOpenChange, 
  onCreateChat, 
  isLoading,
  exampleChats,
  systemExampleChats,
  onSelectExampleChat
}: NewChatDialogProps) => {
  const [title, setTitle] = useState("");
  const [activeTab, setActiveTab] = useState<string>("create");
  const [copyingExampleId, setCopyingExampleId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current && activeTab === "create") {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, activeTab]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setActiveTab("create");
      setCopyingExampleId(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    await onCreateChat(title.trim());
    setTitle("");
  };

  const handleExampleSelect = async (exampleChat: Chat) => {
    setCopyingExampleId(exampleChat.id);
    
    try {
      const newChatId = uuidv4();
      
      // Get full chat details
      const { data: chatDetails, error: chatDetailsError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', exampleChat.id)
        .single();
        
      if (chatDetailsError) throw chatDetailsError;
      
      // Get example messages
      const { data: exampleMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', exampleChat.id)
        .order('created_at', { ascending: true });
        
      if (messagesError) throw messagesError;
      
      // Get example workflow steps
      const { data: exampleWorkflowSteps, error: workflowStepsError } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('chat_id', exampleChat.id)
        .order('step_number', { ascending: true });
        
      if (workflowStepsError) throw workflowStepsError;
      
      // Prepare new chat
      const chatInsert = {
        id: newChatId,
        title: exampleChat.title,
        created_at: new Date().toISOString(),
        is_example: false,
        username: 'current_user'
      };
      
      // Prepare messages
      let newMessages = [];
      if (exampleMessages && exampleMessages.length > 0) {
        newMessages = exampleMessages.map(message => ({
          id: uuidv4(),
          chat_id: newChatId,
          role: message.role,
          content: message.content,
          username: 'current_user',
          created_at: new Date().toISOString(),
          from_template: true // Set from_template to true for copied messages
        }));
      }
      
      // Prepare workflow steps
      let newWorkflowSteps = [];
      if (exampleWorkflowSteps && exampleWorkflowSteps.length > 0) {
        newWorkflowSteps = exampleWorkflowSteps.map(step => ({
          id: uuidv4(),
          chat_id: newChatId,
          title: step.title,
          description: step.description,
          status: step.status,
          code: step.code,
          example_data: step.example_data,
          screenshots: step.screenshots,
          step_number: step.step_number,
          username: 'current_user',
          created_at: new Date().toISOString()
        }));
      }
      
      // Insert the new chat
      const { error: chatError } = await supabase
        .from('chats')
        .insert(chatInsert);
        
      if (chatError) throw chatError;
      
      // Insert the copied messages
      if (newMessages.length > 0) {
        const { error: insertError } = await supabase
          .from('messages')
          .insert(newMessages);
          
        if (insertError) throw insertError;
      }
      
      // Insert the copied workflow steps
      if (newWorkflowSteps.length > 0) {
        const { error: workflowInsertError } = await supabase
          .from('workflow_steps')
          .insert(newWorkflowSteps);
          
        if (workflowInsertError) throw workflowInsertError;
      }
      
      onOpenChange(false);
      onSelectExampleChat(newChatId);
      
      toast({
        title: "Example workflow copied",
        description: `"${exampleChat.title}" has been copied to your chats.`
      });
    } catch (error) {
      console.error('Error copying example chat:', error);
      toast({
        title: "Error copying example",
        description: error.message || "Failed to copy the example workflow",
        variant: "destructive"
      });
    } finally {
      setCopyingExampleId(null);
    }
  };

  const allExampleChats = [...systemExampleChats, ...exampleChats];

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
              {allExampleChats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No example workflows available</p>
                  <p className="text-sm mt-1">Example workflows may be added by the administrator</p>
                </div>
              ) : (
                <>
                  {systemExampleChats.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">System Examples</span>
                      </div>
                      <div className="space-y-2">
                        {systemExampleChats.map(chat => (
                          <Button
                            key={chat.id}
                            variant="outline"
                            className="w-full justify-start text-left h-auto py-3 px-4"
                            onClick={() => handleExampleSelect(chat)}
                            disabled={copyingExampleId === chat.id}
                          >
                            {copyingExampleId === chat.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin flex-shrink-0" />
                            ) : (
                              <Sparkles className="h-4 w-4 mr-2 flex-shrink-0 text-yellow-500" />
                            )}
                            <div className="truncate">
                              {chat.title}
                              {copyingExampleId === chat.id && " (copying...)"}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {exampleChats.length > 0 && (
                    <div>
                      {systemExampleChats.length > 0 && <Separator className="my-4" />}
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Your Examples</span>
                      </div>
                      <div className="space-y-2">
                        {exampleChats.map(chat => (
                          <Button
                            key={chat.id}
                            variant="outline"
                            className="w-full justify-start text-left h-auto py-3 px-4"
                            onClick={() => handleExampleSelect(chat)}
                            disabled={copyingExampleId === chat.id}
                          >
                            {copyingExampleId === chat.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin flex-shrink-0" />
                            ) : (
                              <Sparkles className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" />
                            )}
                            <div className="truncate">
                              {chat.title}
                              {copyingExampleId === chat.id && " (copying...)"}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
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
