
import { Video, Square, CheckCircle, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const RecordingScreen = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Extract chat_id from URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const chatIdParam = queryParams.get('chat_id');
    setChatId(chatIdParam);

    // Listen for recording status messages
    const handleRecordingStatus = (event: MessageEvent) => {
      if (event.data && event.data.type === "RECORDING_STATUS") {
        setIsRecording(event.data.isRecording);
      }
    };

    window.addEventListener("message", handleRecordingStatus);
    
    // Check if we should show extension UI
    const isExtension = window.location.search.includes('extension=true');
    
    // When running in extension mode, send ready message
    if (isExtension && chatIdParam) {
      window.parent.postMessage({
        type: 'RECORDING_SCREEN_READY',
        payload: {
          chatId: chatIdParam
        }
      }, '*');
    }
    
    return () => window.removeEventListener("message", handleRecordingStatus);
  }, [location]);

  const handleRecordingToggle = () => {
    if (!chatId) return;
    
    if (!isRecording) {
      // Start recording
      window.parent.postMessage({
        type: 'START_RECORDING',
        payload: { chatId }
      }, '*');
    } else {
      // Stop recording
      window.parent.postMessage({
        type: 'STOP_RECORDING',
        payload: { chatId }
      }, '*');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
        <div className="container mx-auto">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Screen Recording
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {chatId ? `Recording for chat: ${chatId}` : 'No chat ID provided'}
          </p>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
              isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'
            }`}>
              {isRecording ? (
                <Square className="w-10 h-10" />
              ) : (
                <Video className="w-10 h-10" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold mb-2">
              {isRecording ? 'Recording in Progress' : 'Ready to Record'}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {isRecording 
                ? 'Your screen is currently being recorded.' 
                : 'Click the button below to start recording your screen.'}
            </p>
            
            <button
              onClick={handleRecordingToggle}
              className={`px-6 py-3 rounded-md font-medium flex items-center justify-center mx-auto ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-5 h-5 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Video className="w-5 h-5 mr-2" />
                  Start Recording
                </>
              )}
            </button>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-500" />
              Instructions
            </h3>
            
            <ol className="space-y-4 pl-6 list-decimal">
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Click this window to be recorded</span> - 
                Your entire window will be captured in the recording.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Perform your steps as you would normally</span> - 
                Demonstrate the process you want to capture.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Once you are done, click the Stop Recording button</span> - 
                This will finish the recording process.
              </li>
              <li className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Review the recording</span> - 
                Make sure it captures everything you intended before submitting.
              </li>
            </ol>
          </div>
          
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md flex items-start">
            <CheckCircle className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-300">Tips for a good recording</h4>
              <ul className="mt-2 space-y-2 text-sm text-blue-700 dark:text-blue-300">
                <li>Keep your recording focused and concise.</li>
                <li>Narrate what you're doing if it helps explain the process.</li>
                <li>Ensure private information is not visible in the recording.</li>
                <li>Move your cursor slowly to make it easier to follow.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecordingScreen;
