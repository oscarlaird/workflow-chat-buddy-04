
import { useState } from "react";
import { Play, Loader2, MapPin, FileText, Upload } from "lucide-react";
import { mockWorkflow } from "@/data/mockData";
import WorkflowStep from "./WorkflowStep";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WorkflowPanelProps {
  onRunWorkflow: () => void;
  showRunButton?: boolean;
}

export const WorkflowPanel = ({ onRunWorkflow, showRunButton = true }: WorkflowPanelProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isCopyingImages, setIsCopyingImages] = useState(false);
  const [workflow, setWorkflow] = useState(mockWorkflow);
  const [state, setState] = useState("");
  const [billInput, setBillInput] = useState("");

  const handleRunWorkflow = () => {
    setIsRunning(true);
    
    // Send message to create agent run window
    window.postMessage({ type: "CREATE_AGENT_RUN_WINDOW" }, "*");
    
    // Simulate workflow execution
    setTimeout(() => {
      onRunWorkflow();
      setIsRunning(false);
    }, 2000);
  };

  const handleCopyImagesToSupabase = async () => {
    setIsCopyingImages(true);
    try {
      // Use the supabase client's functions.invoke to call the edge function
      const { data, error } = await supabase.functions.invoke('copy-images', {
        method: 'POST',
        body: {} // Empty body, but required
      });
      
      if (error) {
        console.error('Error calling function:', error);
        throw new Error(error.message || 'Failed to call edge function');
      }
      
      console.log('Function response:', data);
      
      if (data && data.success) {
        toast({
          title: "Images copied successfully",
          description: "All workflow images have been copied to Supabase storage",
        });
      } else {
        throw new Error((data && data.error) || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error copying images:', error);
      toast({
        title: "Error copying images",
        description: error.message || "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCopyingImages(false);
    }
  };

  const getProgressPercentage = () => {
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

          <button
            onClick={handleCopyImagesToSupabase}
            disabled={isCopyingImages}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors disabled:opacity-70"
          >
            {isCopyingImages ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Copying Images...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Copy Images to Supabase</span>
              </>
            )}
          </button>
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
