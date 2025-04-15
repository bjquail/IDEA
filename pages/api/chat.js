// pages/api/chat.js
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
  const thread = await openai.beta.threads.create();
  const message = await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: userMessage,
  });
  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: process.env.ASSISTANT_ID,
  });

  let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  while (runStatus.status !== "completed" && runStatus.status !== "failed") {
    await new Promise(resolve => setTimeout(resolve, 1000));
    runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
  }

  if (runStatus.status === "failed") {
    console.error("❌ Run failed:", runStatus.last_error); // 🔍 Add this
    return res.status(500).json({ reply: "Sorry, something went wrong." });
  }

  const messages = await openai.beta.threads.messages.list(thread.id);
  const reply = messages.data[0].content[0].text.value;
  res.status(200).json({ reply });

} catch (error) {
  console.error("❌ Uncaught error:", error); // 🔍 Add this
  res.status(500).json({ reply: "Sorry, something went wrong." });
}

