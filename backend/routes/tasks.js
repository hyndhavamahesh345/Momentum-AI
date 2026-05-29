import express from 'express';
import sql from '../config/db.js';

const router = express.Router();

router.post('/update', async (req, res) => {
  try {
    const { taskId, status, userId } = req.body;

    if (!taskId || !status) {
      return res.status(400).json({ error: "Task ID and Status are required" });
    }

    const completedAt = status === "completed" ? new Date().toISOString() : null;

    const [updatedTask] = await sql`
      UPDATE tasks 
      SET status = ${status}, 
          completed_at = ${completedAt},
          updated_at = NOW()
      WHERE id = ${taskId}
      RETURNING *
    `;

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    const goalId = updatedTask.goal_id;

    if (status === "completed") {
      const [currentGoal] = await sql`SELECT last_active_at, execution_streak FROM goals WHERE id = ${goalId}`;
      const now = new Date();
      let newStreak = currentGoal.execution_streak || 0;

      if (currentGoal.last_active_at) {
        const lastActive = new Date(currentGoal.last_active_at);
        const hoursSinceActive = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
        if (hoursSinceActive >= 24 && hoursSinceActive < 48) newStreak += 1;
        else if (hoursSinceActive >= 48) newStreak = 1;
      } else {
        newStreak = 1;
      }

      await sql`
        INSERT INTO execution_events (user_id, event_type, metadata)
        VALUES (${userId || "anonymous"}, 'task_completed', ${JSON.stringify({ taskId, goalId, impactScore: updatedTask.impact_score, priority: updatedTask.priority })})
      `;

      await sql`
        UPDATE goals 
        SET last_active_at = NOW(), execution_streak = ${newStreak}, updated_at = NOW()
        WHERE id = ${goalId}
      `;
    } else {
      await sql`
        INSERT INTO execution_events (user_id, event_type, metadata)
        VALUES (${userId || "anonymous"}, 'task_reverted', ${JSON.stringify({ taskId, goalId })})
      `;
    }

    const allTasks = await sql`SELECT * FROM tasks WHERE goal_id = ${goalId}`;
    const [goal] = await sql`SELECT * FROM goals WHERE id = ${goalId}`;

    const totalTasks = allTasks.length;
    const completedCount = allTasks.filter(t => t.status === "completed").length;
    const highPriorityTotal = allTasks.filter(t => t.priority === "high").length;
    const highPriorityCompleted = allTasks.filter(t => t.priority === "high" && t.status === "completed").length;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentlyCompleted = allTasks.filter(t => t.completed_at && new Date(t.completed_at) > sevenDaysAgo).length;

    const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 40 : 0;
    const priorityAccuracy = highPriorityTotal > 0 ? (highPriorityCompleted / highPriorityTotal) * 25 : completedCount > 0 ? 12.5 : 0;
    const streak = goal.execution_streak || 0;
    const consistencyScore = Math.min(streak * 4, 20);
    const velocityScore = Math.min(recentlyCompleted * 2.5, 15);

    const lastActive = goal.last_active_at ? new Date(goal.last_active_at) : new Date(goal.created_at);
    const daysSinceActive = Math.max(0, Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)));
    const inactivityPenalty = Math.min(daysSinceActive * 3, 30);

    const momentum = Math.max(0, Math.min(100, completionRate + priorityAccuracy + consistencyScore + velocityScore - inactivityPenalty));
    const breakdown = {
      completionRate: Math.round(completionRate * 10) / 10,
      priorityAccuracy: Math.round(priorityAccuracy * 10) / 10,
      consistencyScore: Math.round(consistencyScore * 10) / 10,
      velocityScore: Math.round(velocityScore * 10) / 10,
      inactivityPenalty: Math.round(inactivityPenalty * 10) / 10,
    };

    await sql`
      UPDATE goals SET momentum_score = ${momentum}, momentum_breakdown = ${JSON.stringify(breakdown)}, updated_at = NOW() WHERE id = ${goalId}
    `;
    await sql`INSERT INTO momentum_history (goal_id, score) VALUES (${goalId}, ${momentum})`;

    return res.json({ ...updatedTask, newMomentum: momentum, breakdown });
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
