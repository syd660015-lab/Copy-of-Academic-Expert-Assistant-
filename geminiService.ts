
import { GoogleGenAI } from "@google/genai";
import { Message, AppView } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

export const generateGeminiResponse = async (history: Message[]) => {
  // Always use a named parameter for apiKey and access it directly from process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Format history for Gemini API: use 'model' role instead of 'assistant' for multi-turn conversations.
  const contents = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    // Extract the generated text using the .text property (not a method).
    return response.text || "عذراً، لم يتم توليد إجابة.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "عذراً، حدث خطأ أثناء الاتصال بالمساعد الأكاديمي. يرجى المحاولة لاحقاً.";
  }
};
