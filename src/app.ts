import * as fs from "fs";
import * as path from "path";
import {
  ASANA_USER_ID,
  ASANA_WORKSPACE_ID,
  EOD_DATE,
  EOD_REPORT_FOLDER,
  POST_TO_ASANA,
} from "./config";
import {
  addCommentToTask,
  findEndOfDayTaskId,
  getAsanaTasksForToday,
} from "./helpers/asana";
import { generateEODReport } from "./helpers/gemini";

const main = async () => {
  try {
    const tasks = await getAsanaTasksForToday(
      ASANA_USER_ID as string,
      ASANA_WORKSPACE_ID as string,
      {
        date: EOD_DATE,
      }
    );
    const report = await generateEODReport(tasks);

    if (POST_TO_ASANA && report) {
      const eodTaskId = await findEndOfDayTaskId(
        ASANA_WORKSPACE_ID as string,
        ASANA_USER_ID as string,
        { date: EOD_DATE }
      );
      console.log("eodTaskId", eodTaskId);
      if (eodTaskId) {
        await addCommentToTask(eodTaskId, report);
      }
    }

    // Define the file path and name
    fs.mkdirSync(EOD_REPORT_FOLDER, { recursive: true });
    const fileName = `EOD_Report_${EOD_DATE.format("YYYY-MM-DD")}.txt`;
    const filePath = path.join(EOD_REPORT_FOLDER, fileName);

    // Write the report to a file
    fs.writeFileSync(filePath, report);

    console.log("EOD Report generated and saved to:", filePath);
  } catch (error) {
    console.error("Error generating report:", error);
  }
};

main();
