
import React, { useState } from "react";
import { RunMessage as RunMessageType, RunMessageType as MessageType, RunMessageSenderType } from "@/types";
import { 
  Brain, 
  Bot,
  Eye, 
  FileText, 
  ExternalLink, 
  Zap, 
  PackageCheck, 
  XSquare, 
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Globe,
  MousePointer,
  Keyboard,
  Lightbulb,
  History
} from "lucide-react";
import CodeBlock from "./CodeBlock";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface RunMessageItemProps {
  message: RunMessageType;
  isLast?: boolean;
}

// Helper function to get the appropriate icon based on message type
const getMessageIcon = (type: MessageType) => {
  switch (type) {
    case MessageType.RATIONALE:
      return <Brain className="h-3 w-3 flex-shrink-0" />;
    case MessageType.COMMAND:
      return <Bot className="h-3 w-3 flex-shrink-0" />;
    case MessageType.RESULT:
      return <Eye className="h-3 w-3 flex-shrink-0" />;
    case MessageType.INPUTS:
      return <FileText className="h-3 w-3 flex-shrink-0" />;
    case MessageType.SPAWN_WINDOW:
      return <ExternalLink className="h-3 w-3 flex-shrink-0" />;
    case MessageType.LAUNCH_EXTENSION:
      return <Zap className="h-3 w-3 flex-shrink-0" />;
    case MessageType.EXTENSION_LOADED:
      return <PackageCheck className="h-3 w-3 flex-shrink-0" />;
    case MessageType.CLOSE_EXTENSION:
      return <XSquare className="h-3 w-3 flex-shrink-0" />;
    case MessageType.ABORT:
      return <AlertTriangle className="h-3 w-3 flex-shrink-0" />;
    default:
      return <FileText className="h-3 w-3 flex-shrink-0" />;
  }
};

// Helper function to get sender badge color
const getSenderBadgeColor = (sender: RunMessageSenderType) => {
  switch (sender) {
    case RunMessageSenderType.DASHBOARD:
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case RunMessageSenderType.BACKEND:
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    case RunMessageSenderType.EXTENSION:
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  }
};

// Helper function to convert action to human-readable text
const getActionDescription = (action: any) => {
  if (!action) return null;
  
  if (action.go_to_url) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <Globe className="h-3 w-3 text-blue-500" />
        <span>Navigate to: <span className="font-medium">{action.go_to_url.url}</span></span>
      </div>
    );
  } else if (action.click_element) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <MousePointer className="h-3 w-3 text-amber-500" />
        <span>Click element at index: <span className="font-medium">{action.click_element.index}</span></span>
      </div>
    );
  } else if (action.input_text) {
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <Keyboard className="h-3 w-3 text-emerald-500" />
        <span>Type "<span className="font-medium">{action.input_text.text}</span>" at index: {action.input_text.index}</span>
      </div>
    );
  }
  
  return null;
};

// Helper function to render the current state visualization
const renderCurrentState = (currentState: any) => {
  if (!currentState) return null;
  
  return (
    <div className="space-y-2 my-2 pl-3 border-l-2 border-blue-200 dark:border-blue-800">
      {currentState.memory && (
        <div className="flex items-start gap-1.5">
          <History className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-medium text-blue-600 dark:text-blue-400">Memory:</span> 
            <span className="text-gray-700 dark:text-gray-300">{currentState.memory}</span>
          </div>
        </div>
      )}
      
      {currentState.next_goal && (
        <div className="flex items-start gap-1.5">
          <Lightbulb className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-medium text-amber-600 dark:text-amber-400">Next Goal:</span> 
            <span className="text-gray-700 dark:text-gray-300">{currentState.next_goal}</span>
          </div>
        </div>
      )}
      
      {currentState.evaluation_previous_goal && currentState.evaluation_previous_goal !== "N/A" && (
        <div className="flex items-start gap-1.5">
          <Eye className="h-3.5 w-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-medium text-purple-600 dark:text-purple-400">Previous Goal:</span> 
            <span className="text-gray-700 dark:text-gray-300">{currentState.evaluation_previous_goal}</span>
          </div>
        </div>
      )}
    </div>
  );
};

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
                {/* Action summary */}
                <div className="space-y-0.5">
                  {message.payload.action.map((action: any, index: number) => {
                    const actionKey = Object.keys(action)[0];
                    return (
                      <div key={`${actionKey}-${index}`}>
                        {getActionDescription(action[actionKey])}
                      </div>
                    );
                  })}
                </div>
                
                {/* Current state visualization */}
                {message.payload.current_state && renderCurrentState(message.payload.current_state)}
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
