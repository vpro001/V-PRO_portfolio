import { listProjects } from "@/lib/data";
import { json } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return json.ok({ projects: await listProjects() });
  } catch (error) {
    console.error("[projects]", error);
    return json.error("Projects couldn't be loaded.", 500);
  }
}
