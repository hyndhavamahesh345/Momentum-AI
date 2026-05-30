import express from 'express';
import sql from '../config/db.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { goalId } = req.body;

    if (!goalId) return res.status(400).json({ error: "goalId is required" });
    if (!process.env.OPENROUTER_API_KEY) return res.status(500).json({ error: "OpenRouter API key not configured" });

    const [goal] = await sql`SELECT * FROM goals WHERE id = ${goalId}`;
    if (!goal) return res.status(404).json({ error: "Goal not found" });

    const tasks = await sql`SELECT * FROM tasks WHERE goal_id = ${goalId} ORDER BY priority DESC, impact_score DESC`;
    const milestones = await sql`SELECT * FROM milestones WHERE goal_id = ${goalId} ORDER BY order_index`;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const highPriorityPending = tasks.filter((t) => t.priority === "high" && t.status !== "completed");
    const overdueTasks = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed");
    const completedMilestones = milestones.filter((m) => m.status === "completed").length;
    const streak = goal.execution_streak || 0;
    const momentumScore = goal.momentum_score || 0;
    const daysSinceActive = goal.last_active_at ? Math.floor((Date.now() - new Date(goal.last_active_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

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
${highPriorityPending.slice(0, 3).map((t) => `- "${t.title}" (impact: ${t.impact_score}/10)`).join("\n") || "None"}

OVERDUE TASKS:
${overdueTasks.slice(0, 3).map((t) => `- "${t.title}"`).join("\n") || "None"}

Generate 3 insights that would genuinely help this user execute faster and smarter.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:4000",
        "X-Title": "Momentum AI",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL_PRO || "openai/gpt-4o",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        response_format: { type: "json_object" },
        temperature: 0.8,
      }),
    });

    if (!response.ok) throw new Error(`AI service error: ${response.status}`);

    const aiResponse = await response.json();
    const rawContent = aiResponse.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = typeof rawContent === "string" ? JSON.parse(rawContent) : rawContent;
    } catch (parseErr) {
      throw new Error("AI returned invalid JSON for insights");
    }
    const insights = parsed.insights || [];

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

    return res.json({ insights: savedInsights });
  } catch (error) {
    console.error("Insights generation error:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
