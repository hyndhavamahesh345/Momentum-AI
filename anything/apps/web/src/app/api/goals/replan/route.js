import sql from "@/lib/sql";

/**
 * Adaptive Replanning Agent
 * Analyzes current execution state and dynamically reprioritizes tasks,
 * then returns a recovery strategy.
 */
export async function POST(request) {
  try {
    const { goalId } = await request.json();

    if (!goalId) {
      return Response.json({ error: "goalId is required" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "OpenAI API key not configured" },
        { status: 500 },
      );
    }

    const [goal] = await sql`SELECT * FROM goals WHERE id = ${goalId}`;
    if (!goal)
      return Response.json({ error: "Goal not found" }, { status: 404 });

    const tasks =
      await sql`SELECT * FROM tasks WHERE goal_id = ${goalId} AND status != 'completed' ORDER BY impact_score DESC`;
    const milestones =
      await sql`SELECT * FROM milestones WHERE goal_id = ${goalId} ORDER BY order_index`;
    const completedTasks =
      await sql`SELECT COUNT(*) as count FROM tasks WHERE goal_id = ${goalId} AND status = 'completed'`;
    const totalTasks =
      await sql`SELECT COUNT(*) as count FROM tasks WHERE goal_id = ${goalId}`;

    const overdueTasks = tasks.filter(
      (t) => t.due_date && new Date(t.due_date) < new Date(),
    );

    const systemPrompt = `You are Momentum AI's Adaptive Planning Agent — an AI system that dynamically reprioritizes execution when users fall behind.

Your job: analyze a user's current execution state, identify what's blocking progress, and generate a concrete recovery plan.

The recovery plan must include:
1. A prioritized list of the top 5 tasks (by new urgency) with a brief reason why each is critical NOW
2. 3 concrete recovery actions the user should take immediately
3. A one-sentence executive summary of the situation

Be ruthlessly practical. No fluff. Think like a startup advisor who has 24 hours to save a product launch.

Respond ONLY with valid JSON:
{
  "summary": "...",
  "reprioritized_tasks": [
    { "task_id": "...", "task_title": "...", "new_priority": "critical" | "high" | "medium", "reason": "..." }
  ],
  "recovery_actions": ["...", "...", "..."],
  "estimated_recovery_days": 1-7
}`;

    const userPrompt = `GOAL: ${goal.title}
PROGRESS: ${completedTasks[0]?.count || 0}/${totalTasks[0]?.count || 0} tasks done
MOMENTUM SCORE: ${goal.momentum_score?.toFixed(1)}/100
STREAK: ${goal.execution_streak || 0} days
OVERDUE TASKS: ${overdueTasks.length}

PENDING TASKS (by impact score):
${tasks
  .slice(0, 8)
  .map(
    (t) =>
      `- [${t.id}] "${t.title}" | Priority: ${t.priority} | Impact: ${t.impact_score}/10 | Est. Hours: ${t.estimated_hours || "?"}h ${t.due_date && new Date(t.due_date) < new Date() ? "⚠️ OVERDUE" : ""}`,
  )
  .join("\n")}

MILESTONES:
${milestones.map((m) => `- "${m.title}" [${m.status}]`).join("\n")}

Generate a reprioritization and recovery plan. Only include tasks from the pending tasks list above (use exact task_id values).`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`AI service error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const rawContent =
      aiResponse.choices?.[0]?.message?.content || aiResponse.content || "{}";

    let replan;
    try {
      replan =
        typeof rawContent === "string" ? JSON.parse(rawContent) : rawContent;
    } catch (parseErr) {
      console.error("Failed to parse replan JSON:", rawContent);
      throw new Error("AI returned invalid JSON for replan");
    }

    // Apply reprioritization to DB
    if (
      replan.reprioritized_tasks &&
      Array.isArray(replan.reprioritized_tasks)
    ) {
      for (const rt of replan.reprioritized_tasks) {
        if (!rt.task_id) continue;
        const newPriority =
          rt.new_priority === "critical" ? "high" : rt.new_priority || "medium";
        await sql`
          UPDATE tasks 
          SET priority = ${newPriority}, updated_at = NOW()
          WHERE id = ${rt.task_id} AND goal_id = ${goalId}
        `;
      }
    }

    // Save replan as an insight
    if (replan.summary) {
      await sql`
        INSERT INTO ai_insights (goal_id, insight_type, content, urgency, is_read)
        VALUES (${goalId}, 'recovery', ${`🔄 REPLAN: ${replan.summary}`}, 'high', false)
      `;
    }

    return Response.json({ replan });
  } catch (error) {
    console.error("Replan error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
