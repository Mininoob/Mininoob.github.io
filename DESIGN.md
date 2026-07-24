---
name: Joshua M Le — Portfolio
description: A live simulation console — demoscene proof-of-skill in a research/cyber register
colors:
  coolant-cyan: "#43F1E4"
  coolant-cyan-bright: "#7CF7EE"
  telemetry-amber: "#FFB454"
  signal-magenta: "#FF3DA0"
  void-navy: "#060A14"
  silkscreen-white: "#DCE9EC"
typography:
  display:
    fontFamily: "Chakra Petch, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 9vw, 5.8rem)"
    fontWeight: 700
    lineHeight: 1.02
  headline:
    fontFamily: "Chakra Petch, system-ui, sans-serif"
    fontSize: "clamp(1.8rem, 4.5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
  title:
    fontFamily: "Chakra Petch, system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 500
  value:
    fontFamily: "Chakra Petch, system-ui, sans-serif"
    fontSize: "clamp(1.15rem, 3vw, 1.5rem)"
    fontWeight: 500
  body:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "15px"
    fontWeight: 300
    lineHeight: 1.65
  small:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
  ui:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.18em"
  label:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 400
    letterSpacing: "0.16em"
spacing:
  unit: "8px"
components:
  button-primary:
    backgroundColor: "{colors.coolant-cyan}"
    textColor: "{colors.void-navy}"
    padding: "15px 30px"
  button-ghost:
    textColor: "{colors.coolant-cyan}"
---

# Design System: Joshua M Le — Portfolio

## Overview

**Creative North Star: "The Simulation Console"**

The site is a running research simulation, descended from the demoscene intro: everything the visitor sees is generated live from code in their browser, because the medium itself is the proof of VR/game/graphics competence. The register is research-lab and cyber, not retro nostalgia — wireframe geometry, telemetry readouts, HUD framing, and a terminal boot voice. It is a dark room where the screen is the only light source.

Restraint lives in the discipline: the spectacle never hides the facts. Name, role, and contact survive every fallback (reduced motion, no WebGL, no JS).

**Key Characteristics:**
- Live-generated visuals (WebGL/canvas), never faked screenshots of effects
- HUD grammar: corner brackets, hairline rules, telemetry labels
- Terminal voice: boot sequences, uppercase system labels, honest system states
- Dark ground with a saturated instrument palette; light is emitted, not printed

## Colors

A dark void ground lit by instrument phosphors; three signal roles plus silkscreen neutrals.

### Primary
- **Coolant Cyan** (`#43F1E4`): the interface's live voice — active states, primary CTA, wireframes, telemetry values.
- **Coolant Cyan Bright** (`#7CF7EE`): the powered-up step of Coolant Cyan, reserved for hover/active on the primary action.

### Secondary
- **Telemetry Amber** (`#FFB454`): warnings, pending/placeholder states ("AWAITING PAYLOAD"), secondary highlights.

### Tertiary
- **Signal Magenta** (`#FF3DA0`): alerts and the raster-spectrum signature band (cyan→magenta→amber), the one inherited demoscene artifact.

### Neutral
- **Void Navy** (`#060A14`): page ground — deep blue-black, never pure #000.
- **Silkscreen White** (`#DCE9EC`): body text and quiet labels.
- **Panel Line** (cyan at 0.22 alpha): hairline rules and bracket strokes.

### Named Rules
**The Emitted Light Rule.** Color on this surface is light, not pigment: saturated hues appear as glowing strokes, readouts, and fields on the dark ground — never as printed pastel fills.
**The One Alarm Rule.** Magenta at full strength is rare; when everything glows, nothing is a signal.

## Typography

**Display Font:** Chakra Petch (fallback: system sans) — angular, technical, sci-fi without cosplay.
**Body/Console Font:** Martian Mono (fallback: ui-monospace, monospace) — research-grade monospace for labels, telemetry, and body facts.

**Character:** A lab instrument that learned to speak: hard angles at display size, precise tabular mono at reading size. System labels are uppercase, wide-tracked, small.

### Hierarchy
- **Display** (Chakra Petch 700, clamp to 5.8rem): the name only.
- **Headline** (Chakra Petch 700, clamp to 3rem): section titles.
- **Title** (Chakra Petch 500, 1.15rem): panel titles.
- **Value** (Chakra Petch 500, clamp 1.15–1.5rem): the payload of a comms channel — an address or handle presented at reading-priority scale.
- **Body** (Martian Mono 300, 15px, 1.65): facts, descriptions; max ~70ch.
- **Small** (Martian Mono 400, 13px): fine print, scroller, secondary notes.
- **UI** (Martian Mono 600, 12px, +0.18em tracking, uppercase): buttons, HUD identity.
- **Label** (Martian Mono 400, 11px, +0.16em tracking, uppercase): system labels, telemetry, states.

### Named Rules
**The Silkscreen Rule.** Labels are small, uppercase, tracked, and exact — the voice of the instrument, not decoration.

## Layout

Full-bleed canvas scenes framed by a HUD: corner brackets and hairline rules bound each section like an instrument bezel. Content sits in console panels on an 8px rhythm inside a single centered column (max ~1100px) over the live background. Sections read as sequenced "parts" of one running program. On phones the HUD tightens, panels stack single-column, and the canvas scene simplifies rather than disappears.

## Elevation & Depth

No shadows. Depth is conveyed the way instruments convey it: layered glow (emitted light), line-weight, and parallax in the live scene. Panels separate from the ground by hairline borders and faint fills, never drop shadows.

## Shapes

Square-cornered panels with bracketed corners (the HUD signature); hairline 1px strokes; clipped 45° corner notches allowed on interactive elements. No rounded-rectangle softness — this is machined, not molded.

## Do's and Don'ts

### Do:
- **Do** generate every visual effect live from code; the medium is the proof.
- **Do** keep name, role, and contact reachable with all motion skipped or unavailable.
- **Do** mark placeholder content honestly in the world's own voice (amber "AWAITING" states).

### Don't:
- **Don't** use Matrix digital-rain, skull/glitch hacker clichés, or fake "hacking" theatrics.
- **Don't** let an effect run without a visible skip/pause; the visitor owns the clock.
- **Don't** fabricate projects, employers, metrics, or endorsements — placeholder bays stay clearly placeholders until real content lands.
