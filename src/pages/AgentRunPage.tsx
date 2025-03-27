
import { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CircleFadingPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AgentRunPage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const params = useParams();
  const [chatId, setChatId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // First check if ID is in URL params (from route pattern /agent_run/:id)
    const idFromParams = params.id;
    
    // If not found in params, check query string (from route pattern /agent_run?id=xxx or /agent_run?chat_id=xxx)
    const searchParams = new URLSearchParams(location.search);
    const idFromQuery = searchParams.get('id') || searchParams.get('chat_id');
    
    const finalId = idFromParams || idFromQuery;

    if (finalId) {
      console.log("Setting chat ID for agent run:", finalId);
      setChatId(finalId);
      
      toast({
        title: "Agent Run Started",
        description: `Agent run started for chat ID: ${finalId}`,
        variant: "default",
      });
    } else {
      console.log("No chat ID found for agent run");
      setChatId("");
    }
  }, [location.search, params, toast]);

  return (
    <div className="h-screen bg-gradient-to-b from-gray-50 to-blue-50 dark:from-gray-950 dark:to-blue-950">
      <div className="h-full">
        <div className="h-full glass-panel flex flex-col p-4">
          <div className="flex flex-col items-center justify-center gap-6 h-full">
            <Card className="w-full max-w-lg bg-white dark:bg-gray-900 border-purple-200 dark:border-purple-800 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
                    <CircleFadingPlus className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-center mt-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                    Agent Run in Progress
                  </h2>
                  
                  <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
                    The AI agent is working on your request. This process may take a few moments.
                  </p>
                  
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mt-4 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <ScrollArea className="w-full max-w-lg max-h-[300px] rounded-lg border border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 p-4">
              <div className="space-y-2">
                <div className="p-2 rounded animate-pulse bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30">
                  <p className="text-sm text-purple-500 dark:text-purple-300">Initializing agent session...</p>
                </div>
                <div className="p-2 rounded animate-pulse bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                  <p className="text-sm text-blue-500 dark:text-blue-300">Loading context data...</p>
                </div>
                <div className="p-2 rounded animate-pulse bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30">
                  <p className="text-sm text-purple-500 dark:text-purple-300">Analyzing request parameters...</p>
                </div>
                <div className="p-2 rounded animate-pulse bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                  <p className="text-sm text-blue-500 dark:text-blue-300">Processing task queue...</p>
                </div>
                <div className="p-2 rounded animate-pulse bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30">
                  <p className="text-sm text-purple-500 dark:text-purple-300">Executing agent functions...</p>
                </div>
              </div>
            </ScrollArea>
            
            {chatId && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chat ID: <span className="font-mono">{chatId}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentRunPage;
