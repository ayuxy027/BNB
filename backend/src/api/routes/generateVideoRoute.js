import { generateVideoController } from "../controllers/generateVideoController.js";
import express from "express";


const router = express.Router();
router.post("/generate-video", generateVideoController);

export default router;