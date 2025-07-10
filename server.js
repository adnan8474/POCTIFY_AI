const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const assistantId = 'asst_89vz1AusW2LPk225XtBYU2Ar';
const openaiKey = process.env.OPENAI_API_KEY;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let threads = {}; // simple in-memory session threads

app.post('/api/chat', async (req, res) => {
  const message = req.body.message;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  const sessionId = req.headers['x-session-id'] || req.ip;
  if (!threads[sessionId]) {
    // create thread
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
      threads[sessionId] = tData.id;
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create thread' });
    }
  }

  try {
    await fetch(`https://api.openai.com/v1/threads/${threads[sessionId]}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({ role: 'user', content: message })
    });

    const runRes = await fetch(`https://api.openai.com/v1/threads/${threads[sessionId]}/runs`, {
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
      const statusRes = await fetch(`https://api.openai.com/v1/threads/${threads[sessionId]}/runs/${runData.id}`, {
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        }
      });
      const statusData = await statusRes.json();
      runStatus = statusData.status;
    }

    const messagesRes = await fetch(`https://api.openai.com/v1/threads/${threads[sessionId]}/messages`, {
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      }
    });
    const messagesData = await messagesRes.json();
    const last = messagesData.data[0];
    const answer = last.content[0].text.value;
    res.json({ id: last.id, answer, timestamp: Date.now() });
  } catch (err) {
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
