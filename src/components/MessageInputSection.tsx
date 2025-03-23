
import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Camera, X } from "lucide-react";
import ExtensionStatusIndicator from "./ExtensionStatusIndicator";

interface MessageInputSectionProps {
  messageValue: string;
  setMessageValue: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: (inputValue: string) => Promise<string | null>;
  uploadedImages: string[];
  setUploadedImages: React.Dispatch<React.SetStateAction<string[]>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isExtensionInstalled: boolean;
  setIsExtensionInstalled: React.Dispatch<React.SetStateAction<boolean>>;
}

const MessageInputSection: React.FC<MessageInputSectionProps> = ({
  messageValue,
  setMessageValue,
  sendMessage,
  uploadedImages,
  setUploadedImages,
  fileInputRef,
  isExtensionInstalled,
  setIsExtensionInstalled
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendMessage = async () => {
    if (!messageValue.trim() && uploadedImages.length === 0) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare content with image markdown if images exist
      let content = messageValue;
      if (uploadedImages.length > 0) {
        const imageMarkdown = uploadedImages
          .map(img => `![Uploaded Image](${img})`)
          .join("\n");
        
        content = content.trim() 
          ? `${content}\n\n${imageMarkdown}`
          : imageMarkdown;
      }
      
      await sendMessage(content);
      
      // Clear the input field
      setMessageValue("");
      setUploadedImages([]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border-t dark:border-gray-800 bg-background p-4">
      {/* Image preview area */}
      {uploadedImages.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {uploadedImages.map((img, index) => (
            <div key={index} className="relative group">
              <img 
                src={img} 
                alt={`Uploaded ${index}`}
                className="h-20 w-20 object-cover rounded border border-border"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={() => {
            // This onChange is just a placeholder as the actual handler is in the parent component
          }}
        />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleImageUpload}
          className="flex-shrink-0"
        >
          <Camera className="h-5 w-5" />
        </Button>
        
        <div className="relative flex-1">
          <textarea
            value={messageValue}
            onChange={(e) => setMessageValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isSubmitting ? "Sending..." : "Type your message..."}
            className="w-full resize-none rounded-md border p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary"
            rows={1}
            disabled={isSubmitting}
          />
          <button
            onClick={handleSendMessage}
            disabled={(!messageValue.trim() && uploadedImages.length === 0) || isSubmitting}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 bg-primary text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
        
        <div className="flex-shrink-0">
          <ExtensionStatusIndicator 
            isInstalled={isExtensionInstalled}
            setIsInstalled={setIsExtensionInstalled}
            compact={true}
          />
        </div>
      </div>
    </div>
  );
};

export default MessageInputSection;
