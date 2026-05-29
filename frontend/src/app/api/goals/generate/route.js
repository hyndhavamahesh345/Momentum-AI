import sql from "@/lib/sql";

export async function POST(request) {
  try {
    const { goal, userId } = await request.json();

    if (!goal || !userId) {
      return Response.json(
        { error: "Goal and User ID are required" },
        { status: 400 },
      );
    }

    // 1. Create the Goal Record
    const [goalRecord] = await sql`
      INSERT INTO goals (user_id, title, status)
      VALUES (${userId}, ${goal}, 'active')
      RETURNING *
    `;

    // 2. Call OpenAI GPT-4o with structured outputs
    const aiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are the Momentum AI Planning Agent. Your job is to take a high-level goal and decompose it into a structured execution roadmap with real learning resources.

Breakdown the goal into 3-5 high-level milestones, and for each milestone, 4-6 actionable, granular tasks.

For EVERY task, provide 2-3 real, specific learning resources. These MUST be actual, real URLs that exist:
- YouTube videos: use real YouTube video URLs (e.g. https://www.youtube.com/watch?v=...)
- Documentation: link to official docs (e.g. https://docs.python.org, https://reactjs.org/docs)
- Articles: link to real blog posts or guides (e.g. medium.com, dev.to, freecodecamp.org)
- Tools: link to actual tools (e.g. https://github.com/..., https://figma.com)

Resource types: "video", "article", "docs", "tool"

Assign priority (low, medium, high) and impact_score (1-10) to each task.`,
            },
            {
              role: "user",
              content: `Goal: ${goal}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "roadmap_generation",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  milestones: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        tasks: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              title: { type: "string" },
                              description: { type: "string" },
                              priority: {
                                type: "string",
                                enum: ["low", "medium", "high"],
                              },
                              impact_score: { type: "integer" },
                              estimated_hours: { type: "number" },
                              resources: {
                                type: "array",
                                items: {
                                  type: "object",
                                  properties: {
                                    title: { type: "string" },
                                    url: { type: "string" },
                                    type: {
                                      type: "string",
                                      enum: [
                                        "video",
                                        "article",
                                        "docs",
                                        "tool",
                                      ],
                                    },
                                  },
                                  required: ["title", "url", "type"],
                                  additionalProperties: false,
                                },
                              },
                            },
                            required: [
                              "title",
                              "description",
                              "priority",
                              "impact_score",
                              "estimated_hours",
                              "resources",
                            ],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["title", "description", "tasks"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["milestones"],
                additionalProperties: false,
              },
            },
          },
          temperature: 0.7,
        }),
      },
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`AI Agent failed: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();

    // Guard: check choices exist
    const messageContent = aiData.choices?.[0]?.message?.content;
    if (!messageContent) {
      console.error("No content in OpenAI response:", JSON.stringify(aiData));
      throw new Error("OpenAI returned empty response");
    }

    // Safe parse: handle both string JSON and already-parsed objects
    let roadmap;
    try {
      roadmap =
        typeof messageContent === "string"
          ? JSON.parse(messageContent)
          : messageContent;
    } catch (parseErr) {
      console.error("Failed to parse OpenAI JSON:", messageContent);
      throw new Error("AI returned invalid JSON for roadmap");
    }

    if (!roadmap?.milestones?.length) {
      throw new Error("AI returned empty roadmap — no milestones found");
    }

    // 3. Persist Roadmap to DB (Milestones & Tasks)
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
            ${milestone.id},
            ${goalRecord.id},
            ${tData.title},
            ${tData.description},
            ${tData.priority},
            ${tData.impact_score},
            ${tData.estimated_hours},
            ${JSON.stringify(resources)}
          )
        `;
      }
    }

    return Response.json({ success: true, goalId: goalRecord.id });
  } catch (error) {
    console.error("Error in generate-roadmap:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
