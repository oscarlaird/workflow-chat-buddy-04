
import { Message } from "@/types";

interface WorkflowStepMessageProps {
  message: Message;
}

export const WorkflowStepMessage = ({ message }: WorkflowStepMessageProps) => {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-800 dark:text-purple-300">
      <div className="flex flex-col">
        <span className="font-medium">Workflow Step</span>
        {message.content && (
          <div className="text-sm opacity-80 mt-1">
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowStepMessage;
