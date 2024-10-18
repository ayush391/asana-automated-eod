import { TaskGroup } from "./gemini";

const formatTaskList = (taskGroups: TaskGroup) => {
  return Object.entries(taskGroups)
    .map(
      ([project, tasks]) =>
        `${project}:\n${tasks
          .map((task) => `  - ${task.name}\n    Comments: ${task.comments}`)
          .join("\n")}`
    )
    .join("\n\n");
};

export const generatePrompt = (
  completedTasks: TaskGroup,
  ongoingTasks: TaskGroup
) => {
  const prompt = `
  Generate a simple, text-only End-of-Day (EOD) report for the following data:
  
  Completed tasks:
  ${formatTaskList(completedTasks)}
  
  Ongoing tasks:
  ${formatTaskList(ongoingTasks)}
  
  Please include the following sections in plain text, with indentation:
  
  1. How was your day?
  
  [Generate a brief summary of the day, indented by 2 spaces]
  
  2. What did you work on today?
  
  [List the completed tasks and provide a brief description of the work done, indented by 2 spaces. For each task, summarize in 2-3 lines what was done based on the comments provided. Do not include any specific names or Asana profiles.]
  
  3. What do you plan to work on tomorrow?
  
  [List the ongoing tasks and any new tasks planned for tomorrow, indented by 2 spaces. For each task, briefly mention (in 1-2 lines) what needs to be done next based on the comments. Do not include any specific names or Asana profiles.]
  
  4. Are we still on track with all the tasks in the current sprint?
  
  [Provide a brief assessment of the sprint progress, indented by 2 spaces]
  
  5. Are there any blockers?
  
  [Mention any blockers or challenges, if any, indented by 2 spaces]
  
  6. Anything new/interesting you learnt today?
  
  [Share any new insights or learnings from the day, indented by 2 spaces]
  
  Important: Use simple text only, but add indentation (2 spaces) for the content under each section. When mentioning tasks, group them by their projects and indent the tasks. Use the comments provided for each task to give context about what was done or what needs to be done next. Do not include any specific names or Asana profiles in the report.
  `;

  return prompt;
};
