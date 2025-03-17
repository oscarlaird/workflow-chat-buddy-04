
import { supabase } from "@/integrations/supabase/client";
import { mockConversations } from "@/data/mockConversations";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/components/ui/use-toast";

export const seedMockData = async () => {
  try {
    toast({
      title: "Loading example data",
      description: "Please wait while we populate the database with sample conversations..."
    });

    let firstChatId = null;

    // Create chats first
    for (const conversation of mockConversations) {
      // Generate a new UUID for this chat (to avoid potential conflicts)
      const chatId = uuidv4();
      
      // Save the ID of the first chat to return later
      if (!firstChatId) {
        firstChatId = chatId;
      }
      
      // Insert the chat
      const { error: chatError } = await supabase
        .from('chats')
        .insert({
          id: chatId,
          title: conversation.title,
          // Use the same created_at time for all messages in this conversation
          created_at: new Date().toISOString(),
          // Mark as example chat
          is_example: true,
          username: 'example_user'
        });

      if (chatError) {
        console.error('Error creating chat:', chatError);
        throw chatError;
      }

      // Then insert all messages for this chat
      if (conversation.messages.length > 0) {
        const messagesWithChatId = conversation.messages.map(message => ({
          // Generate a new UUID for each message instead of using string IDs
          id: uuidv4(), 
          chat_id: chatId,
          role: message.role,
          content: message.content,
          username: message.username || 'example_user',
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
      title: "Example data loaded successfully",
      description: `Example workflow has been added to the database.`
    });

    return { 
      success: true,
      chatId: firstChatId 
    };
  } catch (error) {
    console.error('Error seeding mock data:', error);
    
    toast({
      title: "Error loading example data",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
    
    return { 
      success: false 
    };
  }
};
