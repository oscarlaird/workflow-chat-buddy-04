
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";

const ScrollToBottom = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const messagesContainer = document.getElementById("messages-container");
    
    if (messagesContainer) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
        const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
        setShowButton(isScrolledUp);
      };
      
      messagesContainer.addEventListener("scroll", handleScroll);
      return () => messagesContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const scrollToBottom = () => {
    const messagesContainer = document.getElementById("messages-container");
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  if (!showButton) return null;

  return (
    <div className="absolute bottom-24 right-4 z-10">
      <Button 
        size="sm" 
        variant="secondary" 
        className="rounded-full h-10 w-10 p-0 shadow-md"
        onClick={scrollToBottom}
      >
        <ChevronDown className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ScrollToBottom;
