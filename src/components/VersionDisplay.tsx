
import { useEffect, useState } from "react";
import { formatVersion, getCurrentVersion, Version } from "@/lib/version";

const VersionDisplay = () => {
  const [version, setVersion] = useState<Version>(getCurrentVersion());

  useEffect(() => {
    // Update the version display if it changes in localStorage
    const handleStorageChange = () => {
      setVersion(getCurrentVersion());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="text-xs text-gray-500 dark:text-gray-400">
      {formatVersion(version)}
    </div>
  );
};

export default VersionDisplay;
