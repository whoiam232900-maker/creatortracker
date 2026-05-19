# Theme Rules — Creator Tracker

## Theme Philosophy

Themes in Creator Tracker are not simple color variations.

Each theme represents a different emotional workspace atmosphere designed to support different creator moods, focus levels, and working environments.

The theme system should influence:

* emotional tone
* interaction feel
* hierarchy perception
* workspace clarity
* visual fatigue
* immersion level

A theme must feel intentional during real interaction, not just during screenshots.

---

# Core Theme Principles

The theme system must prioritize:

* clarity
* hierarchy
* emotional consistency
* interaction quality
* readability
* calmness
* premium restraint

The UI should NEVER feel:

* chaotic
* overly decorative
* template-generated
* visually noisy
* corporate
* experimental for the sake of aesthetics

---

# The Three Theme Atmospheres

---

# Cinematic (Dark)

## Emotional Goal

Deep focus.
Low visual fatigue.
Immersive creator atmosphere.

The dark theme is the flagship Creator Tracker experience.

It should feel similar to:

* high-end editing software
* music production tools
* premium desktop creative environments

Examples:

* DaVinci Resolve
* Ableton Live
* Linear dark mode
* professional cinematic tools

---

## Visual Feeling

* deep charcoal foundations
* layered darkness
* subtle atmospheric glow
* controlled highlights
* soft hierarchy separation

The dark theme should feel:

* immersive
* calm
* focused
* cinematic
* premium

NOT:

* neon
* cyberpunk
* glow-heavy
* oversaturated

---

# Cinematic Light (White)

## Emotional Goal

Clarity.
Structured precision.
Daytime productivity.

The light theme should feel like:

* a premium notebook
* modern Apple interfaces
* Figma light mode
* minimal editorial layouts

---

## Visual Feeling

* clean white surfaces
* soft off-white foundations
* crisp borders
* calm separation
* elegant layering

The light theme must feel:

* intentional
* premium
* spacious
* structured
* refined

NOT:

* flat
* washed out
* invisible
* generic enterprise SaaS

---

# Original (Blue)

## Emotional Goal

Balanced productivity.
Classic Creator Tracker identity.
Familiar technical atmosphere.

---

## Visual Feeling

* deep navy/slate foundations
* restrained blue accents
* technical precision
* controlled contrast

The blue theme should feel:

* professional
* mature
* reliable

NOT:

* cheap Tailwind blue
* gaming UI
* oversaturated SaaS branding

---

# Semantic Theme System

All components must use semantic theme behavior.

Components should NEVER rely on:

* hardcoded colors
* static dark classes
* static light classes
* inline color values

---

# Required Semantic Structure

## Canvas Layer

Main application background.

Purpose:
Creates emotional atmosphere.

---

## Structural Layer

Sidebars, workspace frames, navigation areas.

Purpose:
Supports navigation hierarchy.

---

## Surface Layer

Cards, widgets, logs, panels.

Purpose:
Contains primary content.

---

## Elevated Layer

Dropdowns, popovers, overlays, modals.

Purpose:
Floats above the workspace hierarchy.

---

# Theme Hierarchy Logic

Hierarchy works differently in dark and light themes.

This difference is critical.

---

# Dark Theme Hierarchy

In dark themes:
lighter surfaces appear closer to the user.

Hierarchy is created through:

* controlled lightening
* subtle elevation
* soft contrast

The darkest layer should remain the background.

Elevated layers should gradually become lighter.

---

# Light Theme Hierarchy

In light themes:
brightness alone cannot create hierarchy.

Hierarchy must instead come from:

* surface separation
* border definition
* shadow discipline
* tonal framing
* spacing

White theme is extremely sensitive to weak hierarchy.

If surfaces become too similar:

* cards disappear
* dropdowns feel flat
* text becomes invisible
* the UI feels cheap

---

# Surface Separation Rules

Every surface must feel intentionally separated.

Surfaces should NEVER visually merge together.

Especially in light theme:

* dropdowns
* cards
* sidebars
* modals
  must remain visually distinguishable.

---

# Separation Methods

Preferred:

* subtle contrast difference
* low-opacity borders
* soft shadows
* slight elevation shifts
* spacing separation

Avoid:

* heavy shadows
* thick borders
* glowing outlines
* random gradients

---

# Hover Behavior Rules

Hover represents attention.
NOT selection.

Hover states should feel:

* lightweight
* calm
* responsive
* elegant

Hover may use:

* subtle background tint
* slight brightness shift
* subtle border emphasis
* minimal surface lift

Hover should NEVER:

* display active indicators
* use strong blue highlights
* aggressively glow
* drastically scale elements

---

# Selected / Active Behavior Rules

Selected state represents:
system truth.

Selected states must feel:

* more grounded
* more stable
* structurally stronger
  than hover states.

Selected states may use:

* active indicator dot
* stronger surface hierarchy
* clearer contrast
* subtle depth increase

---

# Indicator Dot Rules

The active indicator dot:

* represents active state ONLY
* must NEVER appear during hover
* should feel intentional and precise
* should remain subtle

The dot is a hierarchy tool.
Not decoration.

---

# Text Hierarchy Rules

Typography hierarchy is one of the strongest premium-feel signals.

Text must always remain readable.

---

# Text Levels

## Primary Text

Highest contrast.
Used for:

* titles
* key metrics
* active labels

---

## Secondary Text

Readable but softer.

Used for:

* descriptions
* body text
* secondary information

---

## Muted Text

Lowest hierarchy.

Used for:

* timestamps
* metadata
* helper labels

Muted text must NEVER become:

* invisible
* ghosted
* inaccessible

Especially in light theme.

---

# White Theme Readability Rules

Light theme readability is critical.

White theme exposes weak hierarchy immediately.

The light theme must maintain:

* visible muted text
* clear borders
* visible dropdown separation
* readable cards
* structured hierarchy

Avoid:

* flat gray surfaces
* invisible labels
* weak borders
* washed interfaces

---

# Dropdown & Popover Rules

Dropdowns and popovers are premium-feel components.

They must feel:

* elevated
* isolated
* intentional
* lightweight

---

# Dropdown Behavior

Dropdowns should:

* float above the layout
* feel visually separated
* maintain readable contrast
* preserve theme consistency

Especially in light theme:

* avoid flat gray sheets
* avoid muddy borders
* avoid dark-theme leakage

Dropdowns should feel:

* refined
* soft
* clean
* premium

NOT:

* browser-default menus
* template-looking popovers

---

# Border Rules

Borders create structural confidence.

Preferred borders:

* subtle
* 1px
* theme-aware
* low-noise

Borders should support:

* separation
* hierarchy
* structure

NOT decoration.

---

# Shadow Rules

Shadows are used carefully.

Shadows should mainly exist on:

* modals
* dropdowns
* overlays
* floating panels

Avoid:

* giant blurry shadows
* fake floating everywhere
* over-layered glassmorphism

---

# Ambient Glow Rules

Creator Tracker includes a fullscreen cursor-follow ambient glow system.

This glow should support atmosphere.
Never dominate the interface.

---

# Dark Theme Glow

Allowed:

* deeper cinematic glow
* subtle indigo/violet tones
* atmospheric immersion

The glow should feel:

* soft
* cinematic
* calm

---

# Light Theme Glow

The light theme glow must be:

* significantly softer
* lower opacity
* cleaner
* less saturated

Avoid:

* visible blue spotlight effect
* aggressive gradients
* visual noise

The glow should feel almost subconscious.

---

# Theme Leakage Prevention Rules

Theme leakage is one of the highest-priority UI problems.

Theme leakage occurs when:

* dark-theme styles appear in light theme
* hardcoded classes override semantic behavior
* shared components ignore theme state

---

# Preventing Theme Leakage

Never:

* hardcode dark backgrounds
* hardcode white text
* use inline colors
* use static zinc-900/zinc-100 values inside shared components

Always:

* use semantic tokens
* use theme-aware utilities
* verify all themes manually
* inspect shared overlays/popovers carefully

---

# Premium Feel Rules

A premium interface is NOT created through visual effects alone.

Premium feel comes from:

* interaction consistency
* predictable hierarchy
* stable layouts
* restrained motion
* controlled contrast
* readable structure
* emotional calmness

The UI should feel:

* expensive
* stable
* refined
* production-ready

NOT:

* flashy
* experimental
* loud
* trendy for the sake of trends

---

# Final Theme Goal

Every Creator Tracker theme should feel like:

* a professional creator workspace
* a focused operating environment
* software built for serious creative work

The themes should create:

* trust
* focus
* calmness
* immersion
* clarity

The interface should not merely LOOK premium.

The interface must FEEL premium during real interaction and long-term usage.
