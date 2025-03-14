
import { useState } from "react";
import { Play, Loader2, CheckCircle } from "lucide-react";
import { mockWorkflow } from "@/data/mockData";
import WorkflowStep from "./WorkflowStep";

interface WorkflowPanelProps {
  onRunWorkflow: () => void;
}

export const WorkflowPanel = ({ onRunWorkflow }: WorkflowPanelProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [workflow, setWorkflow] = useState(mockWorkflow);

  const handleRunWorkflow = () => {
    setIsRunning(true);
    
    // Simulate workflow execution
    setTimeout(() => {
      onRunWorkflow();
      setIsRunning(false);
    }, 2000);
  };

  const getProgressPercentage = () => {
    const completeSteps = workflow.steps.filter(step => step.status === "complete").length;
    return (completeSteps / workflow.totalSteps) * 100;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium">Workflow</h2>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {workflow.currentStep} of {workflow.totalSteps} steps completed
          </div>
        </div>
        
        <button
          onClick={handleRunWorkflow}
          disabled={isRunning}
          className="flex items-center gap-2 py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Run Workflow</span>
            </>
          )}
        </button>
      </div>
      
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
            <WorkflowStep key={step.id} step={step} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowPanel;
