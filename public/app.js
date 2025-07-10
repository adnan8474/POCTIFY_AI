const chatContainer = document.getElementById('chat-container');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');

let typingElem;

function addMessage(text, role, timestamp, messageId) {
  const messageEl = document.createElement('div');
  messageEl.className = `message ${role}`;
  messageEl.innerText = text;
  const timeEl = document.createElement('div');
  timeEl.className = 'timestamp';
  timeEl.innerText = new Date(timestamp).toLocaleTimeString();
  messageEl.appendChild(timeEl);

  if (role === 'ai' && messageId) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback-buttons';
    const up = document.createElement('button');
    up.innerText = '👍';
    up.addEventListener('click', () => sendFeedback(messageId, true));
    const down = document.createElement('button');
    down.innerText = '👎';
    down.addEventListener('click', () => sendFeedback(messageId, false));
    feedback.appendChild(up);
    feedback.appendChild(down);
    messageEl.appendChild(feedback);
  }

  chatContainer.appendChild(messageEl);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function addTyping() {
  typingElem = document.createElement('div');
  typingElem.className = 'message ai typing';
  typingElem.innerText = '...';
  chatContainer.appendChild(typingElem);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeTyping() {
  if (typingElem) {
    chatContainer.removeChild(typingElem);
    typingElem = null;
  }
}

async function sendFeedback(id, helpful) {
  fetch('/api/feedback', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({messageId: id, helpful})
  });
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  addMessage(text, 'user', Date.now());
  chatInput.value = '';
  addTyping();
  sendButton.disabled = true;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({message: text})
    });
    const data = await res.json();
    removeTyping();
    if (res.ok) {
      addMessage(data.answer, 'ai', data.timestamp, data.id);
    } else {
      addMessage(data.error || 'Sorry, something went wrong. Please try again later.', 'ai', Date.now());
    }
  } catch (err) {
    removeTyping();
    addMessage('Sorry, something went wrong. Please try again later.', 'ai', Date.now());
  }

  sendButton.disabled = false;
});

// initial greeting
addMessage('👋 Hi, I\u2019m the POCTIFY Help Desk. Ask me about POCT devices, troubleshooting errors, ISO 15189, training processes, or anything POCT-related.', 'ai', Date.now());
