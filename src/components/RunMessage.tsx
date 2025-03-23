
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import RunBubble from "./RunBubble";

interface RunMessageProps {
  runId: string;
  isLatestRun?: boolean;
}

export const RunMessage = ({ runId, isLatestRun = true }: RunMessageProps) => {
  const [run, setRun] = useState<any | null>(null);
  const [runMessages, setRunMessages] = useState<any[]>([]);

  // We'll provide a stub implementation since the real implementation requires tables that don't exist
  useEffect(() => {
    // Simulate loading a run
    const timer = setTimeout(() => {
      setRun({
        id: runId,
        status: "Completed",
        in_progress: false,
        created_at: new Date().toISOString(),
        chat_id: "stub-chat-id"
      });
      
      setRunMessages([
        {
          id: "msg1",
          type: "info",
          display_text: "This is a stub implementation",
          created_at: new Date().toISOString()
        }
      ]);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [runId]);

  if (!run) {
    return (
      <div className="flex justify-center my-4">
        <Card className="w-full max-w-lg border border-blue-200 dark:border-blue-800">
          <CardContent className="py-4 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Loading run information...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center my-4">
      <RunBubble run={run} messages={runMessages} isLatestRun={isLatestRun} />
    </div>
  );
};

export default RunMessage;
