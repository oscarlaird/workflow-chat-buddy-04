
import React from "react";
import { Zap } from "lucide-react";
import { getActionDescription } from "@/utils/runMessageUtils";

interface ActionsListProps {
  actions: any[];
  isActive: boolean;
  hasDoneAction: boolean;
}

const ActionsList = ({ actions, isActive, hasDoneAction }: ActionsListProps) => {
  return (
    <div className={`space-y-0.5 p-2 rounded-md ${
      isActive && !hasDoneAction 
        ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 shadow-sm animate-pulse" 
        : "bg-gray-50 dark:bg-gray-800/30"
    }`}>
      <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
        <Zap className={`h-3.5 w-3.5 ${isActive && !hasDoneAction ? "text-blue-500 animate-pulse" : "text-gray-500"}`} />
        <span>Actions{isActive && !hasDoneAction ? " (In Progress)" : ""}</span>
      </div>
      {actions.map((actionObj: any, index: number) => {
        const actionType = Object.keys(actionObj)[0];
        return (
          <div 
            key={`${actionType}-${index}`} 
            className={`pl-2 mb-1 border-l-2 ${
              actionType === 'done' && actionObj.done.success 
                ? "border-green-400 dark:border-green-600" 
                : "border-gray-200 dark:border-gray-700"
            } ${isActive && index === actions.length - 1 && !hasDoneAction ? "animate-pulse" : ""}`}
          >
            {getActionDescription(actionObj)}
          </div>
        );
      })}
    </div>
  );
};

export default ActionsList;
