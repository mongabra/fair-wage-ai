import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  planName: string;
  amount: number;
  credits: number;
  companyId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Decode user from JWT without additional auth call
    const token = authHeader.replace('Bearer', '').trim();
    const parts = token.split('.');
    if (parts.length < 2) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token format' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    let payload: any;
    try {
      payload = JSON.parse(atob(base64));
    } catch (_) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Could not parse token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId: string | undefined = payload?.sub;
    const userEmail: string | undefined = payload?.email;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing user in token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', userId);

    const { planName, amount, credits, companyId }: PaymentRequest = await req.json();
    
    console.log('Payment request:', { planName, amount, credits, companyId, userId });

    // Verify company ownership
    const { data: company, error: companyError } = await supabaseClient
      .from('companies')
      .select('id, created_by')
      .eq('id', companyId)
      .single();

    if (companyError || !company || company.created_by !== userId) {
      console.error('Company verification failed:', companyError);
      return new Response(
        JSON.stringify({ error: 'Company not found or unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        company_id: companyId,
        amount,
        credits_purchased: credits,
        status: 'pending',
        payment_method: 'intasend',
      })
      .select()
      .single();

    if (paymentError || !payment) {
      console.error('Payment creation failed:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Intasend keys
    const intasendPublishableKey = Deno.env.get('INTASEND_PUBLISHABLE_KEY');
    const intasendSecretKey = Deno.env.get('INTASEND_SECRET_KEY');

    if (!intasendPublishableKey || !intasendSecretKey) {
      console.error('Intasend keys not configured');
      return new Response(
        JSON.stringify({ error: 'Payment provider not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine Intasend environment (default to test/sandbox)
    const envMode = (Deno.env.get('INTASEND_ENV') || 'test').toLowerCase();
    const baseUrl = envMode === 'live' ? 'https://payment.intasend.com' : 'https://sandbox.intasend.com';

    const intasendResponse = await fetch(`${baseUrl}/api/v1/checkout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_key: intasendPublishableKey,
        amount: amount,
        currency: 'KES',
        email: userEmail || 'payments@no-reply.local',
        first_name: (userEmail?.split('@')[0] || 'User'),
        last_name: 'Checkout',
        country: 'KE',
        api_ref: payment.id,
        redirect_url: `${(req.headers.get('origin') || new URL(Deno.env.get('SUPABASE_URL') || '').origin)}/billing`,
      }),
    });

    if (!intasendResponse.ok) {
      const errorData = await intasendResponse.text();
      console.error('Intasend API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to initialize payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const intasendData = await intasendResponse.json();
    console.log('Intasend payment initialized:', intasendData);

    return new Response(
      JSON.stringify({
        paymentId: payment.id,
        intasendUrl: intasendData.url,
        intasendRef: intasendData.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in intasend-payment function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
