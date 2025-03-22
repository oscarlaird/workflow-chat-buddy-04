
import React, { useState, useEffect } from "react";
import { RunMessage as RunMessageType, RunMessageType as MessageType, RunMessageSenderType } from "@/types";
import { 
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import CodeBlock from "../CodeBlock";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { getMessageIcon, getSenderBadgeColor } from "@/utils/runMessageUtils";
import NextGoalDisplay from "./NextGoalDisplay";
import ActionsList from "./ActionsList";
import MemoryDisplay from "./MemoryDisplay";
import SuccessAlert from "./SuccessAlert";

interface RunMessageItemProps {
  message: RunMessageType;
  isLast?: boolean;
}

export const RunMessageItem = ({ message, isLast = false }: RunMessageItemProps) => {
  const hasPayload = message.payload && typeof message.payload === 'object' && Object.keys(message.payload).length > 0;
  const formattedTime = new Date(message.created_at).toLocaleTimeString();
  const [isOpen, setIsOpen] = useState(false);
  
  // Check if this is a command from backend with actions
  const isBackendCommand = message.type === MessageType.COMMAND && 
                          message.sender_type === RunMessageSenderType.BACKEND &&
                          message.payload && 
                          message.payload.action && 
                          Array.isArray(message.payload.action);

  // Check for completion action
  const hasDoneAction = isBackendCommand && 
                       message.payload.action.some((action: any) => action.done);

  // Determine if this message has a next goal
  const hasNextGoal = isBackendCommand && 
                    message.payload.current_state && 
                    message.payload.current_state.next_goal;

  // Show toast notification for completed runs
  useEffect(() => {
    if (isLast && hasDoneAction) {
      const doneAction = message.payload.action.find((action: any) => action.done);
      if (doneAction && doneAction.done.success) {
        toast({
          title: "Run Completed",
          description: doneAction.done.text || "The automation run has completed successfully.",
          duration: 5000,
        });
      }
    }
  }, [isLast, hasDoneAction, message.payload]);
  
  return (
    <>
      <div 
        className="py-0.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
        onClick={() => hasPayload && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-1">
          {getMessageIcon(message.type)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs">
                <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {message.type}
                </span>
                <span className={`px-0.5 rounded-sm ${getSenderBadgeColor(message.sender_type)}`}>
                  {message.sender_type}
                </span>
                {hasPayload && (
                  <span className="text-blue-500">
                    {isOpen ? (
                      <ChevronDown className="h-2.5 w-2.5" />
                    ) : (
                      <ChevronRight className="h-2.5 w-2.5" />
                    )}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">
                {formattedTime}
              </span>
            </div>
            
            {/* Visual summary of backend commands */}
            {isBackendCommand && (
              <div className="mt-1">
                {/* Next goal display at the top */}
                {hasNextGoal && (
                  <NextGoalDisplay 
                    goal={message.payload.current_state.next_goal}
                    isActive={isLast && !hasDoneAction}
                  />
                )}
                
                {/* Action summary */}
                {message.payload.action && message.payload.action.length > 0 && (
                  <div className="mt-2">
                    <ActionsList
                      actions={message.payload.action}
                      isActive={isLast && !hasDoneAction}
                      hasDoneAction={hasDoneAction}
                    />
                  </div>
                )}
                
                {/* Memory and previous goal display */}
                {message.payload.current_state && (
                  <MemoryDisplay
                    memory={message.payload.current_state.memory}
                    previousGoal={message.payload.current_state.evaluation_previous_goal}
                  />
                )}

                {/* Success alert for done action */}
                {hasDoneAction && message.payload.action.some((action: any) => action.done && action.done.success) && (
                  <SuccessAlert 
                    text={message.payload.action.find((action: any) => action.done)?.done.text || "The automation run has completed successfully."}
                  />
                )}
              </div>
            )}
            
            {hasPayload && (
              <Collapsible 
                open={isOpen}
                onOpenChange={setIsOpen}
                className="mt-0.5"
              >
                <CollapsibleContent className="overflow-x-auto text-xs">
                  <CodeBlock 
                    code={JSON.stringify(message.payload, null, 2)} 
                    language="json" 
                  />
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </div>
      </div>
      {!isLast && <Separator className="my-0.5" />}
    </>
  );
};

export default RunMessageItem;
