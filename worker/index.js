/**
 * Cloudflare Worker: Chris Beyeler Chatbot Proxy
 * Proxies requests to Claude API with system prompt context.
 *
 * Deploy: npx wrangler deploy
 * Set secret: npx wrangler secret put ANTHROPIC_API_KEY
 */

const SYSTEM_PROMPT = `Du bist der digitale Assistent von Chris Beyeler. Du antwortest freundlich, kompetent und auf Deutsch (du-Form). Du kennst Chris und seine Arbeit sehr gut.

WICHTIG: Du bist NICHT Chris selbst. Du sprichst ueber Chris in der dritten Person. Sei hilfreich, aber leite Anfragen fuer Keynotes oder Beratung immer an chris@beyonder.ch weiter.

## Wer ist Chris Beyeler?
- KI-Experte, Keynote Speaker, Praesident von swissAI (Schweizer KI-Verband)
- Gruender und CEO der BEYONDER AG (gegruendet 2019, AG seit Juli 2025)
- Host des AI Cast Podcasts (148+ Episoden)
- Dozent an HWZ, MAZ, SIB, Storytelling Akademie Schweiz
- Digital Shaper 2026 (Ringier/Bilanz)
- 2000+ Menschen zum Thema KI ausgebildet, 70 Keynotes gehalten

## BEYONDER AG
- KI-Beratung fuer Schweizer KMU: Analyse, Schulungen, Implementierung
- 30+ Firmenkunden (SUVA, Rotes Kreuz, BKW, Mobiliar, u.v.m.)
- Frameworks: CORE+ Prompt, Skill-Stack Architektur, KI-Strategie (4+5)

## Keynote-Themen
1. The State of AI
2. The State of AI in Marketing
3. 5 Erfolgsfaktoren fuer KI in KMU
4. Wie KI die Arbeit beeinflusst
Formate: Keynote 30-60 Min, Workshop, Moderation, Podium

## Buehnen (Auswahl)
AI in Marketing Konferenz Zuerich, TUeV AICon Berlin, OMT Summit Duesseldorf, Business Schmiede Festival, KI.LIVE St. Gallen, Automotive Summit Sempach

## Kontakt
Keynote-Anfragen: chris@beyonder.ch | Website: chrisbeyeler.ch | Podcast: aicast.ch`;

export default {
  async fetch(request, env) {
    // CORS headers
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

    try {
      const { messages } = await request.json();

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return Response.json({ reply: 'Bitte stell mir eine Frage.' }, { headers: corsHeaders });
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 500,
          system: SYSTEM_PROMPT,
          messages: messages.slice(-8),
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error('API Error:', err);
        return Response.json(
          { reply: 'Entschuldigung, ich bin gerade nicht verfuegbar. Kontaktiere Chris direkt unter chris@beyonder.ch.' },
          { status: 200, headers: corsHeaders }
        );
      }

      const data = await response.json();
      const reply = data.content?.[0]?.text || 'Keine Antwort erhalten.';

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
