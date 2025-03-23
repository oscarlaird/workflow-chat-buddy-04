
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
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WorkflowPanelProps {
  chatId: string;
  onRunWorkflow?: () => void;
  showRunButton?: boolean;
  showInputs?: boolean;
  messages?: any[]; // Add messages prop
}

const WorkflowPanel = ({ 
  chatId, 
  onRunWorkflow, 
  showRunButton = true,
  showInputs = true,
  messages = [] // Default to empty array
}: WorkflowPanelProps) => {
  const { workflowSteps, isLoading, error } = useWorkflowSteps(chatId);
  const [isRunning, setIsRunning] = useState(false);
  const [isCodePanelOpen, setIsCodePanelOpen] = useState(true);
  const [isRebuilding, setIsRebuilding] = useState(false);

  // Check if workflow is being rebuilt
  useEffect(() => {
    if (messages && messages.length > 0) {
      // Find the most recent user message
      const latestUserMessage = [...messages]
        .reverse()
        .find(msg => msg.role === 'user');
      
      // Check if it requires a text reply but script is null
      const rebuilding = latestUserMessage && 
        latestUserMessage.requires_text_reply === true && 
        latestUserMessage.script === null;
      
      setIsRebuilding(rebuilding);
      console.log("Is rebuilding?", rebuilding, "Latest user message:", latestUserMessage);
    } else {
      setIsRebuilding(false);
    }
  }, [messages]);

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

      // Store input values as a run message (only if there are any inputs)
      if (Object.keys(inputValues).length > 0) {
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
      {/* Add a highly visible rebuilding indicator at the top, regardless of showInputs */}
      {isRebuilding && (
        <Alert className="m-4 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <AlertDescription className="flex items-center font-medium">
            Rebuilding Workflow... (Latest user message has requires_text_reply=true and script=null)
          </AlertDescription>
        </Alert>
      )}
      
      {showInputs && (
        <WorkflowInputs
          chatId={chatId}
          onSubmit={handleRunWorkflow}
          disabled={isRunning}
          showRunButton={showRunButton}
          isRunning={isRunning}
          isRebuilding={isRebuilding} // Pass isRebuilding to WorkflowInputs
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
      
      {/* Rebuilding Workflow Indicator at the bottom as well */}
      {isRebuilding && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-3 flex items-center justify-center text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/30">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Rebuilding Workflow...
        </div>
      )}
    </div>
  );
};

export default WorkflowPanel;
