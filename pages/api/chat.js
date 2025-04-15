import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const assistantId = process.env.OPENAI_ASSISTANT_ID;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  if (!assistantId) {
    console.error("❌ ASSISTANT_ID not found in environment variables.");
    return res.status(500).json({ reply: "Server error: Missing assistant ID." });
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

    let result;
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      const status = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      if (status.status === "completed") {
        result = await openai.beta.threads.messages.list(thread.id);
        break;
      } else if (status.status === "failed") {
        throw new Error("Assistant run failed.");
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    if (!result) {
      throw new Error("Run did not complete in time.");
    }

    const assistantMessages = result.data
      .filter((msg) => msg.role === "assistant")
      .map((msg) => msg.content?.[0]?.text?.value || "")
      .join("\n\n");

    res.status(200).json({ reply: assistantMessages });
  } catch (error) {
    console.error("❌ Server error in /api/chat:", error);
    res.status(500).json({ reply: "Sorry, something went wrong." });
  }
}
