import dayjs from "dayjs";
import { getAsanaTasksForToday } from "./asana";
import { ASANA_USER_ID, ASANA_WORKSPACE_ID } from "./config";

const main = async () => {
  try {
    const tasks = await getAsanaTasksForToday(
      ASANA_USER_ID as string,
      ASANA_WORKSPACE_ID as string,
      {
        date: dayjs("11 October 2024"),
      }
    );
    // const report = await generateEODReport(tasks);
    console.log("EOD Report:", tasks);
  } catch (error) {
    console.error("Error generating report:", error);
  }
};

main();
