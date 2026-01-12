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

**ENTER PLAN MODE FIRST.** Per project-identity.md:136, before writing any code:
1. Restate the core feeling in your own words
2. Outline a minimal playable experience
3. Define the role of each candidate (at a high level)
4. Propose a simple development plan

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
- Document design decisions
- Prefer sharp ideas over many features

## Project Status

This is a greenfield project in the documentation/ideation phase. No code has been implemented yet. The repository contains:
- `game-design-document.md` - Core game design document
- `project-identity.md` - Comprehensive project manifesto
- `.claude/settings.local.json` - Claude Code permissions configuration
