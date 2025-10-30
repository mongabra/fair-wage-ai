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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Create prompt for AI wage assessment
    const prompt = `As a wage fairness expert, analyze this employment situation:

Job Title: ${jobTitle}
Education: ${education}
Experience: ${experience} years
Location: ${location}
Monthly Wage: KES ${wage}

Based on market standards for Kenya, assess if this wage is fair. Consider:
1. Industry standards for this role
2. Education requirements and compensation
3. Experience level impact on salary
4. Cost of living in ${location}
5. Current market trends in Kenya

Provide:
1. A status: "Below Market Average", "Fair Wage", or "Above Market Average"
2. A confidence score (0-100)
3. A brief explanation (2-3 sentences)

Format your response as JSON:
{
  "status": "status here",
  "confidence": number,
  "message": "explanation here"
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
          { role: 'system', content: 'You are a wage fairness analyst. Always respond with valid JSON.' },
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
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI response:', aiResponse);

    // Parse AI response
    let result;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                       aiResponse.match(/```\n([\s\S]*?)\n```/) ||
                       [null, aiResponse];
      result = JSON.parse(jsonMatch[1] || aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to simple assessment
      result = {
        status: "Fair Wage",
        confidence: 70,
        message: "Unable to perform detailed analysis. This appears to be a reasonable wage for the given role and experience."
      };
    }

    // Save assessment to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
