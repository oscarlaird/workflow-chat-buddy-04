
import { memo } from "react";
import { ChevronDown, ChevronRight, Code, Table } from "lucide-react";
import { WorkflowStep as WorkflowStepType } from "@/types";
import CodeBlock from "./CodeBlock";
import DataTable from "./DataTable";
import { useState } from "react";

interface WorkflowStepProps {
  step: WorkflowStepType;
  index: number;
}

export const WorkflowStep = memo(({ step, index }: WorkflowStepProps) => {
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
    <div className={`workflow-step ${getStatusClass()}`} key={stepKey}>
      <div className="mb-2">
        <h3 className="text-lg font-medium">
          Step {index + 1}: {step.title}
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
    </div>
  );
});

export default WorkflowStep;
