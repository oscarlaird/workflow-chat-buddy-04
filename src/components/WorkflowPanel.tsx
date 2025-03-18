
import { useState } from "react";
import { Loader2 } from "lucide-react";
import WorkflowStep from "./WorkflowStep";
import WorkflowInputs from "./WorkflowInputs";
import { InputValues } from "@/types";
import { useWorkflowSteps } from "@/hooks/useWorkflowSteps";

interface WorkflowPanelProps {
  onRunWorkflow: () => void;
  showRunButton?: boolean;
  chatId?: string;
}

export const WorkflowPanel = ({ 
  onRunWorkflow, 
  showRunButton = true, 
  chatId
}: WorkflowPanelProps) => {
  const [currentInputs, setCurrentInputs] = useState<InputValues | InputValues[]>({});
  const { workflowSteps, isLoading, error, deletingStepIds } = useWorkflowSteps(chatId);
  const [isRunning, setIsRunning] = useState(false);

  const workflow = workflowSteps.length > 0 ? {
    id: "workflow-1",
    title: "Website Vote Data Scraper",
    currentStep: workflowSteps.filter(step => step.status === "complete").length + 1,
    totalSteps: workflowSteps.length,
    steps: workflowSteps
  } : null;

  const handleRunWorkflow = () => {
    if (isRunning) return;
    
    setIsRunning(true);
    console.log("Running workflow for chat ID:", chatId);
    
    // Only send the message once with a small delay to prevent duplicate calls
    setTimeout(() => {
      onRunWorkflow();
      setIsRunning(false);
    }, 300);
  };

  const getProgressPercentage = () => {
    if (!workflow) return 0;
    const completeSteps = workflow.steps.filter(step => step.status === "complete").length;
    return (completeSteps / workflow.totalSteps) * 100;
  };

  const handleInputValuesChange = (values: InputValues | InputValues[]) => {
    setCurrentInputs(values);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-gray-500">Loading workflow for chat ID: {chatId || "none"}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-4">
        <div className="text-red-500 mb-2">⚠️ Error loading workflow</div>
        <p className="text-sm text-gray-500 text-center">
          Failed to load workflow steps for chat ID: {chatId || "none"}
        </p>
        <p className="text-xs text-gray-400 mt-2 text-center">{error}</p>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p className="text-sm text-gray-500">No workflow data available for chat ID: {chatId || "none"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <WorkflowInputs 
        chatId={chatId}
        onInputValuesChange={handleInputValuesChange}
        showRunButton={showRunButton}
        onRunWorkflow={handleRunWorkflow}
        isRunning={isRunning}
      />
      
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-secondary/50">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-workflow-progress-bg rounded-full h-2.5">
            <div
              className="bg-workflow-progress-fill h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium">
            {Math.round(getProgressPercentage())}%
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-2">
          {workflow.steps.map((step, index) => (
            <WorkflowStep 
              key={step.id} 
              step={step} 
              index={index}
              isDeleting={deletingStepIds.includes(step.id)} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowPanel;
