
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { tableName } = await req.json();
    
    // Create a Supabase client with SUPERUSER privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    console.log(`Checking REPLICA IDENTITY for table: ${tableName}`);
    
    // Query to check REPLICA IDENTITY status using our new function
    const { data: prevStatus, error: checkError } = await supabaseAdmin.rpc('admin_get_replica_identity', { 
      table_name: tableName 
    });
    
    if (checkError) {
      console.error("Error checking REPLICA IDENTITY:", checkError);
      throw checkError;
    }
    
    console.log(`Current REPLICA IDENTITY for ${tableName}: ${prevStatus}`);
    
    // Only set to FULL if not already FULL
    if (prevStatus !== 'FULL') {
      console.log(`Setting REPLICA IDENTITY FULL for ${tableName}`);
      // Ensure REPLICA IDENTITY is set to FULL for the specified table
      const setReplicaIdentityQuery = `ALTER TABLE ${tableName} REPLICA IDENTITY FULL;`;
      const { error: alterError } = await supabaseAdmin.query(setReplicaIdentityQuery);
      
      if (alterError) {
        console.error("Error setting REPLICA IDENTITY:", alterError);
        throw alterError;
      }
      
      console.log(`Successfully set REPLICA IDENTITY FULL for ${tableName}`);
    } else {
      console.log(`Table ${tableName} already has REPLICA IDENTITY FULL`);
    }
    
    // Ensure the table is in the realtime publication
    const ensurePublicationQuery = `
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_publication_tables 
          WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = '${tableName}'
        ) THEN
          ALTER PUBLICATION supabase_realtime ADD TABLE public.${tableName};
        END IF;
      END
      $$;
    `;
    
    const { error: pubError } = await supabaseAdmin.query(ensurePublicationQuery);
    
    if (pubError) {
      console.error("Error ensuring publication:", pubError);
      throw pubError;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `REPLICA IDENTITY status for ${tableName}: ${prevStatus === 'FULL' ? 'already FULL' : 'set to FULL'}`,
        previousStatus: prevStatus,
        tableAddedToPublication: true
      }),
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
