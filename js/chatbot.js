/* ===================================================================
   CHRIS BEYELER — Chatbot Widget
   FAQ-basierter Fallback + optional API-Anbindung
   =================================================================== */

const CHATBOT_API = 'https://chrisbeyeler-chatbot.beyonder.workers.dev/chat';

// FAQ-Datenbank fuer lokalen Fallback
const FAQ_DATABASE = {
    'keynote': {
        keywords: ['keynote', 'vortrag', 'speech', 'buehne', 'preis', 'kosten', 'buchen', 'anfragen'],
        answer: 'Chris bietet verschiedene Keynote-Formate an: "The State of AI", "AI in Marketing", "5 Erfolgsfaktoren fuer KI in KMU" und "Wie KI die Arbeit beeinflusst". Dauer: 30-90 Minuten. Fuer Preise und Verfuegbarkeit kontaktiere Chris direkt unter chris@beyonder.ch oder nutze das Kontaktformular auf der Seite.'
    },
    'themen': {
        keywords: ['themen', 'topic', 'inhalt', 'worüber', 'wovon', 'angebot'],
        answer: 'Chris spricht ueber: KI-Strategie, KI im Marketing, KI fuer KMU, die Zukunft der Arbeit mit KI, Prompt Engineering und die ethische Nutzung von KI. Alle Vortraege koennen individuell angepasst werden.'
    },
    'chris': {
        keywords: ['chris', 'beyeler', 'wer', 'person', 'bio', 'über', 'ueber'],
        answer: 'Chris Beyeler ist KI-Experte, Keynote Speaker, Gruender & CEO der BEYONDER AG und Praesident von swissAI. Er wurde als Digital Shaper 2026 (Ringier/Bilanz) ausgezeichnet und hat ueber 2000 Menschen im Umgang mit KI ausgebildet. Sein Podcast "AI Cast" hat ueber 148 Episoden.'
    },
    'swissai': {
        keywords: ['swissai', 'kimpact', 'verein', 'verband', 'schweiz'],
        answer: 'swissAI (frueher KImpact) ist der Schweizer Verein zur Foerderung von Kuenstlicher Intelligenz. Chris Beyeler ist Praesident. Ziel ist es, dass mehr Menschen und Unternehmen in der Schweiz KI kompetent, kritisch und verantwortungsvoll nutzen. Mehr: swissai.ch'
    },
    'beyonder': {
        keywords: ['beyonder', 'agentur', 'firma', 'unternehmen', 'ag'],
        answer: 'BEYONDER AG ist die von Chris 2019 gegruendete und 2025 in eine AG umgewandelte KI-Beratung mit Sitz im Aargau. Das Team bildet Unternehmen in der ganzen Schweiz im Umgang mit KI aus: Schulungen, Workshops, Strategieberatung. Mehr: beyonder.ch'
    },
    'podcast': {
        keywords: ['podcast', 'ai cast', 'episode', 'spotify', 'apple'],
        answer: 'Der "AI Cast" ist Chris Beyelers Podcast ueber Kuenstliche Intelligenz mit ueber 148 Episoden seit 2019. Verfuegbar auf Spotify, Apple Podcasts und YouTube. Er ist einer der aeltesten deutschsprachigen KI-Podcasts der Schweiz.'
    },
    'workshop': {
        keywords: ['workshop', 'schulung', 'training', 'kurs', 'lernen', 'masterclass'],
        answer: 'Chris bietet Halbtags- und Ganztags-Workshops zu verschiedenen KI-Themen an: von der KI-Einfuehrung bis zum Deep-Dive in Prompt Engineering. Massgeschneidert fuer Teams von 5 bis 200+ Personen. Anfragen: chris@beyonder.ch'
    },
    'kontakt': {
        keywords: ['kontakt', 'email', 'mail', 'erreichen', 'schreiben'],
        answer: 'Du erreichst Chris am besten per E-Mail: chris@beyonder.ch. Oder nutze das Kontaktformular weiter unten auf der Seite. Fuer dringende Anfragen: LinkedIn @chrisbeyeler.'
    },
    'default': {
        answer: 'Gute Frage! Ich kann dir Infos zu Chris Beyeler, seinen Keynotes, BEYONDER AG, swissAI, dem AI Cast Podcast oder KI-Workshops geben. Fuer detaillierte Anfragen erreichst du Chris direkt unter chris@beyonder.ch.'
    }
};

function findFAQAnswer(question) {
    const q = question.toLowerCase();

    let bestMatch = null;
    let bestScore = 0;

    for (const [key, faq] of Object.entries(FAQ_DATABASE)) {
        if (key === 'default') continue;

        let score = 0;
        for (const keyword of faq.keywords) {
            if (q.includes(keyword)) {
                score += keyword.length;
            }
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = faq;
        }
    }

    return bestMatch ? bestMatch.answer : FAQ_DATABASE.default.answer;
}

const chatbotTrigger = document.getElementById('chatbotTrigger');
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSend = document.getElementById('chatbotSend');
const chatbotQuickReplies = document.getElementById('chatbotQuickReplies');

let chatHistory = [];
let apiAvailable = null; // null = unknown, true/false after first attempt

// Toggle chat window
if (chatbotTrigger) {
    chatbotTrigger.addEventListener('click', () => {
        chatbotWindow.classList.toggle('active');
        if (chatbotWindow.classList.contains('active')) {
            chatbotInput.focus();
        }
    });
}

if (chatbotClose) {
    chatbotClose.addEventListener('click', () => {
        chatbotWindow.classList.remove('active');
    });
}

// Quick reply buttons
if (chatbotQuickReplies) {
    chatbotQuickReplies.querySelectorAll('.chatbot__quickreply').forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.getAttribute('data-question');
            chatbotInput.value = question;
            // Hide quick replies after first use
            chatbotQuickReplies.style.display = 'none';
            sendMessage();
        });
    });
}

async function sendMessage() {
    const text = chatbotInput.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    chatbotInput.value = '';
    chatHistory.push({ role: 'user', content: text });

    // Hide quick replies
    if (chatbotQuickReplies) {
        chatbotQuickReplies.style.display = 'none';
    }

    const typingEl = addMessage('...', 'bot', true);

    // Try API first if we haven't determined it's unavailable
    if (apiAvailable !== false) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(CHATBOT_API, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: chatHistory.slice(-10)
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('API error');

            const data = await response.json();
            const reply = data.reply || findFAQAnswer(text);

            typingEl.remove();
            addMessage(reply, 'bot');
            chatHistory.push({ role: 'assistant', content: reply });
            apiAvailable = true;
            return;

        } catch (err) {
            apiAvailable = false;
        }
    }

    // Fallback: FAQ-basierte Antwort
    typingEl.remove();

    // Simulate short delay for natural feel
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 600));

    const reply = findFAQAnswer(text);
    addMessage(reply, 'bot');
    chatHistory.push({ role: 'assistant', content: reply });
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
if (chatbotSend) {
    chatbotSend.addEventListener('click', sendMessage);
}
if (chatbotInput) {
    chatbotInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

// Close on outside click
document.addEventListener('click', (e) => {
    if (chatbotWindow && !e.target.closest('.chatbot') && chatbotWindow.classList.contains('active')) {
        chatbotWindow.classList.remove('active');
    }
});
