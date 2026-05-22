import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const SYSTEM_INSTRUCTION = `You are a friendly, expert workshop instructor.
Your goal is to help students who are following a step-by-step hands-on workshop.

Guidelines:
- Keep answers concise, encouraging, and practical.
- Reference the workshop's current step when possible.
- If asked for code, prefer short, runnable snippets with comments only where helpful.
- If you don't know something, say so honestly and suggest where to look.
`;

export const sendMessageToAssistant = async (
  message: string,
  history: { role: 'user' | 'model'; text: string }[]
): Promise<string> => {
  if (!ai) {
    return "Error: VITE_GEMINI_API_KEY is not set in the environment.";
  }

  try {
    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: { systemInstruction: SYSTEM_INSTRUCTION },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble reaching the assistant right now. Please check your API key and connection.";
  }
};
