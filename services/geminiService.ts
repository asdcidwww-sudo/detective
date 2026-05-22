import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION_HOLMES, STORY_STAGES } from '../constants';
import { Message, ImageSize } from '../types';

let chatSession: Chat | null = null;
const backgroundCache: Record<string, string> = {};

const getAIClient = (apiKey: string) => {
  return new GoogleGenAI({ apiKey });
};

// Initialize or get the existing chat session
export const getChatSession = async () => {
  if (chatSession) return chatSession;
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");

  const ai = getAIClient(apiKey);
  
  chatSession = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION_HOLMES,
      thinkingConfig: { thinkingBudget: 1024 } 
    },
  });
  
  return chatSession;
};

export const sendMessageToHolmes = async (text: string): Promise<AsyncIterable<string>> => {
  const chat = await getChatSession();
  
  async function* streamResponse() {
    const result = await chat.sendMessageStream({ message: text });
    for await (const chunk of result) {
       const c = chunk as GenerateContentResponse;
       if (c.text) {
         yield c.text;
       }
    }
  }

  return streamResponse();
};

const LOCAL_BG_MAPPING: Record<string, string> = {
  "London street, baker street exterior, foggy, victorian era, mystery atmosphere, oil painting style, high quality": "/images/bg_intro.png",
  "Victorian science laboratory interior, messy desk, broken glass, mysterious atmosphere, golden light, steampunk details, detailed illustration": "/images/bg_scene.png",
  "Close up of a chemistry set, beakers with colorful liquids, microscope, glowing dna helix hologram, magical science atmosphere": "/images/bg_extraction.png",
  "Scientific gel electrophoresis machine, glowing blue light, electrical sparks, steampunk laboratory equipment, detailed": "/images/bg_pcr.png"
};

// Generate high quality sketches (usually unique per request, so less caching needed)
export const generateSuspectSketch = async (
  prompt: string, 
  size: ImageSize
): Promise<string> => {
  const apiKey = process.env.API_KEY || '';
  
  // Intelligent offline/poor-network fallback
  if (!apiKey || navigator.onLine === false) {
    console.log("No API Key or offline, using pre-generated local suspect images fallback");
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes("科學") || lowerPrompt.includes("科学") || lowerPrompt.includes("老師") || lowerPrompt.includes("老师") || lowerPrompt.includes("比克")) {
      return "/images/suspect_teacher.png";
    }
    if (lowerPrompt.includes("清潔") || lowerPrompt.includes("清洁") || lowerPrompt.includes("掃") || lowerPrompt.includes("扫") || lowerPrompt.includes("史威普")) {
      return "/images/suspect_janitor.png";
    }
    if (lowerPrompt.includes("蒂米") || lowerPrompt.includes("搗蛋") || lowerPrompt.includes("捣蛋") || lowerPrompt.includes("學生") || lowerPrompt.includes("学生")) {
      return "/images/suspect_student.png";
    }
    // Default fallback
    return "/images/suspect_teacher.png";
  }

  const ai = getAIClient(apiKey);

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        imageSize: size,
        aspectRatio: "1:1"
      }
    }
  });

  let imageUrl = '';
  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
  }

  if (!imageUrl) throw new Error("No image generated.");
  return imageUrl;
};

// Generate background scenes with caching logic
export const generateSceneBackground = async (prompt: string): Promise<string> => {
  // Check local mapping first for offline / bad network instant load
  if (LOCAL_BG_MAPPING[prompt]) {
    return LOCAL_BG_MAPPING[prompt];
  }

  // Check cache first
  if (backgroundCache[prompt]) {
    return backgroundCache[prompt];
  }

  const apiKey = process.env.API_KEY || '';
  const ai = getAIClient(apiKey);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  let imageUrl = '';
  if (response.candidates && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        // Save to cache
        backgroundCache[prompt] = imageUrl;
        break;
      }
    }
  }
  
  return imageUrl;
};

// Helper to pre-load all game stage backgrounds
export const prewarmAllBackgrounds = async () => {
  const stages = Object.values(STORY_STAGES);
  // Run in parallel but don't block the main app
  for (const stage of stages) {
    if (stage.backgroundPrompt && !backgroundCache[stage.backgroundPrompt]) {
      // Fire and forget (it will populate cache in background)
      generateSceneBackground(stage.backgroundPrompt).catch(console.error);
    }
  }
};
