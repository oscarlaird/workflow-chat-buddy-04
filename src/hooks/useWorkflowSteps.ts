
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

    // Set up real-time subscription for workflow steps
    // Using the exact same pattern as in ChatInterface.tsx
    console.log(`Setting up realtime subscription for workflow steps of chat ${chatId}`);
    
    const channel = supabase
      .channel(`workflow_steps:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'workflow_steps',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        console.log('Received real-time INSERT workflow step:', payload);
        const newStep = payload.new;
        
        setWorkflowSteps(prevSteps => {
          // If step already exists, don't add it again
          if (prevSteps.some(step => step.id === newStep.id)) {
            return prevSteps;
          }
          
          // Add the new step and sort by step_order
          const updatedSteps = [...prevSteps, parseWorkflowStep(newStep)];
          return updatedSteps.sort((a, b) => a.step_order - b.step_order);
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'workflow_steps',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        console.log('Received real-time UPDATE workflow step:', payload);
        const updatedStep = payload.new;
        
        setWorkflowSteps(prevSteps => 
          prevSteps.map(step => 
            step.id === updatedStep.id 
              ? parseWorkflowStep(updatedStep)
              : step
          )
        );
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'workflow_steps',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        console.log('Received real-time DELETE workflow step:', payload);
        const deletedStep = payload.old;
        
        setWorkflowSteps(prevSteps => 
          prevSteps.filter(step => step.id !== deletedStep.id)
        );
      })
      .subscribe((status) => {
        console.log(`Realtime subscription status for workflow steps: ${status}`);
        if (status !== 'SUBSCRIBED') {
          console.error(`Failed to subscribe to workflow steps changes: ${status}`);
        }
      });

    return () => {
      console.log('Removing channel subscription for workflow steps');
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
      console.error("JSON parsing error:", parseError, 
        "Screenshots:", step.screenshots, 
        "Example Data:", step.example_data);
      
      // Continue without the problematic data
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
      step_order: step.step_order, // Include step_order in the returned object
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
