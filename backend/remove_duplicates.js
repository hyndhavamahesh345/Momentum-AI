import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function removeDuplicates() {
  try {
    console.log("Fetching all goals...");
    const goals = await sql`SELECT id, user_id, title, created_at FROM goals ORDER BY created_at DESC`;
    
    const seen = new Set();
    const toDelete = [];

    for (const goal of goals) {
      const key = `${goal.user_id}_${goal.title.toLowerCase().trim()}`;
      if (seen.has(key)) {
        toDelete.push(goal.id);
      } else {
        seen.add(key);
      }
    }

    if (toDelete.length > 0) {
      console.log(`Found ${toDelete.length} duplicates. Deleting...`);
      // Delete tasks and milestones first to avoid foreign key constraint errors if not cascading
      // But we can just delete from goals if ON DELETE CASCADE is set. Let's try.
      for (const id of toDelete) {
        await sql`DELETE FROM tasks WHERE milestone_id IN (SELECT id FROM milestones WHERE goal_id = ${id})`;
        await sql`DELETE FROM milestones WHERE goal_id = ${id}`;
        await sql`DELETE FROM goals WHERE id = ${id}`;
      }
      console.log("Duplicates removed successfully.");
    } else {
      console.log("No duplicates found.");
    }
  } catch (error) {
    console.error("Error removing duplicates:", error);
  }
}

removeDuplicates();
