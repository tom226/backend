// Self-contained chatbot widget for Nursery Green
(function () {
  const BACKEND_URL = window.BACKEND_URL || '';

  // Styles for the chatbot widget
  const styles = document.createElement('style');
  styles.textContent = `
    .chatbot-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background-color: #0F2419;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      z-index: 1000;
    }

    .chatbot-button:hover {
      background-color: #1A3A2A;
    }

    .chatbot-panel {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 350px;
      height: 500px;
      background-color: #0F2419;
      display: none;
      flex-direction: column;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      border-radius: 8px;
      overflow: hidden;
      z-index: 1000;
    }

    .chatbot-panel.open {
      display: flex;
    }

    .chatbot-header {
      background-color: #1A3A2A;
      padding: 10px;
      color: white;
      font-size: 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chatbot-header button {
      background: none;
      border: none;
      color: white;
      font-size: 16px;
      cursor: pointer;
    }

    .chatbot-messages {
      flex: 1;
      background-color: #0B1D14;
      padding: 10px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .chatbot-message {
      padding: 8px 12px;
      border-radius: 10px;
      max-width: 80%;
      word-wrap: break-word;
    }

    .chatbot-message.user {
      align-self: flex-end;
      background-color: #2ECC71;
      color: white;
    }

    .chatbot-message.bot {
      align-self: flex-start;
      background-color: #145A32;
      color: white;
    }

    .chatbot-input {
      display: flex;
      border-top: 1px solid #1A3A2A;
    }

    .chatbot-input textarea {
      flex: 1;
      padding: 10px;
      background-color: #0F2419;
      color: white;
      border: none;
      outline: none;
      resize: none;
    }

    .chatbot-input button {
      padding: 0 15px;
      background-color: #1A3A2A;
      color: white;
      border: none;
      cursor: pointer;
    }

    .chatbot-typing {
      font-style: italic;
      color: #B2BABB;
    }
  `;
  document.head.appendChild(styles);

  // Create the chat bubble button
  const chatButton = document.createElement('div');
  chatButton.className = 'chatbot-button';
  chatButton.innerHTML = '💬';
  document.body.appendChild(chatButton);

  // Create the chat panel
  const chatPanel = document.createElement('div');
  chatPanel.className = 'chatbot-panel';
  chatPanel.innerHTML = `
    <div class="chatbot-header">
      🌿 Plant Expert
      <button class="close-btn">✖</button>
    </div>
    <div class="chatbot-messages"></div>
    <div class="chatbot-input">
      <textarea placeholder="Type your message..."></textarea>
      <button>Send</button>
    </div>
  `;
  document.body.appendChild(chatPanel);

  const messagesContainer = chatPanel.querySelector('.chatbot-messages');
  const textarea = chatPanel.querySelector('textarea');
  const sendButton = chatPanel.querySelector('button');
  const closeButton = chatPanel.querySelector('.close-btn');

  // Open button event
  chatButton.addEventListener('click', () => {
    chatPanel.classList.add('open');
  });

  // Close button event
  closeButton.addEventListener('click', () => {
    chatPanel.classList.remove('open');
  });

  // Helper function to render messages
  function renderMessage(text, sender) {
    const message = document.createElement('div');
    message.className = `chatbot-message ${sender}`;
    message.textContent = text;
    messagesContainer.appendChild(message);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Restore conversation from sessionStorage
  const conversation = JSON.parse(sessionStorage.getItem('chatbot-conversation') || '[]');
  conversation.forEach(({ text, sender }) => renderMessage(text, sender));

  // Send message event
  sendButton.addEventListener('click', async () => {
    const userMessage = textarea.value.trim();
    if (!userMessage) return;

    // Render user message
    renderMessage(userMessage, 'user');

    // Save to session storage
    conversation.push({ text: userMessage, sender: 'user' });
    sessionStorage.setItem('chatbot-conversation', JSON.stringify(conversation));

    textarea.value = '';

    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chatbot-typing';
    typingIndicator.textContent = 'Plant Expert is typing...';
    messagesContainer.appendChild(typingIndicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const response = await fetch(`${BACKEND_URL}/api/chatbot/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();

      // Remove typing indicator
      typingIndicator.remove();

      // Render bot message
      renderMessage(data.reply, 'bot');

      // Save to session storage
      conversation.push({ text: data.reply, sender: 'bot' });
      sessionStorage.setItem('chatbot-conversation', JSON.stringify(conversation));
    } catch (error) {
      typingIndicator.textContent = 'Failed to connect. Please try again later.';
      setTimeout(() => typingIndicator.remove(), 3000);
    }
  });
})();