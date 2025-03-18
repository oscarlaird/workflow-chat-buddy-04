
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Run } from '@/types';
import { cn } from '@/lib/utils';

interface RunStatusBubbleProps {
  run: Run | null;
}

const RunStatusBubble: React.FC<RunStatusBubbleProps> = ({ run }) => {
  if (!run) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-amber-500 text-white';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'failed':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running':
        return 'Running...';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50">
      <Badge 
        className={cn(
          "px-3 py-1.5 text-sm font-medium shadow-md flex items-center gap-2", 
          getStatusColor(run.status)
        )}
      >
        {run.status === 'running' && (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        )}
        {getStatusText(run.status)}
      </Badge>
    </div>
  );
};

export default RunStatusBubble;
