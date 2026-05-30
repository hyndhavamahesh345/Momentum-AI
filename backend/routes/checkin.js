import express from 'express';
import sql from '../config/db.js';

const router = express.Router();

// POST /api/checkin — Daily AI Check-In
router.post('/', async (req, res) => {
  try {
    const { goalId, accomplished, blockers, nextSteps } = req.body;
    const userId = req.user.id;

    if (!goalId) return res.status(400).json({ error: "goalId is required" });
    if (!process.env.OPENROUTER_API_KEY) return res.status(500).json({ error: "OpenRouter API key not configured" });

    const [goal] = await sql`SELECT * FROM goals WHERE id = ${goalId}`;
    if (!goal) return res.status(404).json({ error: "Goal not found" });

    const tasks = await sql`SELECT * FROM tasks WHERE goal_id = ${goalId} ORDER BY priority DESC, impact_score DESC`;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    const pendingTasks = tasks.filter(t => t.status !== "completed");
    const highPriorityPending = pendingTasks.filter(t => t.priority === "high");
    const momentumScore = goal.momentum_score || 0;
    const streak = goal.execution_streak || 0;

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:4000",
        "X-Title": "Momentum AI",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are Momentum AI's Daily Coach — an empathetic but direct AI execution coach.
The user just completed their daily check-in. Analyze their standup responses alongside their execution data to generate a daily execution report.

Be encouraging but honest. If they're falling behind, say so tactfully. If they're doing well, celebrate it.

Return ONLY valid JSON:
{
  "dailyMomentum": number (0-100, your estimate of today's execution quality),
  "riskLevel": "low" | "medium" | "high",
  "riskReason": "string" (1 sentence explaining the risk level),
  "nextFocus": "string" (the single most important thing to work on next),
  "encouragement": "string" (a personalized, motivating message — not generic),
  "adjustments": ["string", "string"] (1-3 suggested task reprioritizations or tactical shifts),
  "streakMessage": "string" (comment on their consistency streak)
}`
          },
          {
            role: "user",
            content: `Goal: ${goal.title}

DAILY CHECK-IN:
What I accomplished today: ${accomplished || "Nothing reported"}
What blocked me: ${blockers || "No blockers reported"}
What I'll do tomorrow: ${nextSteps || "Not specified"}

EXECUTION CONTEXT:
- Overall Progress: ${completedTasks}/${totalTasks} tasks (${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)
- Current Momentum: ${Number(momentumScore).toFixed(1)}/100
- Execution Streak: ${streak} days
- High Priority Tasks Remaining: ${highPriorityPending.length}

TOP PENDING TASKS:
${pendingTasks.slice(0, 5).map(t => `- [${t.priority}] "${t.title}" (impact: ${t.impact_score}/10)`).join("\n") || "None"}

Generate a daily execution report.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) throw new Error(`AI service error: ${aiResponse.status}`);

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = typeof rawContent === "string" ? JSON.parse(rawContent) : rawContent;
    } catch (parseErr) {
      throw new Error("AI returned invalid JSON for check-in report");
    }

    // Log the check-in as an execution event
    try {
      await sql`
        INSERT INTO execution_events (user_id, event_type, metadata)
        VALUES (${userId || "anonymous"}, 'daily_checkin', ${JSON.stringify({
          goalId,
          accomplished: accomplished?.slice(0, 500),
          dailyMomentum: parsed.dailyMomentum,
          riskLevel: parsed.riskLevel,
        })})
      `;
    } catch (evtErr) {
      console.error("Check-in event logging error (non-fatal):", evtErr.message);
    }

    return res.json({
      dailyMomentum: parsed.dailyMomentum || 50,
      riskLevel: parsed.riskLevel || "medium",
      riskReason: parsed.riskReason || "",
      nextFocus: parsed.nextFocus || "",
      encouragement: parsed.encouragement || "",
      adjustments: parsed.adjustments || [],
      streakMessage: parsed.streakMessage || "",
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
