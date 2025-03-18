
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WorkflowStep } from "@/types";
import { toast } from "@/components/ui/use-toast";

export const useWorkflowSteps = (chatId: string | undefined) => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingStepIds, setDeletingStepIds] = useState<string[]>([]);

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
          .order('step_number', { ascending: true });

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

    console.log(`Setting up realtime subscription for workflow_steps on chat ${chatId}`);
    
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
        
        if (payload.eventType === 'INSERT') {
          console.log("INSERT event - New step:", payload.new);
          const newStep = parseWorkflowStep(payload.new);
          setWorkflowSteps(prevSteps => {
            if (prevSteps.some(step => step.id === newStep.id)) {
              console.log("Step already exists, not adding:", newStep.id);
              return prevSteps;
            }
            console.log("Adding new step:", newStep.id);
            const updatedSteps = [...prevSteps, newStep];
            return updatedSteps.sort((a, b) => a.step_number - b.step_number);
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
            
            setDeletingStepIds(prev => [...prev, deletedStepId]);
            
            setTimeout(() => {
              setWorkflowSteps(prevSteps => {
                console.log("Current steps before deletion:", prevSteps.map(s => s.id));
                const filteredSteps = prevSteps.filter(step => step.id !== deletedStepId);
                console.log("Steps after deletion:", filteredSteps.map(s => s.id));
                return filteredSteps;
              });
              
              setDeletingStepIds(prev => prev.filter(id => id !== deletedStepId));
            }, 2000);
            
            toast({
              title: "Step Deleted",
              description: `Workflow step has been removed`,
              variant: "destructive",
            });
          } else {
            console.error("DELETE event received but payload.old.id is missing!", payload);
          }
        }
      })
      .subscribe((status) => {
        console.log(`Realtime subscription status for chat ${chatId}: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to realtime events for workflow_steps with chat_id=${chatId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to realtime events for workflow_steps`);
          toast({
            title: "Realtime Subscription Error",
            description: "Failed to subscribe to workflow updates. Try refreshing the page.",
            variant: "destructive",
          });
        }
      });

    return () => {
      console.log(`Cleaning up realtime subscription for chat ${chatId}`);
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const parseWorkflowStep = (step: any): WorkflowStep => {
    let parsedScreenshots;
    let parsedExampleData;
    
    try {
      if (step.screenshots) {
        if (typeof step.screenshots === 'string') {
          parsedScreenshots = JSON.parse(step.screenshots);
        } else {
          parsedScreenshots = step.screenshots;
        }
      }
      
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
      step_number: step.step_number,
    };
  };

  const parseWorkflowSteps = (data: any[]): WorkflowStep[] => {
    return data.map(step => parseWorkflowStep(step));
  };

  return {
    workflowSteps,
    isLoading,
    error,
    deletingStepIds
  };
};
