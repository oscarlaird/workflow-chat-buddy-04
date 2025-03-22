
import React from "react";
import { Lightbulb } from "lucide-react";

interface NextGoalDisplayProps {
  goal: string;
  isActive: boolean;
}

const NextGoalDisplay = ({ goal, isActive }: NextGoalDisplayProps) => {
  if (!goal) return null;
  
  return (
    <div className={`flex items-start gap-1.5 ${isActive ? "animate-pulse" : ""}`}>
      <Lightbulb className={`h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0 ${isActive ? "animate-pulse" : ""}`} />
      <div className="text-xs">
        <span className="font-medium text-amber-600 dark:text-amber-400">Goal:</span> 
        <div className={`text-gray-800 dark:text-gray-200 font-medium p-2 rounded-md ${
          isActive 
            ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 shadow-sm animate-pulse" 
            : ""
        }`}>
          {goal}
        </div>
      </div>
    </div>
  );
};

export default NextGoalDisplay;
