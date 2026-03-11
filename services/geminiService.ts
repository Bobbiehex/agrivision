
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { AIAnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '' });

/**
 * Helper to parse markdown JSON code blocks often returned by LLMs
 */
const parseJsonFromMarkdown = (text: string): any => {
  try {
    // Try native parse first
    return JSON.parse(text);
  } catch (e) {
    // Look for ```json ... ``` or just {...}
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (e2) {
        console.error("Failed to parse extracted JSON", e2);
        return null;
      }
    }
    return null;
  }
};

export const analyzeCropImage = async (base64Image: string): Promise<AIAnalysisResult> => {
  try {
    const prompt = `
      You are an expert agronomist. Analyze this crop image.
      Identify the crop type, growth stage, and check for signs of pests, diseases, or water stress.
      Estimate an NDVI visual score (0.0 to 1.0) if applicable.
      
      Return a STRICT JSON object with this structure:
      {
        "detectedSubject": "Crop Name",
        "condition": "Healthy/Warning/Critical",
        "confidence": 0-100 (number),
        "issues": ["List of specific issues found"],
        "recommendations": ["List of 3 actionable recommendations"]
      }
      Do not add any markdown formatting outside the JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Optimized for multimodal analysis
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        temperature: 0.2, // Lower temperature for more deterministic output
      }
    });

    const text = response.text || "{}";
    const parsed = parseJsonFromMarkdown(text);

    if (!parsed) {
      throw new Error("Could not parse AI response");
    }

    return {
      detectedSubject: parsed.detectedSubject || "Unknown Crop",
      condition: parsed.condition || "Unknown",
      confidence: parsed.confidence || 0,
      issues: parsed.issues || [],
      recommendations: parsed.recommendations || [],
      rawAnalysis: text
    };

  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return {
      detectedSubject: "Error",
      condition: "Unknown",
      confidence: 0,
      issues: ["Failed to analyze image"],
      recommendations: ["Check internet connection", "Ensure API key is valid"],
      rawAnalysis: String(error)
    };
  }
};

export const analyzeLivestockFrame = async (base64Image: string, detectedHints?: string[]): Promise<AIAnalysisResult> => {
  try {
    const hintText = detectedHints && detectedHints.length > 0 
        ? `Object detection suggests: ${detectedHints.join(', ')}. ` 
        : '';

    const prompt = `
      You are an expert veterinarian and livestock specialist. Analyze this animal image.
      ${hintText}
      1. Identify the specific species AND BREED (e.g., Holstein Cow, Angus, Merino Sheep).
      2. CAREFULLY CHECK FOR VISIBLE WOUNDS, CUTS, LIMPING, OR LESIONS on the animal's body.
      3. Check for signs of isolation or distress. If the hint mentions "Isolated", treat this as a high-risk symptom (Warning or Critical condition).
      
      Return a STRICT JSON object with this structure:
      {
        "detectedSubject": "Specific Breed & Species",
        "condition": "Healthy/Warning/Critical", 
        "confidence": 0-100 (number),
        "issues": ["List visible injuries or behavioral concerns here"],
        "recommendations": ["List of immediate actions"]
      }
      If a wound is found, 'condition' must be 'Warning' or 'Critical'.
      Do not add any markdown formatting outside the JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      }
    });

    const text = response.text || "{}";
    const parsed = parseJsonFromMarkdown(text);

    if (!parsed) {
      throw new Error("Could not parse AI response");
    }

    return {
      detectedSubject: parsed.detectedSubject || "Unknown Animal",
      condition: parsed.condition || "Unknown",
      confidence: parsed.confidence || 0,
      issues: parsed.issues || [],
      recommendations: parsed.recommendations || [],
      rawAnalysis: text
    };

  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return {
      detectedSubject: "Error",
      condition: "Unknown",
      confidence: 0,
      issues: ["Failed to analyze frame"],
      recommendations: [],
      rawAnalysis: String(error)
    };
  }
};

export const createChatSession = (language: string = 'english'): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are AgriBot, an advanced AI farm assistant. You provide concise, scientific, and practical advice on crop management, livestock health, fertilizers, and irrigation. 
      IMPORTANT: You must respond in the '${language}' language. Format your answers clearly using Markdown.`
    }
  });
};

export const sendChatMessage = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "I'm having trouble thinking right now. Please try again.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Connection error with AI service.";
  }
};
