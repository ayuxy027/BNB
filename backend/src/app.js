import express from 'express';
import cors from 'cors';
import generateImageRoutes from './api/routes/generateImageRoute.js';
import generateVideoRoutes from './api/routes/generateVideoRoute.js';

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json());

// API Routes
app.use('/api', generateImageRoutes);
app.use('/api', generateVideoRoutes);

// Health check endpoint.
app.get('/', (req, res) => {
  res.send('Backend server is alive!');
});

export default app;