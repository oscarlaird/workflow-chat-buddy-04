
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
  ChevronRight
} from "lucide-react";
import CodeBlock from "./CodeBlock";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";

interface RunMessageItemProps {
  message: RunMessageType;
  isLast?: boolean;
}

// Helper function to get the appropriate icon based on message type
const getMessageIcon = (type: MessageType) => {
  switch (type) {
    case MessageType.RATIONALE:
      return <Brain className="h-4 w-4 flex-shrink-0" />;
    case MessageType.COMMAND:
      return <Bot className="h-4 w-4 flex-shrink-0" />;
    case MessageType.RESULT:
      return <Eye className="h-4 w-4 flex-shrink-0" />;
    case MessageType.INPUTS:
      return <FileText className="h-4 w-4 flex-shrink-0" />;
    case MessageType.SPAWN_WINDOW:
      return <ExternalLink className="h-4 w-4 flex-shrink-0" />;
    case MessageType.LAUNCH_EXTENSION:
      return <Zap className="h-4 w-4 flex-shrink-0" />;
    case MessageType.EXTENSION_LOADED:
      return <PackageCheck className="h-4 w-4 flex-shrink-0" />;
    case MessageType.CLOSE_EXTENSION:
      return <XSquare className="h-4 w-4 flex-shrink-0" />;
    case MessageType.ABORT:
      return <AlertTriangle className="h-4 w-4 flex-shrink-0" />;
    default:
      return <FileText className="h-4 w-4 flex-shrink-0" />;
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

export const RunMessageItem = ({ message, isLast = false }: RunMessageItemProps) => {
  const hasPayload = message.payload && typeof message.payload === 'object' && Object.keys(message.payload).length > 0;
  const formattedTime = new Date(message.created_at).toLocaleTimeString();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <div 
        className="py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
        onClick={() => hasPayload && setIsOpen(!isOpen)}
      >
        <div className="flex items-start gap-2">
          <div className="mt-0.5">
            {getMessageIcon(message.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                  {message.type}
                </span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${getSenderBadgeColor(message.sender_type)}`}>
                  {message.sender_type}
                </span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                {formattedTime}
              </span>
            </div>
            
            {message.display_text && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 break-words line-clamp-2">
                {message.display_text}
              </p>
            )}
            
            {hasPayload && (
              <Collapsible 
                open={isOpen}
                onOpenChange={setIsOpen}
                className="mt-1"
              >
                <CollapsibleContent className="mt-2 overflow-x-auto">
                  <CodeBlock 
                    code={JSON.stringify(message.payload, null, 2)} 
                    language="json" 
                  />
                </CollapsibleContent>
              </Collapsible>
            )}
            
            {hasPayload && (
              <div className="flex items-center text-xs text-blue-500 mt-1">
                {isOpen ? (
                  <ChevronDown className="h-3 w-3 mr-1" />
                ) : (
                  <ChevronRight className="h-3 w-3 mr-1" />
                )}
                {isOpen ? "Hide" : "Show"} Payload
              </div>
            )}
          </div>
        </div>
      </div>
      {!isLast && <Separator />}
    </>
  );
};

export default RunMessageItem;
