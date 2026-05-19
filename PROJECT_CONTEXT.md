# Creator Tracker — Project Context

## Project Overview

Creator Tracker is a premium creator productivity and tracking SaaS application designed for creators, editors, freelancers, and digital builders.

The application acts as a creator operating system for:

* study tracking
* work tracking
* editing tracking
* earnings tracking
* target management
* workflows
* analytics
* creator intelligence

The long-term goal is to build a stable, premium-quality SaaS platform with elegant UI, modular architecture, controlled customization, and future AI-powered creator tools.

---

# Current Development Priority

Current priority order:

1. Stability
2. Premium UI consistency
3. Theme hierarchy and interaction quality
4. Controlled feature completion

Do NOT prioritize:

* major architecture rewrites
* unnecessary refactors
* experimental redesigns
* AI feature expansion before stability

---

# Current Stable Systems

The following systems are currently stable and should NOT be modified unless absolutely necessary:

* dashboard loading
* entry logging
* entry editing/deleting
* target syncing
* Supabase metadata handling
* analytics calculations
* data persistence

Important:
The previous critical Supabase issue involving:

`user_targets.metadata null / code 23502`

has already been fixed.

Do NOT rework this logic unnecessarily.

---

# Core Architecture Rules

## Stability First

* avoid broad refactors
* avoid architecture rewrites
* avoid touching stable systems unnecessarily

## Minimal Changes

* keep edits surgical
* modify the smallest possible number of files
* preserve current layout structure unless required

## Safe Development

* do not modify backend/data logic unless explicitly requested
* do not break existing Supabase sync systems
* avoid risky global CSS changes

## Preferred Workflow

1. inspect
2. identify exact target
3. explain smallest fix
4. modify surgically
5. test all themes
6. report changed files

---

# UI / Design Direction

Creator Tracker should feel:

* premium
* minimal
* modern
* subtle
* intentional
* creator-focused

Primary inspirations:

* Linear
* Notion
* Spotify
* Apple UI hierarchy

---

# Design Principles

## Preferred UI Style

* subtle depth
* elegant layering
* premium hover states
* soft hierarchy
* refined interaction feedback
* controlled accents
* clean typography
* minimal visual noise

## Avoid

* cheap Tailwind-looking hover effects
* loud blue highlights
* harsh shadows
* heavy glassmorphism
* aggressive gradients
* over-animation
* cluttered UI
* corporate SaaS appearance

---

# Theme System

The app currently supports 3 themes:

1. Cinematic (dark)
2. Cinematic Light (white)
3. Original (blue)

---

# Theme Rules

## Cinematic Theme

The dark theme is already close to the desired quality level.

Avoid unnecessary redesigns.

---

## Cinematic Light Theme

The white/light theme still requires hierarchy and interaction polish.

Known issues:

* dark-theme style leakage
* weak surface hierarchy
* weak muted text readability
* weak dropdown/popover depth
* weak hover/selected hierarchy
* surface layers blending together

Main goal:
Make the light theme feel like a true premium first-class theme.

---

## Original Theme

The original blue theme should preserve its identity while remaining premium and controlled.

Avoid:

* default Tailwind blue styling
* cheap hover effects
* oversaturated accents

---

# Interaction Design Rules

Hover and selected states must feel different.

---

## Hover State

Hover should use:

* subtle surface lift
* slight brightness shift
* elegant minimal feedback

Hover should NOT:

* show selected indicators
* use loud glow
* use aggressive highlights

---

## Selected / Active State

Selected state may use:

* indicator dot
* stronger hierarchy
* subtle surface depth
* clearer separation

The indicator dot should represent ACTIVE state only.

The indicator dot should NOT appear during hover state.

---

# Surface Hierarchy Rules

Especially in light theme:

* cards must feel separated
* dropdowns/popovers should feel elevated
* muted text must remain readable
* surfaces should not blend together
* hierarchy should feel subtle but clear

Avoid:

* flat gray surfaces
* identical brightness levels
* invisible muted text
* weak border hierarchy

---

# Ambient Glow System

The app includes a fullscreen cursor-follow ambient radial glow effect.

Important:
This is NOT a component.
This is a global ambient interaction layer.

---

## Dark Theme Glow

Allowed:

* slightly stronger atmosphere
* cinematic ambient depth

---

## Light Theme Glow

Should be:

* softer
* cleaner
* lower opacity
* subtle
* integrated naturally into white surfaces

Avoid:

* harsh blue glow
* noisy effects
* overpowering gradients

---

# Current UI Focus Areas

Current polish focus:

* white-theme hierarchy
* dropdown layering
* surface separation
* muted text readability
* hover vs selected clarity
* sidebar interaction quality
* premium popover depth
* settings modal consistency

---

# Current Pending Features

Still pending:

* Help & Support completion
* Notifications system
* Export/import system
* Authentication/login
* AI onboarding/messages/chat
* Packaging (exe/apk)

These should come AFTER stable core polish.

---

# Development Constraints

## Do NOT

* refactor the whole app
* redesign the whole UI
* rewrite theme architecture
* introduce unnecessary dependencies
* modify stable systems without reason
* touch backend/data logic during UI tasks

## Always

* prefer minimal patches
* preserve architecture
* preserve layout structure
* test all 3 themes
* verify no console errors
* report changed files

---

# QA Rules

Before completing any task:

* verify dark theme
* verify light theme
* verify original theme
* verify hover hierarchy
* verify selected hierarchy
* verify text readability
* verify no layout regressions
* verify no console errors

---

# AI Agent Rules

When modifying the app:

* inspect before editing
* explain proposed changes first
* avoid touching unrelated files
* avoid broad global edits
* preserve current architecture
* prioritize stability over visual experimentation

If unsure:
report findings instead of making risky edits.

---

# Final Product Philosophy

Creator Tracker should feel like:

* a refined creator operating system
* stable
* premium
* intentional
* focused
* quietly powerful

NOT:

* flashy
* chaotic
* experimental
* generic dashboard UI
* over-designed
