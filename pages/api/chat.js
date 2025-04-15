// pages/api/chat.js

import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  try {
    // 1. Create thread
    const thread = await openai.beta.threads.create();

    // 2. Add user message to thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: messages[messages.length - 1].content
    });

    // 3. Run assistant on thread
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: process.env.ASSISTANT_ID
    });

    // 4. Poll for completion
    let runStatus = run.status;
    while (runStatus !== 'completed' && runStatus !== 'failed') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const updatedRun = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      runStatus = updatedRun.status;
    }

    if (runStatus === 'failed') {
      return res.status(500).json({ error: 'Run failed' });
    }

    // 5. Retrieve messages
    const messagesList = await openai.beta.threads.messages.list(thread.id);
    const replyMessage = messagesList.data.find(msg => msg.role === 'assistant');

    const replyContent = replyMessage?.content?.[0]?.text?.value || 'Something went wrong retrieving the assistant’s reply.';

    res.status(200).json({ reply: replyContent });

  } catch (error) {
    console.error("OpenAI SDK error:", error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}
