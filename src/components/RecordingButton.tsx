
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Message } from "@/types";
import { Play, Square } from "lucide-react";

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
    if (message.function_name === 'recording_requested') {
      return message.content || 'Click Here to Start Recording';
    } else if (message.function_name === 'recording_progress') {
      return 'Recording in Progress...';
    }
    return 'Record Screen';
  };

  const handleClick = () => {
    if (message.function_name === 'recording_requested' || (message.function_name === 'recording_progress' && !recording)) {
      // Start recording - Create recording window
      setRecording(true);
      
      // Send message to create recording window or start recording
      window.postMessage({
        type: 'CREATE_RECORDING_WINDOW',
        payload: {
          chatId: message.chat_id
        }
      }, '*');
    } else if (message.function_name === 'recording_progress' && recording) {
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
        message.function_name === 'recording_progress' || recording ? 
          'animate-pulse bg-red-50 border-red-200 text-red-700 hover:bg-red-100' : 
          'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
      }`}
    >
      {message.function_name === 'recording_progress' || recording ? (
        <>
          <Square className="w-4 h-4 mr-2" />
          {getButtonText()}
        </>
      ) : (
        <>
          <Play className="w-4 h-4 mr-2" />
          {getButtonText()}
        </>
      )}
    </Button>
  );
};

export default RecordingButton;
