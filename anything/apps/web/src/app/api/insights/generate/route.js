import sql from "@/lib/sql";

const INSIGHT_TYPES = [
  "strategy",
  "blocker",
  "recovery",
  "momentum",
  "warning",
];

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

    // Fetch full goal state
    const [goal] = await sql`SELECT * FROM goals WHERE id = ${goalId}`;
    if (!goal)
      return Response.json({ error: "Goal not found" }, { status: 404 });

    const tasks =
      await sql`SELECT * FROM tasks WHERE goal_id = ${goalId} ORDER BY priority DESC, impact_score DESC`;
    const milestones =
      await sql`SELECT * FROM milestones WHERE goal_id = ${goalId} ORDER BY order_index`;

    // Compute execution state
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const highPriorityPending = tasks.filter(
      (t) => t.priority === "high" && t.status !== "completed",
    );
    const overdueTasks = tasks.filter(
      (t) =>
        t.due_date &&
        new Date(t.due_date) < new Date() &&
        t.status !== "completed",
    );
    const completedMilestones = milestones.filter(
      (m) => m.status === "completed",
    ).length;
    const streak = goal.execution_streak || 0;
    const momentumScore = goal.momentum_score || 0;
    const daysSinceActive = goal.last_active_at
      ? Math.floor(
          (Date.now() - new Date(goal.last_active_at).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

    const systemPrompt = `You are Momentum AI's Strategy Agent — a world-class AI Chief of Staff and execution intelligence engine.
Your job is to analyze a user's execution state and generate 3 sharp, specific, actionable intelligence insights.
Each insight must be direct, tactical, and ruthlessly focused on execution — NOT generic advice.
Think like a VC-backed founder's chief of staff who has seen 1000 failed startups.

Respond ONLY with valid JSON. No markdown, no explanation outside the JSON.

Output format:
{
  "insights": [
    {
      "type": "strategy" | "blocker" | "recovery" | "momentum" | "warning",
      "urgency": "high" | "medium" | "low",
      "content": "One powerful, specific sentence of execution guidance."
    }
  ]
}

Types:
- strategy: Next best action to accelerate progress
- blocker: Something actively impeding execution
- recovery: How to recover from a delay or drop in momentum
- momentum: Positive signal to reinforce consistent behavior
- warning: An urgent risk requiring immediate attention`;

    const userPrompt = `Analyze this execution state and generate 3 targeted insights:

GOAL: ${goal.title}
DESCRIPTION: ${goal.description || "Not specified"}

EXECUTION METRICS:
- Progress: ${completedTasks}/${totalTasks} tasks completed (${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
- Milestones: ${completedMilestones}/${milestones.length} completed
- Momentum Score: ${momentumScore.toFixed(1)}/100
- Execution Streak: ${streak} consecutive days
- Days Since Last Activity: ${daysSinceActive}
- Overdue Tasks: ${overdueTasks.length}
- High Priority Tasks Still Pending: ${highPriorityPending.length}

TOP PENDING HIGH-PRIORITY TASKS:
${
  highPriorityPending
    .slice(0, 3)
    .map((t) => `- "${t.title}" (impact: ${t.impact_score}/10)`)
    .join("\n") || "None"
}

OVERDUE TASKS:
${
  overdueTasks
    .slice(0, 3)
    .map((t) => `- "${t.title}"`)
    .join("\n") || "None"
}

Generate 3 insights that would genuinely help this user execute faster and smarter.`;

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
        temperature: 0.8,
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

    let parsed;
    try {
      parsed =
        typeof rawContent === "string" ? JSON.parse(rawContent) : rawContent;
    } catch (parseErr) {
      console.error("Failed to parse insights JSON:", rawContent);
      throw new Error("AI returned invalid JSON for insights");
    }
    const insights = parsed.insights || [];

    // Clear old unread insights and save new ones
    await sql`DELETE FROM ai_insights WHERE goal_id = ${goalId} AND is_read = false`;

    const savedInsights = [];
    for (const insight of insights) {
      const [saved] = await sql`
        INSERT INTO ai_insights (goal_id, insight_type, content, urgency, is_read)
        VALUES (${goalId}, ${insight.type}, ${insight.content}, ${insight.urgency || "medium"}, false)
        RETURNING *
      `;
      savedInsights.push(saved);
    }

    return Response.json({ insights: savedInsights });
  } catch (error) {
    console.error("Insights generation error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
