
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { InputField } from "@/types";
import { Json } from "@/integrations/supabase/types";

// Helper function to infer input field types from example values
export const inferFieldType = (fieldName: string, value: any): InputField['type'] => {
  if (value === null || value === undefined) return 'string';
  
  if (typeof value === 'boolean') return 'bool';
  
  if (typeof value === 'number') {
    // Check if it's an integer
    if (Number.isInteger(value)) {
      if (value >= 1900 && value <= 2100) return 'year';
      return 'integer';
    }
    // If it's a decimal number
    return 'number';
  }
  
  if (typeof value === 'string') {
    // Try to infer more specific string types
    if (/^\d{5}(-\d{4})?$/.test(value)) return 'zip_code';
    if (/^(https?:\/\/)/.test(value)) return 'url';
    if (/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(value)) return 'email';
    if (/^\+?[\d\s-()]{7,}$/.test(value)) return 'phone';
    
    // Check for dates in various formats
    if (/^\d{4}-\d{2}-\d{2}$/.test(value) || // YYYY-MM-DD
        /^\d{2}\/\d{2}\/\d{4}$/.test(value) || // MM/DD/YYYY
        /^\d{1,2}\s[a-zA-Z]{3}\s\d{4}$/.test(value)) { // D MMM YYYY
      return 'date';
    }
    
    // Check for state/country
    const states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];
    if (states.includes(value.toUpperCase()) || value.length === 2) return 'state';
    
    // Default to string
    return 'string';
  }
  
  // Default to string for any other type
  return 'string';
};

// Convert example_inputs to input schema
export const inferInputSchema = (exampleInputs: Record<string, any> | null): InputField[] => {
  if (!exampleInputs) return [];
  
  return Object.entries(exampleInputs).map(([fieldName, value]) => ({
    field_name: fieldName,
    type: inferFieldType(fieldName, value)
  }));
};

export interface ChatSettings {
  exampleInputs: Record<string, any> | null;
  inferredSchema: InputField[];
  isLoading: boolean;
}

export const useSelectedChatSettings = (chatId?: string): ChatSettings => {
  const [exampleInputs, setExampleInputs] = useState<Record<string, any> | null>(null);
  const [inferredSchema, setInferredSchema] = useState<InputField[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          .select('example_inputs')
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
          const examples = data.example_inputs as Record<string, any> | null;
          setExampleInputs(examples);
          
          if (examples) {
            const schema = inferInputSchema(examples);
            setInferredSchema(schema);
          }
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
          
          if (newData.example_inputs !== undefined) {
            const examples = newData.example_inputs as Record<string, any> | null;
            setExampleInputs(examples);
            
            if (examples) {
              const schema = inferInputSchema(examples);
              setInferredSchema(schema);
            }
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [chatId]);

  return {
    exampleInputs,
    inferredSchema,
    isLoading,
  };
};
