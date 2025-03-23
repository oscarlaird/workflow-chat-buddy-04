
import { useEffect } from "react";

export const useRunEvents = (
  conversationId: string,
  setCurrentRunId: (runId: string | null) => void
) => {
  // Handle workflow run created events
  useEffect(() => {
    const handleWorkflowRunCreated = (event: MessageEvent) => {
      if (event.data && 
          event.data.type === "WORKFLOW_RUN_CREATED" && 
          event.data.chatId === conversationId) {
        console.log("Workflow run created event received:", event.data);
        setCurrentRunId(event.data.runId);
      }
    };

    window.addEventListener("message", handleWorkflowRunCreated);
    return () => window.removeEventListener("message", handleWorkflowRunCreated);
  }, [conversationId, setCurrentRunId]);
};

export default useRunEvents;
