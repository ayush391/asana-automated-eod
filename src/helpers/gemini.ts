import { GEMINI_API_KEY } from "../config";
import { Task } from "./asana";

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateEODReport = async (tasks: Task[]): Promise<string> => {
  const completedTasks = tasks
    .filter((task) => task.completed)
    .map((task) => JSON.stringify(task));
  const ongoingTasks = tasks
    .filter((task) => !task.completed)
    .map((task) => JSON.stringify(task));
  const prompt = `
        Generate an End-of-Day (EOD) report that has simple text, no formatting please, for the following data:
        - Completed tasks: ${
          completedTasks.length > 0 ? completedTasks.join(", ") : "None"
        }
        - Ongoing tasks: ${
          ongoingTasks.length > 0 ? ongoingTasks.join(", ") : "None"
        }
        Please format the report professionally with the following sections:
        1. How was your day?
        2. What did you work on today?
        3. What do you plan to work on tomorrow?
        4. Are we still on track with all the tasks in the current sprint?
        5. Are there any blockers?
        6. Anything new/interesting you learnt today?
    `;
  console.log(prompt);

  try {
    const result = await model.generateContent([prompt]);

    return result?.response?.text() || "";
  } catch (error) {
    console.error("Error generating EOD report:", error);
    return "Error generating report";
  }
};
