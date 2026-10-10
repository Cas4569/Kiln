---
name: monolyth-aesthetic
description: Design system tokens and styles for a Monolyth-inspired trading UI.
metadata:
  type: project
---

**Why:** To create a cohesive, modern, and highly interactive interface for Kiln, we need consistent design tokens that mirror the premium tech aesthetic of the "Monolyth" template.

**How to apply:** Use the following utilities and patterns:

- [[glass-panel]]: Add `glass-panel` to card components for a semi-transparent, blurred look.
- [[monolyth-grid]]: Add `monolyth-grid` class to containers to get the subtle background structure.
- [[glow-accent]]: Use `glow-accent` (or `glow-blue`/`glow-emerald`) on primary actions, active tabs, or key cards to create the signature glow.
- **Micro-animations**: Rely on Framer Motion for any movement, focusing on `ease-out` transitions and subtle spring physics.
- **Typography**: Keep headlines large and wide-tracked; use `font-mono` for all data figures.
