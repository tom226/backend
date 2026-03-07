---
description: "Check project progress till date from repo docs and current workspace changes"
name: "Check Progress Till Date"
argument-hint: "Optional focus: backend, mobile, web, deploy, security"
agent: "agent"
---
Review project progress as of today and produce a concise status report.

Use these inputs first:
- [README](../../README.md)
- [NEXT-STEPS](../../NEXT-STEPS.md)
- [STEP-BY-STEP](../../STEP-BY-STEP.md)
- [Latest update log](../../UPDATE-LOG-2026-02-25.md)
- [Mobile progress](../../NurseryGreenApp/PROGRESS.md)
- [Backend issue report](../../backend/ISSUE-CHECK-REPORT.md)

Also inspect current workspace git changes to capture progress not yet documented.

Output format:
1. As-of date and confidence level (high/medium/low).
2. Completed work (group by backend, web, mobile, deployment).
3. In-progress or newly added artifacts (from git changes).
4. Pending checklist from NEXT-STEPS (show only unchecked items).
5. Top 3 immediate actions for the next working session.

Style:
- Keep it practical and decision-oriented.
- Prefer facts from files over assumptions.
- If dates conflict, call out the conflict explicitly.