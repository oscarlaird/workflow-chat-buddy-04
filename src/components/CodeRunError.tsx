
import { ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import CodeBlock from "@/components/CodeBlock";

interface CodeRunErrorProps {
  hasError: boolean;
  error: string;
  errorExpanded: boolean;
  setErrorExpanded: (expanded: boolean) => void;
}

const CodeRunError = ({
  hasError,
  error,
  errorExpanded,
  setErrorExpanded
}: CodeRunErrorProps) => {
  if (!hasError) return null;
  
  return (
    <div className="mt-3 border-t pt-3">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setErrorExpanded(!errorExpanded);
        }}
        className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors mb-2"
      >
        {errorExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <AlertCircle className="w-4 h-4" />
        <span>Error</span>
      </button>
      
      {errorExpanded && (
        <div className="mt-2">
          <CodeBlock code={error} language="plaintext" />
        </div>
      )}
    </div>
  );
};

export default CodeRunError;
