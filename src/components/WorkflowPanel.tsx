import { useState, useEffect } from "react";
import { Play, Loader2, MapPin, FileText } from "lucide-react";
import WorkflowStep from "./WorkflowStep";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Workflow, WorkflowStep as WorkflowStepType } from "@/types";

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
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [state, setState] = useState("");
  const [billInput, setBillInput] = useState("");

  useEffect(() => {
    if (!chatId) {
      setIsLoading(false);
      setWorkflow(null);
      return;
    }

    async function fetchWorkflowSteps() {
      try {
        setIsLoading(true);
        console.log("Fetching workflow steps for chat ID:", chatId);
        
        const { data, error } = await supabase
          .from('workflow_steps')
          .select('*')
          .eq('chat_id', chatId)
          .order('step_order', { ascending: true });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        if (data && data.length > 0) {
          console.log("Workflow steps found:", data.length);
          const workflowSteps: WorkflowStepType[] = data.map(step => ({
            id: step.id,
            title: step.title,
            description: step.description,
            status: step.status as "complete" | "active" | "waiting",
            screenshots: step.screenshots ? JSON.parse(String(step.screenshots)) : undefined,
            code: step.code || undefined,
            exampleData: step.example_data ? JSON.parse(String(step.example_data)) : undefined,
          }));

          const completeSteps = workflowSteps.filter(step => step.status === "complete").length;
          
          setWorkflow({
            id: "workflow-1",
            title: "Website Vote Data Scraper",
            currentStep: completeSteps + 1,
            totalSteps: workflowSteps.length,
            steps: workflowSteps
          });
        } else {
          console.log("No workflow steps found for chat ID:", chatId);
          setWorkflow(null);
        }
      } catch (error) {
        console.error("Error fetching workflow steps:", error);
        toast({
          title: "Error",
          description: "Failed to load workflow steps",
          variant: "destructive"
        });
        setWorkflow(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchWorkflowSteps();
  }, [chatId]);

  const handleRunWorkflow = () => {
    setIsRunning(true);
    
    window.postMessage({ type: "CREATE_AGENT_RUN_WINDOW" }, "*");
    
    setTimeout(() => {
      onRunWorkflow();
      setIsRunning(false);
    }, 2000);
  };

  const getProgressPercentage = () => {
    if (!workflow) return 0;
    const completeSteps = workflow.steps.filter(step => step.status === "complete").length;
    return (completeSteps / workflow.totalSteps) * 100;
  };

  const states = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", 
    "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", 
    "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-gray-500">Loading workflow...</p>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p className="text-sm text-gray-500">No workflow data available for this chat</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="state" className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>State</span>
            </Label>
            <Select value={state} onValueChange={setState}>
              <SelectTrigger id="state" className="w-full">
                <SelectValue placeholder="Select a state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((stateName) => (
                  <SelectItem key={stateName} value={stateName}>
                    {stateName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bill-input" className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span>Bill Number/Name</span>
            </Label>
            <Input
              id="bill-input"
              placeholder="Enter bill number or name"
              value={billInput}
              onChange={(e) => setBillInput(e.target.value)}
            />
          </div>
        </div>
        
        {showRunButton && (
          <button
            onClick={handleRunWorkflow}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-70"
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
        )}
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
