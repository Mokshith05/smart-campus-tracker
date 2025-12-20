import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClassifyRequest {
  description: string;
  imageUrl?: string;
}

const CATEGORIES = [
  "electrical",
  "hostel", 
  "mess_food",
  "plumber",
  "security",
  "cleaning",
  "internet_network",
  "others"
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { description, imageUrl }: ClassifyRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Classifying issue:", { description, hasImage: !!imageUrl });

    // Build the content array for multimodal input
    const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
      {
        type: "text",
        text: `You are an AI assistant that classifies campus issues. Analyze the following issue and classify it into ONE of these categories:
        
Categories:
- electrical: Power outages, faulty wiring, broken switches, lighting issues
- hostel: Room repairs, furniture damage, bathroom issues in hostels
- mess_food: Food quality, hygiene, mess timing, kitchen equipment
- plumber: Water leakage, blocked drains, tap issues, water supply
- security: Safety concerns, theft, unauthorized access, lost items
- cleaning: Dirty areas, garbage, pest control, sanitation
- internet_network: WiFi issues, slow internet, network outages
- others: Issues that don't fit other categories

Issue Description: "${description}"

Respond with ONLY the category name (lowercase, exactly as listed above). Nothing else.`
      }
    ];

    // Add image if provided
    if (imageUrl) {
      content.push({
        type: "image_url",
        image_url: { url: imageUrl }
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "user", content }
        ],
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later.", category: "others" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required.", category: "others" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const rawCategory = data.choices?.[0]?.message?.content?.trim().toLowerCase() || "others";
    
    // Validate and sanitize the category
    const category = CATEGORIES.includes(rawCategory) ? rawCategory : "others";
    
    console.log("Classified as:", category);

    return new Response(
      JSON.stringify({ category }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Classification error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        category: "others" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
