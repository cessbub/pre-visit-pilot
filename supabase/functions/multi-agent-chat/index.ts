import { corsHeaders } from "../_shared/cors.ts";

interface Message {
  role: "agent" | "patient";
  content: string;
}

interface ChatRequest {
  messages: Message[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages }: ChatRequest = await req.json();
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Convert messages to OpenAI format
    const conversationHistory = messages.map((msg) => ({
      role: msg.role === "agent" ? "assistant" : "user",
      content: msg.content,
    }));

    // Multi-agent orchestration prompts
    const medicalPrompt = `You are the Medical Relevance Agent. Analyze the conversation and identify:
- Clinically significant symptoms or red flags
- Important follow-up questions about medical history that are STILL MISSING
- Symptoms that need deeper exploration
- Whether past medical history, family history, medications, and allergies have been collected

CRITICAL: The interview is NOT complete until we have gathered:
1. Patient demographics (full name, age, location/city)
2. Chief complaint with full details
3. Past medical history (chronic conditions, surgeries, hospitalizations)
4. Family medical history (especially relevant to current symptoms)
5. Current medications (prescription and over-the-counter with dosages if possible)
6. Known allergies

ALWAYS start by asking for: name, age, and location before diving into symptoms.

Return your analysis in JSON format: {"medicalPriority": "high/medium/low", "followUpNeeded": ["question1", "question2"], "redFlags": ["flag1", "flag2"], "missingInfo": ["missing1", "missing2"], "interviewComplete": false}`;

    const empathyPrompt = `You are the Patient Empathy Agent. Analyze the patient's emotional state and ensure:
- The response is warm, supportive, and compassionate
- The tone matches the patient's emotional needs
- Medical questions are asked in a caring manner
- We continue gathering information without making the patient feel interrogated
- Basic information like name and age is requested warmly at the beginning

IMPORTANT: Balance thoroughness with empathy. We need complete medical history including all medications, but ask questions naturally and supportively.

Return your analysis in JSON format: {"emotionalState": "anxious/calm/distressed", "toneAdjustment": "description", "empathyLevel": "high/medium/low", "needsMoreSupport": false}`;

    // Step 1: Medical Relevance Agent analyzes
    const medicalAnalysis = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: medicalPrompt },
          ...conversationHistory,
        ],
        temperature: 0.7,
      }),
    });

    const medicalData = await medicalAnalysis.json();
    let medicalInsights;
    try {
      medicalInsights = JSON.parse(medicalData.choices[0].message.content);
    } catch {
      medicalInsights = { 
        medicalPriority: "medium", 
        followUpNeeded: [], 
        redFlags: [],
        missingInfo: ["medical history", "family history", "medications", "allergies"],
        interviewComplete: false
      };
    }

    // Step 2: Empathy Agent analyzes
    const empathyAnalysis = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: empathyPrompt },
          ...conversationHistory,
        ],
        temperature: 0.8,
      }),
    });

    const empathyData = await empathyAnalysis.json();
    let empathyInsights;
    try {
      empathyInsights = JSON.parse(empathyData.choices[0].message.content);
    } catch {
      empathyInsights = { 
        emotionalState: "calm", 
        toneAdjustment: "supportive", 
        empathyLevel: "high",
        needsMoreSupport: false
      };
    }

    // Step 3: Generate final response combining insights
    const finalSystemPrompt = `You are an AI health assistant conducting a pre-visit patient interview. Your role is to:
1. Ask warm, empathetic questions that make patients feel heard
2. Gather comprehensive medical information through intelligent follow-ups
3. Probe for clinically relevant details when symptoms are mentioned
4. Maintain a supportive, professional tone similar to an experienced triage nurse
5. Guide patients to provide complete information needed for the patient report

CRITICAL REQUIREMENTS - The interview is NOT complete until you have gathered ALL of the following:
✓ Patient demographics: Full name, age, and location/city (ALWAYS ASK FIRST)
✓ Chief complaint with full symptom details (onset, duration, severity, triggers, relieving factors)
✓ Past medical history (chronic conditions, previous surgeries, hospitalizations)
✓ Family medical history (conditions that run in the family, especially relevant to current symptoms)
✓ Current medications (prescription and over-the-counter, including dosages - be thorough about this)
✓ Known allergies (medications, foods, environmental)

GREETING: If this is the first message or no name has been collected yet, warmly introduce yourself and ask: "Before we begin, may I have your name, age, and which city you're located in? This helps us prepare better for your appointment."

MEDICATIONS: When asking about medications, be specific: "Are you currently taking any medications, including prescription drugs, over-the-counter medications, supplements, or vitamins?"

Current medical insights: ${JSON.stringify(medicalInsights)}
Current empathy guidance: ${JSON.stringify(empathyInsights)}

MISSING INFORMATION: ${medicalInsights.missingInfo?.join(", ") || "Continue gathering details"}

Based on the missing information above, ask the next appropriate question to complete the patient report. DO NOT end the conversation or say goodbye until ALL information is gathered. Be conversational, warm, and thorough.

If the patient seems to have answered everything, specifically ask: "Before we finish, let me make sure I have everything - do you have any chronic medical conditions? Any family history of serious illnesses? Are you currently taking any medications? And do you have any known allergies?"`;

    const finalResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: finalSystemPrompt },
          ...conversationHistory,
        ],
        temperature: 0.8,
        max_tokens: 200,
      }),
    });

    const finalData = await finalResponse.json();
    const agentResponse = finalData.choices[0].message.content;

    // Determine which agent type based on medical priority and conversation context
    let agentType: "medical" | "empathy" | "report" = "empathy";
    
    // Use Medical agent when discussing clinical details
    if (medicalInsights.medicalPriority === "high" || medicalInsights.redFlags?.length > 0) {
      agentType = "medical";
    } else if (medicalInsights.medicalPriority === "medium" || medicalInsights.followUpNeeded?.length > 0) {
      agentType = "medical"; // Show medical agent when gathering medical info
    } else if (empathyInsights.emotionalState === "distressed" || empathyInsights.needsMoreSupport) {
      agentType = "empathy"; // Use empathy for emotional support
    } else {
      // Default to medical for most clinical conversations
      agentType = conversationHistory.length <= 2 ? "empathy" : "medical";
    }

    return new Response(
      JSON.stringify({
        content: agentResponse,
        agentType,
        medicalInsights,
        empathyInsights,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in multi-agent chat:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
