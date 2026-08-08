# Frontend / UI

- Prefers shadcn native components over custom/one-off components across the app so the UI/UX stays consistent and uniform; when reviewing pages, wants non-shadcn components replaced with shadcn equivalents (sidebar, buttons, etc.). Confidence: 0.85
- When borrowing from animated component libraries (e.g., beUI), only wants the animations themselves wired onto shadcn components — not the third-party components dropped in as replacements. Confidence: 0.7
- Wants a single central control point to toggle features like animations on/off globally, rather than scattering them throughout forms/pages. Confidence: 0.5
- Cares about correct RTL (right-to-left) support, e.g. for Urdu, and expects the implementation verified against shadcn's official RTL guidance rather than assumed working. Confidence: 0.6
