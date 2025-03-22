
import React from "react";
import { History, Eye } from "lucide-react";

interface MemoryDisplayProps {
  memory?: string;
  previousGoal?: string;
}

const MemoryDisplay = ({ memory, previousGoal }: MemoryDisplayProps) => {
  const hasContent = memory || (previousGoal && previousGoal !== "N/A");
  
  if (!hasContent) return null;
  
  return (
    <div className="space-y-2 my-2 pl-3 border-l-2 border-blue-200 dark:border-blue-800">
      {memory && (
        <div className="flex items-start gap-1.5">
          <History className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-medium text-blue-600 dark:text-blue-400">Memory:</span> 
            <span className="text-gray-700 dark:text-gray-300">{memory}</span>
          </div>
        </div>
      )}
      
      {previousGoal && previousGoal !== "N/A" && (
        <div className="flex items-start gap-1.5">
          <Eye className="h-3.5 w-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-medium text-purple-600 dark:text-purple-400">Previous Goal:</span> 
            <span className="text-gray-700 dark:text-gray-300">{previousGoal}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryDisplay;
