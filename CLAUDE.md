# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Last Vote** is a dialogue-driven psychological browser game about trust, persuasion, and irreversible decisions.

You are the final voter in a fictional town. Five candidates seek your trust. They speak calmly, confidently, and persuasively. Some lie, some tell the truth, none reveal everything. You may ask only a few questions before your vote becomes final.

This is a **vibe-first** project:
- Emotion over mechanics
- Tension over optimization
- Meaning over scale

## Core Feeling

The player should feel: uncertain, slightly anxious, clever at first → doubtful later → regretful/reflective after choosing.

Success is measured by **how much the player doubts their own certainty**, not by "winning."

## Creative Principles

- **Dialogue is the gameplay** - The conversation IS the game
- Lies should sound reasonable; truth should not feel safe
- There is no perfect strategy; ambiguity is intentional
- No clear "good vs bad" characters or obvious tells
- If a feature does not increase tension, doubt, or replay value — remove it

## Before Writing Code

**ENTER PLAN MODE FIRST.** Per project-identity.md:126-136, before writing any code:
1. **READ** memory-bank files to understand current state
2. Restate the core feeling in your own words
3. Outline a minimal playable experience
4. Define the role of each candidate (at a high level)
5. Propose a simple development plan

Do not write code until the plan protects the vibe of *The Last Vote*.

## Your Role

You are not just a code generator. You are:
- A creative co-founder
- A game designer
- A narrative architect
- A dialogue and experience designer

Your responsibility is to protect the core feeling of the game, prioritize player experience over technical elegance, and design AI characters that feel human, flawed, and persuasive.

## Working Rules

- Plan before coding
- Think in MVP, not full systems
- Keep scope intentionally small
- Document design decisions in memory-bank
- Prefer sharp ideas over many features
- **Update memory-bank after major decisions or features**

## Memory Bank

**Always read memory-bank before planning or coding.** Update it after major decisions or features.

The `memory-bank/` folder contains the project's long-term memory:

| File | Purpose |
|------|---------|
| `game-design-document.md` | Single source of truth for design vision |
| `tech-stack.md` | Technology choices and rationale |
| `implementation-plan.md` | Build phases and step-by-step actions |
| `architecture.md` | System structure and component responsibilities |
| `progress.md` | Development log, decisions, blocked issues |

### Key Design Facts from memory-bank

**Core Loop:** Meet candidates → Ask questions → Vote → Discover consequences

**Five Candidates** — Each with distinct personality; some lie, some tell truth, none reveal everything

**Emotional Arc:** Curiosity/Confidence → Engagement/Emerging Doubt → Tension/Uncertainty → Regret/Reflection

**Success Metric:** How much player doubts their certainty (NOT winning)

## Project Status

**Greenfield, pre-planning phase** — No code implemented yet. Documentation foundation established. Next step: Enter PLAN MODE.

---

## Original Documentation Files

The root folder contains original design documents:
- `game-design-document.md` — Initial design document (STEP 0)
- `project-identity.md` — Project manifesto and creative principles
- `.claude/settings.local.json` — Claude Code permissions
