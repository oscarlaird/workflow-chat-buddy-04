
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse the request body to get the message data
    const { conversationId, username, workflowStepId, functionName } = await req.json();
    
    // Create a Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    console.log(`Function called for conversation ${conversationId}${functionName ? ` with function ${functionName}` : ''}${workflowStepId ? ` for workflow step ${workflowStepId}` : ''}`);
    
    // Enable REPLICA IDENTITY FULL for the messages table to capture the old record on updates
    // This is needed for proper realtime filtering
    await supabaseAdmin.query(`
      ALTER TABLE messages REPLICA IDENTITY FULL;
    `);
    
    // Also enable REPLICA IDENTITY FULL for workflow_steps table
    await supabaseAdmin.query(`
      ALTER TABLE workflow_steps REPLICA IDENTITY FULL;
    `);
    
    // Add the tables to the realtime publication if they're not already there
    await supabaseAdmin.query(`
      BEGIN;
      -- Check if the publication exists
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
        ) THEN
          CREATE PUBLICATION supabase_realtime;
        END IF;
      END
      $$;
      
      -- Add the messages table to the publication if it's not already there
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_publication_tables
          WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'messages'
        ) THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
        END IF;
      END
      $$;
      
      -- Add the workflow_steps table to the publication if it's not already there
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_publication_tables
          WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'workflow_steps'
        ) THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_steps;
        END IF;
      END
      $$;
      COMMIT;
    `);
    
    return new Response(
      JSON.stringify({ success: true, message: "Function disabled - not creating assistant response" }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
