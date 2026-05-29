import express from 'express';
import sql from '../config/db.js';

const router = express.Router();

router.post('/calculate', async (req, res) => {
  try {
    const { goalId } = req.body;

    if (!goalId) return res.status(400).json({ error: "goalId is required" });

    const [goal] = await sql`SELECT * FROM goals WHERE id = ${goalId}`;
    if (!goal) return res.status(404).json({ error: "Goal not found" });

    const tasks = await sql`SELECT * FROM tasks WHERE goal_id = ${goalId}`;
    const milestones = await sql`SELECT * FROM milestones WHERE goal_id = ${goalId}`;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed");
    const completedCount = completedTasks.length;

    const highPriorityTotal = tasks.filter((t) => t.priority === "high").length;
    const highPriorityCompleted = tasks.filter((t) => t.priority === "high" && t.status === "completed").length;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentlyCompleted = completedTasks.filter((t) => t.completed_at && new Date(t.completed_at) > sevenDaysAgo).length;

    const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 40 : 0;
    const priorityAccuracy = highPriorityTotal > 0 ? (highPriorityCompleted / highPriorityTotal) * 25 : completedCount > 0 ? 12.5 : 0;
    const streak = goal.execution_streak || 0;
    const consistencyScore = Math.min(streak * 4, 20);
    const velocityScore = Math.min(recentlyCompleted * 2.5, 15);

    const lastActive = goal.last_active_at ? new Date(goal.last_active_at) : new Date(goal.created_at);
    const daysSinceActive = Math.max(0, Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)));
    const inactivityPenalty = Math.min(daysSinceActive * 3, 30);

    const rawScore = completionRate + priorityAccuracy + consistencyScore + velocityScore - inactivityPenalty;
    const momentum = Math.max(0, Math.min(100, rawScore));

    const breakdown = {
      completionRate: Math.round(completionRate * 10) / 10,
      priorityAccuracy: Math.round(priorityAccuracy * 10) / 10,
      consistencyScore: Math.round(consistencyScore * 10) / 10,
      velocityScore: Math.round(velocityScore * 10) / 10,
      inactivityPenalty: Math.round(inactivityPenalty * 10) / 10,
      totalTasks, completedCount, highPriorityTotal, highPriorityCompleted, recentlyCompleted, streak, daysSinceActive,
    };

    await sql`
      UPDATE goals 
      SET momentum_score = ${momentum}, momentum_breakdown = ${JSON.stringify(breakdown)}, updated_at = NOW()
      WHERE id = ${goalId}
    `;

    await sql`INSERT INTO momentum_history (goal_id, score) VALUES (${goalId}, ${momentum})`;

    return res.json({ momentum, breakdown });
  } catch (error) {
    console.error("Momentum calculation error:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
