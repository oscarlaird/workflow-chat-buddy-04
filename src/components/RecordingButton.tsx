
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Message } from "@/types";
import { Video, Square } from "lucide-react";

interface RecordingButtonProps {
  message: Message;
  isInProgress?: boolean;
}

const RecordingButton = ({ message, isInProgress = false }: RecordingButtonProps) => {
  const [recording, setRecording] = useState(isInProgress);

  // Listen for recording status changes
  useEffect(() => {
    const handleRecordingStatus = (event: MessageEvent) => {
      if (event.data && event.data.type === "RECORDING_STATUS") {
        setRecording(event.data.isRecording);
      }
    };

    window.addEventListener("message", handleRecordingStatus);
    return () => window.removeEventListener("message", handleRecordingStatus);
  }, []);

  const getButtonText = () => {
    if (isInProgress) {
      return 'Recording in Progress...';
    }
    return message.content || 'Capture Screen';
  };

  const handleClick = () => {
    if (!recording) {
      // Start recording - Create recording window
      setRecording(true);
      
      // Send message to create recording window or start recording
      window.postMessage({
        type: 'CREATE_RECORDING_WINDOW',
        payload: {
          chatId: message.chat_id
        }
      }, '*');
    } else {
      // Stop recording
      setRecording(false);
      
      // Send message to stop recording
      window.postMessage({
        type: 'STOP_RECORDING',
        payload: {
          chatId: message.chat_id
        }
      }, '*');
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className={`w-full max-w-xs ${
        recording ? 
          'animate-pulse bg-red-50 border-red-300 text-red-700 hover:bg-red-100' : 
          'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
      }`}
    >
      {recording ? (
        <>
          <Square className="w-4 h-4 mr-2" />
          {getButtonText()}
        </>
      ) : (
        <>
          <Video className="w-4 h-4 mr-2" />
          {getButtonText()}
        </>
      )}
    </Button>
  );
};

export default RecordingButton;
