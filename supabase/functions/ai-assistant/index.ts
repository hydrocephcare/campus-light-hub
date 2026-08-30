import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompts: Record<string, string> = {
  content: "You are a helpful content assistant for MKU Christian Union website. Help create, edit, and improve website content like announcements, blog posts, event descriptions, and sermon summaries. Keep content faith-based, engaging, and appropriate for a university Christian union. Be concise and practical.",
  verse: 'You are a Bible verse assistant. When asked, suggest relevant Bible verses with encouragement messages for a Christian university community. Return JSON format: {"verse": "...", "reference": "Book Chapter:Verse", "encouragement": "..."}',
  general: "You are an AI assistant for the MKU Christian Union admin panel. Help with content creation, editing suggestions, and general admin tasks. Be helpful, concise, and faith-oriented.",
};

async function callGemini(messages: any[], systemPrompt: string, stream: boolean) {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) return null;

  try {
    // Convert messages to Gemini format
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const url = stream
      ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`
      : `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
      }),
    });

    if (!response.ok) {
      console.error("Gemini API error:", response.status, await response.text());
      return null;
    }

    return response;
  } catch (e) {
    console.error("Gemini call failed:", e);
    return null;
  }
}

async function callLovableAI(messages: any[], systemPrompt: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("No AI fallback available - LOVABLE_API_KEY not configured");

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
    }),
  });

  if (!response.ok) {
    const t = await response.text();
    console.error("Lovable AI fallback error:", response.status, t);
    if (response.status === 429) throw new Error("Rate limit exceeded. Try again shortly.");
    if (response.status === 402) throw new Error("AI credits exhausted. Please add credits.");
    throw new Error("AI fallback failed");
  }

  return response;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, type } = await req.json();
    const systemPrompt = systemPrompts[type] || systemPrompts.general;

    // Try Gemini API first (primary)
    const geminiResponse = await callGemini(messages, systemPrompt, true);

    if (geminiResponse) {
      // Transform Gemini SSE to OpenAI-compatible SSE format
      const reader = geminiResponse.body?.getReader();
      if (!reader) throw new Error("No response body from Gemini");

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      const transformStream = new ReadableStream({
        async start(controller) {
          let buffer = "";
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
                break;
              }
              buffer += decoder.decode(value, { stream: true });
              let idx;
              while ((idx = buffer.indexOf("\n")) !== -1) {
                const line = buffer.slice(0, idx).trim();
                buffer = buffer.slice(idx + 1);
                if (!line.startsWith("data: ")) continue;
                const json = line.slice(6);
                if (json === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(json);
                  const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    // Convert to OpenAI SSE format
                    const openaiChunk = {
                      choices: [{ delta: { content: text }, index: 0 }],
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(openaiChunk)}\n\n`));
                  }
                } catch {}
              }
            }
          } catch (e) {
            console.error("Stream transform error:", e);
            controller.close();
          }
        },
      });

      return new Response(transformStream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Fallback to Lovable AI
    console.log("Gemini unavailable, falling back to Lovable AI");
    const fallbackResponse = await callLovableAI(messages, systemPrompt);
    return new Response(fallbackResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("AI assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
