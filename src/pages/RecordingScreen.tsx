
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video, Square } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";

const RecordingScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const chatId = queryParams.get('chat_id');

  useEffect(() => {
    // Listen for recording status changes
    const handleRecordingStatus = (event: MessageEvent) => {
      if (event.data && event.data.type === "RECORDING_STATUS") {
        setIsRecording(event.data.isRecording);
      }
    };

    window.addEventListener("message", handleRecordingStatus);
    
    // Notify the parent window that the recording screen is ready
    window.parent.postMessage({
      type: "RECORDING_SCREEN_READY",
      chatId: chatId
    }, "*");
    
    return () => window.removeEventListener("message", handleRecordingStatus);
  }, [chatId]);

  const addRecordingProgressMessage = async () => {
    if (!chatId) return;
    
    try {
      const messageId = uuidv4();
      
      const messageData = {
        id: messageId,
        chat_id: chatId,
        role: 'assistant',
        content: 'Recording in Progress...',
        function_name: 'recording_progress',
        is_currently_streaming: false,
        username: 'system' // Required username field
      };
      
      await supabase.from('messages').insert(messageData);
    } catch (error) {
      console.error('Error adding recording_progress message:', error);
    }
  };

  const handleToggleRecording = async () => {
    // Toggle recording state
    const newRecordingState = !isRecording;
    setIsRecording(newRecordingState);
    
    // Send message to parent window to start/stop recording
    if (newRecordingState) {
      // Start recording
      window.parent.postMessage({
        type: 'START_RECORDING',
        payload: { chatId }
      }, '*');
      
      // Add a recording_progress message
      await addRecordingProgressMessage();
    } else {
      // Stop recording
      window.parent.postMessage({
        type: 'STOP_RECORDING',
        payload: { chatId }
      }, '*');
    }
    
    // Also notify the main chat window to update recording buttons
    window.parent.postMessage({
      type: 'RECORDING_STATUS',
      isRecording: newRecordingState
    }, '*');
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full glass-panel p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Screen Recording</h1>
        
        <div className="space-y-6 mb-8">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <h2 className="font-medium text-lg mb-2">Instructions:</h2>
            <ol className="text-left space-y-2 text-sm">
              <li>1. Click this window to be recorded - your entire window will be recorded</li>
              <li>2. Do your steps as you would normally</li>
              <li>3. Once you are done, click the stop recording button</li>
              <li>4. Review the recording to make sure it is correct</li>
            </ol>
          </div>
          
          <Button 
            onClick={handleToggleRecording}
            className={`w-full py-6 text-lg ${isRecording ? 
              'bg-red-500 hover:bg-red-600 animate-pulse' : 
              'bg-purple-600 hover:bg-purple-700'}`}
          >
            {isRecording ? (
              <>
                <Square className="w-5 h-5 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Video className="w-5 h-5 mr-2" />
                Record Your Screen
              </>
            )}
          </Button>
        </div>
        
        {isRecording && (
          <div className="text-red-500 animate-pulse font-medium">
            Recording in progress...
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingScreen;
