// pages/api/chat.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/threads", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v1"
      },
      body: JSON.stringify({
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        assistant_id: process.env.ASSISTANT_ID
      })
    });

    const thread = await response.json();

    // Run the assistant on the new thread
    const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "OpenAI-Beta": "assistants=v1"
      },
      body: JSON.stringify({
        assistant_id: process.env.ASSISTANT_ID
      })
    });

    const run = await runRes.json();

    // Poll for completion
    let runStatus = run.status;
    while (runStatus !== "completed" && runStatus !== "failed") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const statusRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "OpenAI-Beta": "assistants=v1"
        }
      });
      const statusData = await statusRes.json();
      runStatus = statusData.status;
    }

    // Get the final messages
    const messagesRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "assistants=v1"
      }
    });

    const messagesData = await messagesRes.json();
    const finalMessage = messagesData.data[messagesData.data.length - 1];

    res.status(200).json({ reply: finalMessage.content[0].text.value });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
}
