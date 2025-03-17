
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
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting image copy process');

    // File paths to copy
    const filesToCopy = [
      '/lovable-uploads/3787fcb9-6ee1-4dc1-8ba4-f128921dac07.png',
      '/lovable-uploads/d77919d8-ec33-4b18-88e4-b0bd6273c649.png',
      '/lovable-uploads/1b371124-f8f8-4ab5-8d93-541f9c1b0bfd.png',
      '/lovable-uploads/3651c761-43bf-424a-b48f-6b0ae1f45811.png'
    ];

    const copyResults = [];

    for (const filePath of filesToCopy) {
      try {
        // Get the file name from the path
        const fileName = filePath.split('/').pop();
        
        // Construct a proper URL for fetching
        // For development, use the request's origin or fallback to the Supabase URL
        let baseUrl;
        const requestOrigin = req.headers.get('origin');
        
        if (requestOrigin) {
          baseUrl = requestOrigin;
        } else {
          // Fallback to a hardcoded URL that matches your development server
          baseUrl = 'http://localhost:8080';
        }
        
        const fileUrl = `${baseUrl}${filePath}`;
        console.log(`Attempting to fetch file from: ${fileUrl}`);
        
        const fileResponse = await fetch(fileUrl, {
          headers: {
            'Accept': 'image/png,image/*',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!fileResponse.ok) {
          throw new Error(`Failed to fetch file: ${fileResponse.status} ${fileResponse.statusText}`);
        }
        
        // Check content type
        const contentType = fileResponse.headers.get('content-type');
        console.log(`File ${fileName} content type: ${contentType}`);
        
        // Get the file as an array buffer
        const fileBuffer = await fileResponse.arrayBuffer();
        console.log(`File ${fileName} size: ${fileBuffer.byteLength} bytes`);
        
        if (fileBuffer.byteLength === 0) {
          throw new Error('File is empty');
        }
        
        // Upload to Supabase Storage
        const { data, error } = await supabaseAdmin.storage
          .from('workflow-screenshots')
          .upload(fileName, fileBuffer, {
            contentType: contentType || 'image/png',
            upsert: true
          });
        
        if (error) {
          throw error;
        }
        
        console.log(`Successfully uploaded ${fileName} to Supabase storage`);
        
        // Get the public URL
        const { data: urlData } = supabaseAdmin.storage
          .from('workflow-screenshots')
          .getPublicUrl(fileName);
        
        copyResults.push({
          originalPath: filePath,
          newPath: urlData.publicUrl,
          success: true
        });
        
      } catch (err) {
        console.error(`Error copying file ${filePath}:`, err.message);
        copyResults.push({
          originalPath: filePath,
          error: err.message,
          success: false
        });
      }
    }

    // Log the final results
    console.log('Image copy results:', JSON.stringify(copyResults, null, 2));

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Image copy operation completed", 
        results: copyResults 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in edge function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error',
        stack: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
