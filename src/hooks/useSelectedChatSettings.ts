
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { InputField } from "@/types";
import { Json } from "@/integrations/supabase/types";

// Helper function to safely parse input_schema JSON from Supabase
const parseInputSchema = (inputSchema: Json | null): InputField[] => {
  if (!inputSchema) return [];
  
  if (Array.isArray(inputSchema)) {
    return inputSchema.filter((item): item is InputField => {
      if (typeof item !== 'object' || item === null) return false;
      
      return (
        'field_name' in item && 
        typeof item.field_name === 'string' &&
        'type' in item && 
        (item.type === 'string' || item.type === 'number' || item.type === 'bool')
      );
    });
  }
  
  return [];
};

export interface ChatSettings {
  multiInput: boolean;
  inputSchema: InputField[];
  isLoading: boolean;
  isSaving: boolean;
  updateMultiInput: (value: boolean) => Promise<void>;
}

export const useSelectedChatSettings = (chatId?: string): ChatSettings => {
  const [multiInput, setMultiInput] = useState(false);
  const [inputSchema, setInputSchema] = useState<InputField[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchChatSettings = async () => {
      if (!chatId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('chats')
          .select('multi_input, input_schema')
          .eq('id', chatId)
          .single();

        if (error) {
          console.error('Error fetching chat settings:', error);
          toast({
            title: "Error loading chat settings",
            description: error.message,
            variant: "destructive"
          });
        } else if (data) {
          setMultiInput(data.multi_input || false);
          const parsedSchema = parseInputSchema(data.input_schema);
          setInputSchema(parsedSchema);
        }
      } catch (error) {
        console.error('Error in fetchChatSettings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatSettings();

    // Set up real-time subscription for the specific chat
    if (chatId) {
      const channel = supabase
        .channel(`chat-settings-${chatId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'chats',
          filter: `id=eq.${chatId}`,
        }, (payload) => {
          const newData = payload.new as any;
          
          // Only update if multi_input or input_schema changed
          if (newData.multi_input !== undefined) {
            setMultiInput(newData.multi_input);
          }
          
          if (newData.input_schema !== undefined) {
            setInputSchema(parseInputSchema(newData.input_schema));
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [chatId]);

  const updateMultiInput = async (value: boolean) => {
    if (!chatId) return;
    
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('chats')
        .update({ multi_input: value })
        .eq('id', chatId);
        
      if (error) {
        console.error('Error updating input mode:', error);
        toast({
          title: "Error updating input mode",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: `${value ? 'Tabular' : 'Single'} input mode enabled`,
          description: `You can now use ${value ? 'multiple rows of' : 'a single set of'} inputs.`
        });
        
        // Update local state immediately for a responsive UI
        setMultiInput(value);
      }
    } catch (error) {
      console.error('Error in updateMultiInput:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    multiInput,
    inputSchema,
    isLoading,
    isSaving,
    updateMultiInput
  };
};
