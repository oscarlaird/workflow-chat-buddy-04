
import React from 'react';
import { Loader2, Square, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Run } from '@/types';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './ui/use-toast';

interface RunStatusBubbleProps {
  run: Run | null;
}

const RunStatusBubble: React.FC<RunStatusBubbleProps> = ({ run }) => {
  if (!run) return null;

  const getStatusColor = (inProgress: boolean) => {
    if (inProgress) {
      return 'bg-amber-500 text-white';
    }
    if (run.status.toLowerCase().includes('fail') || run.status.toLowerCase().includes('error')) {
      return 'bg-red-500 text-white';
    }
    if (run.status.toLowerCase().includes('complet')) {
      return 'bg-green-500 text-white';
    }
    return 'bg-gray-500 text-white';
  };

  const handleStopRun = async () => {
    try {
      const { error } = await supabase
        .from('runs')
        .update({ 
          in_progress: false,
          status: 'Stopped by user'
        })
        .eq('id', run.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Run stopped",
        description: "The operation was successfully stopped."
      });
    } catch (error) {
      console.error('Error stopping run:', error);
      toast({
        title: "Failed to stop run",
        description: "An error occurred while trying to stop the operation.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRun = async () => {
    try {
      const { error } = await supabase
        .from('runs')
        .delete()
        .eq('id', run.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Run deleted",
        description: "The run and its associated data have been deleted."
      });
    } catch (error) {
      console.error('Error deleting run:', error);
      toast({
        title: "Failed to delete run",
        description: "An error occurred while trying to delete the run.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex justify-center py-4">
      <div className="bg-muted px-4 py-3 rounded-lg max-w-[80%] flex justify-center">
        <div className="flex items-center gap-3">
          <Badge 
            className={cn(
              "px-3 py-1.5 text-sm font-medium shadow-md flex items-center gap-2", 
              getStatusColor(run.in_progress)
            )}
          >
            {run.in_progress && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            {run.status}
          </Badge>
          
          {run.in_progress ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleStopRun}
              className="flex items-center gap-1 text-destructive hover:bg-destructive/10"
            >
              <Square className="h-4 w-4" />
              <span>Stop</span>
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleDeleteRun}
              className="flex items-center gap-1 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RunStatusBubble;
