// pages/api/chat.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  try {
    // 1. Create a new thread
    const threadRes = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      }
    });
    const thread = await threadRes.json();
    console.log('🧵 Thread created:', thread);

    // 2. Add messages to the thread
    for (const message of messages) {
      const msgRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2'
        },
        body: JSON.stringify({
          role: message.role,
          content: message.content
        })
      });
      const added = await msgRes.json();
      console.log('📩 Message added:', added);
    }

    // 3. Start a run
    const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({
        assistant_id: process.env.ASSISTANT_ID
      })
    });
    const run = await runRes.json();
    console.log('🏃‍♂️ Run started:', run);

    // 4. Poll for completion (max 10 attempts)
    let runStatus = run.status;
    let attempts = 0;
    const maxAttempts = 10;

    while (runStatus !== 'completed' && runStatus !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2'
        }
      });
      const statusData = await statusRes.json();
      runStatus = statusData.status;
      attempts++;
      console.log(`⏱️ Polling (${attempts}) – Status:`, runStatus);
    }

    if (runStatus !== 'completed') {
      console.error('❌ Run did not complete:', runStatus);
      return res.status(504).json({ error: 'Assistant did not respond in time.' });
    }

    // 5. Retrieve the final messages
    const messagesRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });
    const messagesData = await messagesRes.json();
    console.log('📨 Final messages:', messagesData);

    const finalMessage = messagesData.data.find(
      msg => msg.role === 'assistant'
    );

    res.status(200).json({ reply: finalMessage?.content[0]?.text?.value || 'No reply received.' });

  } catch (err) {
    console.error('🔥 Server error:', err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}
