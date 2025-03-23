
import { useState, useRef, useEffect } from "react";
import { Film, Play, Clock, Maximize2 } from "lucide-react";
import { Message, Keyframe } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ScreenRecordingDisplayProps {
  message: Message;
}

export const ScreenRecordingDisplay = ({ message }: ScreenRecordingDisplayProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
  const [selectedKeyframe, setSelectedKeyframe] = useState<Keyframe | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Format recording timestamp 
  const recordingDate = new Date();
  const formattedDate = format(recordingDate, "MMM d, yyyy 'at' h:mm a");
  
  // Use screenrecording_url from the message
  const videoUrl = message.screenrecording_url || "";
  
  // Calculate duration or use placeholder
  const duration = message.duration || "45s";
  
  // Fetch keyframes from the database
  useEffect(() => {
    const fetchKeyframes = async () => {
      if (!message.id) return;
      
      const { data, error } = await supabase
        .from('keyframes')
        .select('*')
        .eq('message_id', message.id)
        .order('id', { ascending: true });
        
      if (error) {
        console.error('Error fetching keyframes:', error);
        return;
      }
      
      if (data && data.length > 0) {
        // Convert numeric IDs to strings to match the Keyframe interface
        const formattedKeyframes: Keyframe[] = data.map(item => ({
          id: String(item.id), // Convert numeric ID to string
          message_id: item.message_id,
          screenshot_url: item.screenshot_url || '',
          url: item.url || '',
          tab_title: item.tab_title || '',
          timestamp: item.timestamp || new Date().toISOString()
        }));
        
        setKeyframes(formattedKeyframes);
        // Set the first keyframe as selected by default
        setSelectedKeyframe(formattedKeyframes[0]);
      }
    };
    
    fetchKeyframes();
  }, [message.id]);
  
  // Handle play in modal
  const handlePlayInModal = () => {
    setIsVideoPlaying(true);
    setIsModalOpen(true);
    
    // Play the video when modal opens
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().catch(e => console.error("Error playing video:", e));
      }
    }, 100);
  };
  
  // Handle clicking on a keyframe
  const handleKeyframeClick = (keyframe: Keyframe) => {
    setSelectedKeyframe(keyframe);
    setIsVideoPlaying(false);
    setIsModalOpen(true);
  };
  
  // Handle closing the modal
  const handleCloseModal = (open: boolean) => {
    setIsModalOpen(open);
    if (!open && videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };
  
  // Toggle between video and screenshot in modal
  const toggleVideoPlay = () => {
    setIsVideoPlaying(!isVideoPlaying);
    
    if (!isVideoPlaying && videoRef.current) {
      videoRef.current.play().catch(e => console.error("Error playing video:", e));
    } else if (videoRef.current) {
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
          
          {keyframes.length > 0 ? (
            <div className="mt-4">
              <Carousel className="w-full">
                <CarouselContent>
                  {keyframes.map((keyframe, index) => (
                    <CarouselItem key={keyframe.id} className="basis-1/3">
                      <div 
                        className="relative aspect-video bg-gray-200 dark:bg-gray-800 rounded-md overflow-hidden border border-gray-300 dark:border-gray-700 cursor-pointer group"
                        onClick={() => handleKeyframeClick(keyframe)}
                      >
                        {keyframe.screenshot_url ? (
                          <img 
                            src={keyframe.screenshot_url} 
                            alt={`Screenshot ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Film className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          {index + 1}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          {keyframe.tab_title || 'Unknown page'}
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 mt-2">
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
          )}
        </div>
      </div>
      
      {/* Modal for full screen recording playback or keyframe viewing */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {isVideoPlaying ? 'Screen Recording' : selectedKeyframe?.tab_title || 'Screenshot'}
            </DialogTitle>
          </DialogHeader>
          
          {isVideoPlaying ? (
            // Show video
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
          ) : (
            // Show selected keyframe
            <div className="aspect-video bg-black rounded-md flex items-center justify-center overflow-hidden">
              {selectedKeyframe?.screenshot_url ? (
                <img 
                  src={selectedKeyframe.screenshot_url} 
                  alt="Selected keyframe" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center">
                  <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">
                    Screenshot not available
                  </p>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>
              {selectedKeyframe?.url && !isVideoPlaying ? (
                <a 
                  href={selectedKeyframe.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {selectedKeyframe.url}
                </a>
              ) : (
                <>Recorded on {formattedDate}</>
              )}
            </div>
            <div>
              {videoUrl && (
                <Button variant="outline" size="sm" onClick={toggleVideoPlay}>
                  {isVideoPlaying ? 'View Screenshot' : 'Play Video'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScreenRecordingDisplay;
