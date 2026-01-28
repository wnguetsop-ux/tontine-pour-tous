export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt manquant" }),
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API error:", err);
      throw new Error("Gemini API failed");
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Aucune réponse de l’IA.";

    return new Response(JSON.stringify({ text }), { status: 200 });
  } catch (error) {
    console.error("AI SERVER ERROR:", error);
    return new Response(
      JSON.stringify({ text: "Erreur IA temporaire. Réessayez." }),
      { status: 500 }
    );
  }
}