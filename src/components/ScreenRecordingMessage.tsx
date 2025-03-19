
import { Film } from "lucide-react";
import { ScreenRecording } from "@/hooks/useConversations";

interface ScreenRecordingMessageProps {
  messageId: string;
  screenRecordings: Record<string, ScreenRecording>;
}

export const ScreenRecordingMessage = ({ messageId, screenRecordings }: ScreenRecordingMessageProps) => {
  const recording = screenRecordings[messageId];
  
  return (
    <div className="flex justify-center my-4">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-md text-sm font-medium">
        <Film className="w-4 h-4" />
        <span>
          {recording?.duration 
            ? `Screen recording, ${recording.duration}` 
            : "Screen recording"}
        </span>
      </div>
    </div>
  );
};

export default ScreenRecordingMessage;
