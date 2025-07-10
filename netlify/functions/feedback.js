exports.handler = async (event) => {
  const body = JSON.parse(event.body || '{}');
  const fb = {
    messageId: body.messageId,
    helpful: body.helpful,
    timestamp: Date.now()
  };
  console.log('feedback', JSON.stringify(fb));
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
