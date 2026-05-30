import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import goalsRouter from './routes/goals.js';
import insightsRouter from './routes/insights.js';
import momentumRouter from './routes/momentum.js';
import tasksRouter from './routes/tasks.js';
import checkinRouter from './routes/checkin.js';
import authRouter from './routes/auth.js';
import { requireAuth } from './middleware/auth.js';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/goals', requireAuth, goalsRouter);
app.use('/api/insights', requireAuth, insightsRouter);
app.use('/api/momentum', requireAuth, momentumRouter);
app.use('/api/tasks', requireAuth, tasksRouter);
app.use('/api/checkin', requireAuth, checkinRouter);
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
