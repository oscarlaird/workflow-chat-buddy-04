
import { useState, useEffect } from "react";

export const useExtensionStatus = (forceExtensionInstalled: boolean = false) => {
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);

  // Handle extension installation check
  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "EXTENSION_INSTALLED") {
        console.log("Extension installation detected in ChatInterface:", event.data);
        setIsExtensionInstalled(true);
      }
    };

    window.addEventListener("message", handleExtensionMessage);
    return () => window.removeEventListener("message", handleExtensionMessage);
  }, []);

  return {
    isExtensionInstalled: isExtensionInstalled || forceExtensionInstalled,
    setIsExtensionInstalled
  };
};

export default useExtensionStatus;
