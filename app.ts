import dotenv from "dotenv";
import { getAsanaTasksForToday } from "./asana";
import { generateEODReport } from "./gpt";

dotenv.config();

const userId = "your_asana_user_id";
const workspaceId = "your_asana_workspace_id";

const main = async () => {
  try {
    const tasks = await getAsanaTasksForToday(userId, workspaceId);
    const report = await generateEODReport(tasks);
    console.log("EOD Report:", report);
  } catch (error) {
    console.error("Error generating report:", error);
  }
};

main();
