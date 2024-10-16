import dayjs from "dayjs";
import dotenv from "dotenv";

dotenv.config();

export const ASANA_TOKEN = process.env.ASANA_TOKEN;
export const ASANA_USER_ID = process.env.ASANA_USER_ID;
export const ASANA_WORKSPACE_ID = process.env.ASANA_WORKSPACE_ID;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const EOD_REPORT_FOLDER = "eod-report";
export const EOD_DATE = dayjs("17 October 2024");

export const POST_TO_ASANA = false;
