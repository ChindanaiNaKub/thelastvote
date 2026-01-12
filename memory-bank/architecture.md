# Architecture — The Last Vote

> This file describes the high-level system structure. Update as the design evolves.

---

## Status

**NOT YET DESIGNED** — This project is in the planning phase.

System architecture will be designed after tech stack decisions are made.

---

## High-Level System Structure

*To be designed*

---

## Major Components

*To be defined*

Potential components (tentative):

- **Game State Manager** — Tracks progress, questions asked, current phase
- **Dialogue Engine** — Handles conversation flow and AI responses
- **AI Character System** — Manages the five candidates and their behaviors
- **UI/Presentation Layer** — Renders the game to the player
- **Save/Load System** — Handles game persistence (if needed)

---

## Component Responsibilities

*To be defined during architecture design*

---

## Data Flow

*To be documented*

Rough flow (conceptual):

1. Player interacts with UI
2. Game state updates
3. Dialogue/AI system generates response
4. UI renders response
5. Player makes choice → vote
6. Consequence system determines outcome
7. Aftermath is revealed

---

## AI Integration Strategy

*To be determined*

Key questions:
- Which LLM service to use?
- How to ensure characters can lie convincingly?
- How to maintain character consistency?
- How to handle API costs/rate limits?

---

## Browser Deployment Strategy

*To be determined*

Options to consider:
- Static hosting (GitHub Pages, Netlify, Vercel)
- Serverless functions for AI API calls
- Client-side API calls (CORS considerations)

---

## Security Considerations

- API key protection (if using LLM APIs)
- Rate limiting to control costs
- Input sanitization for user-provided text
