
import { formatVersion, getCurrentVersion } from "@/lib/version";

const VersionDisplay = () => {
  const version = getCurrentVersion();

  return (
    <div className="text-xs text-gray-500 dark:text-gray-400">
      {formatVersion(version)}
    </div>
  );
};

export default VersionDisplay;
