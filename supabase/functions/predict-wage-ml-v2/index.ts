import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobTitle, education, experience, location } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Use AI to predict fair wage based on Kenya market knowledge
    const prompt = `As a Kenya labor market expert, analyze this job profile and predict a fair monthly wage in KES:

Job Title: ${jobTitle}
Education Level: ${education}
Years of Experience: ${experience}
Location: ${location}

Based on your knowledge of:
- Kenya's job market and industry standards
- Cost of living variations across counties
- Education and experience impact on compensation
- Current market rates for similar roles

Provide your analysis in this EXACT JSON format (no additional text):
{
  "predictedWage": <number in KES>,
  "confidence": <number between 70-95>,
  "wageRange": {
    "min": <number in KES>,
    "max": <number in KES>
  },
  "reasoning": "<brief 1-sentence explanation of key factors>"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are a Kenya labor market expert. Always respond with valid JSON only, no markdown formatting or additional text.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
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
    let aiResponse = data.choices[0].message.content.trim();
    
    // Clean up response (remove markdown code blocks if present)
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const prediction = JSON.parse(aiResponse);

    // Get model version
    const { data: modelVersion } = await supabase
      .from('ml_model_versions')
      .select('version')
      .eq('is_active', true)
      .eq('model_type', 'ai_powered')
      .single();

    const result = {
      predictedWage: Math.round(prediction.predictedWage),
      confidence: prediction.confidence,
      wageRange: {
        min: Math.round(prediction.wageRange.min),
        max: Math.round(prediction.wageRange.max)
      },
      modelVersion: modelVersion?.version || 'v3.0-ai-powered',
      metadata: {
        reasoning: prediction.reasoning,
        model: 'google/gemini-2.5-flash'
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in predict-wage-ml-v2:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
