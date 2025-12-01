import { GoogleGenerativeAI } from "@google/genai";

const client = new GoogleGenerativeAI(process.env.API_KEY);

export default async function handler(event, context) {
  try {
    const { prompt } = JSON.parse(event.body);

    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);

    return {
      statusCode: 200,
      body: JSON.stringify({ result: result.response.text() }),
    };
  } catch (e) {
    return { statusCode: 500, body: e.message };
  }
}
