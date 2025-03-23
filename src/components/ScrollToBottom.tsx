
import React, { useEffect, useState } from 'react';
import { ArrowDown } from 'lucide-react';

const ScrollToBottom: React.FC = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const messagesContainer = document.getElementById('messages-container');
      if (messagesContainer) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isAtBottom);
      }
    };

    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
    }

    return () => {
      if (messagesContainer) {
        messagesContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const scrollToBottom = () => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  if (!showScrollButton) return null;

  return (
    <button
      onClick={scrollToBottom}
      className="absolute bottom-20 right-8 rounded-full p-2 bg-primary text-white shadow-md hover:bg-primary/90 transition-opacity"
      aria-label="Scroll to bottom"
    >
      <ArrowDown className="h-5 w-5" />
    </button>
  );
};

export default ScrollToBottom;
