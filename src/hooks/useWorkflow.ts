
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Workflow, WorkflowStep } from "@/types";
import { toast } from "@/components/ui/use-toast";

interface UseWorkflowProps {
  chatId?: string;
}

export const useWorkflow = ({ chatId }: UseWorkflowProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingStepIds, setUpdatingStepIds] = useState<Set<string>>(new Set());

  const fetchWorkflowSteps = useCallback(async () => {
    if (!chatId) {
      setIsLoading(false);
      setWorkflow(null);
      setError(null);
      return;
    }

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
        const workflowSteps = processWorkflowStepsData(data);
        
        const completeSteps = workflowSteps.filter(step => step.status === "complete").length;
        
        setWorkflow({
          id: `workflow-${chatId}`,
          title: "Website Vote Data Scraper",
          currentStep: completeSteps + 1,
          totalSteps: workflowSteps.length,
          steps: workflowSteps
        });
      } else {
        console.log("No workflow steps found for chat ID:", chatId);
        setWorkflow(null);
      }
    } catch (error: any) {
      console.error("Error fetching workflow steps:", error);
      setError(error?.message || "Unknown error occurred");
      setWorkflow(null);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);
  
  const processWorkflowStepsData = (data: any[]): WorkflowStep[] => {
    return data.map(step => {
      let parsedScreenshots;
      let parsedExampleData;
      
      try {
        // Handle screenshots parsing safely
        if (step.screenshots) {
          if (typeof step.screenshots === 'string') {
            parsedScreenshots = JSON.parse(step.screenshots);
          } else {
            // If it's already an object, use it directly
            parsedScreenshots = step.screenshots;
          }
        }
        
        // Handle example data parsing safely
        if (step.example_data) {
          if (typeof step.example_data === 'string') {
            parsedExampleData = JSON.parse(step.example_data);
          } else {
            // If it's already an object, use it directly
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
      };
    });
  };

  // Initial data loading
  useEffect(() => {
    fetchWorkflowSteps();
  }, [fetchWorkflowSteps]);

  // Set up real-time subscription for workflow steps updates
  useEffect(() => {
    if (!chatId) return;
    
    console.log(`Setting up realtime subscription for workflow steps of chat ${chatId}`);
    
    const channel = supabase
      .channel(`workflow-steps:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'workflow_steps',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        console.log('Received real-time INSERT workflow step:', payload);
        const newStep = payload.new;
        
        setWorkflow(prev => {
          if (!prev) return null;
          
          // Check if the step already exists in the workflow
          if (prev.steps.some(step => step.id === newStep.id)) {
            return prev;
          }
          
          const processedStep = processWorkflowStepsData([newStep])[0];
          
          const updatedSteps = [...prev.steps, processedStep];
          updatedSteps.sort((a, b) => {
            const orderA = newStep.step_order || 0;
            const orderB = newStep.step_order || 0;
            return orderA - orderB;
          });
          
          const completeSteps = updatedSteps.filter(step => step.status === "complete").length;
          
          return {
            ...prev,
            currentStep: completeSteps + 1,
            totalSteps: updatedSteps.length,
            steps: updatedSteps
          };
        });
        
        // Mark step as updating
        setUpdatingStepIds(prev => {
          const updated = new Set(prev);
          updated.add(newStep.id);
          return updated;
        });
        
        // Remove updating status after animation
        setTimeout(() => {
          setUpdatingStepIds(prev => {
            const updated = new Set(prev);
            updated.delete(newStep.id);
            return updated;
          });
        }, 2000);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'workflow_steps',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        console.log('Received real-time UPDATE workflow step:', payload);
        const updatedStep = payload.new;
        
        setWorkflow(prev => {
          if (!prev) return null;
          
          const updatedSteps = prev.steps.map(step => {
            if (step.id === updatedStep.id) {
              const processedStep = processWorkflowStepsData([updatedStep])[0];
              return processedStep;
            }
            return step;
          });
          
          const completeSteps = updatedSteps.filter(step => step.status === "complete").length;
          
          return {
            ...prev,
            currentStep: completeSteps + 1,
            totalSteps: updatedSteps.length,
            steps: updatedSteps
          };
        });
        
        // Mark step as updating
        setUpdatingStepIds(prev => {
          const updated = new Set(prev);
          updated.add(updatedStep.id);
          return updated;
        });
        
        // Remove updating status after animation
        setTimeout(() => {
          setUpdatingStepIds(prev => {
            const updated = new Set(prev);
            updated.delete(updatedStep.id);
            return updated;
          });
        }, 2000);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'workflow_steps',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        console.log('Received real-time DELETE workflow step:', payload);
        const deletedStep = payload.old;
        
        setWorkflow(prev => {
          if (!prev) return null;
          
          const updatedSteps = prev.steps.filter(step => step.id !== deletedStep.id);
          const completeSteps = updatedSteps.filter(step => step.status === "complete").length;
          
          return {
            ...prev,
            currentStep: completeSteps + 1,
            totalSteps: updatedSteps.length,
            steps: updatedSteps
          };
        });
      })
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      console.log('Removing workflow steps channel subscription');
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const getProgressPercentage = useCallback(() => {
    if (!workflow) return 0;
    const completeSteps = workflow.steps.filter(step => step.status === "complete").length;
    return (completeSteps / workflow.totalSteps) * 100;
  }, [workflow]);

  return {
    workflow,
    isLoading,
    error,
    updatingStepIds,
    getProgressPercentage
  };
};
