const fetch = global.fetch || ((...args) => import('node-fetch').then(({default: f}) => f(...args)));

exports.handler = async (event) => {
  const openaiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.OPENAI_ASSISTANT_ID || 'asst_89vz1AusW2LPk225XtBYU2Ar';
  if (!openaiKey || !assistantId) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  const body = JSON.parse(event.body || '{}');
  const message = body.message;
  if (!message) return { statusCode: 400, body: JSON.stringify({ error: 'No message provided' }) };

  let threadId = body.threadId;
  try {
    if (!threadId) {
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
    }

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
    return { statusCode: 200, body: JSON.stringify({ id: last.id, answer, timestamp: Date.now(), threadId }) };
  } catch (err) {
    console.error('chat error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Sorry, something went wrong. Please try again later.' }) };
  }
};
