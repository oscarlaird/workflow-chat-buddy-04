
import { supabase } from "@/integrations/supabase/client";
import { mockConversations } from "@/data/mockData";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/components/ui/use-toast";

export const seedMockData = async () => {
  try {
    toast({
      title: "Seeding mock data",
      description: "Please wait while we populate the database with sample conversations..."
    });

    // Create chats first
    for (const conversation of mockConversations) {
      // Generate a new UUID for this chat (to avoid potential conflicts)
      const chatId = uuidv4();
      
      // Insert the chat
      const { error: chatError } = await supabase
        .from('chats')
        .insert({
          id: chatId,
          title: conversation.title,
          // Use the same created_at time for all messages in this conversation
          created_at: new Date().toISOString()
        });

      if (chatError) {
        console.error('Error creating chat:', chatError);
        throw chatError;
      }

      // Then insert all messages for this chat
      if (conversation.messages.length > 0) {
        const messagesWithChatId = conversation.messages.map(message => ({
          id: message.id,
          chat_id: chatId,
          role: message.role,
          content: message.content,
          username: message.username || 'current_user',
          created_at: new Date().toISOString()
        }));

        const { error: messagesError } = await supabase
          .from('messages')
          .insert(messagesWithChatId);

        if (messagesError) {
          console.error('Error inserting messages:', messagesError);
          throw messagesError;
        }
      }
    }

    toast({
      title: "Mock data seeded successfully",
      description: `${mockConversations.length} conversations and their messages have been added to the database.`
    });

    return true;
  } catch (error) {
    console.error('Error seeding mock data:', error);
    
    toast({
      title: "Error seeding data",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    
    return false;
  }
};
