
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "@/components/TopBar";
import { supabase } from "@/integrations/supabase/client";
import ChatInterface from "@/components/ChatInterface";
import { useChats } from "@/hooks/useChats";
import { FolderIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ConversationPage = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [chatExists, setChatExists] = useState(false);
  const navigate = useNavigate();
  const { refreshChats } = useChats();

  useEffect(() => {
    const checkChat = async () => {
      if (!id) {
        setChatExists(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('chats')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !data) {
          console.error('Error fetching chat or chat not found:', error);
          setChatExists(false);
        } else {
          setChatExists(true);
        }
      } catch (err) {
        console.error('Error in checkChat:', err);
        setChatExists(false);
      } finally {
        setLoading(false);
      }
    };

    checkChat();
  }, [id]);

  const onSendMessage = () => {
    refreshChats();
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <TopBar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!chatExists || !id) {
    return (
      <div className="flex flex-col h-screen">
        <TopBar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center text-center space-y-4 max-w-md mx-auto">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full">
              <FolderIcon className="h-10 w-10 text-slate-500" />
            </div>
            <h2 className="text-2xl font-bold">Chat not found</h2>
            <p className="text-slate-500 dark:text-slate-400">
              The conversation you're looking for doesn't exist or has been deleted.
            </p>
            <Button
              onClick={() => navigate('/')}
              variant="default"
              className="mt-4"
            >
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <TopBar conversationId={id} />
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
};

export default ConversationPage;
