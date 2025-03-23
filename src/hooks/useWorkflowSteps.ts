
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkflowStep } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { formatFieldName } from "@/lib/utils";

interface UseWorkflowStepsResult {
  workflowSteps: WorkflowStep[];
  isLoading: boolean;
  error: string | null;
}

// Define a type for step data to avoid TypeScript errors
interface StepData {
  function_name?: string;
  description?: string;
  example_input?: Record<string, any> | null;
  example_output?: Record<string, any> | null;
  requires_browser?: boolean;
  [key: string]: any; // Allow other properties
}

export const useWorkflowSteps = (chatId?: string): UseWorkflowStepsResult => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chatId) {
      setWorkflowSteps([]);
      setIsLoading(false);
      return;
    }

    const fetchWorkflowSteps = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get the latest message with non-null steps for this chat
        const { data: messageData, error: messageError } = await supabase
          .from('messages')
          .select('steps')
          .eq('chat_id', chatId)
          .not('steps', 'is', null)
          .order('created_at', { ascending: false })
          .limit(1);

        if (messageError) {
          console.error('Error fetching workflow steps:', messageError);
          setError(messageError.message);
          toast({
            title: "Error loading workflow steps",
            description: messageError.message,
            variant: "destructive"
          });
          return;
        }

        if (messageData && messageData.length > 0 && messageData[0].steps) {
          const stepsData = messageData[0].steps;
          
          // Handle steps as an array
          if (Array.isArray(stepsData)) {
            // Transform the steps array into an array of workflow steps
            const transformedSteps = stepsData.map((stepData, index) => {
              // Type check and cast the step data
              const typedStepData = stepData as StepData;
              
              if (typedStepData && typeof typedStepData === 'object') {
                const step: WorkflowStep = {
                  id: `${chatId}-step-${index}`,
                  chat_id: chatId,
                  title: typedStepData.function_name ? formatFieldName(typedStepData.function_name) : `Step ${index + 1}`,
                  description: typedStepData.description || "No description available",
                  step_number: index + 1,
                  exampleInput: typedStepData.example_input || null,
                  exampleOutput: typedStepData.example_output || null,
                  requiresBrowser: Boolean(typedStepData.requires_browser),
                  originalKey: index.toString() // Store the index to maintain order reference
                };
                
                return step;
              }
              return null;
            }).filter(Boolean) as WorkflowStep[];
            
            setWorkflowSteps(transformedSteps);
          } 
          // Handle steps as an object (backward compatibility)
          else if (typeof stepsData === 'object' && !Array.isArray(stepsData)) {
            // Create an array from the object entries and preserve original order
            const transformedSteps: WorkflowStep[] = [];
            
            Object.entries(stepsData).forEach(([key, stepData], index) => {
              // Type check and cast the step data
              const typedStepData = stepData as StepData;
              
              if (typedStepData && typeof typedStepData === 'object') {
                const step: WorkflowStep = {
                  id: `${chatId}-step-${index}`,
                  chat_id: chatId,
                  title: formatFieldName(key), // Format the title
                  description: typedStepData.description || "No description available",
                  step_number: index + 1, // We preserve the original order with index
                  exampleInput: typedStepData.example_input || null,
                  exampleOutput: typedStepData.example_output || null,
                  requiresBrowser: Boolean(typedStepData.requires_browser),
                  originalKey: key // Store the original key to maintain order reference
                };
                
                transformedSteps.push(step);
              }
            });
            
            setWorkflowSteps(transformedSteps);
          } else {
            console.error('Steps data is not a valid array or object:', stepsData);
            setWorkflowSteps([]);
          }
        } else {
          // No steps found
          setWorkflowSteps([]);
        }
      } catch (err) {
        console.error('Error in fetchWorkflowSteps:', err);
        setError('An unexpected error occurred while loading workflow steps');
        setWorkflowSteps([]); // Ensure we set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflowSteps();

    // Set up real-time subscription for messages with steps for this chat
    const channel = supabase
      .channel(`chat-messages-steps-${chatId}`)
      .on('postgres_changes', {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      }, (payload) => {
        // Check if the message has steps
        if (payload.new && 'steps' in payload.new && payload.new.steps) {
          console.log('Message with steps updated:', payload.new);
          
          const stepsData = payload.new.steps;
          
          // Handle steps as an array
          if (Array.isArray(stepsData)) {
            // Transform the steps array into an array of workflow steps
            const transformedSteps = stepsData.map((stepData, index) => {
              // Type check and cast the step data
              const typedStepData = stepData as StepData;
              
              if (typedStepData && typeof typedStepData === 'object') {
                const step: WorkflowStep = {
                  id: `${chatId}-step-${index}`,
                  chat_id: chatId,
                  title: typedStepData.function_name ? formatFieldName(typedStepData.function_name) : `Step ${index + 1}`,
                  description: typedStepData.description || "No description available",
                  step_number: index + 1,
                  exampleInput: typedStepData.example_input || null,
                  exampleOutput: typedStepData.example_output || null,
                  requiresBrowser: Boolean(typedStepData.requires_browser),
                  originalKey: index.toString() // Store the index to maintain order reference
                };
                
                return step;
              }
              return null;
            }).filter(Boolean) as WorkflowStep[];
            
            setWorkflowSteps(transformedSteps);
          }
          // Handle steps as an object (backward compatibility)
          else if (typeof stepsData === 'object' && !Array.isArray(stepsData)) {
            const transformedSteps: WorkflowStep[] = [];
            
            Object.entries(stepsData).forEach(([key, stepData], index) => {
              // Type check and cast the step data
              const typedStepData = stepData as StepData;
              
              if (typedStepData && typeof typedStepData === 'object') {
                const step: WorkflowStep = {
                  id: `${chatId}-step-${index}`,
                  chat_id: chatId,
                  title: formatFieldName(key), // Format the title
                  description: typedStepData.description || "No description available",
                  step_number: index + 1, // We preserve the original order with index
                  exampleInput: typedStepData.example_input || null,
                  exampleOutput: typedStepData.example_output || null,
                  requiresBrowser: Boolean(typedStepData.requires_browser),
                  originalKey: key // Store the original key to maintain order reference
                };
                
                transformedSteps.push(step);
              }
            });
            
            setWorkflowSteps(transformedSteps);
          } else {
            console.error('Steps data in subscription is not a valid array or object:', stepsData);
            setWorkflowSteps([]);
          }
        }
      })
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  return { workflowSteps, isLoading, error };
};
