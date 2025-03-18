
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';

export interface InputField {
  field_name: string;
  type: 'string' | 'number' | 'bool';
}

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_example?: boolean;
  username?: string;
  multi_input?: boolean;
  input_schema?: InputField[];
}

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
        
        // Fetch regular user chats - only for the current user
        const { data: userChats, error: userChatsError } = await supabase
          .from('chats')
          .select('*')
          .eq('is_example', false)
          .eq('username', currentUsername) // Only get current user's chats
          .order('created_at', { ascending: false });
          
        if (userChatsError) {
          console.error('Error fetching user chats:', userChatsError);
          toast({
            title: "Error loading chats",
            description: userChatsError.message,
            variant: "destructive"
          });
        } else {
          // Parse the input_schema JSON if it exists
          const parsedUserChats = userChats?.map(chat => ({
            ...chat,
            input_schema: chat.input_schema ? chat.input_schema as InputField[] : undefined
          }));
          setChats(parsedUserChats || []);
        }
        
        // Fetch user-created example chats
        const { data: userExamples, error: userExamplesError } = await supabase
          .from('chats')
          .select('*')
          .eq('is_example', true)
          .eq('username', currentUsername) // Only get the current user's example chats
          .order('created_at', { ascending: false });
          
        if (userExamplesError) {
          console.error('Error fetching user example chats:', userExamplesError);
        } else {
          // Parse the input_schema JSON if it exists
          const parsedUserExamples = userExamples?.map(chat => ({
            ...chat,
            input_schema: chat.input_schema ? chat.input_schema as InputField[] : undefined
          }));
          setExampleChats(parsedUserExamples || []);
        }

        // Fetch system example chats
        const { data: systemExamples, error: systemExamplesError } = await supabase
          .from('chats')
          .select('*')
          .eq('is_example', true)
          .eq('username', systemUsername) // Get system example chats
          .order('created_at', { ascending: false });
          
        if (systemExamplesError) {
          console.error('Error fetching system example chats:', systemExamplesError);
        } else {
          // Parse the input_schema JSON if it exists
          const parsedSystemExamples = systemExamples?.map(chat => ({
            ...chat,
            input_schema: chat.input_schema ? chat.input_schema as InputField[] : undefined
          }));
          setSystemExampleChats(parsedSystemExamples || []);
        }
      } catch (error) {
        console.error('Error in fetchChats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();

    // Set up real-time subscription for chats
    const channel = supabase
      .channel('chats-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chats',
        filter: `username=eq.${currentUsername}` // Only listen for changes to current user's chats
      }, (payload) => {
        console.log('Real-time update on chats:', payload);
        
        // Refresh the chats list when changes occur
        fetchChats();
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
          username: 'current_user',
          multi_input: false,
          input_schema: [
            { field_name: "state", type: "string" },
            { field_name: "bill", type: "string" },
            { field_name: "passed", type: "bool" }
          ]
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

  return {
    chats,
    exampleChats,
    systemExampleChats,
    isLoading,
    createChat,
    deleteChat
  };
};
