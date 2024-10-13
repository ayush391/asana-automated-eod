import { resources } from "asana";
import dayjs from "dayjs";

const Asana = require("asana");

export interface Task {
  id: string;
  name: string;
  completed: boolean;
  modified_at: string;
  due_on?: string;
  notes?: string;
  lastComment?: string; // New field to store the last comment by the user
}

export const getAsanaTasksForToday = async (
  userId: string,
  workspaceId: string,
  { date }: { date: dayjs.Dayjs } = { date: dayjs() }
): Promise<Task[]> => {
  // Initialize Asana client
  const client = Asana.ApiClient.instance;
  const token = client.authentications["token"];
  token.accessToken = process.env.ASANA_TOKEN; // Set your access token from environment variable

  // Initialize the Tasks API instance
  const tasksApiInstance = new Asana.TasksApi();
  const storiesApiInstance = new Asana.StoriesApi(); // Initialize the Stories API

  const opts = {
    assignee: userId, // Assign the user
    workspace: workspaceId, // Specify the workspace
    modified_by: userId,
    modified_since: dayjs(date).toISOString(), // Today's tasks
    opt_fields: "name,completed,modified_at,due_on,notes", // Fields to include in the response
    limit: 100, // Limit the number of tasks per request (pagination)
  };

  try {
    let tasks: Task[] = [];
    let pageIndex = 1;
    let response = await tasksApiInstance.getTasks(opts);

    while (true) {
      console.log(`Page ${pageIndex}:`);
      tasks = tasks.concat(
        response.data.map((task: any) => ({
          id: task.gid,
          name: task.name,
          completed: task.completed,
          modified_at: task.modified_at,
          due_on: task.due_on,
          notes: task.notes, // Get task description
        }))
      );
      pageIndex += 1;

      // Check if there is a next page
      response = await response.nextPage();
      if (!response.data) {
        break;
      }
    }

    // Fetch the last actual comment made by the user for each task
    const tasksWithComments = await Promise.all(
      tasks.map(async (task) => {
        try {
          const comments = await storiesApiInstance.getStoriesForTask(task.id, {
            limit: 10,
          });

          // Filter only user comments (exclude status updates, activity logs)
          const userComments = comments.data.filter(
            (story: resources.Stories.Type) =>
              story.created_by.gid === userId && story.type === "comment"
          );
          const latestComment =
            userComments.length > 0 ? userComments[0].text : null;

          return {
            ...task,
            lastComment: latestComment, // Add the latest comment by the user to the task
          };
        } catch (error) {
          console.error(
            `Error fetching comments for task ${task.name}:`,
            error
          );
          return { ...task, lastComment: null }; // Return the task without the comment in case of error
        }
      })
    );

    return tasksWithComments;
  } catch (error) {
    console.error(
      "Error fetching tasks from Asana:",
      (error as any).response.body
    );
    return [];
  }
};
