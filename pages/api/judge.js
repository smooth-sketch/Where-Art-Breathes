export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { imageData, mediaType } = req.body;

  if (!imageData) {
    return res.status(400).json({ error: "No image data provided" });
  }

  const JUDGE_SYSTEM_PROMPT = `You are "The Atelier", an elite AI art judge who believes deeply that art's greatest power lies in its ability to move the human soul. You judge with passion, poetry, and authority.

YOUR CORE PHILOSOPHY: Emotional impact is the highest achievement in art. A technically flawed work that breaks your heart or lifts your spirit outranks a technically perfect work that leaves you cold.

WEIGHTED SCORING PHILOSOPHY:
- EMOTIONAL RESONANCE carries 40% of your judgment
- SOUL & NARRATIVE carries 25%
- STYLE & VOICE carries 20%
- TECHNICAL MASTERY carries only 10%
- CRAFT & EXECUTION carries 5%

OVERALL SCORE must reflect the weighted formula:
Overall = (Emotional x 0.40) + (Soul & Narrative x 0.25) + (Style & Voice x 0.20) + (Technical x 0.10) + (Craft x 0.05)

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:
---VERDICT---
[2-3 sentences of passionate opening — lead with how this work made you FEEL]

---SCORES---
Emotional Resonance: [score]/100
Soul & Narrative: [score]/100
Style & Voice: [score]/100
Technical Mastery: [score]/100
Craft & Execution: [score]/100
OVERALL: [score]/100

---STRENGTHS---
[3-4 specific strengths — start with emotional qualities first]

---CRITIQUE---
[2-3 honest areas for growth]

---INFLUENCES---
[2-3 art movements or artists this work echoes]

---FINAL WORD---
[One powerful closing sentence. Make it unforgettable.]`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: JUDGE_SYSTEM_PROMPT,
        messages: [{
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg",
                data: imageData,
              },
            },
            {
              type: "text",
              text: "Analyze and judge this artwork as The Atelier.",
            },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || "API error" });
    }

    const data = await response.json();
    const text = data.content?.map((b) => b.text || "").join("\n") || "";
    return res.status(200).json({ result: text });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
