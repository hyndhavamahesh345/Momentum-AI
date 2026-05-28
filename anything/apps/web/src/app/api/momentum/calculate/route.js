import sql from "@/lib/sql";

/**
 * Advanced Momentum Score Engine
 *
 * Formula:
 * Momentum = Completion Rate (40) + Priority Accuracy (25) + Consistency (20) + Velocity (15) - Inactivity Penalty (max 30)
 */
export async function POST(request) {
  try {
    const { goalId } = await request.json();

    if (!goalId) {
      return Response.json({ error: "goalId is required" }, { status: 400 });
    }

    // Fetch goal and all its tasks
    const [goal] = await sql`SELECT * FROM goals WHERE id = ${goalId}`;
    if (!goal) {
      return Response.json({ error: "Goal not found" }, { status: 404 });
    }

    const tasks = await sql`SELECT * FROM tasks WHERE goal_id = ${goalId}`;
    const milestones =
      await sql`SELECT * FROM milestones WHERE goal_id = ${goalId}`;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed");
    const completedCount = completedTasks.length;

    const highPriorityTotal = tasks.filter((t) => t.priority === "high").length;
    const highPriorityCompleted = tasks.filter(
      (t) => t.priority === "high" && t.status === "completed",
    ).length;

    // Velocity: tasks completed in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentlyCompleted = completedTasks.filter(
      (t) => t.completed_at && new Date(t.completed_at) > sevenDaysAgo,
    ).length;

    // --- Score Components ---

    // 1. Completion Rate (0-40 pts)
    const completionRate =
      totalTasks > 0 ? (completedCount / totalTasks) * 40 : 0;

    // 2. Priority Accuracy — are high-impact tasks being done first? (0-25 pts)
    const priorityAccuracy =
      highPriorityTotal > 0
        ? (highPriorityCompleted / highPriorityTotal) * 25
        : completedCount > 0
          ? 12.5 // neutral if no high-priority tasks but work is happening
          : 0;

    // 3. Consistency / Streak (0-20 pts) — 4 pts per consecutive active day, max 5 days
    const streak = goal.execution_streak || 0;
    const consistencyScore = Math.min(streak * 4, 20);

    // 4. Velocity (0-15 pts) — recent execution burst
    const velocityScore = Math.min(recentlyCompleted * 2.5, 15);

    // 5. Inactivity Penalty (up to -30 pts)
    const lastActive = goal.last_active_at
      ? new Date(goal.last_active_at)
      : new Date(goal.created_at);
    const daysSinceActive = Math.max(
      0,
      Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const inactivityPenalty = Math.min(daysSinceActive * 3, 30);

    const rawScore =
      completionRate +
      priorityAccuracy +
      consistencyScore +
      velocityScore -
      inactivityPenalty;
    const momentum = Math.max(0, Math.min(100, rawScore));

    const breakdown = {
      completionRate: Math.round(completionRate * 10) / 10,
      priorityAccuracy: Math.round(priorityAccuracy * 10) / 10,
      consistencyScore: Math.round(consistencyScore * 10) / 10,
      velocityScore: Math.round(velocityScore * 10) / 10,
      inactivityPenalty: Math.round(inactivityPenalty * 10) / 10,
      totalTasks,
      completedCount,
      highPriorityTotal,
      highPriorityCompleted,
      recentlyCompleted,
      streak,
      daysSinceActive,
    };

    // Update goal with new momentum score and breakdown
    await sql`
      UPDATE goals 
      SET momentum_score = ${momentum},
          momentum_breakdown = ${JSON.stringify(breakdown)},
          updated_at = NOW()
      WHERE id = ${goalId}
    `;

    // Record in momentum history
    await sql`
      INSERT INTO momentum_history (goal_id, score)
      VALUES (${goalId}, ${momentum})
    `;

    return Response.json({ momentum, breakdown });
  } catch (error) {
    console.error("Momentum calculation error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
