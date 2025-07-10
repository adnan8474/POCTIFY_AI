const express = require('express');
const path = require('path');
// `node-fetch` ensures `fetch` works on Node versions <18
let fetch = global.fetch;
if (!fetch) {
  fetch = (...args) => import('node-fetch').then(({ default: fn }) => fn(...args));
}
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const assistantId = process.env.OPENAI_ASSISTANT_ID || 'asst_89vz1AusW2LPk225XtBYU2Ar';
const openaiKey = process.env.OPENAI_API_KEY;

if (!openaiKey) {
  console.warn('OPENAI_API_KEY is not set. Requests to OpenAI will fail.');
}
if (!assistantId) {
  console.warn('OPENAI_ASSISTANT_ID is not set.');
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  if (!openaiKey || !assistantId) {
    return res.status(500).json({ error: 'Server configuration error' });
  }
  const message = req.body.message;
  if (!message) return res.status(400).json({ error: 'No message provided' });

let threadId = req.body.threadId;
if (!threadId) {
  try {
    const tRes = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      }
    });
    const tData = await tRes.json();
    threadId = tData.id;
  } catch (err) {
    console.error('thread creation error', err);
    return res.status(500).json({ error: 'Failed to create thread' });
  }
}

  try {
    await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({ role: 'user', content: message })
    });

    const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({ assistant_id: assistantId })
    });
    const runData = await runRes.json();

    let runStatus = runData.status;
    while (runStatus === 'queued' || runStatus === 'in_progress') {
      await new Promise(r => setTimeout(r, 1000));
      const statusRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runData.id}`, {
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        }
      });
      const statusData = await statusRes.json();
      runStatus = statusData.status;
    }

    const messagesRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      }
    });
    const messagesData = await messagesRes.json();
    const last = messagesData.data[0];
    const answer = last.content[0].text.value;
    res.json({ id: last.id, answer, timestamp: Date.now(), threadId });
  } catch (err) {
    console.error('chat error', err);
    res.status(500).json({ error: 'Sorry, something went wrong. Please try again later.' });
  }
});

app.post('/api/feedback', (req, res) => {
  const fb = {
    messageId: req.body.messageId,
    helpful: req.body.helpful,
    timestamp: Date.now()
  };
  console.log('feedback', JSON.stringify(fb));
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
