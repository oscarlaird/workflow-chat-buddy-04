import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Video, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const RecordingScreen = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Listen for messages from the background script
    const handleBackgroundMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "RECORDING_ERROR") {
        setHasError(true);
      }
    };

    window.addEventListener("message", handleBackgroundMessage);
    return () => window.removeEventListener("message", handleBackgroundMessage);
  }, []);

  const handleToggleRecording = () => {
    if (!chatId) {
      console.error("Chat ID is missing");
      return;
    }

    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      window.postMessage({ type: 'STOP_RECORDING', payload: { chatId } }, '*');
    } else {
      // Start recording
      setIsRecording(true);
      window.postMessage({ type: 'START_RECORDING', payload: { chatId } }, '*');
    }
  };

  const closeWindow = () => {
    navigate(`/`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 p-3 shadow-md z-10 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Screen Recording</h1>
        <button 
          onClick={closeWindow}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" />
          </svg>
        </button>
      </div>
      
      <div className="flex-1 pt-16 p-6 overflow-auto">
        <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold mb-2">
              {isRecording ? "Recording in progress..." : "Ready to capture"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isRecording 
                ? "Your screen is being recorded. Click 'Stop Recording' when you're done." 
                : "Click the button below to record your screen and capture your workflow."}
            </p>
          </div>
          
          {hasError && (
            <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
              <p>There was a problem starting the recording. Please make sure you've granted permission to record your screen.</p>
            </div>
          )}
          
          <Button 
            onClick={handleToggleRecording}
            className={`w-full py-6 text-lg ${isRecording ? 
              'bg-red-500 hover:bg-red-600 animate-pulse' : 
              'bg-gray-700 hover:bg-gray-800'}`}
          >
            {isRecording ? (
              <>
                <Square className="w-5 h-5 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Video className="w-5 h-5 mr-2" />
                Capture Screen
              </>
            )}
          </Button>
          
          {isRecording && (
            <p className="mt-3 text-center text-red-600 text-sm animate-pulse">
              Recording in progress...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordingScreen;
