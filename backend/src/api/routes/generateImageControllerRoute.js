import express from "express";
import { generateImageController } from "../controllers/generateImageController.js";

const router = express.Router();

// Route for image generation.
router.post("/generate-image", generateImageController);

export default router;