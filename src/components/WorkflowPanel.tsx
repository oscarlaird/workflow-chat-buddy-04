import { useState, useEffect } from "react";
import { Play, Loader2, Check, X } from "lucide-react";
import WorkflowStep from "./WorkflowStep";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Workflow } from "@/types";
import { useWorkflowSteps } from "@/hooks/useWorkflowSteps";
import { supabase } from "@/integrations/supabase/client";
import { InputField } from "@/hooks/useChats";
import { Json } from "@/integrations/supabase/types";

interface WorkflowPanelProps {
  onRunWorkflow: () => void;
  showRunButton?: boolean;
  chatId?: string;
}

interface InputValues {
  [key: string]: string | number | boolean;
}

const parseInputSchema = (inputSchema: Json | null): InputField[] => {
  if (!inputSchema) return [];
  
  if (Array.isArray(inputSchema)) {
    return inputSchema.filter((item): item is InputField => {
      if (typeof item !== 'object' || item === null) return false;
      
      return (
        'field_name' in item && 
        typeof item.field_name === 'string' &&
        'type' in item && 
        (item.type === 'string' || item.type === 'number' || item.type === 'bool')
      );
    });
  }
  
  return [];
};

export const WorkflowPanel = ({ 
  onRunWorkflow, 
  showRunButton = true, 
  chatId
}: WorkflowPanelProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [inputValues, setInputValues] = useState<InputValues>({});
  const [multiInput, setMultiInput] = useState(false);
  const [inputSchema, setInputSchema] = useState<InputField[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(true);
  
  const { workflowSteps, isLoading, error, deletingStepIds } = useWorkflowSteps(chatId);

  useEffect(() => {
    const fetchChatSettings = async () => {
      if (!chatId) {
        setIsLoadingChat(false);
        return;
      }

      try {
        setIsLoadingChat(true);
        const { data, error } = await supabase
          .from('chats')
          .select('multi_input, input_schema')
          .eq('id', chatId)
          .single();

        if (error) {
          console.error('Error fetching chat settings:', error);
          toast({
            title: "Error loading chat settings",
            description: error.message,
            variant: "destructive"
          });
        } else if (data) {
          setMultiInput(data.multi_input || false);
          
          const parsedSchema = parseInputSchema(data.input_schema);
          setInputSchema(parsedSchema);
          
          const initialValues: InputValues = {};
          parsedSchema.forEach((field: InputField) => {
            if (field.type === 'string') initialValues[field.field_name] = '';
            else if (field.type === 'number') initialValues[field.field_name] = 0;
            else if (field.type === 'bool') initialValues[field.field_name] = false;
          });
          setInputValues(initialValues);
        }
      } catch (error) {
        console.error('Error in fetchChatSettings:', error);
      } finally {
        setIsLoadingChat(false);
      }
    };

    fetchChatSettings();
  }, [chatId]);

  const workflow = workflowSteps.length > 0 ? {
    id: "workflow-1",
    title: "Website Vote Data Scraper",
    currentStep: workflowSteps.filter(step => step.status === "complete").length + 1,
    totalSteps: workflowSteps.length,
    steps: workflowSteps
  } : null;

  const handleRunWorkflow = () => {
    setIsRunning(true);
    
    window.postMessage({ 
      type: "CREATE_AGENT_RUN_WINDOW",
      inputs: inputValues 
    }, "*");
    
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

  const handleInputChange = (name: string, value: string | number | boolean) => {
    setInputValues(prev => ({
      ...prev,
      [name]: value
    }));
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

  const renderInputField = (field: InputField) => {
    const value = inputValues[field.field_name];
    
    switch(field.type) {
      case 'string':
        if (field.field_name.toLowerCase() === 'state') {
          return (
            <Select 
              key={field.field_name}
              value={value as string} 
              onValueChange={(val) => handleInputChange(field.field_name, val)}
            >
              <SelectTrigger id={field.field_name} className="w-full">
                <SelectValue placeholder={`Select ${field.field_name}`} />
              </SelectTrigger>
              <SelectContent>
                {states.map((stateName) => (
                  <SelectItem key={stateName} value={stateName}>
                    {stateName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        } else {
          return (
            <Input
              key={field.field_name}
              id={field.field_name}
              placeholder={`Enter ${field.field_name}`}
              value={value as string}
              onChange={(e) => handleInputChange(field.field_name, e.target.value)}
            />
          );
        }
      case 'number':
        return (
          <Input
            key={field.field_name}
            id={field.field_name}
            type="number"
            placeholder={`Enter ${field.field_name}`}
            value={value as number}
            onChange={(e) => handleInputChange(field.field_name, parseInt(e.target.value) || 0)}
          />
        );
      case 'bool':
        return (
          <div key={field.field_name} className="flex items-center space-x-2">
            <Switch
              id={field.field_name}
              checked={value as boolean}
              onCheckedChange={(checked) => handleInputChange(field.field_name, checked)}
            />
            <span className="text-sm text-gray-500">
              {value ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading || isLoadingChat) {
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
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-4 mb-4">
          {inputSchema.map((field) => (
            <div key={field.field_name} className="space-y-2">
              <Label htmlFor={field.field_name} className="flex items-center gap-1.5 capitalize">
                <span>{field.field_name}</span>
              </Label>
              {renderInputField(field)}
            </div>
          ))}
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
