import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { InputField } from "@/types";
import { Json } from "@/integrations/supabase/types";

// Helper function to infer input field types from example values
export const inferFieldType = (fieldName: string, value: any): InputField['type'] => {
  if (value === null || value === undefined) return 'string';
  
  if (typeof value === 'boolean') return 'bool';
  
  // Check for array/table type
  if (Array.isArray(value)) return 'table';
  
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

// Extract example_output from the first step in steps
const extractExampleInputFromSteps = (steps: Json): Record<string, any> | null => {
  // Check if steps is null, not an object, or an empty object
  if (!steps || typeof steps !== 'object' || Array.isArray(steps) || Object.keys(steps).length === 0) {
    return null;
  }

  // Find the first step with example_output
  const firstStepKey = Object.keys(steps)[0];
  const firstStep = steps[firstStepKey] as Record<string, any>;
  
  if (firstStep && typeof firstStep === 'object' && 'example_output' in firstStep && firstStep.example_output) {
    // Ensure the example_output is an object
    const exampleOutput = firstStep.example_output;
    if (typeof exampleOutput === 'object' && !Array.isArray(exampleOutput)) {
      return exampleOutput as Record<string, any>;
    }
  }
  
  return null;
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
        
        // Get the latest message with non-null steps for this chat
        const { data, error } = await supabase
          .from('messages')
          .select('steps')
          .eq('chat_id', chatId)
          .not('steps', 'is', null)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Error fetching chat settings:', error);
          toast({
            title: "Error loading chat settings",
            description: error.message,
            variant: "destructive"
          });
        } else if (data && data.length > 0) {
          // Extract example inputs from the first step in steps
          const steps = data[0].steps;
          const examples = extractExampleInputFromSteps(steps);
          setExampleInputs(examples);
          
          if (examples) {
            const schema = inferInputSchema(examples);
            setInferredSchema(schema);
          }
        } else {
          // No steps found
          setExampleInputs(null);
          setInferredSchema([]);
        }
      } catch (error) {
        console.error('Error in fetchChatSettings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatSettings();

    // Set up real-time subscription for messages with steps for this chat
    if (chatId) {
      const channel = supabase
        .channel(`chat-messages-settings-${chatId}`)
        .on('postgres_changes', {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        }, (payload) => {
          // Only process if the message has steps
          if (payload.new && 'steps' in payload.new && payload.new.steps) {
            console.log('Message with steps updated:', payload.new);
            
            // Extract example inputs from the first step
            const steps = payload.new.steps;
            const examples = extractExampleInputFromSteps(steps);
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
