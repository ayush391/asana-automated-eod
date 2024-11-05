import dayjs from "dayjs";
import dotenv from "dotenv";

dotenv.config();

export const ASANA_TOKEN = process.env.ASANA_TOKEN;
export const ASANA_USER_ID = process.env.ASANA_USER_ID;
export const ASANA_WORKSPACE_ID = process.env.ASANA_WORKSPACE_ID;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const EOD_REPORT_FOLDER = "eod-report";
export const EOD_DATE = process.argv[2]
  ? dayjs(process.argv[2]).startOf("day")
  : dayjs().startOf("day");

export const POST_TO_ASANA = false;
