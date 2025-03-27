
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BrowserEvent, Run } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RunStatusBubble from './RunStatusBubble';
import RunMessageItem from './RunMessageItem';

interface RunBubbleProps {
  run: Run;
  messages: BrowserEvent[];
  isLatestRun?: boolean;
}

const RunBubble: React.FC<RunBubbleProps> = ({ run, messages, isLatestRun = true }) => {
  const [expanded, setExpanded] = useState(isLatestRun);
  
  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };
  
  return (
    <Card className="w-full max-w-lg bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800">
      <CardHeader className="px-4 py-2 flex flex-col gap-2 border-b border-blue-100 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Run Details</div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0" 
            onClick={toggleExpanded}
          >
            {expanded ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </Button>
        </div>
        
        <RunStatusBubble run={run} />
      </CardHeader>
      
      {expanded && messages.length > 0 && (
        <CardContent className="p-3 max-h-[300px] overflow-y-auto">
          <div className="space-y-0.5">
            {messages.map((message, idx) => (
              <RunMessageItem 
                key={message.id} 
                message={message} 
                isLast={idx === messages.length - 1}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default RunBubble;
