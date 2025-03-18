
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkflowStep } from "@/types";

export const useWorkflowSteps = (chatId: string | undefined) => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chatId) {
      setWorkflowSteps([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const fetchWorkflowSteps = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("Fetching workflow steps for chat ID:", chatId);
        
        const { data, error } = await supabase
          .from('workflow_steps')
          .select('*')
          .eq('chat_id', chatId)
          .order('step_order', { ascending: true });

        if (error) {
          console.error("Supabase error:", error);
          setError(`Database error: ${error.message}`);
          throw error;
        }

        if (data && data.length > 0) {
          console.log("Workflow steps found:", data.length);
          setWorkflowSteps(parseWorkflowSteps(data));
        } else {
          console.log("No workflow steps found for chat ID:", chatId);
          setWorkflowSteps([]);
        }
      } catch (error: any) {
        console.error("Error fetching workflow steps:", error);
        setError(error?.message || "Unknown error occurred");
        setWorkflowSteps([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflowSteps();

    // Enhanced debugging for realtime subscriptions
    console.log(`Setting up realtime subscription for workflow_steps on chat ${chatId}`);
    
    // Test query to check if the workflow_steps table exists and is accessible
    supabase.from('workflow_steps').select('id').limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.error("Error accessing workflow_steps table:", error);
        } else {
          console.log("Successfully accessed workflow_steps table, row count:", data?.length);
        }
      });

    // Ensure the table has REPLICA IDENTITY FULL
    supabase.rpc('get_table_replica_identity', { table_name: 'workflow_steps' })
      .then(({ data, error }) => {
        if (error) {
          console.error("Error checking REPLICA IDENTITY:", error);
        } else {
          console.log("workflow_steps REPLICA IDENTITY status:", data);
        }
      });

    // Set up realtime subscription with comprehensive debugging
    const channel = supabase
      .channel(`workflow_steps_${chatId}`)
      .on('postgres_changes', {
        event: '*',  // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'workflow_steps',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        console.log(`Realtime event received for workflow_steps:`, payload);
        console.log(`Event type: ${payload.eventType}`);
        console.log(`Event payload:`, JSON.stringify(payload, null, 2));
        
        if (payload.eventType === 'INSERT') {
          console.log("INSERT event - New step:", payload.new);
          const newStep = parseWorkflowStep(payload.new);
          setWorkflowSteps(prevSteps => {
            // Only add if not already present
            if (prevSteps.some(step => step.id === newStep.id)) {
              console.log("Step already exists, not adding:", newStep.id);
              return prevSteps;
            }
            console.log("Adding new step:", newStep.id);
            const updatedSteps = [...prevSteps, newStep];
            return updatedSteps.sort((a, b) => a.step_order - b.step_order);
          });
        } 
        else if (payload.eventType === 'UPDATE') {
          console.log("UPDATE event - Updated step:", payload.new);
          const updatedStep = parseWorkflowStep(payload.new);
          setWorkflowSteps(prevSteps => {
            console.log("Updating step:", updatedStep.id);
            return prevSteps.map(step => 
              step.id === updatedStep.id ? updatedStep : step
            );
          });
        } 
        else if (payload.eventType === 'DELETE') {
          console.log("DELETE event received!");
          console.log("DELETE payload:", JSON.stringify(payload, null, 2));
          if (payload.old && payload.old.id) {
            const deletedStepId = payload.old.id;
            console.log("Step deleted with ID:", deletedStepId);
            
            setWorkflowSteps(prevSteps => {
              console.log("Current steps before deletion:", prevSteps.map(s => s.id));
              const filteredSteps = prevSteps.filter(step => {
                const keep = step.id !== deletedStepId;
                console.log(`Step ${step.id}: keep=${keep}`);
                return keep;
              });
              console.log("Steps after deletion:", filteredSteps.map(s => s.id));
              return filteredSteps;
            });
          } else {
            console.error("DELETE event received but payload.old.id is missing!", payload);
          }
        }
      })
      .subscribe((status) => {
        console.log(`Realtime subscription status for chat ${chatId}: ${status}`);
      });

    // Test the channel connection
    channel.send({
      type: 'broadcast',
      event: 'test',
      payload: { message: 'Testing channel connection' },
    })
    .then(() => console.log('Test message sent successfully'))
    .catch(err => console.error('Error sending test message:', err));

    return () => {
      console.log(`Cleaning up realtime subscription for chat ${chatId}`);
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  // Helper function to parse individual step
  const parseWorkflowStep = (step: any): WorkflowStep => {
    let parsedScreenshots;
    let parsedExampleData;
    
    try {
      // Handle screenshots parsing safely
      if (step.screenshots) {
        if (typeof step.screenshots === 'string') {
          parsedScreenshots = JSON.parse(step.screenshots);
        } else {
          parsedScreenshots = step.screenshots;
        }
      }
      
      // Handle example data parsing safely
      if (step.example_data) {
        if (typeof step.example_data === 'string') {
          parsedExampleData = JSON.parse(step.example_data);
        } else {
          parsedExampleData = step.example_data;
        }
      }
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      parsedScreenshots = undefined;
      parsedExampleData = undefined;
    }

    return {
      id: step.id,
      title: step.title,
      description: step.description,
      status: step.status as "complete" | "active" | "waiting",
      screenshots: parsedScreenshots,
      code: step.code || undefined,
      exampleData: parsedExampleData,
      step_order: step.step_order,
    };
  };

  // Helper function to parse workflow steps array
  const parseWorkflowSteps = (data: any[]): WorkflowStep[] => {
    return data.map(step => parseWorkflowStep(step));
  };

  return {
    workflowSteps,
    isLoading,
    error
  };
};
