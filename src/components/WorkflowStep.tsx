
import { memo } from "react";
import { ChevronDown, ChevronRight, Code, Table, Trash2 } from "lucide-react";
import { WorkflowStep as WorkflowStepType } from "@/types";
import CodeBlock from "./CodeBlock";
import DataTable from "./DataTable";
import { useState } from "react";
import { MotionDiv } from "@/lib/transitions";

interface WorkflowStepProps {
  step: WorkflowStepType;
  index: number;
  isDeleting?: boolean;
}

export const WorkflowStep = memo(({ step, index, isDeleting = false }: WorkflowStepProps) => {
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);
  const [isDataExpanded, setIsDataExpanded] = useState(false);
  
  // Create a key based on step data to ensure proper re-renders
  const stepKey = `${step.id}-${step.description}-${step.status}`;

  const getStatusClass = () => {
    switch (step.status) {
      case "complete":
        return "workflow-step-complete";
      case "active":
        return "workflow-step-active";
      case "waiting":
        return "workflow-step-waiting";
      default:
        return "workflow-step-waiting";
    }
  };

  // Detect code language based on content or use default
  const detectLanguage = (code: string) => {
    if (code.includes("function") || code.includes("const") || code.includes("let") || code.includes("var")) {
      return "javascript";
    }
    if (code.includes("<html") || code.includes("</div>")) {
      return "html";
    }
    if (code.includes("SELECT") || code.includes("FROM") || code.includes("WHERE")) {
      return "sql";
    }
    if (code.includes("import") && code.includes("from") && (code.includes("React") || code.includes("useState"))) {
      return "jsx";
    }
    if (code.includes("python") || code.includes("def ") || code.includes("import ") && code.includes(":")) {
      return "python";
    }
    return "javascript"; // Default
  };

  return (
    <MotionDiv 
      className={`workflow-step ${getStatusClass()} ${isDeleting ? 'workflow-step-deleting' : ''}`} 
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
        <h3 className="text-lg font-medium">
          Step {step.step_number}: {step.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
      </div>

      {step.screenshots && step.screenshots.length > 0 && (
        <div className="mt-4 mb-4">
          <div className="flex flex-wrap gap-4">
            {step.screenshots.map((screenshot) => (
              <div key={screenshot.id} className="relative group">
                <div className="relative w-48 h-36 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                  <img
                    src={screenshot.url}
                    alt={screenshot.caption}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-2">
                    <span className="text-white text-xs">{screenshot.caption}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step.code && (
        <div className="mt-3">
          <button
            onClick={() => setIsCodeExpanded(!isCodeExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors"
          >
            {isCodeExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <Code className="w-4 h-4" />
            <span>Code {isCodeExpanded ? "▾" : "▸"}</span>
          </button>
          
          {isCodeExpanded && (
            <div className="mt-2 overflow-hidden rounded-md animate-slide-in-bottom">
              <CodeBlock code={step.code} language={detectLanguage(step.code)} />
            </div>
          )}
        </div>
      )}

      {step.exampleData && step.exampleData.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setIsDataExpanded(!isDataExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors"
          >
            {isDataExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <Table className="w-4 h-4" />
            <span>Example Data {isDataExpanded ? "▾" : "▸"}</span>
          </button>
          
          {isDataExpanded && (
            <div className="mt-2 overflow-hidden rounded-md animate-slide-in-bottom">
              <DataTable data={step.exampleData} />
            </div>
          )}
        </div>
      )}
    </MotionDiv>
  );
});

export default WorkflowStep;
