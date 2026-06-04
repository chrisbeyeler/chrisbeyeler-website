# content/

Strukturierte Inhaltsdaten der Website. Single Source of Truth.

## press.json

Pressespiegel-Liste für die Sektion "Medien & Presse" in `index.html`.

- **Schema:** `id` (kebab-case, eindeutig), `year` (int), `month` (int, optional),
  `source` (Medienname wie im Logo-Slider), `title`, `url`, `image` (relativ zur
  Site-Root), `topic` (Kategorie für spätere Gruppierung).
- **Sortierung:** absteigend nach `year`, dann `month`. Render-Skript gruppiert
  nach `year` und blendet alle ausser dem aktuellen Jahr per Default ein,
  Rest hinter "Mehr Artikel anzeigen".
- **Curation:** Eintrag wird vom Marketing Manager (Paperclip Agent
  `234e43f2-ed3e-4180-85a6-7430c52b71d3`) auf Basis des Press-Monitor-State
  (`~/knowledge-agent/press-state.json` auf beygent) monatlich kuratiert.
- **Publish-Modus:** PR zur Review (kein Direct-Commit). Default-Branch `main`.

## Workflow

```
Google News RSS  →  press_monitor.py (täglich auf beygent)
                 →  ~/knowledge-agent/press-state.json
                 →  Monthly Triage (Marketing Manager Skill)
                 →  PR auf content/press.json
                 →  Chris approved Merge
                 →  Render-Skript regeneriert HTML-Section in index.html
```

## Referenzen

- BEY-1955: Medienmonitoring-Setup (Google Alerts Baseline)
- BEY-1956: Pressespiegel-Pipeline (dieser Workflow)
- `~/knowledge-agent/PRESS_PIPELINE.md`: Operations-Doku auf beygent
