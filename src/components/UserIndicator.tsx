
import { User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface UserIndicatorProps {
  username: string;
  className?: string;
}

const UserIndicator = ({ username, className }: UserIndicatorProps) => {
  const initial = username.charAt(0).toUpperCase();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-sm font-medium transition-colors", 
              className
            )}
          >
            <div className="flex items-center gap-2 p-1">
              <User className="w-4 h-4" />
              <span className="hidden lg:inline-block">{username}</span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Signed in as: {username}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UserIndicator;
