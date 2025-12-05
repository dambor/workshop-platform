import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize only if key is present to avoid immediate errors, 
// though the app assumes the key is valid per instructions.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const sendMessageToAssistant = async (
  message: string, 
  history: { role: 'user' | 'model'; text: string }[]
): Promise<string> => {
  if (!ai) {
    return "Error: API Key is missing in the environment variables.";
  }

  try {
    const model = ai.models;
    
    // Construct a context-aware prompt
    const systemInstruction = `You are a friendly and expert workshop instructor specializing in AstraDB (by DataStax) and Langflow. 
    Your goal is to help students who are following a step-by-step workshop.
    
    Key knowledge:
    - AstraDB is a serverless vector database built on Apache Cassandra.
    - Langflow is a visual framework for building LLM applications.
    - Common issues: Wrong API keys, network settings, Python version mismatches (requires 3.9+).
    
    Keep answers concise, encouraging, and helpful. If asked for code, provide Python examples relevant to Langflow or AstraDB.
    `;

    // We combine history into a chat format
    // Since we are using a single-shot generateContent for simplicity in this demo structure,
    // we'll concatenate the history into the prompt or use the chat API. 
    // Let's use the Chat API for better context handling.
    
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I couldn't generate a response. Please try again.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the brain right now. Please check your internet or API key.";
  }
};
