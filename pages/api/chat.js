// pages/api/chat.js
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  try {
    const { messages } = req.body;

    // Step 1: Create a thread
    const thread = await openai.beta.threads.create();

    // Step 2: Add user message to thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: messages[messages.length - 1].content
    });

    // Step 3: Run assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: process.env.ASSISTANT_ID
    });

    // Step 4: Poll until run completes (simple polling loop)
    let completed = false;
    let response = null;

    while (!completed) {
      const status = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      if (status.status === 'completed') {
        completed = true;

        const messages = await openai.beta.threads.messages.list(thread.id);
        response = messages.data
          .filter(m => m.role === 'assistant')
          .map(m => m.content?.[0]?.text?.value)
          .join('\n');
      } else if (status.status === 'failed') {
        throw new Error('Assistant run failed.');
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500)); // wait 1.5 sec
      }
    }

    res.status(200).json({ reply: response || 'Something went wrong retrieving the reply.' });
  } catch (error) {
    console.error('OpenAI SDK Error:', error);
    res.status(500).json({ reply: 'Sorry, something went wrong.' });
  }
}
