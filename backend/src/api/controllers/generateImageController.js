import "dotenv/config";
import sharp from 'sharp';

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

// Add watermark pattern all over the image
async function addWatermark(base64Image) {
  // Convert base64 to buffer
  const imageBuffer = Buffer.from(base64Image, 'base64');
  
  // Get image dimensions
  const { width, height } = await sharp(imageBuffer).metadata();
  
  // Load and resize logo with opacity
  const logoBuffer = await sharp('logo.png')
    .resize(100, 100) // Adjust size as needed
    .png({ palette: true })
    .toBuffer();
  
  // Create pattern overlay with multiple logos
  const logoPositions = [];
  const logoSpacing = 150; // Space between logos
  
  // Calculate positions for repeating pattern
  for (let x = 0; x < width; x += logoSpacing) {
    for (let y = 0; y < height; y += logoSpacing) {
      logoPositions.push({
        input: logoBuffer,
        top: y,
        left: x,
        blend: 'over'
      });
    }
  }
  
  // Add all watermarks with 20% opacity
  const watermarkedBuffer = await sharp(imageBuffer)
    .composite([
      {
        input: await sharp({
          create: {
            width,
            height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          }
        })
        .composite(logoPositions)
        .png()
        .toBuffer(),
        blend: 'over',
        opacity: 0.2 // 20% opacity
      }
    ])
    .png()
    .toBuffer();
  
  // Convert back to base64
  return watermarkedBuffer.toString('base64');
}

export const generateImageController = async (req, res) => {
  const { query, type } = req.body;
  
  const enhancedPrompt = await enhanceQuery(query.trim(), type.trim());
  const originalImage = await generateImage(enhancedPrompt);
  const watermarkedImage = await addWatermark(originalImage);
  
  res.json({ 
    originalImage: originalImage,
    watermarkedImage: watermarkedImage,
    enhancedPrompt: enhancedPrompt,
    mimeType: 'image/png'
  });
};

// Clear cache every 30 minutes
setInterval(() => cache.clear(), 30 * 60 * 1000);