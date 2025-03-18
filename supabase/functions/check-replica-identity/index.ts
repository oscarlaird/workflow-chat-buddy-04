
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
    
    // Query to check REPLICA IDENTITY status
    const { data, error } = await supabaseAdmin.rpc('admin_get_replica_identity', { 
      table_name: tableName 
    });
    
    if (error) {
      throw error;
    }
    
    // Ensure REPLICA IDENTITY is set to FULL for the specified table
    const setReplicaIdentityQuery = `ALTER TABLE ${tableName} REPLICA IDENTITY FULL;`;
    const { error: alterError } = await supabaseAdmin.query(setReplicaIdentityQuery);
    
    if (alterError) {
      throw alterError;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `REPLICA IDENTITY set to FULL for ${tableName}`,
        previousStatus: data
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
