import OpenAI, { ClientOptions } from "openai";

const configuration: ClientOptions = {
  apiKey: process.env.OPENAI_API_KEY,
};
const openai = new OpenAI(configuration);

interface Task {
  name: string;
  completed: boolean;
}

export const generateEODReport = async (tasks: Task[]): Promise<string> => {
  const completedTasks = tasks
    .filter((task) => task.completed)
    .map((task) => task.name);
  const ongoingTasks = tasks
    .filter((task) => !task.completed)
    .map((task) => task.name);

  const prompt = `
        Generate an End-of-Day (EOD) report for the following data:
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

  try {
    const response = await openai.chat.completions.create({
      model: "text-davinci-003",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response?.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("Error generating EOD report:", error);
    return "Error generating report";
  }
};
