// /netlify/functions/gemini/handler.ts
import type { Handler } from "@netlify/functions";
import { GoogleGenerativeAI } from "@google/genai";

const client = new GoogleGenerativeAI(process.env.API_KEY!);

export const handler: Handler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: "Missing request body",
      };
    }

    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return {
        statusCode: 400,
        body: "Missing 'prompt'",
      };
    }

    const model = client.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(prompt);

    return {
      statusCode: 200,
      body: JSON.stringify({
        output: result.response.text(),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
