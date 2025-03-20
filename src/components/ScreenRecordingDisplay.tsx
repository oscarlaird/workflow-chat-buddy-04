
import { useState, useRef } from "react";
import { Film, Play, Clock, Maximize2 } from "lucide-react";
import { Message } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

interface ScreenRecordingDisplayProps {
  message: Message;
  duration?: string;
}

export const ScreenRecordingDisplay = ({ message, duration = "00:45" }: ScreenRecordingDisplayProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videoUrl = message.content || "";
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Format recording timestamp 
  const recordingDate = new Date();
  const formattedDate = format(recordingDate, "MMM d, yyyy 'at' h:mm a");
  
  // Generate timestamps for the preview images (25%, 50%, 75% of the video)
  const handlePlayInModal = () => {
    setIsModalOpen(true);
    // Play the video when modal opens
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(e => console.error("Error playing video:", e));
      }
    }, 100);
  };

  // Stop video when modal closes
  const handleCloseModal = (open: boolean) => {
    setIsModalOpen(open);
    if (!open && videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-6 bg-slate-50 dark:bg-slate-900 rounded-lg overflow-hidden shadow-md">
      <div className="p-4 bg-amber-100 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800/30">
        <div className="flex items-center gap-2">
          <Film className="w-5 h-5 text-amber-700 dark:text-amber-400" />
          <h3 className="font-medium text-amber-800 dark:text-amber-300">Screen Recording</h3>
          <div className="ml-auto flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
            <Clock className="w-4 h-4" />
            <span>{duration}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Recorded on {formattedDate}
            </span>
            <Button 
              onClick={handlePlayInModal}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" /> 
              Play Recording
            </Button>
          </div>
          
          {/* Video element for creating thumbnails */}
          <video className="hidden" src={videoUrl} />
          
          <div className="grid grid-cols-3 gap-2 mt-2">
            {/* For simplicity, use the same video for all thumbnails */}
            {[0, 1, 2].map((index) => (
              <div 
                key={index} 
                className="relative aspect-video bg-gray-200 dark:bg-gray-800 rounded-md overflow-hidden border border-gray-300 dark:border-gray-700 cursor-pointer"
                onClick={handlePlayInModal}
              >
                {videoUrl ? (
                  <video 
                    src={videoUrl}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Film className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                {index === 1 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Modal for full screen recording playback */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Screen Recording</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-black rounded-md flex items-center justify-center">
            {videoUrl ? (
              <video 
                ref={videoRef}
                src={videoUrl} 
                className="w-full h-full rounded-md" 
                controls
              />
            ) : (
              <div className="text-center">
                <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">
                  Video URL not available
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>Recorded on {formattedDate}</div>
            <div>Duration: {duration}</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScreenRecordingDisplay;
