
import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";

export const ExtensionStatusIndicator = () => {
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if extension status is already stored
    const storedStatus = localStorage.getItem('extension_installed');
    if (storedStatus === 'true') {
      setIsInstalled(true);
    }

    // Function to handle messages from the extension
    const handleExtensionMessage = (event: MessageEvent) => {
      // Check if the message is from our extension
      if (event.data && event.data.type === "EXTENSION_INSTALLED") {
        console.log("Extension installation detected via message:", event.data);
        setIsInstalled(true);
        localStorage.setItem('extension_installed', 'true');
      }
    };

    // Add the event listener
    window.addEventListener("message", handleExtensionMessage);
    
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("message", handleExtensionMessage);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium">
      {isInstalled ? (
        <div className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">
          <Check className="w-4 h-4" />
          <span>Extension Installed</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded">
          <X className="w-4 h-4" />
          <span>Extension Not Installed</span>
        </div>
      )}
    </div>
  );
};

export default ExtensionStatusIndicator;
