import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const input = await req.json();
    
    console.log('Callback received:', JSON.stringify(input));

    if (!input || !input.status) {
      return new Response(
        JSON.stringify({ error: 'Invalid callback data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const response = input.response;
    if (!response) {
      return new Response(
        JSON.stringify({ error: 'Invalid callback data - no response' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Determine the correct User_Reference and Status from different possible payloads
    const userReference = response.User_Reference ?? response.ExternalReference ?? null;
    const statusText = response.Status ?? null;

    if (!userReference || !statusText) {
      console.error('Missing User_Reference or Status in response');
      return new Response(
        JSON.stringify({ error: "Missing 'User_Reference' or 'Status' in response" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Map PayHero status to local status keys
    const statusMap: Record<string, string> = {
      'success': 'success',
      'failed': 'failed',
      'cancelled': 'failed',
      'pending': 'pending'
    };

    const status = statusMap[statusText.toLowerCase()] ?? 'pending';

    // Update payment status in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing');
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: dbError } = await supabase
      .from('payments')
      .update({
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('external_reference', userReference);

    if (dbError) {
      console.error('Database update error:', dbError);
    } else {
      console.log(`Payment ${userReference} updated to status: ${status}`);
    }

    return new Response(
      JSON.stringify({ status: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Callback processing error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
