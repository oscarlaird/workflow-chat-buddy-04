
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { Chat } from "@/types";

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [exampleChats, setExampleChats] = useState<Chat[]>([]);
  const [systemExampleChats, setSystemExampleChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const currentUsername = 'current_user'; // The current user's username
  const systemUsername = 'system'; // The system username for examples
  
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        
        const { data: userChats, error: userChatsError } = await supabase
          .from('chats')
          .select('*')
          .eq('is_example', false)
          .eq('username', currentUsername)
          .order('created_at', { ascending: false });
          
        if (userChatsError) {
          console.error('Error fetching user chats:', userChatsError);
          toast({
            title: "Error loading chats",
            description: userChatsError.message,
            variant: "destructive"
          });
        } else {
          setChats(userChats || []);
        }
        
        const { data: userExamples, error: userExamplesError } = await supabase
          .from('chats')
          .select('*')
          .eq('is_example', true)
          .eq('username', currentUsername)
          .order('created_at', { ascending: false });
          
        if (userExamplesError) {
          console.error('Error fetching user example chats:', userExamplesError);
        } else {
          setExampleChats(userExamples || []);
        }

        const { data: systemExamples, error: systemExamplesError } = await supabase
          .from('chats')
          .select('*')
          .eq('is_example', true)
          .eq('username', systemUsername)
          .order('created_at', { ascending: false });
          
        if (systemExamplesError) {
          console.error('Error fetching system example chats:', systemExamplesError);
        } else {
          setSystemExampleChats(systemExamples || []);
        }
      } catch (error) {
        console.error('Error in fetchChats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();

    // Set up the realtime subscription with more specific update triggers
    const channel = supabase
      .channel('chats-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chats',
        filter: `username=eq.${currentUsername}`
      }, (payload) => {
        console.log('New chat inserted:', payload);
        fetchChats();
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'chats',
        filter: `username=eq.${currentUsername}`
      }, (payload) => {
        console.log('Chat deleted:', payload);
        fetchChats();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chats',
        filter: `username=eq.${currentUsername}`,
      }, (payload) => {
        const oldData = payload.old as Record<string, any>;
        const newData = payload.new as Record<string, any>;
        
        // Identify which fields have changed
        const changedFields = Object.keys(oldData).filter(key => oldData[key] !== newData[key]);
        
        // Only refresh if title or fields relevant to the chat list have changed
        // Explicitly ignore 'script' updates
        const relevantFields = changedFields.filter(field => 
          field === 'title' || field === 'is_example'
        );
        
        if (relevantFields.length > 0) {
          console.log('Relevant chat fields updated:', relevantFields);
          fetchChats();
        } else {
          console.log('Ignoring non-relevant update for sidebar:', changedFields);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createChat = async (title: string): Promise<string> => {
    try {
      const chatId = uuidv4();
      
      const { error } = await supabase
        .from('chats')
        .insert({
          id: chatId,
          title,
          is_example: false,
          username: 'current_user'
        });

      if (error) {
        console.error('Error creating chat:', error);
        toast({
          title: "Error creating chat",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      
      toast({
        title: "New chat created",
        description: `"${title}" has been created successfully.`
      });
      
      return chatId;
    } catch (error) {
      console.error('Error in createChat:', error);
      throw error;
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);

      if (error) {
        console.error('Error deleting chat:', error);
        toast({
          title: "Error deleting chat",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Chat deleted",
          description: "The chat has been deleted successfully."
        });
      }
    } catch (error) {
      console.error('Error in deleteChat:', error);
    }
  };

  const renameChat = async (chatId: string, newTitle: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq('id', chatId);

      if (error) {
        console.error('Error renaming chat:', error);
        toast({
          title: "Error renaming chat",
          description: error.message,
          variant: "destructive"
        });
        return false;
      } else {
        toast({
          title: "Chat renamed",
          description: `The chat has been renamed to "${newTitle}".`
        });
        return true;
      }
    } catch (error) {
      console.error('Error in renameChat:', error);
      return false;
    }
  };

  const duplicateChat = async (chatId: string): Promise<string | null> => {
    try {
      const newChatId = uuidv4();
      
      const { data: chatDetails, error: chatDetailsError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();
        
      if (chatDetailsError) {
        console.error('Error fetching chat details:', chatDetailsError);
        throw chatDetailsError;
      }
      
      const { data: chatMessages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
        
      if (messagesError) {
        console.error('Error fetching chat messages:', messagesError);
        throw messagesError;
      }
      
      const { data: workflowSteps, error: workflowStepsError } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('chat_id', chatId)
        .order('step_number', { ascending: true });
        
      if (workflowStepsError) {
        console.error('Error fetching workflow steps:', workflowStepsError);
        throw workflowStepsError;
      }
      
      const duplicatedChatTitle = `${chatDetails.title} (Copy)`;
      const chatInsert = {
        id: newChatId,
        title: duplicatedChatTitle,
        created_at: new Date().toISOString(),
        is_example: false,
        username: currentUsername
      };
      
      let newMessages = [];
      if (chatMessages && chatMessages.length > 0) {
        newMessages = chatMessages.map(message => ({
          id: uuidv4(),
          chat_id: newChatId,
          role: message.role,
          content: message.content,
          username: currentUsername,
          created_at: new Date().toISOString(),
          from_template: true,
          function_name: message.function_name,
          workflow_step_id: null
        }));
      }
      
      let newWorkflowSteps = [];
      const workflowStepIdMap: Record<string, string> = {};
      
      if (workflowSteps && workflowSteps.length > 0) {
        newWorkflowSteps = workflowSteps.map(step => {
          const newStepId = uuidv4();
          workflowStepIdMap[step.id] = newStepId;
          
          return {
            id: newStepId,
            chat_id: newChatId,
            title: step.title,
            description: step.description,
            status: step.status,
            code: step.code,
            example_data: step.example_data,
            screenshots: step.screenshots,
            step_number: step.step_number,
            username: currentUsername,
            created_at: new Date().toISOString()
          };
        });
      }
      
      const { error: chatError } = await supabase
        .from('chats')
        .insert(chatInsert);
        
      if (chatError) {
        console.error('Error creating duplicated chat:', chatError);
        throw chatError;
      }
      
      if (newWorkflowSteps.length > 0) {
        const { error: workflowInsertError } = await supabase
          .from('workflow_steps')
          .insert(newWorkflowSteps);
          
        if (workflowInsertError) {
          console.error('Error inserting workflow steps:', workflowInsertError);
          throw workflowInsertError;
        }
      }
      
      if (newMessages.length > 0) {
        newMessages = newMessages.map(message => {
          if (message.workflow_step_id && workflowStepIdMap[message.workflow_step_id]) {
            return {
              ...message,
              workflow_step_id: workflowStepIdMap[message.workflow_step_id]
            };
          }
          return message;
        });
        
        const { error: insertError } = await supabase
          .from('messages')
          .insert(newMessages);
          
        if (insertError) {
          console.error('Error inserting messages:', insertError);
          throw insertError;
        }
      }
      
      toast({
        title: "Workflow duplicated",
        description: `"${duplicatedChatTitle}" has been created successfully.`
      });
      
      return newChatId;
    } catch (error: any) {
      console.error('Error in duplicateChat:', error);
      toast({
        title: "Error duplicating workflow",
        description: error?.message || "An error occurred while duplicating the workflow",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    chats,
    exampleChats,
    systemExampleChats,
    isLoading,
    createChat,
    deleteChat,
    renameChat,
    duplicateChat
  };
};
