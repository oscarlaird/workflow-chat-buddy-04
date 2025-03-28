
import { useState, useEffect } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Code2, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CodeBlock from "@/components/CodeBlock";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PythonCodeDisplayProps {
  chatId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const PythonCodeDisplay = ({ chatId, isOpen, onOpenChange }: PythonCodeDisplayProps) => {
  const [pythonCode, setPythonCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch Python code from messages table
  const fetchPythonCode = async () => {
    if (!chatId) return;
    
    setIsLoading(true);
    try {
      // Fetch the latest non-null script from messages table
      const { data, error } = await supabase
        .from('messages')
        .select('script')
        .eq('chat_id', chatId)
        .not('script', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error) {
        console.error('Error fetching Python code:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setPythonCode(data[0].script);
      }
    } catch (err) {
      console.error('Exception when fetching Python code:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch Python code on initial load
    fetchPythonCode();
    
    // Subscribe to real-time updates for all messages in this chat
    const channel = supabase
      .channel(`messages-with-script-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          // Only process if the message has a script
          if (payload.new && 'script' in payload.new && payload.new.script) {
            console.log('Message with script updated:', payload.new);
            setPythonCode(payload.new.script);
          }
        }
      )
      .subscribe();
    
    // Clean up the subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  if (!chatId) return null;

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 h-full flex flex-col">
      <Collapsible 
        open={isOpen} 
        onOpenChange={onOpenChange} 
        className="w-full h-full flex flex-col"
      >
        <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <div className="flex items-center">
            <Code2 className="w-4 h-4 mr-2" />
            <span>Python Code</span>
          </div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="flex-grow overflow-hidden">
          <div className="p-0 w-full h-full">
            {isLoading ? (
              <div className="p-4 text-sm text-gray-500">Loading...</div>
            ) : pythonCode ? (
              <ScrollArea className="w-full h-full" type="always">
                <CodeBlock code={pythonCode} language="python" />
              </ScrollArea>
            ) : (
              <div className="p-4 text-sm text-gray-500">No Python code available for this workflow.</div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PythonCodeDisplay;
