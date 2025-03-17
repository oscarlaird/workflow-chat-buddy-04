
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
    console.log('Received request to respond-to-message function');
    
    // Parse the request body to get the message data
    const requestData = await req.json();
    console.log('Request data:', requestData);
    
    // Create a Supabase client with the service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Extract message information
    const { message, conversationId, username } = requestData;
    
    // Create an assistant response
    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert({
        chat_id: conversationId,
        role: 'assistant',
        content: 'testing',
        username: username  // Use the same username
      });
    
    if (error) {
      console.error('Error adding assistant message to database:', error);
      throw new Error('Failed to insert assistant message');
    }
    
    console.log('Added assistant response to database');
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in respond-to-message function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
