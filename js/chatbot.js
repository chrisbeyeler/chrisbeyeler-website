/* ===================================================================
   CHRIS BEYELER — Chatbot Widget
   FAQ-basierter Fallback + optional API-Anbindung
   =================================================================== */

const CHATBOT_API = 'https://chrisbeyeler-chatbot.chrisbeyeler.workers.dev/chat';

// FAQ-Datenbank fuer lokalen Fallback (RAG-Wissensbasis)
const FAQ_DATABASE = {
    'alter': {
        keywords: ['alt', 'alter', 'geburtstag', 'geboren', 'jahrgang', 'wie alt'],
        answer: 'Alter ist nur eine Zahl. Was zaehlt: Seit 2016 im KI-Game, ueber 2000 Menschen ausgebildet und immer noch neugierig wie am ersten Tag. Das ist doch relevanter, oder?'
    },
    'keynote': {
        keywords: ['keynote', 'vortrag', 'speech', 'buehne', 'buchen', 'anfragen', 'referent', 'speaker', 'rede'],
        answer: 'Ich hab vier Keynote-Themen im Repertoire: "The State of AI" (der grosse Ueberblick mit Live-Demos), "AI in Marketing" (Praxis pur), "5 Erfolgsfaktoren fuer KI in KMU" (bodenstaendig und sofort umsetzbar) und "Wie KI die Arbeit beeinflusst". Dauer: 30-90 Minuten, alles individuell anpassbar. 70+ Keynotes auf Buehnen wie OMT Summit, Power Pur und Digital Day Bern. Schreib mir: chris@beyonder.ch'
    },
    'preis': {
        keywords: ['preis', 'kosten', 'budget', 'was kostet', 'preisliste', 'tarif', 'offerte', 'angebot'],
        answer: 'Preise nenne ich hier nicht, jedes Projekt ist anders. Schreib mir direkt an chris@beyonder.ch fuer ein individuelles Angebot. Dann schauen wir gemeinsam, was passt.'
    },
    'themen': {
        keywords: ['themen', 'topic', 'inhalt', 'worueber', 'wovon', 'state of ai', 'marketing', 'kmu', 'arbeit'],
        answer: 'Meine vier Kernthemen: 1) The State of AI, der grosse Ueberblick mit Trends und Live-Demos. 2) AI in Marketing, Content, Personalisierung, Automation, alles Praxis. 3) 5 Erfolgsfaktoren fuer KI in KMU, bodenstaendig mit klarem ROI-Fokus. 4) Wie KI die Arbeit beeinflusst, neue Rollen, Leadership, Chancen. Alles individuell anpassbar. Ich spreche auch ueber Prompting, KI-Ethik und digitale Transformation.'
    },
    'chris': {
        keywords: ['chris', 'beyeler', 'wer', 'person', 'bio', 'ueber'],
        answer: 'Ich bin die digitale Version von Chris Beyeler. KI-Experte, Keynote Speaker, Gruender & CEO der BEYONDER AG und Praesident von swissAI. Seit 2016 im KI-Game, ueber 2000 Menschen ausgebildet, 70+ Keynotes, 148+ Podcast-Episoden. Digital Shaper 2026. Quellcode im Blut, Neugier im Kopf.'
    },
    'karriere': {
        keywords: ['karriere', 'lebenslauf', 'cv', 'werdegang', 'erfahrung', 'recruiting', 'siroop', 'mysign'],
        answer: 'Mein Weg in Kurzform: 2004-2008 Ausbildung Mediamatiker. Dann MySign, wo ich vom Frontend-Entwickler zum Teamleiter Marketing aufgestiegen bin. 2016 zu siroop (Swisscom/Coop), dort kam der erste Kontakt mit generativer KI. Danach CEO von RecruitingHUB, KI im HR. 2019 hab ich BEYONDER gegruendet, 2023 swissAI. 2025 wurde BEYONDER zur AG. Und 2026 die Digital Shaper Auszeichnung. Kein gerader Weg, aber jeder Schritt hat mich hierhin gebracht.'
    },
    'swissai': {
        keywords: ['swissai', 'kimpact', 'verein', 'verband', 'schweiz', 'ki verband'],
        answer: 'swissAI ist der Schweizer Verband fuer Kuenstliche Intelligenz, den ich 2023 gegruendet habe (damals noch als KImpact). Rund 300 Mitglieder, gemeinnuetzig. Unsere Mission: Wissen teilen, Dialog foerdern und verantwortungsvolle Innovation vorantreiben. Mehr auf swissai.ch'
    },
    'beyonder': {
        keywords: ['beyonder', 'firma', 'unternehmen', 'ag', 'kompetenzzentrum', 'team'],
        answer: 'BEYONDER ist mein Baby. Schweizer KI-Kompetenzzentrum in Gebenstorf. 2019 gegruendet, seit Juli 2025 eine AG mit Vollfokus auf KI. Mein Team: David Henzmann, Michi Kyburz, Raphael Pflugi und Luca Conconi. Wir machen Schulungen, Beratung, Implementierung und Keynotes. Kunden wie SUVA, Rotes Kreuz, BKW und Mobiliar vertrauen uns. 4.9/5 auf Google mit 108 Reviews. Mehr auf beyonder.ch'
    },
    'schulung': {
        keywords: ['workshop', 'schulung', 'training', 'kurs', 'lernen', 'masterclass', 'weiterbildung'],
        answer: 'Wir bieten verschiedene Formate: Die KI-Business Masterclass (6 Stunden, max 6 Leute, inkl. Zmittag, das ist intensiv), KI-Basiskurse als Halb- oder Ganztag, massgeschneiderte Team-Workshops fuer 5 bis 200+ Personen. Alles praxisnah mit unserem CORE+ Prompt Framework. 4.9 Sterne auf Google sprechen fuer sich. Schreib mir: chris@beyonder.ch'
    },
    'podcast': {
        keywords: ['podcast', 'ai cast', 'episode', 'spotify', 'apple', 'youtube', 'marketing booster'],
        answer: 'Mein Podcast heisst AI Cast (frueher Marketing BOOSTER). 148+ Episoden seit 2019, 1000 Abonnenten, 8000 Reichweite pro Folge. Ich rede ueber KI in der Praxis, Mensch & Maschine, Zukunft & Verantwortung. Auf Spotify, Apple Podcasts und YouTube. Reinhoren: aicast.ch'
    },
    'kontakt': {
        keywords: ['kontakt', 'email', 'mail', 'erreichen', 'schreiben', 'telefon', 'adresse'],
        answer: 'Am besten erreichst du mich per Mail: chris@beyonder.ch. BEYONDER AG: +41 56 560 11 00, Wambisterstrasse 1a, 5412 Gebenstorf. Auf LinkedIn, Instagram und TikTok findest du mich als @chrisbeyeler. Oder nutz einfach das Kontaktformular weiter unten.'
    },
    'digital_shaper': {
        keywords: ['digital shaper', 'auszeichnung', 'award', 'ringier', 'bilanz', 'acrobat'],
        answer: '2026 wurde ich als Digital Shaper ausgezeichnet, von Ringier, Bilanz und Handelszeitung in der Kategorie "AI Acrobats". Die Digital Shapers ehren Persoenlichkeiten, die die Digitalisierung in der Schweiz vorantreiben. Freut mich natuerlich, aber die eigentliche Arbeit zaehlt mehr als der Titel.'
    },
    'dozent': {
        keywords: ['dozent', 'hwz', 'maz', 'sib', 'hochschule', 'universitaet', 'lehre', 'studiengang'],
        answer: 'Ich unterrichte an der HWZ, am MAZ und am SIB. War auch Studiengangsleiter am zB. Zentrum Bildung. Ueber 2000 Menschen hab ich zum Thema KI ausgebildet. Vermitteln liegt mir, das steckt in meiner DNA.'
    },
    'review': {
        keywords: ['review', 'bewertung', 'rezension', 'google', 'proven', 'sterne', 'erfahrung', 'feedback'],
        answer: '4.9 von 5 Sternen auf Google mit 108 Reviews, 4.47 auf ProvenExpert. Meine Teilnehmer schaetzen die Praxisnaehe und die verstaendlichen Erklaerungen. "Hat meine Erwartungen uebertroffen" (Daniel Keller), "Bringt Inspiration auf die Buehne" (Romi Hofer). Das freut mich jedes Mal.'
    },
    'essay': {
        keywords: ['essay', 'manifest', 'text', 'artikel', 'zukunft', 'meinung'],
        answer: 'Ich hab ein Essay geschrieben: "Gestalte deine Zukunft mit Kuenstlicher Intelligenz." Nicht mit Angst und blindem Vertrauen, sondern mit kritischem Denken und aktivem Handeln. Das ist meine Haltung in Textform. Lies es auf essay.chrisbeyeler.ch'
    },
    'medien': {
        keywords: ['medien', 'presse', 'interview', 'srf', 'zeitung', 'pressekit', 'foto'],
        answer: 'Du findest mich in SRF, Ringier/Bilanz, persoenlich.com, Aargauer Zeitung, Handelszeitung, topsoft, Netzwoche und weiteren Medien. Das Pressekit mit Bio-Texten und Profi-Fotos gibts auf chrisbeyeler.ch. Fuer Medienanfragen: chris@beyonder.ch'
    },
    'core': {
        keywords: ['core', 'framework', 'prompt', 'prompting', 'methode', 'skill-stack'],
        answer: 'CORE+ ist unser eigenes Prompt-Framework bei BEYONDER. Stell es dir vor wie ein Navi fuer den Prompting-Prozess: strukturiert, klar, wirkungsvoll. Das Plus steht fuer "bleib im Gespraech", weil gute Ergebnisse durch Zusammenarbeit entstehen. Auch mit KI.'
    },
    'format': {
        keywords: ['format', 'dauer', 'lang', 'kurz', 'halbtag', 'ganztag', 'moderation', 'podium'],
        answer: 'Ich biete verschiedene Formate: Keynote (30-60 Min), Workshop (Halb- oder Ganztag), Moderation (Events & Panels), Podium. Die KI-Business Masterclass dauert 6 Stunden mit max 6 Leuten. Alles individuell anpassbar. Was passt zu deinem Anlass?'
    },
    'default': {
        answer: 'Ich bin die digitale Version von Chris Beyeler und kann dir Infos geben zu: meiner Person, Keynotes, BEYONDER AG, swissAI, dem AI Cast Podcast oder KI-Workshops. Was interessiert dich? Fuer alles Weitere: chris@beyonder.ch'
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
