
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import WorkflowStep from "./WorkflowStep";
import WorkflowInputs from "./WorkflowInputs";
import PythonCodeDisplay from "./PythonCodeDisplay";
import { InputValues, RunMessageType, RunMessageSenderType } from "@/types";
import { useWorkflowSteps } from "@/hooks/useWorkflowSteps";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";

interface WorkflowPanelProps {
  chatId: string;
  onRunWorkflow?: () => void;
  showRunButton?: boolean;
  showInputs?: boolean;
}

const WorkflowPanel = ({ 
  chatId, 
  onRunWorkflow, 
  showRunButton = true,
  showInputs = true
}: WorkflowPanelProps) => {
  const { workflowSteps, isLoading, error } = useWorkflowSteps(chatId);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunWorkflow = async (inputValues: InputValues) => {
    try {
      setIsRunning(true);
      const runId = uuidv4();
      
      // Create a new run
      const { data: runData, error: runError } = await supabase
        .from('runs')
        .insert({
          id: runId,
          chat_id: chatId,
          dashboard_id: 'web-dashboard',
          in_progress: true,
          status: 'running'
        })
        .select();
      
      if (runError) {
        console.error('Error creating run:', runError);
        toast.error('Failed to start workflow run');
        return;
      }

      // Create a message with the run_id for the chat interface
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          role: 'assistant',
          content: 'Running workflow',
          username: 'current_user',
          run_id: runId
        });

      if (messageError) {
        console.error('Error creating run message:', messageError);
        // Continue anyway as this is not a critical error
      }

      // Store input values as a run message
      const inputPayload = { values: inputValues };
      const { data: messageData, error: runMessageError } = await supabase
        .from('run_messages')
        .insert({
          run_id: runId,
          type: RunMessageType.INPUTS,
          payload: inputPayload,
          chat_id: chatId,
          username: 'current_user',
          sender_type: RunMessageSenderType.DASHBOARD,
          display_text: 'Workflow input values'
        })
        .select();
        
      if (runMessageError) {
        console.error('Error storing input values:', runMessageError);
        toast.error('Failed to store workflow inputs');
      }
      
      toast.success("Workflow started");
      
      if (onRunWorkflow) {
        onRunWorkflow();
      }
      
      // Broadcast a workflow run created event to trigger the ChatInterface to set the current run ID
      window.postMessage({
        type: "WORKFLOW_RUN_CREATED", 
        runId: runId,
        chatId: chatId
      }, '*');
      
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
      {showInputs && (
        <WorkflowInputs
          chatId={chatId}
          onSubmit={handleRunWorkflow}
          disabled={isRunning}
          showRunButton={showRunButton}
          isRunning={isRunning}
        />
      )}
      <div className="flex-grow overflow-y-auto p-4">
        {workflowSteps && workflowSteps.map((step, index) => (
          <WorkflowStep
            key={step.id}
            step={step}
            index={index}
            isDeleting={false}
          />
        ))}
      </div>
      {chatId && <PythonCodeDisplay chatId={chatId} />}
    </div>
  );
};

export default WorkflowPanel;
