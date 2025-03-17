
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  is_example?: boolean;
  username?: string;
}

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [exampleChats, setExampleChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        
        // Fetch regular user chats
        const { data: userChats, error: userChatsError } = await supabase
          .from('chats')
          .select('*')
          .eq('is_example', false)
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
        
        // Fetch example chats
        const { data: examples, error: examplesError } = await supabase
          .from('chats')
          .select('*')
          .eq('is_example', true)
          .order('created_at', { ascending: false });
          
        if (examplesError) {
          console.error('Error fetching example chats:', examplesError);
        } else {
          setExampleChats(examples || []);
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
        table: 'chats'
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

  return {
    chats,
    exampleChats,
    isLoading,
    createChat,
    deleteChat
  };
};
