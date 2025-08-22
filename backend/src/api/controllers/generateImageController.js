import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// Simple cache for enhancement results
const cache = new Map();

// Fast prompt enhancement with timeout and fallback
async function enhanceQuery(query, type) {
  const cacheKey = `${query}-${type}`;
  
  if (cache.has(cacheKey)) {
    console.log("Using cached enhancement");
    return cache.get(cacheKey);
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    console.log("Enhancing prompt with AI...");
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
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      const enhanced = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      
      if (enhanced) {
        console.log("AI enhancement successful:", enhanced.substring(0, 100) + "...");
        cache.set(cacheKey, enhanced);
        return enhanced;
      } else {
        console.warn("AI response empty, using fallback");
      }
    } else {
      console.warn("AI enhancement failed with status:", response.status);
    }
  } catch (error) {
    console.warn("Enhancement error:", error.name, error.message);
  }
  
  // Fallback: return original with style
  const fallback = `${query}, ${type} style, high quality, detailed`;
  console.log("Using fallback enhancement:", fallback);
  return fallback;
}

export const generateImageController = async (req, res) => {
  console.log("=== Image Generation Request Started ===");
  console.log("Request body:", req.body);
  
  try {
    const { query, type } = req.body;
    
    // Validate inputs
    if (!query?.trim() || !type?.trim()) {
      console.log("Validation failed - missing query or type");
      return res.status(400).json({ 
        error: "Query and type are required" 
      });
    }
    
    console.log(`Processing: query="${query.trim()}", type="${type.trim()}"`);
    
    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not found in environment");
      return res.status(500).json({ error: "Server configuration error" });
    }
    
    // Enhance prompt
    const enhancedPrompt = await enhanceQuery(query.trim(), type.trim());
    console.log("Final prompt for image generation:", enhancedPrompt);
    
    // Initialize Gemini AI
    console.log("Initializing GoogleGenerativeAI...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-preview-image-generation"
    });
    
    console.log("Calling image generation API...");
    const result = await model.generateContent({
      contents: [{ parts: [{ text: enhancedPrompt }] }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
    });
    
    console.log("Image generation API called, processing response...");
    const response = await result.response;
    
    // Log full response for debugging
    console.log("API Response structure:", {
      candidates: response.candidates?.length || 0,
      promptFeedback: response.promptFeedback,
      usageMetadata: response.usageMetadata
    });
    
    // Handle blocked content or empty response
    if (!response.candidates || response.candidates.length === 0) {
      const blockReason = response.promptFeedback?.blockReason;
      const safetyRatings = response.promptFeedback?.safetyRatings;
      
      console.error("No candidates in response:", {
        blockReason,
        safetyRatings,
        fullResponse: JSON.stringify(response, null, 2)
      });
      
      return res.status(400).json({
        error: blockReason 
          ? `Content blocked: ${blockReason}` 
          : "No image generated - check your prompt content"
      });
    }
    
    // Log candidate structure
    const candidate = response.candidates[0];
    console.log("Candidate structure:", {
      hasContent: !!candidate.content,
      partsCount: candidate.content?.parts?.length || 0,
      finishReason: candidate.finishReason
    });
    
    if (candidate.finishReason === 'SAFETY') {
      console.error("Content blocked due to safety concerns");
      return res.status(400).json({
        error: "Content blocked due to safety policies. Please modify your prompt."
      });
    }
    
    // Extract image data
    const imagePart = candidate.content?.parts?.find(part => part.inlineData);
    
    if (!imagePart) {
      console.error("No image part found in response");
      console.log("Available parts:", candidate.content?.parts?.map(p => Object.keys(p)));
      throw new Error("No image data returned from API");
    }
    
    if (!imagePart.inlineData?.data) {
      console.error("Image part exists but no data:", imagePart);
      throw new Error("Image data is empty");
    }
    
    console.log("Image generation successful! Base64 length:", imagePart.inlineData.data.length);
    console.log("=== Request Completed Successfully ===");
    
    res.json({ 
      imageBase64: imagePart.inlineData.data,
      enhancedPrompt: enhancedPrompt // Include for debugging
    });
    
  } catch (error) {
    console.error("=== Generation Error ===");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    if (!res.headersSent) {
      let statusCode = 500;
      let errorMessage = "Generation failed";
      
      if (error.message.includes('timeout') || error.name === 'AbortError') {
        statusCode = 408;
        errorMessage = "Request timed out";
      } else if (error.message.includes('API key') || error.message.includes('unauthorized')) {
        statusCode = 401;
        errorMessage = "Authentication failed";
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        statusCode = 429;
        errorMessage = "Rate limit exceeded";
      }
      
      res.status(statusCode).json({ 
        error: errorMessage,
        details: error.message // Include details for debugging
      });
    }
  }
};

// Clear cache every 30 minutes
setInterval(() => {
  console.log("Clearing enhancement cache");
  cache.clear();
}, 30 * 60 * 1000);