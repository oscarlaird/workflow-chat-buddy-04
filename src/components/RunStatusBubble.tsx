
import React from 'react';
import { Loader2, Trash2, ExternalLink } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Run } from '@/types';

interface RunStatusBubbleProps {
  run: Run | null;
}

const RunStatusBubble: React.FC<RunStatusBubbleProps> = ({ run }) => {
  if (!run) return null;

  const getStatusColor = (inProgress: boolean, status: string) => {
    if (inProgress) {
      return 'bg-amber-500 text-white';
    }
    if (status.toLowerCase().includes('fail') || status.toLowerCase().includes('error')) {
      return 'bg-red-500 text-white';
    }
    if (status.toLowerCase().includes('complet')) {
      return 'bg-green-500 text-white';
    }
    return 'bg-gray-500 text-white';
  };

  const handleDeleteRun = async () => {
    console.log('Delete run stub implementation');
    alert('Run deletion is not available in this build');
  };

  const handleJumpToAgentWindow = () => {
    // Updated to navigate to our new agent_run route
    window.open(`/agent_run?chat_id=${run.chat_id}`, '_blank');
  };

  return (
    <div className="flex justify-center py-4">
      <Card className="w-full max-w-md border-blue-200 dark:border-blue-800 bg-gradient-to-b from-blue-50/80 to-blue-50/30 dark:from-blue-950/30 dark:to-blue-950/10">
        <CardContent className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant="default"
              className={`px-3 py-1.5 font-medium ${getStatusColor(run.in_progress, run.status)}`}
            >
              {run.in_progress && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              )}
              {run.status}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {run.in_progress && (
              <Button 
                variant="outline"
                size="sm" 
                onClick={handleJumpToAgentWindow}
                className="flex items-center gap-1 text-blue-500 hover:text-blue-600 border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Jump to agent</span>
              </Button>
            )}
            
            {!run.in_progress && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDeleteRun}
                className="flex items-center gap-1 text-red-500 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RunStatusBubble;
