
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
          // Transform the steps object into an array of workflow steps
          const stepsObject = messageData[0].steps;
          
          // Safely convert steps object to array with defensive check
          const transformedSteps: WorkflowStep[] = [];
          
          if (stepsObject && typeof stepsObject === 'object' && !Array.isArray(stepsObject)) {
            Object.entries(stepsObject).forEach(([key, stepData], index) => {
              if (stepData && typeof stepData === 'object') {
                transformedSteps.push({
                  id: `${chatId}-step-${index}`,
                  chat_id: chatId,
                  title: formatFieldName(key), // Format the title
                  description: (stepData as any).description || "No description available",
                  step_number: index + 1,
                  status: "waiting", // Default status
                  exampleInput: (stepData as any).example_input || null,
                  exampleOutput: (stepData as any).example_output || null,
                  code: null
                });
              }
            });
          } else {
            console.error('Steps data is not a valid object:', stepsObject);
          }
          
          setWorkflowSteps(transformedSteps);
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
          
          const stepsObject = payload.new.steps;
          const transformedSteps: WorkflowStep[] = [];
          
          if (stepsObject && typeof stepsObject === 'object' && !Array.isArray(stepsObject)) {
            Object.entries(stepsObject).forEach(([key, stepData], index) => {
              if (stepData && typeof stepData === 'object') {
                transformedSteps.push({
                  id: `${chatId}-step-${index}`,
                  chat_id: chatId,
                  title: formatFieldName(key), // Format the title
                  description: (stepData as any).description || "No description available",
                  step_number: index + 1,
                  status: "waiting", // Default status
                  exampleInput: (stepData as any).example_input || null,
                  exampleOutput: (stepData as any).example_output || null,
                  code: null
                });
              }
            });
            
            setWorkflowSteps(transformedSteps);
          } else {
            console.error('Steps data in subscription is not a valid object:', stepsObject);
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
