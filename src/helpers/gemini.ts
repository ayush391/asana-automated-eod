import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "../config";
import { Task } from "./asana";
import { generatePrompt } from "./prompt";
export type TaskGroup = Record<string, { name: string; comments: string }[]>;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
export const generateEODReport = async (tasks: Task[]): Promise<string> => {
  const groupTasksByProject = (tasks: Task[]) => {
    return tasks.reduce((acc, task) => {
      if (!acc[task.project]) {
        acc[task.project] = [];
      }
      acc[task.project].push({
        name: task.name,
        comments:
          task.comments
            ?.map((comment) => comment.text)
            .join(", ")
            .replace(/\[.*?'s Asana profile\]/g, "QA") || "No comments",
      });
      return acc;
    }, {} as TaskGroup);
  };

  const completedTasks = groupTasksByProject(
    tasks.filter((task) => task.completed)
  );
  const ongoingTasks = groupTasksByProject(
    tasks.filter((task) => !task.completed)
  );
  const prompt = generatePrompt(completedTasks, ongoingTasks);
  try {
    const result = await model.generateContent([prompt]);
    return result?.response?.text() || "";
  } catch (error) {
    console.error("Error generating EOD report:", error);
    return "Error generating report";
  }
};
