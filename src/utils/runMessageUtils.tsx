
import { RunMessageSenderType, RunMessageType as MessageType } from "@/types";
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
  Globe,
  MousePointer,
  Keyboard,
  MoveDown,
  MoveUp,
  Check
} from "lucide-react";

// Helper function to get the appropriate icon based on message type
export const getMessageIcon = (type: MessageType) => {
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
export const getSenderBadgeColor = (sender: RunMessageSenderType) => {
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

// Helper function to convert action to human-readable text with improved visualization
export const getActionDescription = (action: any) => {
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
  } else if (action.scroll) {
    const direction = action.scroll.direction || "down";
    const Icon = direction === "up" ? MoveUp : MoveDown;
    return (
      <div className="flex items-center gap-1.5 text-xs">
        <Icon className="h-3 w-3 text-purple-500" />
        <span>Scroll <span className="font-medium">{direction}</span> {action.scroll.amount && `by ${action.scroll.amount}px`}</span>
      </div>
    );
  } else if (action.done) {
    return (
      <div className="flex items-center gap-1.5 text-xs bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
        <span className="font-medium text-green-700 dark:text-green-300">
          {action.done.text || "Task completed"} {action.done.success ? "successfully" : ""}
        </span>
      </div>
    );
  }
  
  return null;
};
