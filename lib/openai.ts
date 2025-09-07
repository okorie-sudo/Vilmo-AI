import OpenAI from "openai";



export const client = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});
