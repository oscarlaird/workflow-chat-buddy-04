
import { RunMessage as RunMessageType } from "@/types";
import { 
  Brain, 
  Robot, 
  Eye, 
  FileText, 
  ExternalLink, 
  Zap, 
  PackageCheck, 
  XSquare, 
  AlertTriangle
} from "lucide-react";

interface RunMessageItemProps {
  message: RunMessageType;
}

// Helper function to get the appropriate icon based on message type
const getMessageIcon = (type: string) => {
  switch (type) {
    case 'rationale':
      return <Brain className="h-4 w-4 flex-shrink-0" />;
    case 'command':
      return <Robot className="h-4 w-4 flex-shrink-0" />;
    case 'result':
      return <Eye className="h-4 w-4 flex-shrink-0" />;
    case 'inputs':
      return <FileText className="h-4 w-4 flex-shrink-0" />;
    case 'spawn_window':
      return <ExternalLink className="h-4 w-4 flex-shrink-0" />;
    case 'launch_extension':
      return <Zap className="h-4 w-4 flex-shrink-0" />;
    case 'extension_loaded':
      return <PackageCheck className="h-4 w-4 flex-shrink-0" />;
    case 'close_extension':
      return <XSquare className="h-4 w-4 flex-shrink-0" />;
    case 'abort':
      return <AlertTriangle className="h-4 w-4 flex-shrink-0" />;
    default:
      return <FileText className="h-4 w-4 flex-shrink-0" />;
  }
};

// Helper function to get sender badge color
const getSenderBadgeColor = (sender: string) => {
  switch (sender) {
    case 'dashboard':
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case 'backend':
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    case 'extension':
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  }
};

export const RunMessageItem = ({ message }: RunMessageItemProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 transition-all hover:shadow">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {getMessageIcon(message.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
              {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
            </span>
            
            <span className={`text-xs px-2 py-0.5 rounded-full ${getSenderBadgeColor(message.sender_type || 'dashboard')}`}>
              {message.sender_type || 'dashboard'}
            </span>
          </div>
          
          {message.display_text && (
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 break-words">
              {message.display_text}
            </p>
          )}
          
          {(!message.display_text && message.payload) && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-auto max-h-32">
              {typeof message.payload === 'object' 
                ? JSON.stringify(message.payload, null, 2)
                : String(message.payload)
              }
            </div>
          )}
          
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {new Date(message.created_at).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunMessageItem;
