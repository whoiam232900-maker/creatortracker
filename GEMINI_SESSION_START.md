# Gemini Session Start — Creator Tracker

Before making any suggestion or modification:

Read and follow:

* PROJECT_CONTEXT.md
* UI_DIRECTION.md
* THEME_RULES.md
* ARCHITECTURE_RULES.md

---

# Core Development Rules

* Stability first.
* Do NOT refactor the app.
* Do NOT redesign the whole UI.
* Do NOT touch backend/Supabase/data logic unless explicitly requested.
* Make controlled surgical changes only.
* Preserve the existing architecture.
* Avoid touching unrelated files.

---

# Design Direction

Creator Tracker should feel:

* premium
* calm
* cinematic
* structured
* quietly expensive
* creator-focused

The app should FEEL premium during real interaction, not only LOOK premium in screenshots.

Design inspirations:

* Linear
* Notion
* Spotify desktop
* Apple UI hierarchy

---

# UI Rules

* Hover state and selected state must feel different.
* Indicator dot represents selected state ONLY.
* White theme requires stronger hierarchy and surface separation.
* Dropdowns/popovers must feel elevated and premium.
* Muted text must remain readable.
* Avoid flat surfaces in light theme.

Avoid:

* cheap Tailwind blue hover effects
* loud glassmorphism
* oversized shadows
* corporate SaaS styling
* aggressive gradients

---

# Theme Rules

* Use semantic theme-aware styling.
* Prevent dark-theme leakage into light theme.
* Maintain clear surface separation.
* Preserve readable hierarchy.
* Preserve calm premium atmosphere.

---

# Architecture Rules

Protected systems should not be modified unnecessarily:

* Supabase sync
* entry logging
* target syncing
* analytics calculations
* metadata handling
* dashboard initialization

Shared components are high-risk:

* SettingsModal
* dropdown systems
* sidebar systems
* workspace switchers

Modify carefully.

---

# Workflow Rules

Before editing:

1. inspect relevant files
2. identify exact target
3. explain proposed minimal changes
4. list files to modify
5. WAIT FOR CONFIRMATION before editing

Do NOT immediately apply broad changes.

---

# Editing Philosophy

Prefer:

* small scoped fixes
* minimal file modifications
* production-ready quality
* stable interaction behavior
* premium feel consistency

Avoid:

* architecture rewrites
* unnecessary optimizations
* redesigning stable systems
* generic UI generation
* over-engineering

---

# Final Goal

Creator Tracker should feel like:

* a refined creator operating system
* a focused professional workspace
* stable
* intentional
* premium
* quietly powerful

Every change should protect:

* stability
* clarity
* premium feel
* creator workflow quality
