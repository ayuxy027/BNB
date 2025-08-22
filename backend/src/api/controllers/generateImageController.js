import "dotenv/config";

// Simple cache for enhancement results
const cache = new Map();

// Fast prompt enhancement
async function enhanceQuery(query, type) {
  const cacheKey = `${query}-${type}`;
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  try {
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
        })
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
    // Silent fallback
  }
  
  // Fallback: return original with style
  const fallback = `${query}, ${type} style, high quality, detailed`;
  return fallback;
}

// Generate image using Imagen API
async function generateImage(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          personGeneration: "allow_adult"
        }
      })
    }
  );

  const result = await response.json();
  const imageData = result.predictions?.[0]?.bytesBase64Encoded;
  
  return imageData;
}

export const generateImageController = async (req, res) => {
  const { query, type } = req.body;
  
  const enhancedPrompt = await enhanceQuery(query.trim(), type.trim());
  const imageData = await generateImage(enhancedPrompt);
  
  res.json({ 
    imageBase64: imageData,
    enhancedPrompt: enhancedPrompt,
    mimeType: 'image/png'
  });
};

// Clear cache every 30 minutes
setInterval(() => cache.clear(), 30 * 60 * 1000);