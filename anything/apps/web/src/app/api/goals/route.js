import sql from "@/lib/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    const goals = await sql`
      SELECT * FROM goals 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;

    return Response.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
