import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import goalsRouter from './routes/goals.js';
import insightsRouter from './routes/insights.js';
import momentumRouter from './routes/momentum.js';
import tasksRouter from './routes/tasks.js';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/goals', goalsRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/momentum', momentumRouter);
app.use('/api/tasks', tasksRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
