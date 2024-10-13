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

const client = Asana.ApiClient.instance;
const token = client.authentications["token"];
token.accessToken = process.env.ASANA_TOKEN; // Set your access token from environment variable

// Initialize the Tasks API instance
const tasksApiInstance = new Asana.TasksApi();
const storiesApiInstance = new Asana.StoriesApi();

export const getAsanaTasksForToday = async (
  userId: string,
  workspaceId: string,
  { date }: { date: dayjs.Dayjs } = { date: dayjs() }
): Promise<Task[]> => {
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

export const addCommentToTask = async (taskId: string, comment: string) => {
  try {
    const response = await storiesApiInstance.createStoryForTask(
      {
        data: { text: comment },
      },
      taskId
    );
    console.log(`Comment added to task: ${response.data.text}`);
  } catch (error) {
    console.error("Error adding comment:", error);
  }
};

export const findEndOfDayTaskId = async (
  workspaceId: string,
  userId: string,
  { date }: { date: dayjs.Dayjs } = { date: dayjs() }
): Promise<string | null> => {
  try {
    // Fetch all tasks in the workspace (you can adjust for pagination if necessary)
    const tasksInWorkspace = await tasksApiInstance.getTasks({
      assignee: userId, // Assign the user
      workspace: workspaceId, // Specify the workspace
      opt_fields: "name,gid,assignee",
      modified_since: dayjs(date).toISOString(), // Today's tasks
      // limit: 100, // Limit the number of tasks per request (pagination)
    });

    // Look for the task named "End-of-the-Day Update"
    const endOfDayTask = tasksInWorkspace.data.find(
      (task: any) => task.name === "End-of-the-Day Update"
    );

    if (endOfDayTask) {
      return endOfDayTask.gid; // Return the task ID
    } else {
      console.error('Task "End-of-the-Day Update" not found.');
      return null; // Task not found
    }
  } catch (error) {
    console.error(
      "Error finding or assigning the End-of-the-Day Update task:",
      error
    );
    return null; // Error occurred
  }
};
