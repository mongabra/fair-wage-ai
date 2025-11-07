import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const webhookData = await req.json();
    console.log('Received Intasend webhook:', webhookData);

    const { api_ref, state, challenge } = webhookData;

    // Handle Intasend challenge (webhook verification)
    if (challenge) {
      console.log('Responding to Intasend challenge');
      return new Response(
        JSON.stringify({ challenge }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!api_ref) {
      console.error('Missing api_ref in webhook data');
      return new Response(
        JSON.stringify({ error: 'Invalid webhook data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select('*, company_id')
      .eq('id', api_ref)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Payment not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update payment status based on Intasend state
    let paymentStatus = 'pending';
    if (state === 'COMPLETE') {
      paymentStatus = 'completed';
    } else if (state === 'FAILED') {
      paymentStatus = 'failed';
    }

    // Update payment record
    const { error: updatePaymentError } = await supabaseClient
      .from('payments')
      .update({ 
        status: paymentStatus,
        stripe_payment_id: webhookData.id || webhookData.invoice_id,
      })
      .eq('id', api_ref);

    if (updatePaymentError) {
      console.error('Failed to update payment:', updatePaymentError);
      return new Response(
        JSON.stringify({ error: 'Failed to update payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If payment is complete, update subscription credits
    if (paymentStatus === 'completed') {
      console.log('Payment completed, updating credits');
      
      const { data: subscription } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('company_id', payment.company_id)
        .single();

      if (subscription) {
        const { error: updateSubError } = await supabaseClient
          .from('subscriptions')
          .update({
            credits_remaining: subscription.credits_remaining + payment.credits_purchased,
            total_credits: subscription.total_credits + payment.credits_purchased,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);

        if (updateSubError) {
          console.error('Failed to update subscription:', updateSubError);
        } else {
          console.log(`Added ${payment.credits_purchased} credits to subscription`);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in intasend-webhook function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
