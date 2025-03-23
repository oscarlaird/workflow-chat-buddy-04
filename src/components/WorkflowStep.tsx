
import { memo } from "react";
import { ChevronDown, ChevronRight, Table, Database, Trash2, ArrowDownUp, Globe, Chrome, ExternalLink } from "lucide-react";
import { WorkflowStep as WorkflowStepType } from "@/types";
import DataTable from "./DataTable";
import { useState } from "react";
import { MotionDiv } from "@/lib/transitions";
import { Button } from "./ui/button";
import { TypedInputField, InputFieldIcon } from "./InputField";
import { InputField } from "@/types";
import { inferFieldType } from "@/hooks/useSelectedChatSettings";
import { Badge } from "./ui/badge";

interface WorkflowStepProps {
  step: WorkflowStepType;
  index: number;
  isDeleting?: boolean;
}

export const WorkflowStep = memo(({ step, index, isDeleting = false }: WorkflowStepProps) => {
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [isOutputExpanded, setIsOutputExpanded] = useState(false);
  
  // Create a key based on step data to ensure proper re-renders
  const stepKey = `${step.id}-${step.description}`;

  // Check if step requires browser
  const requiresBrowser = step.requiresBrowser === true;

  // Function to infer field types from example inputs and outputs
  const inferInputFields = (inputData: Record<string, any> | null): InputField[] => {
    if (!inputData) return [];
    
    return Object.entries(inputData).map(([fieldName, value]) => ({
      field_name: fieldName,
      type: inferFieldType(fieldName, value)
    }));
  };

  // Prepare input and output fields
  const inputFields = step.exampleInput ? inferInputFields(step.exampleInput) : [];
  const hasInputs = inputFields.length > 0;
  
  const getOutputType = (output: any): string => {
    if (output === null) return 'null';
    if (Array.isArray(output)) return 'table';
    if (typeof output === 'object') {
      // Check if we have a _ret field which is typically a table
      if (output._ret && Array.isArray(output._ret)) return 'table';
      return 'object';
    }
    return typeof output;
  };
  
  const renderOutput = (output: any) => {
    if (output === null) return <div className="text-gray-500">No output available</div>;
    
    if (Array.isArray(output)) {
      return <DataTable data={output} />;
    }
    
    if (typeof output === 'object') {
      // Special case for _ret field which is typically a table
      if (output._ret && Array.isArray(output._ret)) {
        return <DataTable data={output._ret} />;
      }
      
      // For other objects, display each field separately
      return (
        <div className="space-y-3">
          {Object.entries(output).map(([key, value]) => (
            <div key={key} className="border rounded-md p-3">
              <div className="font-medium text-sm mb-1">{key}</div>
              {renderOutput(value)}
            </div>
          ))}
        </div>
      );
    }
    
    // For primitive values
    return <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">{String(output)}</div>;
  };

  return (
    <MotionDiv 
      className={`workflow-step ${isDeleting ? 'workflow-step-deleting' : ''}`} 
      key={stepKey}
      initial={{ opacity: 1, height: "auto" }}
      animate={{ 
        opacity: isDeleting ? 1 : 1,
        height: isDeleting ? "auto" : "auto", 
      }}
      transition={{ 
        duration: 1.2,
        ease: "easeInOut",
        delay: isDeleting ? 1.2 : 0
      }}
      exit={{ opacity: 0, height: 0 }}
    >
      {isDeleting && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-100/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-md">
          <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-full flex items-center gap-2 shadow-md">
            <Trash2 className="w-5 h-5" />
            <span className="text-sm font-medium">Deleting...</span>
          </div>
        </div>
      )}
      
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">
            Step {step.step_number}: {step.title}
          </h3>
          
          {requiresBrowser && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800 flex items-center gap-1 px-2">
              <Chrome className="h-3.5 w-3.5" />
              <span>Browser Required</span>
            </Badge>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
        
        {requiresBrowser && (
          <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
            <ExternalLink className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span>This step will be executed in a browser window</span>
          </div>
        )}
      </div>

      {hasInputs && (
        <div className="mt-3">
          <button
            onClick={() => setIsInputExpanded(!isInputExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors"
          >
            {isInputExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <Database className="w-4 h-4" />
            <span>Example Inputs {isInputExpanded ? "▾" : "▸"}</span>
          </button>
          
          {isInputExpanded && (
            <div className="mt-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-900 animate-slide-in-bottom">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inputFields.map((field) => (
                  <div key={field.field_name} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <InputFieldIcon type={field.type} className="text-gray-500" />
                      <label className="text-sm font-medium">
                        {field.field_name}
                        <span className="ml-2 text-xs text-gray-500">({field.type})</span>
                      </label>
                    </div>
                    <TypedInputField 
                      field={field} 
                      value={step.exampleInput?.[field.field_name]} 
                      onChange={() => {}} // Read-only
                      showValidation={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step.exampleOutput && (
        <div className="mt-3">
          <button
            onClick={() => setIsOutputExpanded(!isOutputExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors"
          >
            {isOutputExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <ArrowDownUp className="w-4 h-4" />
            <span>Example Output {isOutputExpanded ? "▾" : "▸"}</span>
          </button>
          
          {isOutputExpanded && (
            <div className="mt-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-900 animate-slide-in-bottom">
              {renderOutput(step.exampleOutput)}
            </div>
          )}
        </div>
      )}
    </MotionDiv>
  );
});

export default WorkflowStep;
