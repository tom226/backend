# Plant Knowledge Database

This project now includes a MongoDB-backed plant diagnosis knowledge system for scanner + chatbot.

## What it stores
- Plant disease/health entries with:
  - symptoms
  - leaf indicators
  - soil indicators
  - environment indicators
  - verified solutions
  - prevention steps
  - references
- Diagnosis cases from scanner/chatbot requests (for audit and quality improvement).

## New APIs
- `POST /api/plant-scanner/analyze`
  - Accepts verified observation payload (leaf + soil + environment).
  - Returns best disease match + confidence + solution + references.
- `POST /api/plant-knowledge/diagnose`
  - Generic diagnosis endpoint for scanner/chatbot/manual tools.
- `POST /api/plant-knowledge/chat-assist`
  - Query-based assistant response for chatbot.
- `GET /api/plant-knowledge/references?q=leaf+spot`
  - Returns references for matched knowledge entries.
- `POST /api/plant-knowledge/upsert`
  - Admin-only knowledge upsert using `x-admin-token`.
- `POST /api/plant-knowledge/daily-refresh`
  - Admin-only manual trigger for daily refresh.

## Daily update flow
- Auto scheduler runs every `KNOWLEDGE_REFRESH_HOURS` (default 24).
- Seed data is auto-loaded when the DB is empty.
- Optional incremental updates can be added in:
  - `data/plantKnowledgeDaily.json`

Expected JSON format:

```json
{
  "entries": [
    {
      "slug": "new-disease-slug",
      "diseaseName": "Disease Name",
      "category": "fungal",
      "summary": "...",
      "symptoms": ["..."],
      "solutions": [
        {
          "title": "...",
          "priority": 1,
          "estimatedDays": "7-14 days",
          "steps": ["...", "..."]
        }
      ],
      "references": [
        {
          "title": "...",
          "url": "https://...",
          "source": "..."
        }
      ]
    }
  ]
}
```

## Env vars
Add to `.env`:
- `KNOWLEDGE_ADMIN_TOKEN=your_strong_token`
- `KNOWLEDGE_REFRESH_HOURS=24`

## Security note
Never put secrets in code. Keep secrets only in local vault/env files.

## Admin operations UI
- Open `knowledge-admin.html` in browser (served by this project).
- Provide:
  - Backend URL
  - `KNOWLEDGE_ADMIN_TOKEN`
- Actions available:
  - Validate JSON
  - Upsert entries (`/api/plant-knowledge/upsert`)
  - Run daily refresh (`/api/plant-knowledge/daily-refresh`)
  - Check reference output (`/api/plant-knowledge/references`)
