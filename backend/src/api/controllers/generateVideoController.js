import "dotenv/config";
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { GoogleAuth } from 'google-auth-library';

// Promisify fs functions for async/await
const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);

const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const GCP_LOCATION = process.env.GCP_LOCATION || 'us-central1';

// Validate required environment variables
if (!GCP_PROJECT_ID) {
    throw new Error('GCP_PROJECT_ID is required in environment variables');
}

const GOOGLE_CREDENTIALS_PATH = "C:/Users/patil/Documents/Web Devlopment/BNB/BNB/backend/bnb-hack-469810-cc330915ff0e.json";

async function getAccessToken() {
    try {
        if (!fs.existsSync(GOOGLE_CREDENTIALS_PATH)) {
            throw new Error(`Credentials file not found at: ${GOOGLE_CREDENTIALS_PATH}`);
        }

        console.log("Using credentials file path:", GOOGLE_CREDENTIALS_PATH);

        const auth = new GoogleAuth({
            keyFile: GOOGLE_CREDENTIALS_PATH,
            scopes: ["https://www.googleapis.com/auth/cloud-platform"],
        });

        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();

        if (!accessToken.token) {
            throw new Error("Failed to obtain access token");
        }

        console.log("Authentication successful ✅");
        return accessToken.token;
    } catch (error) {
        console.error("Authentication failed ❌:", error.message);
        throw new Error(`Authentication failed: ${error.message}`);
    }
}

async function startVideoGeneration(params) {
    const { prompt, resolution, generateAudio, personGeneration } = params;
    
    const MODEL_ID = "veo-3.0-generate-001";
    const API_ENDPOINT = `https://${GCP_LOCATION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/publishers/google/models/${MODEL_ID}:predictLongRunning`;

    console.log('Starting video generation...');
    console.log('User prompt:', prompt);
    
    try {
        const accessToken = await getAccessToken();
        
        const requestBody = {
            instances: [{ prompt: prompt }],
            parameters: {
                resolution: resolution,
                generateAudio: generateAudio,
                personGeneration: personGeneration,
                durationSeconds: 8,
                sampleCount: 1,
                enhancePrompt: true,
                fps: 24,
                outputMimeType: "video/mp4"
            }
        };
        
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'User-Agent': 'video-generator/1.0'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Video generation start failed:', response.status, errorBody);
            throw new Error(`Failed to start video generation: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        console.log('Video generation job started:', data.name);
        return data.name;
    } catch (error) {
        console.error('Error starting video generation:', error);
        throw error;
    }
}

async function pollForVideoResult(operationName) {
    const MODEL_ID = "veo-3.0-generate-001";
    const API_ENDPOINT = `https://${GCP_LOCATION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_LOCATION}/publishers/google/models/${MODEL_ID}:fetchPredictOperation`;
    
    const INITIAL_POLLING_INTERVAL = 5000;
    const MAX_POLLING_INTERVAL = 30000;
    const MAX_POLLS = 60;
    let pollCount = 0;
    let currentInterval = INITIAL_POLLING_INTERVAL;

    console.log('Starting to poll for video generation result...');
    
    while (pollCount < MAX_POLLS) {
        console.log(`Polling attempt ${pollCount + 1}/${MAX_POLLS} (waiting ${currentInterval/1000}s)`);
        
        await new Promise(resolve => setTimeout(resolve, currentInterval));

        try {
            const accessToken = await getAccessToken();
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ operationName })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`Polling failed with status ${response.status}:`, errorBody);
                
                if (response.status >= 500) {
                    pollCount++;
                    continue;
                } else {
                    throw new Error(`Polling failed: ${response.status} - ${errorBody}`);
                }
            }
            
            const data = await response.json();
            
            if (data.metadata && data.metadata.progressPercent) {
                console.log(`Generation progress: ${data.metadata.progressPercent}%`);
            }

            if (data.done) {
                console.log("Video generation completed!");
                
                if (data.error) {
                    console.error('Video generation failed with error:', data.error);
                    throw new Error(`Video generation failed: ${data.error.message || JSON.stringify(data.error)}`);
                }
                
                const videoData = data.response?.videos?.[0]?.bytesBase64Encoded;
                if (!videoData) {
                    console.error('Response data:', JSON.stringify(data, null, 2));
                    throw new Error("Job finished but no video data was returned. This may be due to content filtering or generation issues.");
                }
                
                console.log('Video data received successfully');
                return videoData;
            }
            
            currentInterval = Math.min(currentInterval * 1.2, MAX_POLLING_INTERVAL);
            pollCount++;
            
        } catch (error) {
            console.error('Polling error:', error);
            
            if (error.code === 'NETWORK_ERROR' || error.message.includes('fetch')) {
                pollCount++;
                currentInterval = Math.min(currentInterval * 1.5, MAX_POLLING_INTERVAL);
                continue;
            }
            
            throw error;
        }
    }
    
    throw new Error(`Video generation timed out after ${MAX_POLLS} polling attempts.`);
}

// Helper function for cleanup
async function cleanupFiles(filePaths) {
    const cleanupPromises = filePaths.map(filePath => 
        unlinkAsync(filePath).catch(err => {
            console.warn(`Failed to cleanup ${filePath}:`, err.message);
        })
    );
    
    await Promise.all(cleanupPromises);
}

// Simple text watermark function
async function addSimpleTextWatermark(base64Video) {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tempDir = path.join(process.cwd(), 'tmp');
    const inputPath = path.join(tempDir, `${tempId}_input.mp4`);
    const outputPath = path.join(tempDir, `${tempId}_output.mp4`);
    
    console.log('Adding simple text watermark...');

    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
    
    try {
        await writeFileAsync(inputPath, Buffer.from(base64Video, 'base64'));
        
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .videoFilter([
                    "drawtext=text='PREVIEW'",
                    "fontsize=48",
                    "fontcolor=white@0.7",
                    "x=(w-tw)/2",
                    "y=(h-th)/2",
                    "box=1",
                    "boxcolor=black@0.5",
                    "boxborderw=8"
                ].join(':'))
                .outputOptions([
                    '-c:v', 'libx264',
                    '-preset', 'medium', 
                    '-crf', '23',
                    '-c:a', 'copy',
                    '-movflags', '+faststart'
                ])
                .on('start', (commandLine) => {
                    console.log('Starting simple text watermark...');
                })
                .on('progress', (progress) => {
                    if (progress.percent) {
                        console.log(`Text watermarking: ${Math.round(progress.percent)}%`);
                    }
                })
                .on('end', async () => {
                    try {
                        console.log('Text watermark completed!');
                        const watermarkedBuffer = fs.readFileSync(outputPath);
                        
                        await cleanupFiles([inputPath, outputPath]);
                        resolve(watermarkedBuffer.toString('base64'));
                    } catch (error) {
                        await cleanupFiles([inputPath, outputPath]);
                        reject(error);
                    }
                })
                .on('error', async (err) => {
                    console.error("Text watermarking error:", err.message);
                    await cleanupFiles([inputPath, outputPath]);
                    reject(new Error(`Text watermarking failed: ${err.message}`));
                })
                .save(outputPath);
        });
        
    } catch (error) {
        await cleanupFiles([inputPath, outputPath]);
        throw error;
    }
}

// --- MAIN CONTROLLER ---
export const generateVideoController = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method Not Allowed',
            message: 'This endpoint only accepts POST requests'
        });
    }

    const startTime = Date.now();
    
    try {
        // Validate request body
        const { query, type, resolution, voice, personGeneration } = req.body;
        
        if (!query || typeof query !== 'string' || !query.trim()) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Query is required and must be a non-empty string'
            });
        }
        
        if (!type || !['cinematic', 'realistic', 'anime', 'claymation', 'documentary'].includes(type)) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Type must be one of: cinematic, realistic, anime, claymation, documentary'
            });
        }
        
        console.log('=== Video Generation Request ===');
        console.log('Query:', query);
        console.log('Type:', type);
        console.log('Resolution:', resolution);
        console.log('Generate Audio:', voice);
        console.log('Person Generation:', personGeneration);
        
        // Create styled prompt
        const styledPrompt = `${query}, ${type} style`;
        
        // Start video generation
        const operationName = await startVideoGeneration({
            prompt: styledPrompt,
            resolution: resolution || '720p',
            generateAudio: voice === 'yes',
            personGeneration: personGeneration || 'allow_adult'
        });
        
        // Poll for result - THIS IS WHERE originalVideo IS DEFINED
        const originalVideo = await pollForVideoResult(operationName);
        
        // Add watermark with proper error handling
        let watermarkedVideo = originalVideo; // Initialize with original video
        try {
            console.log('Attempting to add watermark...');
            watermarkedVideo = await addSimpleTextWatermark(originalVideo);
            console.log('✅ Watermark applied successfully');
        } catch (watermarkError) {
            console.error('❌ Watermarking failed:', watermarkError.message);
            console.log('📹 Continuing with original video (no watermark)');
            // watermarkedVideo remains as originalVideo
        }
        
        const totalTime = Date.now() - startTime;
        console.log(`=== Video Generation Completed in ${totalTime}ms ===`);
        
        res.status(200).json({
            success: true,
            originalVideo,
            watermarkedVideo,
            userPrompt: query,
            styledPrompt: styledPrompt,
            mimeType: 'video/mp4',
            metadata: {
                processingTime: totalTime,
                videoLength: 8,
                resolution: resolution || '720p',
                hasAudio: voice === 'yes'
            }
        });
        
    } catch (error) {
        const totalTime = Date.now() - startTime;
        console.error(`=== Video Generation Failed after ${totalTime}ms ===`);
        console.error("Error in generateVideoController:", error);
        
        // Determine appropriate status code based on error
        let statusCode = 500;
        if (error.message.includes('Authentication failed')) {
            statusCode = 401;
        } else if (error.message.includes('Invalid request') || error.message.includes('Bad Request')) {
            statusCode = 400;
        } else if (error.message.includes('timed out')) {
            statusCode = 408;
        } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
            statusCode = 429;
        }
        
        res.status(statusCode).json({
            success: false,
            error: "Failed to generate video",
            details: error.message,
            userPrompt: req.body.query || 'Not provided',
            processingTime: totalTime,
            troubleshooting: {
                commonSolutions: [
                    "Check your Google Cloud credentials and project setup",
                    "Ensure the Vertex AI API is enabled",
                    "Verify your prompt doesn't contain restricted content",
                    "Try again with a shorter or simpler prompt"
                ]
            }
        });
    }
};

// Cleanup temp files every hour
setInterval(() => {
    const tempDir = path.join(process.cwd(), 'tmp');
    if (fs.existsSync(tempDir)) {
        const files = fs.readdirSync(tempDir);
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        
        files.forEach(file => {
            const filePath = path.join(tempDir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.mtime.getTime() < oneHourAgo) {
                fs.unlinkSync(filePath);
                console.log(`Cleaned up old temp file: ${file}`);
            }
        });
    }
}, 60 * 60 * 1000);