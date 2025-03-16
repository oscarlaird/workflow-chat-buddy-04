
import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";

export const ExtensionStatusIndicator = () => {
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  const checkExtensionStatus = () => {
    const installed = typeof window !== 'undefined' && 
      window.hasOwnProperty('macroAgentsExtensionInstalled') &&
      (window as any).macroAgentsExtensionInstalled === true;
    
    setIsInstalled(installed);
    console.log("Extension status check:", installed);
  };

  useEffect(() => {
    // Check immediately on mount
    checkExtensionStatus();
    
    // Set up interval to check every 500ms
    const intervalId = setInterval(checkExtensionStatus, 500);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
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
