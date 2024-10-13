import dayjs from "dayjs";

const Asana = require("asana");

export interface Task {
  name: string;
  completed: boolean;
  modified_at: string;
  due_on?: string;
  notes?: string;
}

export const getAsanaTasksForToday = async (
  userId: string,
  workspaceId: string
): Promise<Task[]> => {
  // Initialize Asana client
  let client = Asana.ApiClient.instance;
  let token = client.authentications["token"];
  token.accessToken = process.env.ASANA_TOKEN; // Set your access token from environment variable

  // Initialize the Tasks API instance
  let tasksApiInstance = new Asana.TasksApi();
  let opts = {
    assignee: userId, // Assign the user
    workspace: workspaceId, // Specify the workspace
    modified_since: dayjs().subtract(1, "day").toISOString(), // Today's tasks
    opt_fields: "name,completed,modified_at,due_on,notes", // Fields to include in the response
    limit: 100, // Limit the number of tasks per request (pagination)
  };

  try {
    let tasks: Task[] = [];
    let pageIndex = 1;
    let response = await tasksApiInstance.getTasks(opts);

    while (true) {
      // Do something with the page results
      console.log(`Page ${pageIndex}:`);
      tasks = tasks.concat(
        response.data.map((task: any) => ({
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

    return tasks;
  } catch (error) {
    console.error(
      "Error fetching tasks from Asana:",
      (error as any).response.body
    );
    return [];
  }
};
