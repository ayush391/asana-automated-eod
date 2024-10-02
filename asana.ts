import axios from "axios";

interface Task {
  name: string;
  completed: boolean;
  modified_at: string;
  due_on?: string;
}

export const getAsanaTasksForToday = async (
  userId: string,
  workspaceId: string
): Promise<Task[]> => {
  const url = `https://app.asana.com/api/1.0/tasks`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.ASANA_TOKEN}`,
      },
      params: {
        assignee: userId,
        workspace: workspaceId,
        modified_since: "today", // Fetch today's tasks
        opt_fields: "name,completed,modified_at,due_on",
      },
    });

    return response.data.data.map((task: any) => ({
      name: task.name,
      completed: task.completed,
      modified_at: task.modified_at,
      due_on: task.due_on,
    }));
  } catch (error) {
    console.error("Error fetching tasks from Asana:", error);
    return [];
  }
};
