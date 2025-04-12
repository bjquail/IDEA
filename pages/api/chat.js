export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  try {
    // Step 1: Create empty thread
    const threadRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
      }
    });

    const thread = await threadRes.json();
    if (!thread.id) {
      console.error("Thread creation failed:", thread);
      return res.status(500).json({ error: "Failed to create thread." });
    }

    // Step 2: Add messages to thread
    for (const msg of messages) {
      await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
          "OpenAI-Beta": "assistants=v2"
        },
        body: JSON.stringify({
          role: msg.role,
          content: msg.content
        })
      });
    }

    // Step 3: Run the assistant
    const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
      },
      body: JSON.stringify({
        assistant_id: process.env.ASSISTANT_ID
      })
    });

    const run = await runRes.json();
    if (!run.id) {
      console.error("Run creation failed:", run);
      return res.status(500).json({ error: "Failed to start assistant run." });
    }

    // Step 4: Poll for status
    let runStatus = run.status;
    let attempts = 0;
    while (runStatus !== "completed" && runStatus !== "failed" && attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v2"
        }
      });

      const statusData = await statusRes.json();
      runStatus = statusData.status;
      attempts++;
    }

    if (runStatus !== "completed") {
      return res.status(500).json({ error: "Assistant failed to complete." });
    }

    // Step 5: Retrieve messages
    const messagesRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2"
      }
    });

    const messagesData = await messagesRes.json();
    const finalMessage = messagesData.data[messagesData.data.length - 1];

    res.status(200).json({ reply: finalMessage?.content?.[0]?.text?.value || "I wasn’t able to generate a response." });

  } catch (err) {
    console.error("Handler Error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
}
