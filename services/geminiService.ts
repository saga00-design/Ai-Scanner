import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ScanResult } from "../types";

// Access API key via process.env.API_KEY as per guidelines.
// Assume process.env.API_KEY is pre-configured and valid.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define the schema for strict JSON output
const bottleAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    productName: {
      type: Type.STRING,
      description: "The full commercial name of the product (e.g., 'Grey Goose Vodka' or 'Heinz Baked Beans').",
    },
    description: {
      type: Type.STRING,
      description: "A 2-3 sentence engaging story, history, or heritage about the brand or product.",
    },
    averagePrice: {
      type: Type.STRING,
      description: "Estimated retail price range in GBP (£) based on general market knowledge (e.g., '£30 - £40').",
    },
    specs: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, description: "Type of product (Vodka, Sauce, Snack, Electronic, etc.)" },
        abv: { type: Type.STRING, description: "Alcohol by volume percentage if applicable, or 'N/A'" },
        volume: { type: Type.STRING, description: "Net weight or volume (e.g., '750ml', '400g')" },
        origin: { type: Type.STRING, description: "Country or region of origin" },
      },
      required: ["type", "abv", "volume", "origin"],
    },
    tastingNotes: {
      type: Type.OBJECT,
      properties: {
        nose: { type: Type.STRING, description: "Aroma or Scent profile (or 'N/A' if non-consumable)." },
        palate: { type: Type.STRING, description: "Flavor profile or Key Features (if non-food)." },
        finish: { type: Type.STRING, description: "Aftertaste or Build Quality/Finish (if non-food)." },
      },
      required: ["nose", "palate", "finish"],
    },
    cocktails: {
      type: Type.ARRAY,
      description: "List of 3 distinct items. If alcohol: Cocktails. If food: Recipes. If object: Usage cases.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the cocktail, recipe, or use case." },
          ingredients: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of ingredients or required tools." 
          },
          instructions: { type: Type.STRING, description: "Brief instructions." },
          visualPrompt: { 
            type: Type.STRING, 
            description: "A short, vivid comma-separated visual description to generate a photorealistic image of this result (e.g., 'Old Fashioned cocktail...' or 'Plate of beans on toast...')." 
          },
        },
        required: ["name", "ingredients", "instructions", "visualPrompt"],
      },
    },
    barcode: {
      type: Type.STRING,
      description: "The numeric barcode value if visible in the image, otherwise null.",
      nullable: true,
    },
    liquidAnalysis: {
      type: Type.OBJECT,
      properties: {
        percentage: {
          type: Type.INTEGER,
          description: "Precise estimated remaining content percentage (0-100).",
        },
        description: {
          type: Type.STRING,
          description: "A brief visual description of the content level.",
        },
      },
      required: ["percentage", "description"],
    },
  },
  required: ["productName", "description", "averagePrice", "specs", "tastingNotes", "cocktails", "liquidAnalysis"],
};

// --- Helper to resize image to avoid payload size limits ---
const resizeImage = (base64Str: string, maxWidth = 800): Promise<string> => {
  return new Promise((resolve) => {
    // If not running in browser environment (SSR), return as is
    if (typeof Image === 'undefined' || typeof document === 'undefined') {
      resolve(base64Str);
      return;
    }

    const img = new Image();
    img.src = `data:image/jpeg;base64,${base64Str}`;
    
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions keeping aspect ratio
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG 0.85 quality
          const newDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(newDataUrl.split(',')[1]);
      } else {
          // Fallback if context fails
          resolve(base64Str);
      }
    };
    
    img.onerror = () => {
      // Fallback if loading fails
      resolve(base64Str);
    };
  });
};

export const analyzeBottleImage = async (base64Image: string): Promise<ScanResult> => {
  try {
    const model = "gemini-2.5-flash"; 
    
    // Resize for analysis (max 1024px is plenty for text/barcode reading)
    const optimizedImage = await resizeImage(base64Image, 1024);

    const prompt = `
      Analyze this image. It is either a Spirit Bottle, a specific Barcode, or a General Product.
      
      1. **Identify**: Read the Barcode if visible. Identify Product Name, Type, Weight/Volume, Origin.
      2. **Analyze Content (High Precision)**: Look closely at the transparency and bottle geometry to estimate the remaining % (0-100). 
         - Be precise (e.g. 98% if near full, 45% if half). 
         - If it is a solid object or opaque container, estimate 100% unless clearly used/opened.
      3. **Knowledge Retrieval**: 
         - Provide a short, engaging "Story" about the brand.
         - Estimate the "Average Price" in GBP (£).
         - Provide "Tasting Notes" (Nose, Palate, Finish). *If non-food, map these to 'Scent/Material', 'Features', 'Quality/Finish'*.
         - Suggest 3 "Cocktails" (or Recipes/Use-Cases if not alcohol).
           *Important*: For each item, provide a 'visualPrompt' describing exactly how it looks.
      4. **Scan**: Prioritize reading the barcode numbers.
      
      Return strictly valid JSON matching the schema.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: optimizedImage } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: bottleAnalysisSchema,
        temperature: 0.4,
      },
    });

    if (!response.text) {
      throw new Error("No response text received from Gemini.");
    }

    const result: ScanResult = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const enhanceImageStyle = async (base64Image: string, stylePrompt: string): Promise<string> => {
  try {
    // Resize for generation - strictly required to avoid 500 errors on large inputs
    // 768px or 800px is the sweet spot for these models
    const optimizedImage = await resizeImage(base64Image, 800);
    
    // Using gemini-2.5-flash-image for image generation/editing
    const model = "gemini-2.5-flash-image";

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: optimizedImage,
            },
          },
          {
            text: stylePrompt,
          },
        ],
      },
    });

    // Extract image from response parts
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini Enhancement Error:", error);
    throw error;
  }
};