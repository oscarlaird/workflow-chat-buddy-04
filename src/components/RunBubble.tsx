
import { useState } from "react";
import { Run } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RunBubbleProps {
  run: Run;
}

export const RunBubble = ({ run }: RunBubbleProps) => {
  const [isStopping, setIsStopping] = useState(false);

  const handleStopRun = async () => {
    if (!run.id || isStopping || !run.in_progress) return;
    
    setIsStopping(true);
    
    try {
      const { error } = await supabase
        .from('runs')
        .update({ 
          in_progress: false,
          status: 'Stopped by user'
        })
        .eq('id', run.id);
        
      if (error) {
        console.error('Error stopping run:', error);
        toast({
          title: "Error",
          description: "Failed to stop run: " + error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Run stopped successfully"
        });
      }
    } catch (err) {
      console.error('Exception when stopping run:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while stopping the run",
        variant: "destructive"
      });
    } finally {
      setIsStopping(false);
    }
  };

  return (
    <Card className="w-[80%] max-w-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
      <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center">
          <div 
            className={`h-2.5 w-2.5 rounded-full mr-2 ${
              run.in_progress 
                ? "bg-amber-500 animate-pulse" 
                : "bg-green-500"
            }`} 
          />
          <span className="font-medium text-sm">
            {run.in_progress ? "Running" : "Completed"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Run #{run.id.slice(0, 8)}
          </span>
          {run.in_progress && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={handleStopRun}
              disabled={isStopping}
            >
              {isStopping ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="py-3">
        <div className="space-y-2">
          <p className="text-sm font-medium">Status: {run.status}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RunBubble;
