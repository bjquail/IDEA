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

  if (!Array.isArray(messages) || messages.length === 0) {
    console.error("❌ Invalid or missing messages:", messages);
    return res.status(400).json({ reply: "No messages provided." });
  }

  try {
    const thread = await openai.beta.threads.create();
    console.log("✅ Created thread:", thread.id);

    for (const msg of messages) {
      console.log("📝 Adding message:", msg);
      await openai.beta.threads.messages.create(thread.id, {
        role: msg.role,
        content: msg.content,
      });
    }

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
    });

    console.log("🏃 Started run:", run.id);

    return res.status(202).json({ threadId: thread.id, runId: run.id });
  } catch (error) {
    console.error("🔥 Error in chat.js:", error.response?.data || error.message);
    return res.status(500).json({ reply: "Server error while starting assistant." });
  }
}
