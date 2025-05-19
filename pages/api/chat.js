import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistantId = process.env.ASSISTANT_ID;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  if (!assistantId) {
    console.error("❌ ASSISTANT_ID not found.");
    return res.status(500).json({ reply: "Missing Assistant ID." });
  }

  try {
    const thread = await openai.beta.threads.create();

    for (const msg of messages) {
      await openai.beta.threads.messages.create(thread.id, {
        role: msg.role,
        content: msg.content,
      });
    }

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    return res.status(202).json({ threadId: thread.id, runId: run.id });
  } catch (error) {
    console.error("Error starting thread:", error);
    return res.status(500).json({ reply: "Server error." });
  }
}
