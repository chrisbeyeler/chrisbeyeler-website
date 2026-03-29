/* ===================================================================
   CHRIS BEYELER — Chatbot Widget
   FAQ-basierter Fallback + optional API-Anbindung
   =================================================================== */

const CHATBOT_API = 'https://chrisbeyeler-chatbot.chrisbeyeler.workers.dev/chat';

// FAQ-Datenbank fuer lokalen Fallback (RAG-Wissensbasis)
const FAQ_DATABASE = {
    'keynote': {
        keywords: ['keynote', 'vortrag', 'speech', 'buehne', 'buchen', 'anfragen', 'referent', 'speaker', 'rede'],
        answer: 'Chris bietet 4 Keynote-Themen an: "The State of AI" (KI-Ueberblick mit Live-Demos), "AI in Marketing" (Praxisbeispiele fuer Marketingteams), "5 Erfolgsfaktoren fuer KI in KMU" (sofort anwendbar) und "Wie KI die Arbeit beeinflusst" (Future of Work). Dauer: 30-90 Minuten. Alle Themen individuell anpassbar. 70+ Keynotes auf Buehnen wie OMT Summit, AI in Marketing Konferenz Zuerich, Power Pur und Digital Day Bern. Anfragen: chris@beyonder.ch'
    },
    'preis': {
        keywords: ['preis', 'kosten', 'budget', 'was kostet', 'preisliste', 'tarif', 'offerte', 'angebot'],
        answer: 'Fuer ein individuelles Angebot kontaktiere Chris direkt unter chris@beyonder.ch. Die Preise haengen von Format (Keynote, Workshop, Moderation), Dauer und Anpassungen ab. Mehr Infos unter beyonder.ch/preise.'
    },
    'themen': {
        keywords: ['themen', 'topic', 'inhalt', 'worueber', 'wovon', 'state of ai', 'marketing', 'kmu', 'arbeit'],
        answer: 'Die 4 Hauptthemen: 1) The State of AI (Trends, Demos), 2) AI in Marketing (Content, Personalisierung, Automation), 3) 5 Erfolgsfaktoren fuer KI in KMU (Strategie, ROI), 4) Wie KI die Arbeit beeinflusst (neue Rollen, Leadership). Alle individuell anpassbar. Chris spricht auch ueber Prompt Engineering, KI-Ethik und digitale Transformation.'
    },
    'chris': {
        keywords: ['chris', 'beyeler', 'wer', 'person', 'bio', 'ueber'],
        answer: 'Chris Beyeler ist KI-Experte, Keynote Speaker, Gruender & CEO der BEYONDER AG und Praesident von swissAI. Digital Shaper 2026 (Ringier/Bilanz). Seit 2016 in der KI-Welt aktiv, 2000+ Menschen ausgebildet, 70+ Keynotes, 148+ Podcast-Episoden. Dozent an HWZ, MAZ und SIB. Sein Weg: von MySign ueber siroop und RecruitingHUB zu BEYONDER.'
    },
    'karriere': {
        keywords: ['karriere', 'lebenslauf', 'cv', 'werdegang', 'erfahrung', 'recruiting', 'siroop', 'mysign'],
        answer: 'Chris Karriere: 2004-2008 Ausbildung Mediamatiker. 2008-2016 MySign (Frontend bis Teamleiter Marketing). 2016-2017 siroop (Swisscom/Coop) als Head of Content, erste Beruehrung mit generativer KI. 2017-2018 CEO RecruitingHUB (KI im HR). 2019 BEYONDER gegruendet. 2023 swissAI gegruendet. 2025 BEYONDER wird AG. 2026 Digital Shaper.'
    },
    'swissai': {
        keywords: ['swissai', 'kimpact', 'verein', 'verband', 'schweiz', 'ki verband'],
        answer: 'swissAI (frueher KImpact) ist der Schweizer Verband fuer Kuenstliche Intelligenz mit ca. 300 Mitgliedern. Chris Beyeler ist Praesident. Gegruendet 2023, gemeinnuetzig. Mission: Wissen, Dialog und verantwortungsvolle Innovation foerdern. Mehr: swissai.ch'
    },
    'beyonder': {
        keywords: ['beyonder', 'firma', 'unternehmen', 'ag', 'kompetenzzentrum', 'team'],
        answer: 'BEYONDER AG ist das Schweizer KI-Kompetenzzentrum in Gebenstorf (AG). Gegruendet 2019, seit Juli 2025 AG mit Vollfokus auf KI. Team: Chris Beyeler (CEO), David Henzmann, Michael Kyburz, Raphael Pflugi, Luca Conconi. Dienstleistungen: Schulungen, Beratung, Implementierung, Keynotes. Kunden: SUVA, Rotes Kreuz, BKW, Mobiliar u.v.m. Google Rating: 4.9/5 (108 Reviews). Mehr: beyonder.ch'
    },
    'schulung': {
        keywords: ['workshop', 'schulung', 'training', 'kurs', 'lernen', 'masterclass', 'weiterbildung'],
        answer: 'BEYONDER bietet verschiedene Formate: KI-Business Masterclass (6 Std, max 6 TN, inkl. Zmittag), KI-Basiskurs (Halbtag/Ganztag), massgeschneiderte Team-Workshops (5-200+ Personen), und Dozentschaften. Praxisnah mit dem CORE+ Prompt Framework. 4.9 Sterne auf Google mit 108 Reviews. Anfragen: chris@beyonder.ch'
    },
    'podcast': {
        keywords: ['podcast', 'ai cast', 'episode', 'spotify', 'apple', 'youtube', 'marketing booster'],
        answer: 'Der AI Cast (frueher Marketing BOOSTER) ist der Schweizer KI-Podcast von Chris Beyeler. 148+ Episoden seit 2019, 1000 Abonnenten, 8000 Reichweite pro Folge. Themen: KI in der Praxis, Mensch & Maschine, Zukunft & Verantwortung. Verfuegbar auf Spotify, Apple Podcasts und YouTube. Mehr: aicast.ch'
    },
    'kontakt': {
        keywords: ['kontakt', 'email', 'mail', 'erreichen', 'schreiben', 'telefon', 'adresse'],
        answer: 'Chris erreichst du am besten per E-Mail: chris@beyonder.ch. BEYONDER AG: +41 56 560 11 00, Wambisterstrasse 1a, 5412 Gebenstorf. Social Media: LinkedIn, Instagram, TikTok @chrisbeyeler. Oder nutze das Kontaktformular weiter unten auf der Seite.'
    },
    'digital_shaper': {
        keywords: ['digital shaper', 'auszeichnung', 'award', 'ringier', 'bilanz', 'acrobat'],
        answer: 'Chris wurde 2026 als Digital Shaper ausgezeichnet (Ringier/Bilanz/Handelszeitung, Kategorie "AI Acrobats"). Die Digital Shapers werden jaehrlich von digitalswitzerland gekuert und ehren Persoenlichkeiten, die die Digitalisierung in der Schweiz vorantreiben.'
    },
    'dozent': {
        keywords: ['dozent', 'hwz', 'maz', 'sib', 'hochschule', 'universitaet', 'lehre', 'studiengang'],
        answer: 'Chris ist Dozent an der HWZ (Hochschule fuer Wirtschaft Zuerich), am MAZ (Medienausbildungszentrum) und am SIB. Er war zudem Studiengangsleiter am zB. Zentrum Bildung. Total hat er ueber 2000 Menschen im Bereich KI ausgebildet.'
    },
    'review': {
        keywords: ['review', 'bewertung', 'rezension', 'google', 'proven', 'sterne', 'erfahrung', 'feedback'],
        answer: 'BEYONDER hat 4.9 von 5 Sternen auf Google (108 Reviews) und 4.47 auf ProvenExpert. Teilnehmer loben die praxisnahen Inhalte, Chris verstaendliche Erklaerungen und die motivierende Atmosphaere. Einzelne Stimmen: "Hat meine Erwartungen uebertroffen" (Daniel Keller), "Bringt Inspiration auf die Buehne" (Romi Hofer).'
    },
    'essay': {
        keywords: ['essay', 'manifest', 'text', 'artikel', 'zukunft', 'meinung'],
        answer: 'Chris hat ein KI-Essay veroeffentlicht: "Gestalte deine Zukunft mit Kuenstlicher Intelligenz. Nicht mit Angst und blindem Vertrauen, sondern mit kritischem Denken und aktivem Handeln." Volltext unter essay.chrisbeyeler.ch'
    },
    'medien': {
        keywords: ['medien', 'presse', 'interview', 'srf', 'zeitung', 'pressekit', 'foto'],
        answer: 'Chris ist bekannt aus SRF, Ringier/Bilanz, persoenlich.com, Aargauer Zeitung, Handelszeitung, topsoft, Netzwoche und vielen weiteren. Das Pressekit mit Bio-Texten und Profi-Fotos findest du auf chrisbeyeler.ch. Medienanfragen: chris@beyonder.ch'
    },
    'core': {
        keywords: ['core', 'framework', 'prompt', 'prompting', 'methode', 'skill-stack'],
        answer: 'CORE+ ist BEYONDERs eigenes Framework fuer effektives Prompting. Es funktioniert wie ein Navigationsgeraet fuer den Prompting-Prozess und fuehrt strukturiert zu klaren, wirkungsvollen Inputs. Das Plus steht fuer "bleib im Gespraech", weil gute Ergebnisse durch Zusammenarbeit entstehen, auch mit KI.'
    },
    'format': {
        keywords: ['format', 'dauer', 'lang', 'kurz', 'halbtag', 'ganztag', 'moderation', 'podium'],
        answer: 'Verfuegbare Formate: Keynote (30-60 Min), Workshop (Halb- oder Ganztag), Moderation (Events & Panels), Podiumsdiskussion. Die KI-Business Masterclass dauert 6 Stunden mit max. 6 Teilnehmern. Alles individuell anpassbar.'
    },
    'default': {
        answer: 'Ich kann dir Infos geben zu: Chris Beyeler (Bio, Karriere), Keynotes (Themen, Formate, Buchen), BEYONDER AG (Team, Dienstleistungen), swissAI (Verband), AI Cast (Podcast), oder KI-Workshops. Fuer detaillierte Anfragen: chris@beyonder.ch'
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
