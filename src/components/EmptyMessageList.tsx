
import React from "react";

export const EmptyMessageList = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center text-gray-500 dark:text-gray-400">
        <p className="text-lg mb-2">Start a new conversation</p>
        <p className="text-sm">Describe what you'd like to build a workflow for.</p>
      </div>
    </div>
  );
};

export default EmptyMessageList;
