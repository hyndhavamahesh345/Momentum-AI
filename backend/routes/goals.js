import express from 'express';
import sql from '../config/db.js';

const router = express.Router();

// GET /api/goals
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const goals = await sql`
      SELECT * FROM goals 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;

    return res.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/goals/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [goal] = await sql`SELECT * FROM goals WHERE id = ${id}`;
    if (!goal) return res.status(404).json({ error: "Goal not found" });

    const milestones = await sql`
      SELECT * FROM milestones 
      WHERE goal_id = ${id} 
      ORDER BY order_index ASC
    `;

    const tasks = await sql`
      SELECT * FROM tasks 
      WHERE goal_id = ${id} 
      ORDER BY created_at ASC
    `;

    const insights = await sql`
      SELECT * FROM ai_insights 
      WHERE goal_id = ${id} 
      ORDER BY created_at DESC 
      LIMIT 5
    `;

    const momentumHistory = await sql`
      SELECT score, recorded_at 
      FROM momentum_history 
      WHERE goal_id = ${id}
      ORDER BY recorded_at ASC
      LIMIT 30
    `;

    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    let executionEvents = [];
    try {
      executionEvents = await sql`
        SELECT 
          DATE(created_at) as day,
          COUNT(*) as count
        FROM execution_events
        WHERE (metadata->>'goalId')::text = ${String(id)}
          AND event_type = 'task_completed'
          AND created_at >= ${twoWeeksAgo}
        GROUP BY DATE(created_at)
        ORDER BY day ASC
      `;
    } catch (evtErr) {
      console.error("Execution events query error (non-fatal):", evtErr.message);
      executionEvents = [];
    }

    return res.json({
      ...goal,
      milestones,
      tasks,
      insights,
      momentumHistory,
      executionEvents,
    });
  } catch (error) {
    console.error("Error fetching goal detail:", error);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/goals/generate
router.post('/generate', async (req, res) => {
  try {
    const { goal, userId } = req.body;

    if (!goal || !userId) {
      return res.status(400).json({ error: "Goal and User ID are required" });
    }

    const [goalRecord] = await sql`
      INSERT INTO goals (user_id, title, status)
      VALUES (${userId}, ${goal}, 'active')
      RETURNING *
    `;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are the Momentum AI Planning Agent. Your job is to take a high-level goal and decompose it into a structured execution roadmap with real learning resources.

Breakdown the goal into 2-3 high-level milestones, and for each milestone, 2-4 actionable, granular tasks.

For EVERY task, provide 1-2 learning resources. You can use generic or placeholder URLs (like https://youtube.com/results?search_query=...) if you don't know the exact link.
- YouTube videos: use real YouTube video URLs (e.g. https://www.youtube.com/watch?v=...)
- Documentation: link to official docs (e.g. https://docs.python.org, https://reactjs.org/docs)
- Articles: link to real blog posts or guides (e.g. medium.com, dev.to, freecodecamp.org)
- Tools: link to actual tools (e.g. https://github.com/..., https://figma.com)

Resource types: "video", "article", "docs", "tool"

Assign priority (low, medium, high) and impact_score (1-10) to each task.

CRITICAL: You MUST output ONLY a valid JSON object with the following structure:
{
  "milestones": [
    {
      "title": "string",
      "description": "string",
      "tasks": [
        {
          "title": "string",
          "description": "string",
          "priority": "low" | "medium" | "high",
          "impact_score": number,
          "estimated_hours": number,
          "resources": [
            { "title": "string", "url": "string", "type": "video" | "article" | "docs" | "tool" }
          ]
        }
      ]
    }
  ]
}`,
          },
          { role: "user", content: `Goal: ${goal}` },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`AI Agent failed: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    const messageContent = aiData.choices?.[0]?.message?.content;
    if (!messageContent) throw new Error("OpenAI returned empty response");

    let roadmap;
    try {
      roadmap = typeof messageContent === "string" ? JSON.parse(messageContent) : messageContent;
    } catch (parseErr) {
      throw new Error("AI returned invalid JSON for roadmap");
    }

    if (!roadmap?.milestones?.length) throw new Error("AI returned empty roadmap — no milestones found");

    const milestoneInserts = roadmap.milestones.map((m, index) => ({
      goal_id: goalRecord.id,
      title: m.title,
      description: m.description,
      order_index: index,
      tasks: m.tasks,
    }));

    for (const mData of milestoneInserts) {
      const [milestone] = await sql`
        INSERT INTO milestones (goal_id, title, description, order_index)
        VALUES (${mData.goal_id}, ${mData.title}, ${mData.description}, ${mData.order_index})
        RETURNING id
      `;

      for (const tData of mData.tasks) {
        const resources = tData.resources || [];
        await sql`
          INSERT INTO tasks (milestone_id, goal_id, title, description, priority, impact_score, estimated_hours, resources)
          VALUES (
            ${milestone.id}, ${goalRecord.id}, ${tData.title}, ${tData.description}, 
            ${tData.priority}, ${tData.impact_score}, ${tData.estimated_hours}, 
            ${JSON.stringify(resources)}
          )
        `;
      }
    }

    return res.json({ success: true, goalId: goalRecord.id });
  } catch (error) {
    console.error("Error in generate-roadmap:", error);
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/goals/replan
router.post('/replan', async (req, res) => {
  try {
    const { goalId } = req.body;

    if (!goalId) {
      return res.status(400).json({ error: "Goal ID is required" });
    }

    const [goal] = await sql`SELECT * FROM goals WHERE id = ${goalId}`;
    if (!goal) return res.status(404).json({ error: "Goal not found" });

    const unfinishedTasks = await sql`
      SELECT id, title, description, status 
      FROM tasks 
      WHERE goal_id = ${goalId} AND status != 'completed'
    `;

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are the Momentum AI Replanning Agent. The user is stuck.
Analyze the unfinished tasks for this goal and suggest 1-2 new, smaller, high-priority tasks to unblock them.
Return ONLY a valid JSON object with the following structure:
{
  "newTasks": [
    {
      "title": "string",
      "description": "string",
      "priority": "high",
      "impact_score": number,
      "estimated_hours": number,
      "resources": [
        { "title": "string", "url": "string", "type": "video" | "article" | "docs" | "tool" }
      ]
    }
  ]
}`,
          },
          {
            role: "user",
            content: `Goal: ${goal.title}\nUnfinished tasks: ${JSON.stringify(unfinishedTasks)}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) throw new Error("AI Agent failed to replan");

    const aiData = await aiResponse.json();
    const messageContent = aiData.choices?.[0]?.message?.content;
    const replan = typeof messageContent === "string" ? JSON.parse(messageContent) : messageContent;

    const [milestone] = await sql`
      SELECT id FROM milestones WHERE goal_id = ${goalId} ORDER BY order_index ASC LIMIT 1
    `;

    for (const tData of replan.newTasks) {
      const resources = tData.resources || [];
      await sql`
        INSERT INTO tasks (milestone_id, goal_id, title, description, priority, impact_score, estimated_hours, resources, status)
        VALUES (
          ${milestone.id}, ${goalId}, ${tData.title}, ${tData.description}, 
          ${tData.priority}, ${tData.impact_score}, ${tData.estimated_hours}, 
          ${JSON.stringify(resources)}, 'in-progress'
        )
      `;
    }

    return res.json({ success: true, newTasksAdded: replan.newTasks.length });
  } catch (error) {
    console.error("Error in replan-roadmap:", error);
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Assuming neon DB, explicitly delete children if no CASCADE
    await sql`DELETE FROM ai_insights WHERE goal_id = ${id}`;
    await sql`DELETE FROM execution_events WHERE (metadata->>'goalId')::text = ${String(id)}`;
    await sql`DELETE FROM momentum_history WHERE goal_id = ${id}`;
    await sql`DELETE FROM tasks WHERE goal_id = ${id}`;
    await sql`DELETE FROM milestones WHERE goal_id = ${id}`;
    const [deletedGoal] = await sql`DELETE FROM goals WHERE id = ${id} RETURNING id`;

    if (!deletedGoal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    return res.json({ success: true, deletedId: id });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return res.status(500).json({ error: error.message });
  }
});

export default router;
