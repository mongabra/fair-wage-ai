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

    // Process each employee
    for (const employee of employees) {
      const { employeeName, jobTitle, education, experience, location, currentWage } = employee;
      
      const prompt = `As a wage fairness expert, analyze this employment situation:

Job Title: ${jobTitle}
Education: ${education}
Experience: ${experience} years
Location: ${location}
Current Annual Wage: KES ${currentWage}

Based on market standards for Kenya, assess if this wage is fair. Consider:
1. Industry standards for this role
2. Education requirements and compensation
3. Experience level impact on salary
4. Cost of living in ${location}
5. Current market trends in Kenya

Provide:
1. A predicted fair wage (number only)
2. A status: "Below Market Average", "Fair Wage", or "Above Market Average"
3. A confidence score (0-100)
4. A brief explanation (2-3 sentences)

Format your response as JSON:
{
  "predictedWage": number,
  "status": "status here",
  "confidence": number,
  "message": "explanation here"
}`;

      try {
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
            throw new Error("Rate limit exceeded. Please try again later.");
          }
          if (response.status === 402) {
            throw new Error("AI credits exhausted. Please contact support.");
          }
          throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        
        let result;
        try {
          const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || 
                           aiResponse.match(/```\n([\s\S]*?)\n```/) ||
                           [null, aiResponse];
          result = JSON.parse(jsonMatch[1] || aiResponse);
        } catch (parseError) {
          console.error('Failed to parse AI response:', parseError);
          result = {
            predictedWage: currentWage,
            status: "Fair Wage",
            confidence: 70,
            message: "Unable to perform detailed analysis."
          };
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
          predicted_wage: result.predictedWage,
          assessment_status: result.status,
          confidence: result.confidence,
          message: result.message,
        });

        results.push({
          employeeName,
          ...result
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
