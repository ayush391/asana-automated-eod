import dotenv from "dotenv";
import { getAsanaTasksForToday } from "./asana";

dotenv.config();

const userId = process.env.ASANA_USER_ID as string;
const workspaceId = process.env.ASANA_WORKSPACE_ID as string;

const main = async () => {
  try {
    const tasks = await getAsanaTasksForToday(userId, workspaceId);
    // const report = await generateEODReport(tasks);
    console.log("EOD Report:", tasks);
  } catch (error) {
    console.error("Error generating report:", error);
  }
};

main();
