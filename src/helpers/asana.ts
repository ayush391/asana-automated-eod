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
  comments?: resources.Stories.Type[]; // Updated to store an array of comments
  project: string;
}

const client = Asana.ApiClient.instance;
const token = client.authentications["token"];
token.accessToken = process.env.ASANA_TOKEN;

const tasksApiInstance = new Asana.TasksApi();
const storiesApiInstance = new Asana.StoriesApi();

export const getAsanaTasksForToday = async (
  userId: string,
  workspaceId: string,
  { date }: { date: dayjs.Dayjs } = { date: dayjs() }
): Promise<Task[]> => {
  const opts = {
    assignee: userId,
    workspace: workspaceId,
    completed_since: dayjs(date).startOf("day").toISOString(),
    opt_fields: "name,completed,modified_at,due_on,notes,projects.name",
    limit: 100,
  };

  try {
    let tasks: Task[] = [];
    let pageIndex = 1;
    let response = await tasksApiInstance.getTasks(opts);

    while (true) {
      console.log(`Page ${pageIndex}:`);
      tasks = tasks.concat(
        response.data?.map((task: any) => ({
          id: task.gid,
          name: task.name,
          completed: task.completed,
          modified_at: task.modified_at,
          due_on: task.due_on,
          notes: task.notes,
          project: task.projects?.[0]?.name ?? "No Project",
        })) ?? []
      );
      pageIndex += 1;

      response = await response.nextPage?.();
      if (!response?.data) {
        break;
      }
    }

    const tasksWithRelevantComments = await Promise.all(
      tasks.map(async (task) => {
        try {
          const comments = await storiesApiInstance.getStoriesForTask(task.id, {
            opt_fields: "created_at,created_by,text,type",
          });

          const relevantComments = comments.data?.filter(
            (story: resources.Stories.Type) =>
              story.created_by?.gid === userId &&
              story.type === "comment" &&
              dayjs(story.created_at).isAfter(date.startOf("day"))
          );

          if (relevantComments?.length > 0) {
            return {
              ...task,
              comments: relevantComments,
            };
          }

          return null;
        } catch (error) {
          console.error(
            `Error fetching comments for task ${task.name}:`,
            error
          );
          return null;
        }
      })
    );

    return tasksWithRelevantComments.filter((task) => task !== null);
  } catch (error) {
    console.error(
      "Error fetching tasks from Asana:",
      (error as any).response?.body ?? error
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
    console.log(`Comment added to task: ${response.data?.text}`);
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
    const tasksInWorkspace = await tasksApiInstance.getTasks({
      assignee: userId,
      workspace: workspaceId,
      opt_fields: "name,gid,assignee",
      modified_since: dayjs(date).toISOString(),
    });

    const endOfDayTask = tasksInWorkspace.data?.find(
      (task: any) => task.name === "End-of-the-Day Update"
    );

    if (endOfDayTask) {
      return endOfDayTask.gid;
    } else {
      console.error('Task "End-of-the-Day Update" not found.');
      return null;
    }
  } catch (error) {
    console.error(
      "Error finding or assigning the End-of-the-Day Update task:",
      error
    );
    return null;
  }
};
