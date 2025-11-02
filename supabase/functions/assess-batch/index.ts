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
    const { employees, companyId } = await req.json();
    
    console.log(`Processing batch assessment for company: ${companyId}, employees: ${employees.length}`);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check and decrement credits
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('company_id', companyId)
      .single();

    if (subError) {
      console.error('Subscription error:', subError);
      return new Response(JSON.stringify({ error: 'Subscription not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (subscription.credits_remaining < employees.length) {
      return new Response(JSON.stringify({ 
        error: 'Insufficient credits',
        creditsNeeded: employees.length,
        creditsAvailable: subscription.credits_remaining
      }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];

    // Process each employee with ML predictions
    for (const employee of employees) {
      const { employeeName, jobTitle, education, experience, location, currentWage } = employee;
      
      try {
        // Step 1: Get ML prediction (fast and free)
        console.log(`Getting ML prediction for ${employeeName}...`);
        const { data: mlResult, error: mlError } = await supabase.functions.invoke('predict-wage-ml', {
          body: { jobTitle, education, experience, location }
        });

        if (mlError) {
          console.error('ML prediction error:', mlError);
          throw new Error('Failed to get wage prediction');
        }

        const { predictedWage, confidence: mlConfidence, modelVersion } = mlResult;
        console.log(`ML prediction for ${employeeName}:`, { predictedWage, mlConfidence });

        // Step 2: Calculate wage status
        const wageDifference = (Number(currentWage) - predictedWage) / predictedWage;
        const percentageDiff = (wageDifference * 100).toFixed(1);
        
        let status: string;
        if (wageDifference < -0.15) {
          status = "Below Market Average";
        } else if (wageDifference > 0.15) {
          status = "Above Market Average";
        } else {
          status = "Fair Wage";
        }

        // Step 3: Generate simple message (without AI to save credits)
        let message = '';
        if (status === "Below Market Average") {
          message = `This wage is ${Math.abs(parseFloat(percentageDiff))}% below the market average of KES ${predictedWage.toLocaleString()} for this role, education level, and location.`;
        } else if (status === "Above Market Average") {
          message = `This wage is ${parseFloat(percentageDiff)}% above the market average of KES ${predictedWage.toLocaleString()} for this role, education level, and location.`;
        } else {
          message = `This wage is within the fair market range (within 15% of KES ${predictedWage.toLocaleString()}) for this role, education level, and location.`;
        }

        // Save to batch_assessments
        await supabase.from('batch_assessments').insert({
          company_id: companyId,
          employee_name: employeeName,
          job_title: jobTitle,
          education: education,
          experience: parseInt(experience),
          location: location,
          current_wage: parseFloat(currentWage),
          predicted_wage: predictedWage,
          assessment_status: status,
          confidence: mlConfidence,
          message: message,
          model_version: modelVersion,
        });

        results.push({
          employeeName,
          predictedWage,
          status,
          confidence: mlConfidence,
          message,
        });

      } catch (error) {
        console.error(`Error processing employee ${employeeName}:`, error);
        results.push({
          employeeName,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Decrement credits
    const newCredits = subscription.credits_remaining - employees.length;
    await supabase
      .from('subscriptions')
      .update({ credits_remaining: newCredits })
      .eq('company_id', companyId);

    return new Response(JSON.stringify({ 
      results,
      creditsRemaining: newCredits
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in assess-batch function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
