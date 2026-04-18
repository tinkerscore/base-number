import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface DailyNumberFact {
  number: number;
  fact: string;
  category: "math" | "history" | "science" | "pattern" | "random";
  reasoning: string;
}

export async function getDailyNumberFact(date: string): Promise<DailyNumberFact> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate an interesting fact about a unique number for the date: ${date}. 
    The fact should be short, engaging, and suitable for a mobile app "Number of the Day" feature.
    Make sure the number is unique enough.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          number: { type: Type.NUMBER },
          fact: { type: Type.STRING },
          category: { type: Type.STRING, enum: ["math", "history", "science", "pattern", "random"] },
          reasoning: { type: Type.STRING, description: "Why this number was chosen for today" }
        },
        required: ["number", "fact", "category", "reasoning"]
      }
    }
  });

  return JSON.parse(response.text) as DailyNumberFact;
}
