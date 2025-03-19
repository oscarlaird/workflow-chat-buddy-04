
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import WorkflowPanel from "@/components/WorkflowPanel";
import RunMessage from "@/components/RunMessage";
import { useToast } from "@/components/ui/use-toast";
import { Info, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const WorkflowPage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const params = useParams();
  const [chatId, setChatId] = useState("");
  const [latestRunId, setLatestRunId] = useState<string | null>(null);

  useEffect(() => {
    // First check if ID is in URL params (from route pattern /workflow/:id)
    const idFromParams = params.id;
    
    // If not found in params, check query string (from route pattern /workflow?id=xxx or /workflow?chat_id=xxx)
    const searchParams = new URLSearchParams(location.search);
    const idFromQuery = searchParams.get('id') || searchParams.get('chat_id');
    
    const finalId = idFromParams || idFromQuery;

    if (finalId) {
      console.log("Setting chat ID:", finalId);
      setChatId(finalId);
      
      toast({
        title: "Loading Workflow",
        description: `Attempting to load workflow for chat ID: ${finalId}`,
        variant: "default",
      });

      // Fetch the latest run for this chat
      fetchLatestRun(finalId);
    } else {
      console.log("No chat ID found, setting to empty string");
      setChatId("");
      
      toast({
        title: "No Workflow ID",
        description: "No workflow ID was provided in the URL",
        variant: "destructive",
        action: (
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>Add ?id=your_chat_id or ?chat_id=your_chat_id to the URL or use /workflow/your_chat_id</span>
          </div>
        ),
      });
    }
  }, [location.search, params, toast]);

  const fetchLatestRun = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('runs')
        .select('id')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching latest run:', error);
        return;
      }

      if (data && data.length > 0) {
        setLatestRunId(data[0].id);
      }
    } catch (err) {
      console.error('Exception when fetching latest run:', err);
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950">
      <div className="h-full p-4">
        <div className="h-full glass-panel flex flex-col">
          {chatId ? (
            <>
              {latestRunId ? (
                <div className="px-4 pt-4">
                  <RunMessage runId={latestRunId} />
                </div>
              ) : (
                <div className="flex justify-center py-4 px-4">
                  <div className="w-full max-w-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-amber-700 dark:text-amber-300">
                    <p className="text-sm flex items-center">
                      <Info className="h-4 w-4 mr-2 flex-shrink-0" />
                      No active run found for this workflow
                    </p>
                  </div>
                </div>
              )}
              
              <div className="mt-2 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                Workflow Steps
              </div>
              
              <div className="flex-grow overflow-auto p-4 pt-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  <WorkflowPanel 
                    chatId={chatId}
                    showRunButton={false}
                    showInputs={false}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col h-full items-center justify-center p-6 text-center">
              <Info className="w-12 h-12 text-gray-400 mb-4" />
              <h2 className="text-xl font-medium mb-2">No Workflow ID Provided</h2>
              <p className="text-gray-500 max-w-md">
                Please specify a workflow ID by adding ?id=your_chat_id or ?chat_id=your_chat_id to the URL or using /workflow/your_chat_id to view workflow details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowPage;
