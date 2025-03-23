
import { ChevronDown, ChevronRight, Terminal } from "lucide-react";
import CodeBlock from "@/components/CodeBlock";

interface CodeRunOutputProps {
  hasOutput: boolean;
  output: string;
  outputExpanded: boolean;
  setOutputExpanded: (expanded: boolean) => void;
}

const CodeRunOutput = ({
  hasOutput,
  output,
  outputExpanded,
  setOutputExpanded
}: CodeRunOutputProps) => {
  if (!hasOutput) return null;
  
  return (
    <div className="mt-3 border-t pt-3">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOutputExpanded(!outputExpanded);
        }}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors mb-2"
      >
        {outputExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <Terminal className="w-4 h-4" />
        <span>Output</span>
      </button>
      
      {outputExpanded && (
        <div className="mt-2">
          <CodeBlock code={output} language="plaintext" />
        </div>
      )}
    </div>
  );
};

export default CodeRunOutput;
