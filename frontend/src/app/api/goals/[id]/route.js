import sql from "@/lib/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const [goal] = await sql`SELECT * FROM goals WHERE id = ${id}`;
    if (!goal)
      return Response.json({ error: "Goal not found" }, { status: 404 });

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

    // Momentum history for analytics chart (last 30 data points)
    const momentumHistory = await sql`
      SELECT score, recorded_at 
      FROM momentum_history 
      WHERE goal_id = ${id}
      ORDER BY recorded_at ASC
      LIMIT 30
    `;

    // Daily execution events for velocity chart (last 14 days)
    const twoWeeksAgo = new Date(
      Date.now() - 14 * 24 * 60 * 60 * 1000,
    ).toISOString();

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
      console.error(
        "Execution events query error (non-fatal):",
        evtErr.message,
      );
      executionEvents = [];
    }

    return Response.json({
      ...goal,
      milestones,
      tasks,
      insights,
      momentumHistory,
      executionEvents,
    });
  } catch (error) {
    console.error("Error fetching goal detail:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
