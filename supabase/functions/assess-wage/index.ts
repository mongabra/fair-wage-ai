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
    const { jobTitle, education, experience, location, wage } = await req.json();
    
    console.log('Assessing wage for:', { jobTitle, education, experience, location, wage });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Get ML prediction (using v2 model)
    console.log('Calling ML prediction v2 function...');
    const { data: mlResult, error: mlError } = await supabase.functions.invoke('predict-wage-ml-v2', {
      body: { jobTitle, education, experience, location }
    });

    if (mlError) {
      console.error('ML prediction error:', mlError);
      throw new Error('Failed to get wage prediction');
    }

    const { predictedWage, confidence: mlConfidence, modelVersion } = mlResult;
    console.log('ML prediction:', { predictedWage, mlConfidence, modelVersion });

    // Step 2: Calculate wage status based on ML prediction
    const wageDifference = (Number(wage) - predictedWage) / predictedWage;
    const percentageDiff = (wageDifference * 100).toFixed(1);
    
    let status: string;
    if (wageDifference < -0.15) {
      status = "Below Market Average";
    } else if (wageDifference > 0.15) {
      status = "Above Market Average";
    } else {
      status = "Fair Wage";
    }

    console.log('Wage status:', status, 'Difference:', percentageDiff + '%');

    // Step 3: Get AI explanation with ML context
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create enhanced prompt with ML prediction
    const prompt = `As a wage fairness expert, provide context and explanation for this wage assessment:

Job Title: ${jobTitle}
Education: ${education}
Experience: ${experience} years
Location: ${location}
Current Monthly Wage: KES ${wage}
ML Predicted Fair Wage: KES ${predictedWage}
Difference: ${percentageDiff}%
Status: ${status}

The ML model has determined the fair market wage based on Kenya labor market data. Provide a brief, actionable explanation (2-3 sentences) that:

1. Explains why the current wage is ${status.toLowerCase()}
2. Mentions key factors (education, experience, location impact)
3. Provides actionable insight if wage is below market

Keep it conversational and supportive. Focus on facts from the ML analysis.

Format as plain text (not JSON), 2-3 sentences only.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a helpful wage fairness analyst. Provide clear, concise explanations.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please contact support." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiExplanation = data.choices[0].message.content.trim();
    
    console.log('AI explanation:', aiExplanation);

    // Combine ML prediction with AI explanation
    const result = {
      status,
      confidence: mlConfidence,
      message: aiExplanation,
      predictedWage,
      modelVersion,
    };

    // Step 4: Save enhanced assessment to database
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);

      if (user) {
        await supabase.from('wage_assessments').insert({
          user_id: user.id,
          job_title: jobTitle,
          education: education,
          experience: parseInt(experience),
          location: location,
          wage: parseFloat(wage),
          assessment_status: result.status,
          confidence: result.confidence,
          message: result.message,
          predicted_wage: predictedWage,
          model_version: modelVersion,
          prediction_confidence: mlConfidence,
        });
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in assess-wage function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
