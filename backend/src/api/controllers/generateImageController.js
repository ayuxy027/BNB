import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// Simple cache for enhancement results
const cache = new Map();

// Fast prompt enhancement with timeout and fallback
async function enhanceQuery(query, type) {
  const cacheKey = `${query}-${type}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 3000); // 3s timeout
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ 
              text: `Make this image prompt vivid and detailed for ${type} style (max 120 words): "${query}"` 
            }] 
          }],
          generationConfig: { maxOutputTokens: 80, temperature: 0.8 }
        }),
        signal: controller.signal
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      const enhanced = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (enhanced) {
        cache.set(cacheKey, enhanced);
        return enhanced;
      }
    }
  } catch (error) {
    console.warn("Enhancement failed, using original query");
  }
  
  // Fallback: return original with style
  return `${query}, ${type} style, high quality, detailed`;
}

export const generateImageController = async (req, res) => {
  try {
    const { query, type } = req.body;
    
    // Validate inputs
    if (!query?.trim() || !type?.trim()) {
      return res.status(400).json({ 
        error: "Query and type are required" 
      });
    }
    
    // Enhance prompt
    const enhancedPrompt = await enhanceQuery(query.trim(), type.trim());
    
    // Generate image
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-preview-image-generation"
    });
    
    const result = await model.generateContent({
      contents: [{ parts: [{ text: enhancedPrompt }] }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
    });
    
    const response = await result.response;
    
    // Handle blocked content
    if (!response.candidates?.length) {
      const blockReason = response.promptFeedback?.blockReason;
      return res.status(400).json({
        error: blockReason 
          ? `Content blocked: ${blockReason}` 
          : "Failed to generate image"
      });
    }
    
    // Extract image data
    const imagePart = response.candidates[0].content.parts.find(
      part => part.inlineData
    );
    
    if (!imagePart?.inlineData?.data) {
      throw new Error("No image data returned");
    }
    
    res.json({ imageBase64: imagePart.inlineData.data });
    
  } catch (error) {
    console.error("Generation error:", error.message);
    
    if (!res.headersSent) {
      const statusCode = error.message.includes('timeout') ? 408 : 500;
      res.status(statusCode).json({ 
        error: error.message.includes('timeout') 
          ? "Request timed out" 
          : "Generation failed" 
      });
    }
  }
};

// Clear cache every 30 minutes
setInterval(() => cache.clear(), 30 * 60 * 1000);