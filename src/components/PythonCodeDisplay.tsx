
import { useState, useEffect } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Code2, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CodeBlock from "@/components/CodeBlock";

interface PythonCodeDisplayProps {
  chatId: string;
}

const PythonCodeDisplay = ({ chatId }: PythonCodeDisplayProps) => {
  const [pythonCode, setPythonCode] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch Python code
  const fetchPythonCode = async () => {
    if (!chatId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chats')
        .select('script')
        .eq('id', chatId)
        .single();
        
      if (error) {
        console.error('Error fetching Python code:', error);
        return;
      }
      
      setPythonCode(data.script);
    } catch (err) {
      console.error('Exception when fetching Python code:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch Python code on initial load (if panel is open)
    if (isOpen) {
      fetchPythonCode();
    }
    
    // Subscribe to real-time updates to the 'script' field for this chat
    const channel = supabase
      .channel('script-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chats',
          filter: `id=eq.${chatId}`
        },
        (payload) => {
          console.log('Script updated:', payload);
          // If the component is already rendered, update the pythonCode state
          if (payload.new && 'script' in payload.new) {
            setPythonCode(payload.new.script);
          }
        }
      )
      .subscribe();
    
    // Clean up the subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, isOpen]);

  if (!chatId) return null;

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 mt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
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
        <CollapsibleContent className="px-4 py-2">
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : pythonCode ? (
            <div className="max-w-full">
              <CodeBlock code={pythonCode} language="python" />
            </div>
          ) : (
            <div className="text-sm text-gray-500">No Python code available for this workflow.</div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PythonCodeDisplay;
