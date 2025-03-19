
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import WorkflowStep from "./WorkflowStep";
import WorkflowInputs from "./WorkflowInputs";
import { InputValues, RunMessageType, RunMessageSenderType } from "@/types";
import { useWorkflowSteps } from "@/hooks/useWorkflowSteps";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";

interface WorkflowPanelProps {
  chatId: string;
  onRunWorkflow?: () => void;
  showRunButton?: boolean;
}

const WorkflowPanel = ({ chatId, onRunWorkflow, showRunButton = true }: WorkflowPanelProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [inputSchema, setInputSchema] = useState<any[]>([]);
  const { workflowSteps, isLoading, error } = useWorkflowSteps(chatId);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const fetchChatInputSchema = async () => {
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('input_schema')
        .eq('id', chatId)
        .single();

      if (chatError) {
        console.error("Error fetching chat input schema:", chatError);
        return;
      }

      if (chatData && chatData.input_schema) {
        setInputSchema(chatData.input_schema);
      }
    };

    fetchChatInputSchema();
  }, [chatId]);

  const handleRunWorkflow = async (inputValues: InputValues) => {
    try {
      setIsRunning(true);
      setCurrentStepIndex(0);
      
      const runId = uuidv4();
      
      // Create a new run
      const { error: runError } = await supabase
        .from('runs')
        .insert({
          id: runId,
          chat_id: chatId,
          dashboard_id: 'web-dashboard',
          in_progress: true,
          status: 'running'
        });
      
      if (runError) {
        console.error('Error creating run:', runError);
        toast.error('Failed to start workflow run');
        setIsRunning(false);
        return;
      }

      // Store input values as a run message
      const inputPayload = { values: inputValues };
      const { error: messageError } = await supabase
        .from('run_messages')
        .insert({
          run_id: runId,
          type: RunMessageType.INPUTS,
          payload: inputPayload,
          chat_id: chatId,
          username: 'current_user',
          sender_type: RunMessageSenderType.DASHBOARD,
          display_text: 'Workflow input values'
        });
        
      if (messageError) {
        console.error('Error storing input values:', messageError);
        toast.error('Failed to store workflow inputs');
      }
      
      // Simulate running each step of the workflow
      for (let i = 0; i < workflowSteps.length; i++) {
        setCurrentStepIndex(i);
        
        // Simulate a delay between steps
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (onRunWorkflow) {
        onRunWorkflow();
      }
      
    } catch (error) {
      console.error('Error running workflow:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-4">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading workflow steps...
    </div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {inputSchema && inputSchema.length > 0 && (
        <WorkflowInputs 
          chatId={chatId}
          onSubmit={handleRunWorkflow} 
          disabled={isRunning} 
          showRunButton={showRunButton}
          onRunWorkflow={onRunWorkflow}
        />
      )}

      <div className="flex-grow overflow-y-auto p-4">
        {workflowSteps && workflowSteps.map((step, index) => (
          <WorkflowStep
            key={step.id}
            step={step}
            status={index === currentStepIndex ? "active" : index < currentStepIndex ? "complete" : "waiting"}
          />
        ))}
      </div>
    </div>
  );
};

export default WorkflowPanel;
