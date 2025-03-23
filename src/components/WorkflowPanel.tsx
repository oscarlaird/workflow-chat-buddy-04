
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
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

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
  const [isCodePanelOpen, setIsCodePanelOpen] = useState(true);

  const handleRunWorkflow = async (inputValues: InputValues) => {
    try {
      setIsRunning(true);
      
      // Create a new code run message
      const messageId = uuidv4();
      
      // Create a message with code run type for the chat interface
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          id: messageId,
          chat_id: chatId,
          role: 'assistant',
          content: 'Running workflow',
          username: 'current_user',
          type: 'code_run'
        });

      if (messageError) {
        console.error('Error creating run message:', messageError);
        toast.error('Failed to start workflow run');
        return;
      }

      // Store input values as a code run event
      if (Object.keys(inputValues).length > 0) {
        const { error: eventError } = await supabase
          .from('coderun_events')
          .insert({
            chat_id: chatId,
            message_id: messageId, 
            function_name: 'workflow_inputs',
            example_input: inputValues,
            requires_browser: false
          });
          
        if (eventError) {
          console.error('Error storing input values:', eventError);
          toast.error('Failed to store workflow inputs');
        }
      }
      
      toast.success("Workflow started");
      
      if (onRunWorkflow) {
        onRunWorkflow();
      }
      
      // Broadcast event to notify other components
      window.postMessage({
        type: "WORKFLOW_STARTED", 
        messageId: messageId,
        chatId: chatId
      }, '*');
      
    } catch (error) {
      console.error('Error running workflow:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  // Handle toggling of Python code panel
  const handlePythonPanelToggle = (open: boolean) => {
    setIsCodePanelOpen(open);
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
      
      <ResizablePanelGroup direction="vertical" className="flex-grow">
        <ResizablePanel defaultSize={60} minSize={20}>
          <div className="h-full overflow-y-auto p-4">
            {workflowSteps && workflowSteps.length > 0 ? (
              workflowSteps.map((step, index) => (
                <WorkflowStep
                  key={step.id}
                  step={step}
                  index={index}
                  isDeleting={false}
                />
              ))
            ) : (
              <div className="text-gray-500 text-center p-4">
                No workflow steps available for this chat.
              </div>
            )}
          </div>
        </ResizablePanel>
        
        {chatId && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40} minSize={10}>
              <PythonCodeDisplay 
                chatId={chatId}
                isOpen={isCodePanelOpen}
                onOpenChange={handlePythonPanelToggle}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
};

export default WorkflowPanel;
