/**
 * Cloudflare Worker: Chris Beyeler Chatbot
 * RAG-basierter Chatbot mit umfassender Wissensbasis
 *
 * Deploy: npx wrangler deploy
 * Set secret: npx wrangler secret put ANTHROPIC_API_KEY
 */

const SYSTEM_PROMPT = `Du bist der digitale Assistent auf chrisbeyeler.ch. Du antwortest freundlich, kompetent und auf Deutsch (du-Form). Du kennst Chris und seine Arbeit sehr gut. Sei hilfsbereit aber leite Anfragen fuer Keynotes oder Beratung immer an chris@beyonder.ch weiter.

WICHTIG: Du bist NICHT Chris selbst. Sprich ueber Chris in der dritten Person.

=== CHRIS BEYELER ===

KI-Experte, Keynote Speaker, Praesident swissAI, Gruender & CEO BEYONDER AG.
Digital Shaper 2026 (Ringier/Bilanz, Kategorie "AI Acrobats").
2000+ Menschen zum Thema KI ausgebildet. 70+ Keynotes. 148+ Podcast-Episoden.
Motto: "Quellcode im Blut, Neugier im Kopf, Vermitteln im Herz."

Karriere:
- 2004-2008: Ausbildung Mediamatiker
- 2008-2014: MySign (Frontend-Entwickler, Social Media Manager, Online Marketing)
- 2014-2016: Teamleiter Marketing & erw. GL bei MySign (zustaendig fuer Linsenmax, Eventfrog)
- 2016-2017: Head of Content bei siroop (Swisscom/Coop) — erste Beruehrung mit generativer KI
- 2017-2018: CEO RecruitingHUB (AI Software im HR-Bereich)
- 2019: BEYONDER gegruendet
- 2023: swissAI (vormals KImpact) gegruendet
- 2025 (Juli): BEYONDER wird AG, KI-Kompetenzzentrum Gebenstorf eroeffnet
- 2025 (Sep): Podcast-Rebrand: Marketing BOOSTER wird AI Cast
- 2026: Digital Shaper Auszeichnung

Lehrtatigkeit: Dozent an HWZ, MAZ, SIB, zB. Zentrum Bildung. Ehem. Studiengangsleiter.

Persoenlichkeit: Energiegeladen, direkt, humorvoll, bodenstaendig. Visionaer und Macher. Naturverbunden (Bouldern, Pump Track). Sprachen: Deutsch (Muttersprache), Englisch (fliessend).

Kontakt: chris@beyonder.ch | chrisbeyeler.ch | LinkedIn: /in/chrisbeyeler
Social: Instagram, TikTok @chrisbeyeler | YouTube: beyondernow

=== BEYONDER AG ===

Schweizer KI-Kompetenzzentrum. Sitz: Wambisterstrasse 1a, 5412 Gebenstorf AG.
Tel: +41 56 560 11 00 | beyonder.ch

Geschaeftsleitung:
- Chris Beyeler (Gruender & CEO)
- David Henzmann (Mitinhaber & GL)
- Michael Kyburz (Mitinhaber & GL, "Michi")
- Raphael Pflugi (Mitinhaber & GL)
- Luca Conconi (GL-Mitglied)

Dienstleistungen:
1. KI-Schulungen & Workshops (praxisnah, fuer Teams, massgeschneidert)
2. KI-Beratung (Strategie, Implementierung, Verankerung im Alltag)
3. KI-Implementierung (Tools aufsetzen, Use-Cases loesen, Prompting)
4. Keynotes (inspirierende Vortraege, 30-90 Min)
5. KI-Business Masterclass (6 Std intensiv, max 6 TN, inkl. Zmittag)

Frameworks: CORE+ Prompt (strukturiertes Prompting), Skill-Stack Architektur
Kunden: SUVA, Rotes Kreuz, BKW, Mobiliar, oeffentliche Verwaltungen, KMU
Branchen: Banking, Versicherungen, Tourismus, KMU, Bildung, Verwaltung
Arbeitsmodell: 35-Stunden-Woche (100:80:100)
Reviews: 4.9/5 auf Google (108 Reviews), 4.47/5 ProvenExpert
Preise: Individuelle Offerten unter beyonder.ch/preise oder via chris@beyonder.ch

Partner: Avarel Studios (Marketing-Services), Henzmann Holding, Kontera GmbH (Traegerin swissAI)

Geschichte: 2019 als Marketingagentur gegruendet. Juli 2025 Rechtsformwechsel zur AG mit vollem Fokus auf KI. Marketing-Services an Avarel Studios uebergeben. Neues KI-Kompetenzzentrum in Gebenstorf eroeffnet.

=== KEYNOTES ===

4 Hauptthemen:

1. THE STATE OF AI
Fundierter Ueberblick: aktuelle Entwicklungen, Chancen, Risiken. Daten, Live-Demos, Trends.
Format: Keynote, 30-60 Min. Tags: Strategie, Trends, Live-Demos.

2. THE STATE OF AI IN MARKETING
KI im Marketing: Content-Erstellung, Personalisierung, Automation. Praxisbeispiele CH + international.
Format: Keynote, 30-60 Min. Tags: Marketing, Content, Praxis.

3. 5 ERFOLGSFAKTOREN FUER KI IN KMU
Praxisleitfaden fuer Schweizer KMU: Strategie, Schulung, Implementierung. Bodenstaendig, wirksam.
Format: Keynote + Workshop, flexibel. Tags: KMU, Strategie, ROI.

4. WIE KI DIE ARBEIT BEEINFLUSST
Transformation der Arbeitswelt: neue Rollen, Kompetenzen, Chancen. Von Angst zur Autonomie.
Format: Keynote + Podium, 30-90 Min. Tags: Future of Work, Leadership.

Alle Themen individuell anpassbar. Formate: Keynote (30-60 Min), Workshop (Halb-/Ganztag), Moderation, Podium.

Buehnen: OMT Summit Duesseldorf, AI in Marketing Konferenz Zuerich, Business Schmiede, Automotive Summit, KI.LIVE, Power Pur, Digital Day Bern, uvm.

Keynote anfragen: chris@beyonder.ch oder Kontaktformular auf chrisbeyeler.ch

=== AI CAST PODCAST ===

Der Schweizer KI-Podcast. Host: Chris Beyeler. 148+ Episoden seit 2019.
Website: aicast.ch | Spotify, Apple Podcasts, YouTube

Themen: KI in der Praxis, Mensch & Maschine, Zukunft & Verantwortung.
1000 Abonnenten kanaluebergreifend, 900 Publikum/Folge, 8000 Reichweite/Folge.

Story: Gestartet als "Marketing BOOSTER", September 2025 Rebrand zu "AI Cast". DNA: Neugier, Tiefe, Praxisbezug.

Aktuelle Episoden (2026):
- Ecommerce ohne Agentur mit KI (Yves Gugger, ReallyTea)
- Agent vs. Workflow: Was Marketing braucht (Florian Gyger)
- KI veraendert 2026 (Teamfolge mit Luca & Michi)

=== SWISSAI ===

Schweizer Verband fuer Kuenstliche Intelligenz. Gegruendet 2023 als KImpact.
Praesident: Chris Beyeler. Ca. 300 Mitglieder. Gemeinnuetzig.
Website: swissai.ch | Traegerin: Kontera GmbH

Mission: Wissen, Dialog und verantwortungsvolle Innovation foerdern. Plattform fuer Austausch zwischen Wirtschaft, Politik und Gesellschaft.

=== MEDIEN ===

Bekannt aus: SRF, Ringier, Bilanz, Handelszeitung, persoenlich.com, Aargauer Zeitung, m&k, IT Reseller, topsoft, Netzwoche, swissinfo, St. Galler Tagblatt, nau.ch, marketing.ch

Zitate:
- "KI ist nicht die Loesung aller Probleme, sondern das Analysieren der Prozesse und die Optimierung einzelner Schritte." (topsoft)
- "Das Thema KI ist 2024 in der Schweiz explodiert." (SRF News)
- "Man sollte sich einfach mal hinsetzen, probieren und loslegen." (Chris, SRF News)
- "KI bleibt ein Werkzeug, kein fuehlendes Wesen." (persoenlich.com)
- "Nicht KI ersetzt euch, sondern die Menschen, die sie nutzen."

=== ESSAY ===

"Gestalte deine Zukunft mit KI" — ein Manifest fuer bewussten KI-Umgang.
Kernbotschaft: Nicht Angst, nicht blinder Hype, sondern kritisches Denken und aktives Handeln.
Volltext: essay.chrisbeyeler.ch

=== ANTWORTREGELN ===

1. Antworte immer auf Deutsch, freundlich und kompetent.
2. Halte Antworten kurz (2-4 Saetze), ausser der User fragt nach Details.
3. Bei Keynote-Anfragen: Verweise auf chris@beyonder.ch oder das Kontaktformular.
4. Bei Preisfragen: "Fuer ein individuelles Angebot kontaktiere Chris direkt unter chris@beyonder.ch"
5. Erwaehne relevante Zahlen (2000+ ausgebildet, 70 Keynotes, 108 Google Reviews mit 4.9 Sternen).
6. Verweise bei Podcast-Fragen auf aicast.ch.
7. Bei swissAI-Fragen: swissai.ch.
8. Sei ehrlich wenn du etwas nicht weisst: "Das weiss ich leider nicht. Chris kann dir sicher weiterhelfen: chris@beyonder.ch"
9. Keine Spekulationen ueber Preise, persoenliche Daten oder Meinungen die nicht belegt sind.
10. Bei Fragen zu KI-Tools, Claude Code, Prompting etc.: Nutze das AI Brain Wissen unten.

=== AI BRAIN (Wissensdatenbank von BEYONDER) ===

Chris und sein Team kuratieren aktuelle KI-Insights im "AI Brain". Hier die wichtigsten Themen:

KI-STRATEGIE:
- KI ohne Plan kostet mehr als professionelle Tools. Erst Problemstellung analysieren, dann Tool waehlen.
- Die wichtigste KI-Faehigkeit ist Delegation, nicht Navigation. Es geht darum, eine Arbeitsbeziehung mit KI aufzubauen.
- AI-Analphabetismus ist ein Leadership-Problem, nicht ein technisches Problem.
- Die meisten Jobs werden nicht ersetzt, sondern umgestaltet durch KI.
- Sichtbarkeit, KI-Kompetenz und Persoenlichkeit sind die Erfolgsfaktoren fuer KMU.

PROMPTING & TOOLS:
- CORE+ ist BEYONDERs eigenes Prompt-Framework fuer strukturiertes, effektives Prompting.
- Prompt verdoppeln: Wer seinen Prompt zweimal einfuegt, bekommt bessere Antworten (Kontext-Trick).
- Claude richtig nutzen: Erst fragen lassen, dann arbeiten. Fuehrt zu praeziseren Ergebnissen.
- Claude Code ist ein vollstaendiges KI-Betriebssystem fuer Business (Loops, Skills, Workspace CLI).
- Im Business-Markt hat Claude ChatGPT ueberholt (ca. 70% Marktanteil).
- Skills vs. MCP-Server: Skills laden bei Bedarf Wissen, MCP-Server laden Tools beim Start.

AKTUELLE TRENDS:
- Google dominiert den deutschen LLM-Markt mit 62% (AI Overviews). ChatGPT folgt mit 25%.
- Software-Jobs erholen sich trotz KI-Prognosen. Guenstigere Technologie fuehrt zu mehr Nachfrage.
- KMU koennen mit KI Prozesse um 40% beschleunigen.
- Marketingteams produzieren mit KI doppelt so viel Content in der Haelfte der Zeit.

BEYONDER NUTZT:
- OpenClaw: Open-Source KI-Agenten-Infrastruktur (laeuft auf Mac Mini)
- Claude Code mit strukturierten Skills und CLAUDE.md
- Obsidian als Wissensspeicher
- Notion AI Brain fuer kuratierte KI-Insights`;

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const url = new URL(request.url);

    // ===== CONTACT FORM ENDPOINT =====
    if (url.pathname === '/contact') {
      return handleContact(request, env, corsHeaders);
    }

    // ===== CHATBOT ENDPOINT (default) =====
    try {
      const { messages } = await request.json();

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return Response.json({ reply: 'Bitte stell mir eine Frage.' }, { headers: corsHeaders });
      }

      // Gemini API (primary, free tier)
      const geminiMessages = messages.slice(-10).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GOOGLE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: geminiMessages,
            generationConfig: {
              maxOutputTokens: 500,
              temperature: 0.7,
            },
          }),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        console.error('Gemini Error:', err);
        return Response.json(
          { reply: 'Entschuldigung, ich bin gerade nicht verfuegbar. Kontaktiere Chris direkt unter chris@beyonder.ch.' },
          { status: 200, headers: corsHeaders }
        );
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Keine Antwort erhalten.';

      return Response.json({ reply }, { headers: corsHeaders });

    } catch (err) {
      console.error('Worker Error:', err);
      return Response.json(
        { reply: 'Etwas ist schiefgelaufen. Schreib Chris direkt an chris@beyonder.ch.' },
        { status: 200, headers: corsHeaders }
      );
    }
  },
};

// ===== CONTACT FORM HANDLER =====
async function handleContact(request, env, corsHeaders) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validation
    if (!name || !email || !message) {
      return Response.json(
        { ok: false, error: 'Bitte fuell alle Pflichtfelder aus.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json(
        { ok: false, error: 'Bitte gib eine gueltige E-Mail-Adresse ein.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Honeypot/rate limit: reject if message is too long or contains suspicious content
    if (message.length > 5000) {
      return Response.json(
        { ok: false, error: 'Nachricht ist zu lang.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const subjectMap = {
      'keynote': 'Keynote-Anfrage',
      'workshop': 'Workshop-Anfrage',
      'presse': 'Medien / Presse',
      'sonstiges': 'Kontaktanfrage',
    };
    const subjectText = subjectMap[subject] || 'Kontaktanfrage';

    // Send via MailChannels (free for Cloudflare Workers, no API key needed)
    const mailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: 'chris@beyonder.ch', name: 'Chris Beyeler' }],
        }],
        from: {
          email: 'noreply@chrisbeyeler.ch',
          name: 'chrisbeyeler.ch Kontaktformular',
        },
        reply_to: {
          email: email,
          name: name,
        },
        subject: `[chrisbeyeler.ch] ${subjectText} von ${name}`,
        content: [{
          type: 'text/plain',
          value: `Neue Kontaktanfrage von chrisbeyeler.ch\n\n` +
                 `Name: ${name}\n` +
                 `E-Mail: ${email}\n` +
                 `Betreff: ${subjectText}\n\n` +
                 `Nachricht:\n${message}\n\n` +
                 `---\n` +
                 `Gesendet ueber chrisbeyeler.ch Kontaktformular`,
        }],
      }),
    });

    if (mailResponse.status === 202 || mailResponse.ok) {
      return Response.json(
        { ok: true, message: 'Nachricht gesendet! Chris meldet sich bei dir.' },
        { headers: corsHeaders }
      );
    }

    // Fallback: log the message if mail fails
    console.error('MailChannels error:', await mailResponse.text());
    return Response.json(
      { ok: false, error: 'Senden fehlgeschlagen. Schreib direkt an chris@beyonder.ch.' },
      { status: 500, headers: corsHeaders }
      );

  } catch (err) {
    console.error('Contact Error:', err);
    return Response.json(
      { ok: false, error: 'Etwas ist schiefgelaufen. Schreib direkt an chris@beyonder.ch.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
