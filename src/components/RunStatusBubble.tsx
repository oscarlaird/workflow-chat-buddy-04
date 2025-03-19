
import React from 'react';
import { Loader2, Square, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Run } from '@/types';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './ui/use-toast';
import { Card, CardContent } from './ui/card';

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
      <Card className="w-full max-w-md border-blue-200 dark:border-blue-800 bg-gradient-to-b from-blue-50/80 to-blue-50/30 dark:from-blue-950/30 dark:to-blue-950/10">
        <CardContent className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant="default"
              className={cn(
                "px-3 py-1.5 font-medium", 
                getStatusColor(run.in_progress, run.status)
              )}
            >
              {run.in_progress && (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              )}
              {run.status}
            </Badge>
          </div>
          
          {run.in_progress ? (
            <Button 
              variant="outline"
              size="sm" 
              onClick={handleStopRun}
              className="flex items-center gap-1 text-red-500 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Square className="h-4 w-4" />
              <span>Stop</span>
            </Button>
          ) : (
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
        </CardContent>
      </Card>
    </div>
  );
};

export default RunStatusBubble;
