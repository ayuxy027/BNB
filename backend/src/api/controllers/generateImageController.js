import "dotenv/config";
import sharp from 'sharp';

// Generate image using Imagen API with built-in enhancement
async function generateImage(prompt, type) {
  try {
    // Create enhanced prompt with style information
    const enhancedPrompt = `${prompt}, ${type} style, high quality, detailed, professional`;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt: enhancedPrompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
            personGeneration: "allow_adult"
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Imagen API error:', response.status, errorText);
      throw new Error(`Imagen API error: ${response.status}`);
    }

    const result = await response.json();
    // console.log('API Response structure:', JSON.stringify(result, null, 2));
    
    const imageData = result.predictions?.[0]?.bytesBase64Encoded;
    
    if (!imageData) {
      console.error('No image data in response:', result);
      throw new Error('No image data received from API');
    }
    
    return imageData;
  } catch (error) {
    console.error('Generate image error:', error);
    throw error;
  }
}

// Add watermark pattern all over the image
async function addWatermark(base64Image) {
  try {
    // Validate input
    if (!base64Image) {
      throw new Error('No base64 image data provided');
    }
    
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
  } catch (error) {
    console.error('Watermark error:', error);
    throw error;
  }
}

export const generateImageController = async (req, res) => {
  try {
    const { query, type } = req.body;
    
    if (!query || !type) {
      return res.status(400).json({ error: 'Query and type are required' });
    }
    
    console.log('Generating image for:', query, 'with type:', type);
    
    // Generate image with enhanced prompt
    const originalImage = await generateImage(query.trim(), type.trim());
    
    if (!originalImage) {
      throw new Error('Failed to generate image - no data returned');
    }
    
    console.log('Image generated successfully, adding watermark...');
    const watermarkedImage = await addWatermark(originalImage);
    
    res.json({ 
      originalImage: originalImage,
      watermarkedImage: watermarkedImage,
      enhancedPrompt: `${query} (enhanced with ${type} style)`,
      mimeType: 'image/png'
    });
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate image',
      details: error.message 
    });
  }
};