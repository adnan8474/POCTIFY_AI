const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const assistantId = process.env.OPENAI_ASSISTANT_ID || 'asst_89vz1AusW2LPk225XtBYU2Ar';

exports.handler = async (event) => {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!process.env.OPENAI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const message = body.message;
    let threadId = body.threadId;

    if (!message) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No message provided' }) };
    }

    // create thread if needed
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
    }

    // add user message
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: message,
    });

    // run assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    let status = run.status;
    while (status === 'queued' || status === 'in_progress') {
      await new Promise((r) => setTimeout(r, 1000));
      const current = await openai.beta.threads.runs.retrieve(threadId, run.id);
      status = current.status;
    }

    const messages = await openai.beta.threads.messages.list(threadId, { limit: 1 });
    const reply = messages.data[0].content[0].text.value;

    return {
      statusCode: 200,
      body: JSON.stringify({ reply, threadId }),
    };
  } catch (err) {
    console.error('chat function error', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || 'Internal Server Error' }) };
  }
};
