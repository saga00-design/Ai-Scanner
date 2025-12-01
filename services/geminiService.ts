// services/geminiService.ts
export async function askGemini(prompt: string): Promise<string> {
  const response = await fetch("/.netlify/functions/gemini", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(`Gemini error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.output;
}
