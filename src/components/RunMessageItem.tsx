
import React from "react";
import { Separator } from "@/components/ui/separator";
import { BrowserEvent, RunMessageSenderType } from "@/types";

interface RunMessageItemProps {
  message: BrowserEvent;
  isLast?: boolean;
}

export const RunMessageItem = ({ message, isLast = false }: RunMessageItemProps) => {
  const formattedTime = new Date(message.created_at).toLocaleTimeString();
  
  return (
    <>
      <div className="py-0.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
        <div className="flex items-center gap-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs">
                <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {message.type}
                </span>
                {message.sender_type && (
                  <span className="px-0.5 rounded-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {message.sender_type}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">
                {formattedTime}
              </span>
            </div>
            
            {message.display_text && (
              <div className="mt-1 text-sm">
                {message.display_text}
              </div>
            )}
          </div>
        </div>
      </div>
      {!isLast && <Separator className="my-0.5" />}
    </>
  );
};

export default RunMessageItem;
