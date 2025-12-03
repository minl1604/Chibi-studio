import { GoogleGenAI } from "@google/genai";
import { ModelType, ImageSize, AspectRatio, AnalysisResult, BackgroundOption } from "../types";
import { BACKGROUND_OPTIONS, QUICK_FILTERS, COLOR_PALETTES } from "../constants";

export const checkApiKeySelection = async (): Promise<boolean> => {
  const win = window as any;
  if (win.aistudio && win.aistudio.hasSelectedApiKey) {
    return await win.aistudio.hasSelectedApiKey();
  }
  return false;
};

export const promptApiKeySelection = async (): Promise<void> => {
  const win = window as any;
  if (win.aistudio && win.aistudio.openSelectKey) {
    await win.aistudio.openSelectKey();
  } else {
    console.warn("AI Studio key selection not available in this environment.");
  }
};

// Helper for friendly error messages
const getFriendlyErrorMessage = (error: any): string => {
  const msg = error.message || error.toString();
  if (msg.includes("API key not valid") || msg.includes("API_KEY_INVALID")) {
    return "Lỗi API Key: Vui lòng cấu hình biến môi trường API_KEY trong cài đặt Hosting/Deployment.";
  }
  if (msg.includes("429") || msg.includes("quota")) {
    return "Hệ thống đang quá tải (Quota Exceeded). Vui lòng thử lại sau ít phút.";
  }
  if (msg.includes("SAFETY") || msg.includes("blocked")) {
    return "Ảnh bị chặn bởi bộ lọc an toàn. Vui lòng thử ảnh khác.";
  }
  return msg;
};

// --- ANALYSIS FEATURE ---
export const analyzeImage = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cleanBase64 = base64Image.split(',')[1] || base64Image;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Use Pro model for best vision analysis
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
          { text: "Analyze this portrait. Return a JSON object with two fields: 'description' (a concise visual description of the person: hair color/style, expression, glasses, clothing type/color) and 'tags' (an array of 3-5 short keywords like 'Smiling', 'Glasses', 'Blue Shirt'). Return ONLY raw JSON." }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || "{}";
    // Clean up markdown code blocks if present
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr) as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    // Fallback
    return { description: "A person", tags: ["Portrait"] };
  }
};

// --- GENERATION FEATURE ---
interface GenerateChibiParams {
  imageBase64: string;
  prompt: string;
  customPrompt?: string;
  background?: BackgroundOption;
  colorPalette?: string;
  activeFilters?: string[];
  model: ModelType;
  size: ImageSize;
  aspectRatio: AspectRatio;
  useThinking?: boolean;
}

export const generateChibiImage = async ({
  imageBase64,
  prompt,
  customPrompt,
  background = 'simple',
  colorPalette = 'default',
  activeFilters = [],
  model,
  size,
  aspectRatio,
  useThinking = false,
}: GenerateChibiParams): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cleanBase64 = imageBase64.split(',')[1] || imageBase64;

  let finalPrompt = `${prompt}`;

  // Add Background Instruction
  const bgOption = BACKGROUND_OPTIONS.find(b => b.id === background);
  if (bgOption) {
    finalPrompt += `\n${bgOption.prompt}`;
  }

  // Add Color Palette Instruction
  const colorOption = COLOR_PALETTES.find(c => c.id === colorPalette);
  if (colorOption && colorOption.prompt) {
    finalPrompt += `\n${colorOption.prompt}`;
  }

  // Add Quick Filters
  if (activeFilters.length > 0) {
    const filterPrompts = activeFilters.map(id => QUICK_FILTERS.find(f => f.id === id)?.prompt).filter(Boolean);
    if (filterPrompts.length > 0) {
      finalPrompt += `\nAdjustments: ${filterPrompts.join(' ')}`;
    }
  }

  if (customPrompt && customPrompt.trim().length > 0) {
    finalPrompt += `\nAdditional User Request: ${customPrompt}`;
  }

  finalPrompt += `
      
      Requirements:
      - Keep the face, hair color, and general pose recognizable from the original photo.
      - Make the character look like a cute chibi version.
      - Use clean line art and simple shading.
      - High quality, detailed.
      - No text, no watermarks.
      - Safety: Wholesome, cute content only.`;

  const parts: any[] = [
    {
      inlineData: {
        mimeType: 'image/jpeg', 
        data: cleanBase64,
      },
    },
    {
      text: finalPrompt,
    },
  ];

  try {
    const config: any = {
      imageConfig: {
        aspectRatio: aspectRatio,
      },
    };

    if (model === ModelType.PRO) {
      config.imageConfig.imageSize = size;
      // Note: Thinking config is omitted for image generation stability as per SDK best practices currently,
      // but logic handles if we were to switch to a two-step text-to-image process.
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: parts,
      },
      config: config,
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    if (response.text) {
      throw new Error("Model returned text instead of image: " + response.text);
    }

    throw new Error("No image generated.");
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(getFriendlyErrorMessage(error));
  }
};

// --- EDITING FEATURE ---
export const editGeneratedImage = async (
  base64Image: string,
  editInstruction: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cleanBase64 = base64Image.split(',')[1] || base64Image;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Fixed typo here (was gemgemini)
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
          { text: `Edit this image: ${editInstruction}. Maintain the chibi style and original character features. High quality.` }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Editing failed to produce an image.");
  } catch (error: any) {
    throw new Error(getFriendlyErrorMessage(error));
  }
};
