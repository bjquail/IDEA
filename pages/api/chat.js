export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  try {
    // Create thread
    const threadRes = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v2"
      }
    });

    const thread = await threadRes.json();
    console.log("🧵 Thread created:", thread);

    if (!thread.id) {
      console.error("❌ Thread creation failed:", thread);
      return res.status(500).json({ error: "Failed to create thread." });
    }

    // Add messages
    for (const msg of messages) {
      const messageRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
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

      const messageData = await messageRes.json();
      console.log("📩 Message added:", messageData);
    }

    // Create run
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
    console.log("🏃‍♂️ Run started:", run);

    if (!run.id) {
      console.error("❌ Run creation failed:", run);
      return res.status(500).json({ error: "Failed to start assistant run." });
    }

    // Poll run status
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

      console.log(`⏱️ Polling (${attempts}) – Status:`, runStatus);
    }

    if (runStatus !== "completed") {
      console.error("❌ Run did not complete:", runStatus);
      return res.status(500).json({ error: "Assistant failed to complete." });
    }

    // Fetch assistant messages
    const messagesRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v2"
      }
    });

    const messagesData = await messagesRes.json();
    const finalMessage = messagesData.data[messagesData.data.length - 1];
    console.log("✅ Final assistant message:", finalMessage);

    res.status(200).json({ reply: finalMessage?.content?.[0]?.text?.value || "No reply generated." });

  } catch (err) {
    console.error("💥 Handler Error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
}
