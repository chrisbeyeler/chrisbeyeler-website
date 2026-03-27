/* ===================================================================
   CHRIS BEYELER — Chatbot Widget
   Custom Chat Widget with Claude API via Cloudflare Worker Proxy
   =================================================================== */

const CHATBOT_API = 'https://chrisbeyeler-chatbot.YOUR_SUBDOMAIN.workers.dev/chat';
// TODO: Replace with actual Cloudflare Worker URL after deployment

const chatbotTrigger = document.getElementById('chatbotTrigger');
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSend = document.getElementById('chatbotSend');

let chatHistory = [];

// Toggle chat window
chatbotTrigger.addEventListener('click', () => {
    chatbotWindow.classList.toggle('active');
    if (chatbotWindow.classList.contains('active')) {
        chatbotInput.focus();
    }
});

chatbotClose.addEventListener('click', () => {
    chatbotWindow.classList.remove('active');
});

// Send message
async function sendMessage() {
    const text = chatbotInput.value.trim();
    if (!text) return;

    // Add user message
    addMessage(text, 'user');
    chatbotInput.value = '';
    chatHistory.push({ role: 'user', content: text });

    // Show typing indicator
    const typingEl = addMessage('...', 'bot', true);

    try {
        const response = await fetch(CHATBOT_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: chatHistory.slice(-10) // Last 10 messages for context
            })
        });

        if (!response.ok) throw new Error('API error');

        const data = await response.json();
        const reply = data.reply || 'Entschuldigung, ich konnte keine Antwort generieren.';

        // Remove typing indicator
        typingEl.remove();

        // Add bot reply
        addMessage(reply, 'bot');
        chatHistory.push({ role: 'assistant', content: reply });

    } catch (err) {
        typingEl.remove();
        addMessage('Entschuldigung, der Chat ist momentan nicht verfügbar. Kontaktiere Chris direkt unter chris@beyonder.ch.', 'bot');
    }
}

function addMessage(text, sender, isTyping = false) {
    const msg = document.createElement('div');
    msg.className = `chatbot__message chatbot__message--${sender === 'user' ? 'user' : 'bot'}`;
    if (isTyping) msg.classList.add('chatbot__message--typing');

    const p = document.createElement('p');
    p.textContent = text;
    msg.appendChild(p);

    chatbotMessages.appendChild(msg);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    return msg;
}

// Event listeners
chatbotSend.addEventListener('click', sendMessage);
chatbotInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Close on outside click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.chatbot') && chatbotWindow.classList.contains('active')) {
        chatbotWindow.classList.remove('active');
    }
});
