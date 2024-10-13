import dayjs from "dayjs";
import * as fs from "fs";
import * as path from "path";
import { ASANA_USER_ID, ASANA_WORKSPACE_ID } from "./config";
import {
  addCommentToTask,
  findEndOfDayTaskId,
  getAsanaTasksForToday,
} from "./helpers/asana";
import { generateEODReport } from "./helpers/gemini";
const Date = dayjs("11 October 2024");
const main = async () => {
  try {
    const tasks = await getAsanaTasksForToday(
      ASANA_USER_ID as string,
      ASANA_WORKSPACE_ID as string,
      {
        date: Date,
      }
    );
    const report = await generateEODReport(tasks);
    if (report) {
      const eodTaskId = await findEndOfDayTaskId(
        ASANA_WORKSPACE_ID as string,
        ASANA_USER_ID as string,
        { date: Date }
      );
      console.log("eodTaskId", eodTaskId);
      if (eodTaskId) {
        await addCommentToTask(eodTaskId, report);
      }
    }
    // Define the file path and name
    const filePath = path.join("EOD_Report.txt");

    // Write the report to a file
    fs.writeFileSync(filePath, report);

    console.log("EOD Report generated and saved to:", report);
    console.log("EOD Report generated and saved to:", filePath);
  } catch (error) {
    console.error("Error generating report:", error);
  }
};

main();
