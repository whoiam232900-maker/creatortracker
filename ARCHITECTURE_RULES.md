# Architecture Rules — Creator Tracker

## Core Architecture Philosophy

Creator Tracker is not an experimental playground.

It is a production-focused premium creator operating system.

The architecture must prioritize:

1. Stability
2. Premium experience
3. Intelligent functionality

This order must NEVER be reversed.

---

# Stability First Philosophy

Stability is the foundation of the entire application.

A visually impressive feature that destabilizes:

* syncing
* persistence
* rendering
* navigation
* interactions
* data integrity

is considered a failed implementation.

The application must remain:

* predictable
* maintainable
* production-ready
* resilient

at all times.

---

# Development Philosophy

Creator Tracker should evolve through:

* controlled improvements
* small scoped enhancements
* surgical fixes
* modular growth
* careful refinement

NOT through:

* massive rewrites
* architecture resets
* trend-driven refactors
* unnecessary abstractions
* experimental engineering

The project should grow like a refined product, not a constantly rewritten prototype.

---

# Production-Ready Rule

The codebase should always remain close to production quality.

Avoid:

* unfinished experimental systems
* placeholder logic
* mock production behavior
* temporary hacks left permanently
* incomplete architectural migrations

Every implementation should feel intentional and maintainable.

---

# Architecture Style

The architecture should feel:

* modular
* understandable
* stable
* predictable
* lightweight
* scalable

Avoid:

* over-engineering
* excessive abstraction
* enterprise complexity
* premature optimization
* unnecessary dependency chains

Prefer:

* readable code
* explicit logic
* maintainable structures
* clear component boundaries

---

# Stability-Protected Systems

The following systems are considered protected systems.

Do NOT refactor, rewrite, or heavily restructure these systems unless a confirmed issue exists inside them.

---

# Protected Systems

## Supabase Systems

* Supabase client configuration
* sync systems
* auth/session handling
* profile metadata handling
* row-level security integration

---

## Creator Data Systems

* entry logging
* entry editing/deleting
* target syncing
* workflow persistence
* analytics calculations
* dashboard initialization

---

## Theme Systems

* semantic theme structure
* theme switching logic
* shared interaction hierarchy
* ambient glow integration

---

# Safe Editing Workflow

All modifications should follow this workflow:

---

## 1. Inspect

Understand:

* the component
* dependencies
* theme behavior
* shared usage
* state relationships

Never assume architecture behavior without inspection.

---

## 2. Identify

Pinpoint:

* exact file
* exact component
* exact logic block
* exact styling source

Avoid broad assumptions.

---

## 3. Minimize

Determine the smallest possible patch.

If 3 lines solve the issue:
do NOT rewrite 50.

---

## 4. Execute Surgically

Modify only:

* necessary logic
* necessary classes
* necessary tokens
* necessary handlers

Avoid touching unrelated systems.

---

## 5. Validate

After every modification:

* test all themes
* inspect console
* verify no regressions
* verify no interaction breakage
* verify no layout instability

---

# Surgical Editing Rules

Creator Tracker development must remain surgical.

---

## Modify the Smallest Possible Scope

Avoid:

* rewriting entire components
* replacing working systems
* restructuring stable modules
* broad “cleanup” passes

Prefer:

* localized fixes
* targeted improvements
* incremental refinement

---

## Preserve Existing Behavior

When improving UI:

* preserve layout rhythm
* preserve spacing hierarchy
* preserve interaction flow
* preserve component responsibilities

Do not accidentally redesign working systems.

---

# Refactor Restrictions

Refactors are HIGH-RISK operations.

Do NOT:

* refactor for style preference
* rewrite working logic
* migrate architecture unnecessarily
* introduce new state systems casually
* reorganize stable folders without reason

Avoid introducing:

* Redux
* Zustand
* complex context layers
* unnecessary service abstractions

unless explicitly requested.

---

# Shared Component Safety Rules

Shared components are high-risk modification zones.

Examples:

* SettingsModal
* dropdown systems
* popovers
* select components
* sidebar systems
* workspace switchers

Changes to shared components must be:

* tested globally
* theme-verified
* interaction-verified

A small shared-component mistake can break:

* multiple screens
* theme consistency
* interaction hierarchy

---

# Theme Safety Rules

The theme system is emotionally important to Creator Tracker.

Avoid:

* hardcoded colors
* static dark/light classes
* inline color styles
* uncontrolled opacity chains

Always use:

* semantic theme tokens
* theme-aware classes
* consistent hierarchy logic

---

# Theme Leakage Prevention

Theme leakage is one of the highest-priority UI risks.

Common leakage causes:

* hardcoded zinc values
* dark-mode assumptions
* shared component styling shortcuts
* static text colors
* static dropdown styling

All theme-related changes must be tested in:

1. Cinematic
2. Cinematic Light
3. Original

before completion.

---

# UI Modification Boundaries

UI edits must preserve:

* hierarchy
* premium feel
* interaction consistency
* visual rhythm

Avoid:

* flashy redesigns
* oversized shadows
* aggressive gradients
* heavy glassmorphism
* “Dribbble concept” styling

Creator Tracker should feel:

* quietly premium
* stable
* mature
* production-ready

---

# Dependency Rules

Avoid unnecessary dependencies.

Do NOT:

* install packages casually
* replace stable systems with libraries
* introduce large UI frameworks
* add animation libraries unnecessarily

Prefer:

* existing Tailwind system
* native React patterns
* lightweight utilities
* current architecture patterns

---

# Supabase Safety Rules

Supabase is a protected infrastructure layer.

---

## Never:

* bypass RLS logic
* weaken auth validation
* clear migrations
* rewrite stable queries carelessly
* introduce redundant polling loops

---

## Always:

* preserve profile integrity
* preserve metadata consistency
* avoid redundant queries
* validate async behavior carefully

---

# Performance Philosophy

Performance should feel:

* lightweight
* calm
* responsive
* stable

Avoid:

* unnecessary re-renders
* animation overload
* aggressive effects
* excessive DOM complexity

Performance optimization should NOT:

* reduce maintainability
* overcomplicate architecture
* sacrifice readability

---

# AI Editing Rules

AI agents must behave conservatively.

---

## AI Should:

* inspect before editing
* explain reasoning
* modify minimally
* preserve architecture
* report changed files
* respect protected systems

---

## AI Should NOT:

* rewrite large sections casually
* assume architecture intent
* redesign components unnecessarily
* introduce broad abstractions
* perform “cleanup refactors”
* optimize without evidence

---

# Confirmation Gate Rules

If a change affects:

* authentication
* billing
* Supabase logic
* sync systems
* analytics calculations
* protected shared systems

the AI must:

1. explain the risk
2. explain the modification
3. wait for confirmation

before editing.

---

# QA Expectations

Before completing ANY task:

---

## Verify:

* dark theme
* light theme
* original theme
* responsive stability
* hover behavior
* selected behavior
* text readability
* dropdown layering
* console cleanliness

---

## Ensure:

* no layout jumping
* no rendering instability
* no theme leakage
* no broken hierarchy
* no React warnings
* no console errors

---

# Long-Term Product Philosophy

Creator Tracker should evolve like:

* a refined creator platform
* a stable professional tool
* a carefully crafted operating system

NOT:

* a constantly rewritten startup prototype
* an over-engineered enterprise app
* a collection of disconnected UI experiments

Every architectural decision should protect:

* stability
* premium feel
* clarity
* maintainability
* creator workflow quality

The architecture should feel invisible to the user.

Only the smoothness, stability, and confidence of the product should be felt.
