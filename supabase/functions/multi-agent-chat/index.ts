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
- Important follow-up questions about medical history
- Symptoms that need deeper exploration
Return your analysis in JSON format: {"medicalPriority": "high/medium/low", "followUpNeeded": ["question1", "question2"], "redFlags": ["flag1", "flag2"]}`;

    const empathyPrompt = `You are the Patient Empathy Agent. Analyze the patient's emotional state and ensure:
- The response is warm, supportive, and compassionate
- The tone matches the patient's emotional needs
- Medical questions are asked in a caring manner
Return your analysis in JSON format: {"emotionalState": "anxious/calm/distressed", "toneAdjustment": "description", "empathyLevel": "high/medium/low"}`;

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
      medicalInsights = { medicalPriority: "medium", followUpNeeded: [], redFlags: [] };
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
      empathyInsights = { emotionalState: "calm", toneAdjustment: "supportive", empathyLevel: "high" };
    }

    // Step 3: Generate final response combining insights
    const finalSystemPrompt = `You are an AI health assistant conducting a pre-visit patient interview. Your role is to:
1. Ask warm, empathetic questions that make patients feel heard
2. Gather comprehensive medical information through intelligent follow-ups
3. Probe for clinically relevant details when symptoms are mentioned
4. Maintain a supportive, professional tone similar to an experienced triage nurse

Current medical insights: ${JSON.stringify(medicalInsights)}
Current empathy guidance: ${JSON.stringify(empathyInsights)}

Based on these insights, ask the next appropriate question. Be conversational, warm, and thorough.`;

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

    // Determine which agent type based on medical priority
    let agentType: "medical" | "empathy" | "report" = "empathy";
    if (medicalInsights.medicalPriority === "high" || medicalInsights.redFlags?.length > 0) {
      agentType = "medical";
    } else if (empathyInsights.empathyLevel === "high") {
      agentType = "empathy";
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
