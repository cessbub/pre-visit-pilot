import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    console.log('Extracting patient info from messages:', messages.length);

    // Combine all patient messages for context
    const conversationText = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .join('\n');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: `You are a medical information extraction assistant. Extract structured patient information from conversations.

IMPORTANT RULES:
1. ONLY extract information that is explicitly stated
2. For duration: ONLY extract symptom duration, NOT age (e.g., "pain for 2 weeks" → duration: "2 weeks", but "I am 24" → NOT duration)
3. Return "Not provided" or "Not yet recorded" for missing information
4. Be precise and don't make assumptions

Return a JSON object with this exact structure:
{
  "patientName": "string or 'Not provided'",
  "patientAge": "string or 'Not provided'",
  "patientLocation": "string or 'Not provided'",
  "chiefComplaint": "string or 'Not yet identified'",
  "duration": "string (symptom duration only, NOT age) or 'Not yet recorded'",
  "triggers": ["array of trigger strings"] or [],
  "characteristics": ["array of characteristic strings"] or [],
  "symptoms": ["array of symptoms"] or [],
  "medicalHistory": ["array of conditions"] or [],
  "familyHistory": ["array of family history items"] or [],
  "medications": ["array of medications"] or [],
  "allergies": ["array of allergies"] or [],
  "redFlags": ["array of urgent concerns"] or []
}`
          },
          {
            role: 'user',
            content: `Extract patient information from this conversation:\n\n${conversationText}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedInfo = JSON.parse(data.choices[0].message.content);
    
    console.log('Successfully extracted patient info:', extractedInfo);

    return new Response(JSON.stringify(extractedInfo), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in extract-patient-info function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
