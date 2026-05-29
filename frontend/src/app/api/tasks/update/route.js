import sql from "@/lib/sql";

export async function POST(request) {
  try {
    const { taskId, status, userId } = await request.json();

    if (!taskId || !status) {
      return Response.json(
        { error: "Task ID and Status are required" },
        { status: 400 },
      );
    }

    // Fix: use actual date or null — not string literals
    const completedAt =
      status === "completed" ? new Date().toISOString() : null;

    const [updatedTask] = await sql`
      UPDATE tasks 
      SET status = ${status}, 
          completed_at = ${completedAt},
          updated_at = NOW()
      WHERE id = ${taskId}
      RETURNING *
    `;

    if (!updatedTask) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    const goalId = updatedTask.goal_id;

    if (status === "completed") {
      // --- Streak Engine ---
      const [currentGoal] = await sql`
        SELECT last_active_at, execution_streak FROM goals WHERE id = ${goalId}
      `;

      const now = new Date();
      let newStreak = currentGoal.execution_streak || 0;

      if (currentGoal.last_active_at) {
        const lastActive = new Date(currentGoal.last_active_at);
        const hoursSinceActive =
          (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

        if (hoursSinceActive < 24) {
          // Active today already — streak stays, don't increment
        } else if (hoursSinceActive < 48) {
          // Active yesterday — extend streak
          newStreak = newStreak + 1;
        } else {
          // Inactive for 2+ days — reset streak
          newStreak = 1;
        }
      } else {
        // First activity ever on this goal
        newStreak = 1;
      }

      // --- Log Execution Event ---
      await sql`
        INSERT INTO execution_events (user_id, event_type, metadata)
        VALUES (
          ${userId || "anonymous"},
          'task_completed',
          ${JSON.stringify({
            taskId,
            goalId,
            impactScore: updatedTask.impact_score,
            priority: updatedTask.priority,
          })}
        )
      `;

      // --- Update Goal: streak + last_active_at ---
      await sql`
        UPDATE goals 
        SET last_active_at = NOW(),
            execution_streak = ${newStreak},
            updated_at = NOW()
        WHERE id = ${goalId}
      `;
    } else {
      // Task un-completed — log the reversal
      await sql`
        INSERT INTO execution_events (user_id, event_type, metadata)
        VALUES (
          ${userId || "anonymous"},
          'task_reverted',
          ${JSON.stringify({ taskId, goalId })}
        )
      `;
    }

    // --- Recalculate Advanced Momentum Score ---
    const allTasks = await sql`SELECT * FROM tasks WHERE goal_id = ${goalId}`;
    const [goal] = await sql`SELECT * FROM goals WHERE id = ${goalId}`;

    const totalTasks = allTasks.length;
    const completedCount = allTasks.filter(
      (t) => t.status === "completed",
    ).length;
    const highPriorityTotal = allTasks.filter(
      (t) => t.priority === "high",
    ).length;
    const highPriorityCompleted = allTasks.filter(
      (t) => t.priority === "high" && t.status === "completed",
    ).length;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentlyCompleted = allTasks.filter(
      (t) => t.completed_at && new Date(t.completed_at) > sevenDaysAgo,
    ).length;

    const completionRate =
      totalTasks > 0 ? (completedCount / totalTasks) * 40 : 0;
    const priorityAccuracy =
      highPriorityTotal > 0
        ? (highPriorityCompleted / highPriorityTotal) * 25
        : completedCount > 0
          ? 12.5
          : 0;
    const streak = goal.execution_streak || 0;
    const consistencyScore = Math.min(streak * 4, 20);
    const velocityScore = Math.min(recentlyCompleted * 2.5, 15);

    const lastActive = goal.last_active_at
      ? new Date(goal.last_active_at)
      : new Date(goal.created_at);
    const daysSinceActive = Math.max(
      0,
      Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const inactivityPenalty = Math.min(daysSinceActive * 3, 30);

    const momentum = Math.max(
      0,
      Math.min(
        100,
        completionRate +
          priorityAccuracy +
          consistencyScore +
          velocityScore -
          inactivityPenalty,
      ),
    );

    const breakdown = {
      completionRate: Math.round(completionRate * 10) / 10,
      priorityAccuracy: Math.round(priorityAccuracy * 10) / 10,
      consistencyScore: Math.round(consistencyScore * 10) / 10,
      velocityScore: Math.round(velocityScore * 10) / 10,
      inactivityPenalty: Math.round(inactivityPenalty * 10) / 10,
    };

    await sql`
      UPDATE goals 
      SET momentum_score = ${momentum},
          momentum_breakdown = ${JSON.stringify(breakdown)},
          updated_at = NOW()
      WHERE id = ${goalId}
    `;

    // Record momentum history point
    await sql`
      INSERT INTO momentum_history (goal_id, score)
      VALUES (${goalId}, ${momentum})
    `;

    return Response.json({ ...updatedTask, newMomentum: momentum, breakdown });
  } catch (error) {
    console.error("Error updating task:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
