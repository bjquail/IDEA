import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { threadId, runId } = req.body;

  // ✅ New: guard clause for invalid IDs
  if (
    !threadId || !runId ||
    !threadId.startsWith("thread_") ||
    !runId.startsWith("run_")
  ) {
    console.error("Invalid or missing threadId/runId:", { threadId, runId });
    return res.status(400).json({ error: "Invalid or missing threadId or runId" });
  }

  try {
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

    if (runStatus.status === "completed") {
      const messages = await openai.beta.threads.messages.list(threadId);
      const assistantReply = messages.data
        .filter((msg) => msg.role === "assistant")
        .map((msg) => msg.content?.[0]?.text?.value || "")
        .join("\n\n");

      return res.status(200).json({ status: "completed", reply: assistantReply });
    }

    return res.status(200).json({ status: runStatus.status });
  } catch (err) {
    console
