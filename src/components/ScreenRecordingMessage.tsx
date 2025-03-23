
import { Film } from "lucide-react";
import { Message } from "@/types";

interface ScreenRecordingMessageProps {
  message: Message;
}

export const ScreenRecordingMessage = ({ message }: ScreenRecordingMessageProps) => {
  // Calculate a duration or use the one provided
  const duration = message.duration || "45s";
  
  return (
    <div className="flex justify-center my-4">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-md text-sm font-medium">
        <Film className="w-4 h-4" />
        <span>Screen recording, {duration}</span>
      </div>
    </div>
  );
};

export default ScreenRecordingMessage;
