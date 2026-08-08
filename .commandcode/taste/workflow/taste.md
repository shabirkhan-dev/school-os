# Workflow

- Pushes code after completing each task, preferring multiple logical commits rather than a single commit. Confidence: 0.7
- Keeps the GitHub Project as a Trello-like kanban board: detailed cards for every task, cards added/moved/updated as sprints progress, and cards created for deferred future work so it stays tracked. Confidence: 0.8
- Prefers a structured branch workflow: merge completed work to main, then cut a fresh branch for the next work phase. Confidence: 0.6
- Tests systematically: fresh seed data that is small but high quality, testing one role/user at a time, walking through every flow, cross-checking permissions and cross-user impact, and fixing issues as they are found. Confidence: 0.7
- Wants browser testing done visibly in the front (cursor visible in the sidebar) so the user can watch the work in progress — not just background/headless testing. Confidence: 0.8
- Wants reported issues verified to actually exist in the codebase before fixing them, and also wants additional issues found proactively fixed. Confidence: 0.6
