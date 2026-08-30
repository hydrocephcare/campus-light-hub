import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Normalize Kenyan phone numbers
function normalizePhoneNumber(phone: string): string {
  phone = phone.trim().replace(/\D+/g, '');
  if (/^254\d{9}$/.test(phone)) return phone;
  if (/^07\d{8}$/.test(phone)) return '254' + phone.substring(1);
  if (/^011\d{7}$/.test(phone)) return '254' + phone.substring(1);
  if (/^\+254\d{9}$/.test(phone)) return phone.substring(1);
  return phone;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { phone, amount, payment_type, donor_name } = await req.json();
    if (!phone || !amount || amount <= 0) return new Response(
      JSON.stringify({ status: 'error', error: 'Phone and valid amount required' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

    const normalizedPhone = normalizePhoneNumber(phone);

    // PayHero credentials from secrets
    const apiUsername = Deno.env.get('PAYHERO_API_USERNAME') || "PSmF5lQYDUEZt1gY1Lls";
    const apiPassword = Deno.env.get('PAYHERO_API_PASSWORD') || "Jr3Aqv3jykzqvdcBGKiX91F35gv7mxW1KREX8y1X";
    const channelId = parseInt(Deno.env.get('PAYHERO_CHANNEL_ID') || "3028");

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) throw new Error('Payment service not configured');

    const externalReference = `TXN-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`;
    const callbackUrl = "https://remote.victoryschoolclub.co.ke/callback.php"; // <-- callback URL

    const paymentData = {
      amount: parseFloat(amount),
      phone_number: normalizedPhone,
      channel_id: channelId,
      provider: "m-pesa",
      external_reference: externalReference,
      customer_name: donor_name || "MKU CU Member",
      payment_type: payment_type || 'tithe',
      callback_url: callbackUrl
    };

    const response = await fetch('https://backend.payhero.co.ke/api/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${apiUsername}:${apiPassword}`)
      },
      body: JSON.stringify(paymentData)
    });

    const responseData = await response.json();

    if (!response.ok) return new Response(
      JSON.stringify({ status: 'error', error: responseData.message || 'Payment initiation failed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

    // Save initial payment to Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error: dbError } = await supabase.from('payments').insert({
      external_reference: externalReference,
      phone_number: normalizedPhone,
      amount: parseFloat(amount),
      status: 'pending',
      payment_type: payment_type || 'tithe',
      donor_name: donor_name || null
    });

    if (dbError) console.error('Database error:', dbError);

    return new Response(
      JSON.stringify({ status: 'success', reference: externalReference }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ status: 'error', error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
